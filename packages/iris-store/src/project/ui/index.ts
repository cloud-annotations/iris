import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface UI {
  selectedTool?: string;
  selectedCategory?: string;
  selectedImages?: string[];
  highlightedBox?: string;
  roomSize?: number;
  imageFilter: {
    mode: "all" | "unlabeled" | "labeled";
    label?: string;
  };
}

const initialState: UI = {
  selectedTool: "box",
  selectedCategory: undefined,
  selectedImages: undefined,
  highlightedBox: undefined,
  roomSize: undefined,
  imageFilter: {
    mode: "all",
    label: undefined,
  },
};

const projectSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setRoomSize(state, { payload }: PayloadAction<number>) {
      state.roomSize = payload;
    },
    showAllImages(state) {
      state.imageFilter.mode = "all";
    },
    showLabeledImages(state) {
      state.imageFilter.mode = "labeled";
    },
    showUnlabeledImages(state) {
      state.imageFilter.mode = "unlabeled";
    },
    filterByLabel(state, { payload }: PayloadAction<string | undefined>) {
      state.imageFilter.label = payload;
    },
    selectTool(state, { payload }: PayloadAction<string>) {
      state.selectedTool = payload;
    },
    selectCategory(state, { payload }: PayloadAction<string>) {
      state.selectedCategory = payload;
    },
    selectImages(state, { payload }: PayloadAction<string>) {
      state.selectedImages = [payload];
    },
    toggleSelectedImage(state, { payload }: PayloadAction<string>) {
      // TODO: This isn't perfect, if selectedImages is undefined, a toggle click
      // will not consider the derived selection.
      if (state.selectedImages) {
        const rangeHasImage = state.selectedImages.includes(payload);

        // Add or remove the new image.
        const newRange = rangeHasImage
          ? state.selectedImages.filter((i) => i !== payload)
          : [payload, ...state.selectedImages];

        state.selectedImages = newRange;
      } else {
        state.selectedImages = [payload];
      }
    },

    highlightBox(state, { payload }: PayloadAction<string | undefined>) {
      state.highlightedBox = payload;
    },
  },
});

export default projectSlice.reducer;
export const {
  highlightBox,
  selectCategory,
  selectImages,
  selectTool,
  toggleSelectedImage,
  showAllImages,
  showLabeledImages,
  showUnlabeledImages,
  filterByLabel,
  setRoomSize,
} = projectSlice.actions;
