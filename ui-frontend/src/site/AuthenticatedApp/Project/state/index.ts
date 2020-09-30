import { atom } from "recoil";

const mockLabels = ["cat", "dog"];
const mockBoxes = [
  { id: "1", x: 0.53, y: 0.25, x2: 0.7, y2: 0.5, label: mockLabels[1] },
  { id: "2", x: 0.0, y: 0.0, x2: 0.3, y2: 0.4, label: mockLabels[1] },
];

interface Box {
  id: string;
  label: string;
  x: number;
  y: number;
  x2: number;
  y2: number;
}

export const boxesState = atom<Box[]>({
  key: "boxesState",
  default: mockBoxes,
});

export const activeBoxState = atom<Box | undefined>({
  key: "activeBoxState",
  default: undefined,
});

export const labelsState = atom<string[]>({
  key: "labelsState",
  default: mockLabels,
});

export const activeLabelState = atom<string>({
  key: "activeLabelState",
  default: mockLabels[0],
});
