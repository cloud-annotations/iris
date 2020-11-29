export interface Annotation {
  id: string;
  label: string;
  tool?: string;
  targets?: Target[];
  [key: string]: any; // plugins can specify extra keys.
}

export interface Target {
  id: string;
  x: number;
  y: number;
}
