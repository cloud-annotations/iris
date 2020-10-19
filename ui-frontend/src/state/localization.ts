import { atom } from "recoil";

const mockImage =
  "https://www.sciencemag.org/sites/default/files/styles/article_main_image_-_1280w__no_aspect_/public/dogs_1280p_0.jpg?itok=6jQzdNB8";
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

export const hoverBoxState = atom<Box | undefined>({
  key: "hoverBoxState",
  default: undefined,
});

export const activeBoxState = atom<Box | undefined>({
  key: "activeBoxState",
  default: undefined,
});

export const labelsState = atom<string[]>({
  key: "labelsState",
  default: mockLabels,
});

// export const activeLabelAtom = atom<string | undefined>({
//   key: "activeLabelAtom",
//   default: undefined,
// });

// export const activeLabelState = selector<string>({
//   key: "activeLabelState",
//   get: ({ get }) =>
//     get(activeLabelAtom) || get(labelsState)[0] || "Untitled Label",
//   set: ({ set }, newVal) => {
//     set(activeLabelAtom, newVal);
//   },
// });

export const imageState = atom<string | undefined>({
  key: "imageState",
  default: mockImage,
});

export const toolState = atom<string>({
  key: "toolState",
  default: "box",
});
