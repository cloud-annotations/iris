import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { load } from "..";

export interface UI {
  selectedTool: string;
  selectedCategory: string;
  selectedImages: string[];
  highlightedBox?: string;
  imageFilter: {
    mode: "all" | "unlabeled" | "labeled";
    label?: string;
  };
}

const initialState: UI = {
  selectedTool: "",
  selectedCategory: "",
  selectedImages: [],
  highlightedBox: undefined,
  imageFilter: {
    mode: "all",
    label: undefined,
  },
};

const projectSlice = createSlice({
  name: "project",
  initialState,
  reducers: {
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
      const rangeHasImage = state.selectedImages.includes(payload);

      // Add or remove the new image.
      const newRange = rangeHasImage
        ? state.selectedImages.filter((i) => i !== payload)
        : [payload, ...state.selectedImages];

      state.selectedImages = newRange;
    },
    // TODO: why not just pass the id? and why could payload be null?
    highlightBox(state, { payload }: PayloadAction<{ id?: string }>) {
      state.highlightedBox = payload?.id;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(load.fulfilled, (_state, { payload }) => {
      const firstImage = Object.keys(payload.annotations.annotations)[0];
      // TODO: get typing support somehow? maybe make IRIS importable?
      // TODO: Move tool should always be the first item.
      // @ts-ignore
      const firstRealTool = window.IRIS.tools.list()[1].id;
      return {
        // NOTE: Should be the first tool after the move tool.
        selectedTool: firstRealTool,
        selectedCategory: payload.annotations.labels[0],
        selectedImages: [firstImage],
        imageFilter: {
          mode: "all",
        },
      };
    });
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
} = projectSlice.actions;
export * from "./types";
