import { createAction, createReducer, nanoid } from "@reduxjs/toolkit";

import { load } from "../load";
import { DataState, Project } from "./types";
import { labelNameExists } from "./utils";

const initialState: DataState = {
  labels: {
    data: {},
    active: undefined,
  },
  annotations: {
    data: {},
  },
  images: {
    data: {},
    active: undefined,
    filter: {},
    selection: [],
  },
  tool: {
    active: "move",
  },
};

export const NEW_LABEL = createAction(
  "[project] Create a new label",
  function prepare(name: string) {
    return {
      payload: {
        id: nanoid(),
        name,
      },
    };
  }
);

export const RENAME_LABEL = createAction<{ id: string; name: string }>(
  "[project] Rename label"
);

export const DELETE_LABEL = createAction<string>("[project] Delete label");

export const SELECT_LABEL = createAction<string>("[project] Select label");

export const SELECT_IMAGE = createAction<string>("[project] Select image");

export const SELECT_TOOL = createAction<string>("[project] Select tool");

export const NEW_ANNOTATION = createAction(
  "[project] Create new annotation",
  function prepare(annotation: Project.Annotation) {
    return {
      payload: {
        id: nanoid(),
        ...annotation,
      },
    };
  }
);

export const UPDATE_ANNOTATION = createAction<Project.AnnotationWithID>(
  "[project] Update annotation"
);

export const DELETE_ANNOTATION = createAction<string>(
  "[project] Delete annotation"
);

const reducer = createReducer(initialState, (builder) => {
  builder.addCase(NEW_LABEL, (state, { payload }) => {
    if (!labelNameExists(state.labels.data, payload.name)) {
      state.labels.data[payload.id] = payload;
    }
  });
  builder.addCase(RENAME_LABEL, (state, { payload }) => {
    state.labels.data[payload.id] = payload;
  });
  builder.addCase(DELETE_LABEL, (state, { payload }) => {
    delete state.labels.data[payload];
  });
  builder.addCase(SELECT_LABEL, (state, { payload }) => {
    state.labels.active = payload;
  });
  builder.addCase(SELECT_IMAGE, (state, { payload }) => {
    state.images.active = payload;
  });
  builder.addCase(SELECT_TOOL, (state, { payload }) => {
    state.tool.active = payload;
  });
  builder.addCase(NEW_ANNOTATION, (state, { payload }) => {
    const { active } = state.images;
    if (active && state.labels.data.hasOwnProperty(payload.label)) {
      if (state.images.data[active].annotations === undefined) {
        state.images.data[active].annotations = [];
      }
      state.images.data[active].annotations.push(payload.id);
      state.annotations.data[payload.id] = payload;
    }
  });
  builder.addCase(UPDATE_ANNOTATION, (state, { payload }) => {
    if (state.labels.data.hasOwnProperty(payload.label)) {
      state.annotations.data[payload.id] = payload;
    }
  });
  builder.addCase(DELETE_ANNOTATION, (state, { payload }) => {
    delete state.annotations.data[payload];
  });
  builder.addCase(load.fulfilled, (state, action) => {
    state.labels.data = action.payload.labels;
    state.labels.active = (Object.values(action.payload.labels)[0] as any).id;

    state.images.data = action.payload.images;
    state.images.active = (Object.values(action.payload.images)[0] as any).id;

    state.annotations.data = action.payload.annotations;
  });
});

// - BULK_LABEL (labelID)
// - DELETE_IMAGES ()
// - UPLOAD_IMAGE (blob)

export * from "./types";
export default reducer;
