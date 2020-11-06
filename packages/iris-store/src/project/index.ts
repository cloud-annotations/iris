import { useEffect } from "react";

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";

import API from "@iris/api";

import { AppThunk, RootState } from "./..";
import { IAnnotation } from "./types";

const appstaticAPI = new API();

export const sync = (action: any): AppThunk => async (dispatch, getState) => {
  dispatch(incrementSaving());
  dispatch(action);
  try {
    const state = getState();
    console.log(state);
    // TODO: persist state;
    // TODO: emit socket message;
  } catch (err) {
    // TODO: handle error
  } finally {
    dispatch(decrementSaving());
  }
};

const load = createAsyncThunk(
  "project/load",
  async (projectID: string, _thunkAPI) => {
    const request = appstaticAPI.endpoint("/api/projects/:id", {
      path: {
        id: projectID,
      },
    });
    return await request.do();
  }
);

export function useProject(id: string) {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(load(id));
  }, [dispatch, id]);

  return useSelector((state: RootState) => state.project);
}

export interface UI {
  selectedTool: string;
  selectedCategory: string;
  selectedImages: string[];
  highlightedBox?: string;
}

export interface ProjectState {
  status: "idle" | "pending" | "success" | "error";
  saving: number;
  id?: string;
  name?: string;
  created?: string;
  error?: any;
  categories?: string[];
  images?: string[];
  annotations?: {
    [key: string]: IAnnotation[];
  };
  ui?: UI;
}

const initialState: ProjectState = { saving: 0, status: "idle" };

const projectSlice = createSlice({
  name: "project",
  initialState,
  reducers: {
    addCategory(state, { payload }) {
      if (state.categories === undefined) {
        state.categories = [];
      }
      if (!state.categories.includes(payload)) {
        state.categories.push(payload);
      }
    },
    deleteCategory(state, { payload }) {
      // find and remove category
      if (state.categories !== undefined) {
        const labelIndex = state.categories.findIndex((c) => c === payload);
        state.categories.splice(labelIndex, 1);
      }

      if (state.annotations !== undefined) {
        // NOTE: What if someone deletes a category right as we label something
        // as the deleted category?
        // it should work out as long as we make sure to recreate the category
        // when creating the annotation.
        for (const [key, val] of Object.entries(state.annotations)) {
          // Remove annotations without annotations.
          state.annotations[key] = val.filter((a) => a.label !== payload);
          // Remove images without annotations.
          if (state.annotations[key].length === 0) {
            delete state.annotations[key];
          }
        }
      }
    },
    addImages(_state, _action) {
      // TODO
      // const imageNames = payload.map((image) => image.name);
      // state.images = [...new Set([...imageNames, ...state.images])];
    },
    deleteImages(_state, _action) {
      // TODO
      // images.forEach((image) => {
      //   state.images.splice(
      //     state.images.findIndex((i) => i === image),
      //     1
      //   );
      //   // TODO: This could possibly cause an undefined error if someone deletes
      //   // an image when someone else adds a box to the image. We should check
      //   // if the image exists in `createBox` and `deleteBox`
      //   delete draft.annotations[image];
      // });
    },
    addAnnotations(state, { payload }) {
      if (state.annotations === undefined) {
        state.annotations = {};
      }
      // add annotation to images
      for (const image of payload.images) {
        if (state.annotations[image] === undefined) {
          state.annotations[image] = [];
        }
        state.annotations[image].unshift(payload.annotation);
      }
      if (state.categories === undefined) {
        state.categories = [];
      }
      // create categories if it doesn't exist for some reason
      if (!state.categories.includes(payload.annotation.label)) {
        state.categories.push(payload.annotation.label);
      }
    },
    editAnnotations(state, { payload }) {
      if (state.annotations === undefined) {
        state.annotations = {};
      }
      // add annotation to images
      for (const image of payload.images) {
        if (state.annotations[image] === undefined) {
          state.annotations[image] = [];
        }
        // state.annotations[image].unshift(payload.annotation);
        const index = state.annotations[image].findIndex(
          (b) => b.id === payload.annotation.id
        );
        state.annotations[image][index] = payload.annotation;
      }
      if (state.categories === undefined) {
        state.categories = [];
      }
      // create categories if it doesn't exist for some reason
      if (!state.categories.includes(payload.annotation.label)) {
        state.categories.push(payload.annotation.label);
      }
    },
    deleteAnnotations(state, { payload }) {
      if (state.annotations !== undefined) {
        for (const image of payload.images) {
          const annotationIndex = state.annotations[image].findIndex((a) => {
            return a.id === payload.annotation.id;
          });
          state.annotations[image].splice(annotationIndex, 1);

          // remove image if it doesn't have any annotations
          if (state.annotations[image].length === 0) {
            delete state.annotations[image];
          }
        }
      }
    },
    incrementSaving(state) {
      state.saving += 1;
    },
    decrementSaving(state) {
      state.saving -= 1;
    },
    selectTool(state, { payload }) {
      if (state.ui !== undefined) {
        state.ui.selectedTool = payload;
      }
    },
    selectCategory(state, { payload }) {
      if (state.ui !== undefined) {
        state.ui.selectedCategory = payload;
      }
    },
    selectImages(state, { payload }) {
      if (state.ui !== undefined) {
        state.ui.selectedImages = [payload];
      }
    },
    toggleSelectedImage(state, { payload }) {
      if (state.ui !== undefined) {
        const rangeHasImage = state.ui.selectedImages.includes(payload);

        // Add or remove the new image.
        const newRange = rangeHasImage
          ? state.ui.selectedImages.filter((i) => i !== payload)
          : [payload, ...state.ui.selectedImages];

        state.ui.selectedImages = newRange;
      }
    },
    highlightBox(state, { payload }) {
      if (state.ui !== undefined) {
        state.ui.highlightedBox = payload?.id;
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(load.pending, (_state, _action) => {
      return {
        status: "pending",
        saving: 0,
      };
    });
    builder.addCase(load.fulfilled, (_state, { payload }) => {
      const firstImage = Object.keys(payload.annotations.annotations)[0];
      // TODO: get typing support somehow? maybe make IRIS importable?
      // TODO: Move tool should always be the first item.
      // @ts-ignore
      const firstRealTool = window.IRIS.tools.list()[1].id;
      return {
        status: "success",
        saving: 0,
        id: payload.id,
        name: payload.name,
        created: payload.created,
        categories: payload.annotations.labels,
        annotations: payload.annotations.annotations,
        images: payload.annotations.images,
        ui: {
          // NOTE: Should be the first tool after the move tool.
          selectedTool: firstRealTool,
          selectedCategory: payload.annotations.labels[0],
          selectedImages: [firstImage],
        },
      };
    });
    builder.addCase(load.rejected, (_state, { payload }) => {
      return {
        status: "error",
        saving: 0,
        error: payload,
      };
    });
  },
});

export default projectSlice.reducer;
export const {
  addAnnotations,
  addCategory,
  addImages,
  decrementSaving,
  deleteAnnotations,
  deleteCategory,
  deleteImages,
  highlightBox,
  incrementSaving,
  selectCategory,
  selectImages,
  selectTool,
  toggleSelectedImage,
} = projectSlice.actions;
export * from "./types";
