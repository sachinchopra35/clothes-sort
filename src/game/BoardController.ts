import Phaser from "phaser";
import type { LevelDefinition } from "../levels/levelTypes";
import type { ShelfLayoutEntry } from "../layout/shelfLayout";
import { ClothingItem } from "../objects/ClothingItem";
import { Shelf } from "../objects/Shelf";
import {
  applyMove,
  canMove,
  createBoard,
  getMovableGroup,
  isWon,
  type BoardState,
} from "./boardState";

export class BoardController {
  private state: BoardState;
  private readonly scene: Phaser.Scene;
  private readonly shelfViews = new Map<string, Shelf>();
  /** Items wall → open per shelf id. */
  private readonly itemsByShelf = new Map<string, ClothingItem[]>();
  private selectedFromId: string | null = null;
  private busy = false;
  onWon: (() => void) | null = null;

  constructor(
    scene: Phaser.Scene,
    level: LevelDefinition,
    layout: ShelfLayoutEntry[],
  ) {
    this.scene = scene;
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

      const items: ClothingItem[] = [];
      boardShelf.items.forEach((clothingId, index) => {
        const pos = shelf.getSlotWorldPosition(index);
        const item = new ClothingItem(scene, pos.x, pos.y, clothingId);
        item.setDepth(entry.y + 1 + index);
        items.push(item);
      });
      this.itemsByShelf.set(entry.definition.id, items);
    }
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

  private async onShelfTap(shelfId: string): Promise<void> {
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

    const result = applyMove(this.state, fromId, shelfId);
    if (!result) {
      fromItems.push(...movingViews.splice(0));
      toItems.splice(toItems.length - moveCount, moveCount);
      this.busy = false;
      return;
    }
    this.state = result.state;

    const destShelf = this.shelfViews.get(shelfId)!;
    const animPromises = movingViews.map((item, i) => {
      const slotIndex = toItems.length - moveCount + i;
      const pos = destShelf.getSlotWorldPosition(slotIndex);
      item.setDepth(destShelf.y + 1 + slotIndex);
      return item.animateTo(pos.x, pos.y);
    });
    await Promise.all(animPromises);

    for (const clearedId of result.clearedShelfIds) {
      const clearedShelf = this.shelfViews.get(clearedId);
      const clearedItems = this.itemsByShelf.get(clearedId) ?? [];
      if (clearedShelf) {
        await clearedShelf.slideOut(clearedItems);
      }
      clearedItems.forEach((item) => item.destroy());
      this.itemsByShelf.delete(clearedId);
    }

    this.busy = false;

    if (isWon(this.state)) {
      this.onWon?.();
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

      const items: ClothingItem[] = [];
      boardShelf.items.forEach((clothingId, index) => {
        const pos = shelf.getSlotWorldPosition(index);
        const item = new ClothingItem(this.scene, pos.x, pos.y, clothingId);
        item.setDepth(entry.y + 1 + index);
        items.push(item);
      });
      this.itemsByShelf.set(entry.definition.id, items);
    }
  }
}
