export interface Input {
  name: string;
  items: Item[];
  strip_height: number;
}

export interface Item {
  id: number;
  demand: number;
  allowed_orientations: number[];
  shape: Shape;
}

export interface Shape {
  type: string;
  data: number[][];
}
