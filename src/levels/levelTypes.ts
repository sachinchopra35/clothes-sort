import type { ClothingId } from "../game/clothing";

export type ShelfSide = "left" | "right";

export interface ShelfDefinition {
  id: string;
  side: ShelfSide;
  capacity: number;
  /** Items from wall (index 0) toward open end. */
  items: ClothingId[];
}

export interface LevelDefinition {
  id: string;
  name: string;
  shelves: ShelfDefinition[];
}
