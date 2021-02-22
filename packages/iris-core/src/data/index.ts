import { createAction, createReducer, nanoid } from "@reduxjs/toolkit";

import { getVisibleImages } from "../hooks";
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
    active: "box",
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

export const TOGGLE_IMAGE = createAction<string>("[project] Toggle image");

export const UPDATE_IMAGE = createAction<Project.Image>(
  "[project] Update image"
);

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

export const SHOW_ALL_IMAGES = createAction("[project] Show all images");

export const SHOW_LABELED_IMAGES = createAction(
  "[project] Show labeled images"
);

export const SHOW_UNLABELED_IMAGES = createAction(
  "[project] Show unlabeled images"
);

export const SHOW_IMAGES_WITH_SPECIFIC_LABEL = createAction<string>(
  "[project] Show images with specific label"
);

function deleteAnnotation(state: DataState, annotationID: string) {
  delete state.annotations.data[annotationID];
  const image = Object.values(state.images.data).find((i) =>
    i.annotations.includes(annotationID)
  );
  if (image?.id === undefined) {
    return;
  }
  const index = state.images.data[image.id].annotations.indexOf(annotationID);
  if (index !== -1) {
    state.images.data[image.id].annotations.splice(index, 1);
  }
}

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

    const annotations = Object.values(state.annotations.data).filter(
      (a) => a.label === payload
    );

    for (const annotation of annotations) {
      deleteAnnotation(state, annotation.id);
    }

    // TODO: update active label if we deleted it.
  });
  builder.addCase(SELECT_LABEL, (state, { payload }) => {
    state.labels.active = payload;
  });
  builder.addCase(SELECT_IMAGE, (state, { payload }) => {
    state.images.active = payload;
    state.images.selection = [];
  });
  builder.addCase(TOGGLE_IMAGE, (state, { payload }) => {
    if (
      state.images.selection.length === 0 &&
      state.images.active !== undefined
    ) {
      state.images.selection = [state.images.active];
    }
    const index = state.images.selection.indexOf(payload);
    if (index === -1) {
      state.images.selection.push(payload);
      state.images.active = payload;
      return;
    }
    if (state.images.selection.length > 1) {
      state.images.selection.splice(index, 1);
      state.images.active =
        state.images.selection[state.images.selection.length - 1];
      return;
    }
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
    // TODO: This could be optimized if we pass the imageID.
    deleteAnnotation(state, payload);
  });

  builder.addCase(SHOW_ALL_IMAGES, (state, _action) => {
    state.images.filter.mode = undefined;
    state.images.filter.label = undefined;
    state.images.selection = [];
    state.images.active = getVisibleImages({ data: state })[0]?.id;
  });
  builder.addCase(SHOW_LABELED_IMAGES, (state, _action) => {
    state.images.filter.mode = "labeled";
    state.images.filter.label = undefined;
    state.images.selection = [];
    state.images.active = getVisibleImages({ data: state })[0]?.id;
  });
  builder.addCase(SHOW_UNLABELED_IMAGES, (state, _action) => {
    state.images.filter.mode = "unlabeled";
    state.images.filter.label = undefined;
    state.images.selection = [];
    state.images.active = getVisibleImages({ data: state })[0]?.id;
  });
  builder.addCase(SHOW_IMAGES_WITH_SPECIFIC_LABEL, (state, { payload }) => {
    state.images.filter.mode = "byLabel";
    state.images.filter.label = payload;
    state.images.selection = [];
    state.images.active = getVisibleImages({ data: state })[0]?.id;
  });

  builder.addCase(UPDATE_IMAGE, (state, { payload }) => {
    state.images.data[payload.id] = payload;
  });

  builder.addCase(load.fulfilled, (state, action) => {
    state.labels.data = action.payload.labels;
    state.labels.active = (Object.values(action.payload.labels)[0] as any)?.id;

    state.images.data = action.payload.images;

    for (const key of Object.keys(state.images.data)) {
      state.images.data[key] = {
        ...state.images.data[key],
        status: "success",
      };
    }

    state.images.active = getVisibleImages({ data: state })[0]?.id;

    state.annotations.data = action.payload.annotations;
  });
});

// - BULK_LABEL (labelID)
// - DELETE_IMAGES ()
// - UPLOAD_IMAGE (blob)

export * from "./types";
export default reducer;
