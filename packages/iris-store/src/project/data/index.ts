import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { load } from "..";
import { IAnnotation } from "../types";

export interface ProjectState {
  categories: string[];
  annotations: {
    [key: string]: IAnnotation[];
  };
}

interface AnnotationEdit {
  images: string[];
  annotation: IAnnotation;
}

const initialState: ProjectState = {
  categories: [],
  annotations: {},
};

function stateAddCategory(state: ProjectState, category: string) {
  if (!state.categories.includes(category)) {
    state.categories.push(category);
  }
}

function stateDeleteCategory(state: ProjectState, category: string) {
  // Remove category.
  const labelIndex = state.categories.findIndex((c) => c === category);
  state.categories.splice(labelIndex, 1);

  // NOTE: What if someone deletes a category right as we label something
  // as the deleted category?
  // it should work out as long as we make sure to recreate the category
  // when creating the annotation.
  for (const [key, val] of Object.entries(state.annotations)) {
    // Remove annotations that have deleted category.
    state.annotations[key] = val.filter((a) => a.label !== category);
    // Clean up if image now has no annotations.
    if (state.annotations[key].length === 0) {
      delete state.annotations[key];
    }
  }
}

function stateAddAnnotations(state: ProjectState, payload: AnnotationEdit) {
  for (const image of payload.images) {
    if (state.annotations[image] === undefined) {
      state.annotations[image] = [];
    }
    state.annotations[image].unshift(payload.annotation);
  }
}

function stateEditAnnotations(state: ProjectState, payload: AnnotationEdit) {
  for (const image of payload.images) {
    if (state.annotations[image] === undefined) {
      state.annotations[image] = [];
    }
    const index = state.annotations[image].findIndex(
      (b) => b.id === payload.annotation.id
    );
    state.annotations[image][index] = payload.annotation;
  }
}

function stateDeleteAnnotations(state: ProjectState, payload: AnnotationEdit) {
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

const projectSlice = createSlice({
  name: "project",
  initialState,
  reducers: {
    addCategory(state, { payload }: PayloadAction<string>) {
      stateAddCategory(state, payload);
    },
    deleteCategory(state, { payload }: PayloadAction<string>) {
      stateDeleteCategory(state, payload);
    },
    addAnnotations(state, { payload }: PayloadAction<AnnotationEdit>) {
      stateAddAnnotations(state, payload);
      stateAddCategory(state, payload.annotation.label);
    },
    editAnnotations(state, { payload }: PayloadAction<AnnotationEdit>) {
      stateEditAnnotations(state, payload);
      stateAddCategory(state, payload.annotation.label);
    },
    deleteAnnotations(state, { payload }: PayloadAction<AnnotationEdit>) {
      stateDeleteAnnotations(state, payload);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(load.fulfilled, (_state, { payload }) => {
      return {
        categories: payload.annotations.labels,
        annotations: payload.annotations.annotations,
      };
    });
  },
});

export default projectSlice.reducer;
export const {
  addCategory,
  deleteCategory,
  addAnnotations,
  editAnnotations,
  deleteAnnotations,
} = projectSlice.actions;
