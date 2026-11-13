import type { ClothingId } from "../game/clothing";

export type ShelfSide = "left" | "right";

export interface ShelfDefinition {
  id: string;
  side: ShelfSide;
  capacity: number;
  /** Items from wall (index 0) toward open end. */
  items: ClothingId[];
}

export interface LevelMove {
  from: string;
  to: string;
}

export interface LevelDefinition {
  id: string;
  name: string;
  shelves: ShelfDefinition[];
  /** Known winning move sequence (shelf ids), replayed by tests as a solvability proof. */
  solution?: LevelMove[];
}
