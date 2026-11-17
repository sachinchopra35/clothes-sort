import Phaser from "phaser";
import { clothingDepthOnShelf } from "../config/layout";
import type { LevelDefinition } from "../levels/levelTypes";
import type { ShelfLayoutEntry } from "../layout/shelfLayout";
import { ClothingItem } from "../objects/ClothingItem";
import { Shelf } from "../objects/Shelf";
import {
  applyMove,
  canMove,
  cloneBoardState,
  createBoard,
  getMovableGroup,
  isWon,
  type BoardState,
} from "./boardState";

export type UndoStateListener = (remaining: number, exhausted: boolean) => void;

export class BoardController {
  private state: BoardState;
  private readonly scene: Phaser.Scene;
  private layout: ShelfLayoutEntry[] = [];
  private readonly shelfViews = new Map<string, Shelf>();
  /** Items wall → open per shelf id. */
  private readonly itemsByShelf = new Map<string, ClothingItem[]>();
  private readonly shelfHomeX = new Map<string, number>();
  private selectedFromId: string | null = null;
  private busy = false;
  private readonly undoAllowance: number;
  private undosRemaining = 0;
  private readonly undoSnapshots: BoardState[] = [];
  onWon: (() => void) | null = null;
  onUndoStateChange: UndoStateListener | null = null;

  constructor(
    scene: Phaser.Scene,
    level: LevelDefinition,
    layout: ShelfLayoutEntry[],
    undoAllowance = 0,
  ) {
    this.scene = scene;
    this.layout = layout;
    this.undoAllowance = undoAllowance;
    this.undosRemaining = undoAllowance;
    this.state = createBoard(level);

    for (const entry of layout) {
      const boardShelf = this.state.shelves.find((s) => s.id === entry.definition.id);
      if (!boardShelf || boardShelf.cleared) continue;

      const shelf = new Shelf(scene, {
        id: entry.definition.id,
        x: entry.x,
        y: entry.y,
        width: entry.width,
        side: entry.definition.side,
        capacity: entry.definition.capacity,
      });
      shelf.setTapHandler(() => void this.onShelfTap(entry.definition.id));
      shelf.setDepth(entry.y);
      this.shelfViews.set(entry.definition.id, shelf);
      this.shelfHomeX.set(entry.definition.id, entry.x);

      const items: ClothingItem[] = [];
      boardShelf.items.forEach((clothingId, index) => {
        const pos = shelf.getSlotWorldPosition(index);
        const item = new ClothingItem(scene, pos.x, pos.y, clothingId);
        item.setDepth(clothingDepthOnShelf(entry.y, index));
        items.push(item);
      });
      this.itemsByShelf.set(entry.definition.id, items);
    }

    this.emitUndoState();
  }

  private boardShelf(id: string) {
    return this.state.shelves.find((s) => s.id === id && !s.cleared);
  }

  private clearSelection(): void {
    if (!this.selectedFromId) return;
    const items = this.itemsByShelf.get(this.selectedFromId);
    items?.forEach((item) => item.setLifted(false));
    this.selectedFromId = null;
  }

  private liftGroup(shelfId: string): void {
    const shelf = this.boardShelf(shelfId);
    if (!shelf) return;
    const group = getMovableGroup(shelf);
    if (!group) return;
    const items = this.itemsByShelf.get(shelfId);
    if (!items) return;

    this.selectedFromId = shelfId;
    const start = items.length - group.count;
    for (let i = start; i < items.length; i++) {
      items[i].setLifted(true);
    }
  }

  private onShelfTap(shelfId: string): void {
    if (this.busy) return;
    const shelf = this.boardShelf(shelfId);
    const view = this.shelfViews.get(shelfId);
    if (!shelf || !view || !view.visible) return;

    if (!this.selectedFromId) {
      if (!getMovableGroup(shelf)) return;
      this.liftGroup(shelfId);
      return;
    }

    if (this.selectedFromId === shelfId) {
      this.clearSelection();
      return;
    }

    if (!canMove(this.state, this.selectedFromId, shelfId)) {
      view.shake();
      this.clearSelection();
      return;
    }

    const fromId = this.selectedFromId;
    const fromItems = this.itemsByShelf.get(fromId)!;
    const toItems = this.itemsByShelf.get(shelfId)!;
    const fromBoard = this.boardShelf(fromId)!;
    const group = getMovableGroup(fromBoard)!;
    const space = shelf.capacity - shelf.items.length;
    const moveCount = Math.min(group.count, space);

    this.busy = true;
    this.clearSelection();

    const movingViews = fromItems.splice(fromItems.length - moveCount, moveCount);
    toItems.push(...movingViews);

    if (this.undoAllowance > 0) {
      this.undoSnapshots.push(cloneBoardState(this.state));
    }

    const result = applyMove(this.state, fromId, shelfId);
    if (!result) {
      this.undoSnapshots.pop();
      fromItems.push(...movingViews.splice(0));
      toItems.splice(toItems.length - moveCount, moveCount);
      this.busy = false;
      return;
    }
    this.state = result.state;
    this.busy = false;
    this.emitUndoState();

    const destShelf = this.shelfViews.get(shelfId)!;
    void this.playMoveVisuals(
      movingViews,
      moveCount,
      destShelf,
      toItems,
      result.clearedShelfIds,
    );
  }

