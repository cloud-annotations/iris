import { useEffect } from "react";

import { Action, configureStore, ThunkAction } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";

import project, { load } from "./project";
import data from "./project/data";
import ui from "./project/ui";

const store = configureStore({
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

export function imageSelector(state: RootState) {
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

export default store;
