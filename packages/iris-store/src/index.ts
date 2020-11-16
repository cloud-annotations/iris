import { useEffect } from "react";

import {
  Action,
  configureStore,
  Middleware,
  ThunkAction,
} from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";

import project, { decrementSaving, incrementSaving, load } from "./project";
import data, {
  addImages,
  editImage,
  ProjectImage,
  removeImages,
} from "./project/data";
import ui from "./project/ui";

const persist: Middleware<{}, {}> = (storeAPI) => (next) => (action) => {
  const result = next(action);
  // only persist data changes
  if (action.type && action.type.startsWith("data/")) {
    storeAPI.dispatch(incrementSaving());

    const state = storeAPI.getState() as RootState;

    fetch(`/api/projects/${state.project.id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: "v2",
        labels: state.data.categories,
        annotations: state.data.annotations,
      }),
    }).finally(() => {
      storeAPI.dispatch(decrementSaving());
    });
  }
  return result;
};

const store = configureStore({
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(persist),
  reducer: { project, ui, data },
  // @ts-ignore
  devTools: process.env.NODE_ENV !== "production",
});

export type RootState = ReturnType<typeof store.getState>;

export type AppThunk = ThunkAction<void, RootState, null, Action<string>>;

async function uploadImage(jpeg: any, dispatch: any) {
  const formData = new FormData();
  formData.append(jpeg.name, jpeg.blob);
  try {
    await fetch(`/api/projects/x/images`, {
      method: "POST",
      body: formData,
    });
    dispatch(
      editImage({
        id: jpeg.name,
        status: "success",
        date: "",
      })
    );
  } catch {
    dispatch(editImage({ id: jpeg.name, status: "error", date: "" }));
  }
}

export const uploadImages = (jpegs: any): AppThunk => async (dispatch) => {
  dispatch(incrementSaving());
  dispatch(
    addImages(
      jpegs.map((j: any) => ({
        id: j.name,
        data: "",
        status: "pending",
      }))
    )
  );

  const promises = jpegs.map((jpeg: any) => uploadImage(jpeg, dispatch));

  await Promise.all(promises).then(() => {
    dispatch(decrementSaving());
  });
};

export const deleteImages = (images: string[]): AppThunk => async (
  dispatch
) => {
  dispatch(incrementSaving());
  dispatch(removeImages(images));
  // TODO: Actually delete images.
  dispatch(decrementSaving());
};

export function useProject(id: string) {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(load(id));
  }, [dispatch, id]);

  return useSelector((state: RootState) => state.project);
}

export function visibleImagesSelector(state: RootState) {
  const all = state.data.images ?? [];
  const annotatedImages = new Set(Object.keys(state.data.annotations));

  const _labeled = new Set<ProjectImage>();
  const _unlabeled = new Set<ProjectImage>();
  for (let elem of all) {
    if (annotatedImages.has(elem.id)) {
      _labeled.add(elem);
    } else {
      _unlabeled.add(elem);
    }
  }

  const labeled = Array.from(_labeled);
  const unlabeled = Array.from(_unlabeled);

  const filterLabel = state.ui.imageFilter.label;
  if (filterLabel === undefined) {
    switch (state.ui.imageFilter.mode) {
      case "all":
        return all;
      case "labeled":
        return labeled;
      case "unlabeled":
        return unlabeled;
    }
  }

  return labeled.filter((image) => {
    const annotations = state.data.annotations[image.id];
    if (annotations === undefined) {
      return false;
    }
    return annotations.find((a) => a.label === filterLabel) !== undefined;
  });
}

export function visibleSelectedImagesSelector(state: RootState) {
  const visibleImages = visibleImagesSelector(state);

  if (state.ui.selectedImages === undefined) {
    return [visibleImages[0]];
  }

  const selection = visibleImages.filter((image) =>
    state.ui.selectedImages?.includes(image.id)
  );

  if (selection.length === 0) {
    return [visibleImages[0]];
  }

  return selection;
}

export function activeImageSelector(
  state: RootState
): ProjectImage | undefined {
  const selection = visibleSelectedImagesSelector(state);
  return selection[0];
}

export function selectedCategorySelector(state: RootState) {
  if (
    state.ui.selectedCategory &&
    state.data.categories.includes(state.ui.selectedCategory)
  ) {
    return state.ui.selectedCategory;
  }
  return state.data.categories[0];
}

export default store;