  private async playMoveVisuals(
    movingViews: ClothingItem[],
    moveCount: number,
    destShelf: Shelf,
    toItems: ClothingItem[],
    clearedShelfIds: string[],
  ): Promise<void> {
    const animPromises = movingViews.map((item, i) => {
      const slotIndex = toItems.length - moveCount + i;
      const pos = destShelf.getSlotWorldPosition(slotIndex);
      item.setDepth(clothingDepthOnShelf(destShelf.y, slotIndex));
      return item.animateTo(pos.x, pos.y);
    });
    await Promise.all(animPromises);

    for (const clearedId of clearedShelfIds) {
      const clearedShelf = this.shelfViews.get(clearedId);
      const clearedItems = this.itemsByShelf.get(clearedId) ?? [];
      if (clearedShelf) {
        await clearedShelf.slideOut(clearedItems);
      }
      clearedItems.forEach((item) => item.destroy());
      this.itemsByShelf.delete(clearedId);
    }

    if (isWon(this.state)) {
      this.onWon?.();
    }
  }

  tryUndo(): boolean {
    if (
      this.undoAllowance <= 0 ||
      this.undosRemaining <= 0 ||
      this.undoSnapshots.length === 0 ||
      this.busy
    ) {
      return false;
    }

    this.busy = true;
    this.clearSelection();
    const previous = this.undoSnapshots.pop();
    if (!previous) {
      this.busy = false;
      return false;
    }
    this.state = cloneBoardState(previous);
    this.undosRemaining -= 1;
    this.resyncVisualsToState();
    this.busy = false;
    this.emitUndoState();
    return true;
  }

  hasMovesToUndo(): boolean {
    return this.undoSnapshots.length > 0;
  }

  canAttemptUndo(): boolean {
    return this.undoAllowance > 0 && this.undosRemaining > 0;
  }

  areUndosExhausted(): boolean {
    return this.undoAllowance > 0 && this.undosRemaining <= 0;
  }

  private emitUndoState(): void {
    const exhausted = this.undosRemaining <= 0;
    this.onUndoStateChange?.(this.undosRemaining, exhausted);
  }

  private resyncVisualsToState(): void {
    for (const entry of this.layout) {
      const id = entry.definition.id;
      const boardShelf = this.state.shelves.find((s) => s.id === id);
      if (!boardShelf) continue;

      const homeX = this.shelfHomeX.get(id) ?? entry.x;
      let view = this.shelfViews.get(id);

      if (boardShelf.cleared) {
        if (view) {
          view.setVisible(false);
          view.setActive(false);
        }
        const existing = this.itemsByShelf.get(id);
        existing?.forEach((item) => {
          this.scene.tweens.killTweensOf(item);
          item.destroy();
        });
        this.itemsByShelf.delete(id);
        continue;
      }

      if (!view) {
        view = new Shelf(this.scene, {
          id: entry.definition.id,
          x: homeX,
          y: entry.y,
          width: entry.width,
          side: entry.definition.side,
          capacity: entry.definition.capacity,
        });
        view.setTapHandler(() => void this.onShelfTap(id));
        this.shelfViews.set(id, view);
      } else {
        view.resetFromSlide(homeX);
        view.y = entry.y;
        view.setDepth(entry.y);
        view.setTapHandler(() => void this.onShelfTap(id));
      }

      const existing = this.itemsByShelf.get(id) ?? [];
      existing.forEach((item) => {
        this.scene.tweens.killTweensOf(item);
        item.destroy();
      });

      const items: ClothingItem[] = [];
      boardShelf.items.forEach((clothingId, index) => {
        const pos = view!.getSlotWorldPosition(index);
        const item = new ClothingItem(this.scene, pos.x, pos.y, clothingId);
        item.setDepth(clothingDepthOnShelf(entry.y, index));
        items.push(item);
      });
      this.itemsByShelf.set(id, items);
    }
  }

  restart(level: LevelDefinition, layout: ShelfLayoutEntry[]): void {
    for (const items of this.itemsByShelf.values()) {
      items.forEach((i) => i.destroy());
    }
    for (const shelf of this.shelfViews.values()) {
      shelf.destroy();
    }
    this.shelfViews.clear();
    this.itemsByShelf.clear();
    this.selectedFromId = null;
    this.busy = false;
    this.undoSnapshots.length = 0;
    this.undosRemaining = this.undoAllowance;
    this.layout = layout;

    this.state = createBoard(level);
    for (const entry of layout) {
      const boardShelf = this.state.shelves.find((s) => s.id === entry.definition.id);
      if (!boardShelf) continue;

      const shelf = new Shelf(this.scene, {
        id: entry.definition.id,
        x: entry.x,
        y: entry.y,
        width: entry.width,
        side: entry.definition.side,
        capacity: entry.definition.capacity,
      });
      shelf.setTapHandler(() => void this.onShelfTap(entry.definition.id));
      shelf.setDepth(entry.y);
      this.shelfViews.set(entry.definition.id, shelf);
      this.shelfHomeX.set(entry.definition.id, entry.x);

      const items: ClothingItem[] = [];
      boardShelf.items.forEach((clothingId, index) => {
        const pos = shelf.getSlotWorldPosition(index);
        const item = new ClothingItem(this.scene, pos.x, pos.y, clothingId);
        item.setDepth(clothingDepthOnShelf(entry.y, index));
        items.push(item);
      });
      this.itemsByShelf.set(entry.definition.id, items);
      this.shelfHomeX.set(entry.definition.id, entry.x);
    }

    this.emitUndoState();
  }
}
