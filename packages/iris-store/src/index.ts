import { useEffect } from "react";

import {
  Action,
  AnyAction,
  configureStore,
  Middleware,
  ThunkAction,
} from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";

import project, { decrementSaving, incrementSaving, load } from "./project";
import data from "./project/data";
import ui from "./project/ui";

const persist: Middleware = (storeAPI) => (next) => (action) => {
  const result = next(action);
  // only persist data changes
  if (action.type && action.type.startsWith("data/")) {
    storeAPI.dispatch(incrementSaving());
    setTimeout(() => {
      storeAPI.dispatch(decrementSaving());
    }, 3000);
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

export function useProject(id: string) {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(load(id));
  }, [dispatch, id]);

  return useSelector((state: RootState) => state.project);
}

export function visibleImagesSelector(state: RootState) {
  const all = state.project.images ?? [];
  const annotatedImages = new Set(Object.keys(state.data.annotations));

  const _labeled = new Set<string>();
  const _unlabeled = new Set<string>();
  for (let elem of all) {
    if (annotatedImages.has(elem)) {
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
    const annotations = state.data.annotations[image];
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
    state.ui.selectedImages?.includes(image)
  );

  if (selection.length === 0) {
    return [visibleImages[0]];
  }

  return selection;
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
