import { useEffect } from "react";

import {
  Action,
  configureStore,
  Middleware,
  ThunkAction,
} from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import { Manager } from "socket.io-client";

import { api } from "@iris/api";

import connections, { loadConnections } from "./connections";
import project, { decrementSaving, incrementSaving, load } from "./project";
import data, {
  addImages,
  editImage,
  ProjectImage,
  removeImages,
} from "./project/data";
import ui, { setRoomSize } from "./project/ui";
import projects, { loadProjects } from "./projects";

const manager = new Manager();
const socket = manager.socket("/");

socket.on("roomSize", (res: number) => {
  store.dispatch(setRoomSize(res));
});

socket.on("patch", (res: any) => {
  store.dispatch({ type: "socket", action: res });
});

socket.emit("join", { image: "boop" });

const persist: Middleware<{}, {}> = (storeAPI) => (next) => async (action) => {
  let result;
  if (action.type === "socket") {
    result = next(action.action);
  } else {
    result = next(action);
  }

  // only persist data changes
  if (action.type && action.type.startsWith("data/")) {
    storeAPI.dispatch(incrementSaving());

    const state = storeAPI.getState() as RootState;

    socket.emit("patch", action);

    try {
      await api.put("/project", {
        query: { projectID: state.project.id },
        headers: {
          "Content-Type": "application/json",
        },
        data: {
          version: "v2",
          labels: state.data.categories,
          annotations: state.data.annotations,
        },
      });
    } catch {}

    storeAPI.dispatch(decrementSaving());
  }
  return result;
};

const store = configureStore({
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(persist),
  reducer: { connections, projects, project, ui, data },
  // @ts-ignore
  devTools: process.env.NODE_ENV !== "production",
});

export type RootState = ReturnType<typeof store.getState>;

export type AppThunk = ThunkAction<void, RootState, null, Action<string>>;

async function uploadImage(jpeg: any, dispatch: any) {
  const formData = new FormData();
  formData.append(jpeg.name, jpeg.blob);
  try {
    await api.post("/images", {
      data: formData,
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

async function deleteImage(image: string) {
  try {
    await api.del("/images/:imageID", {
      path: { imageID: image },
    });
  } catch {
    // TODO
  }
}

export const deleteImages = (images: string[]): AppThunk => async (
  dispatch
) => {
  dispatch(incrementSaving());
  dispatch(removeImages(images));

  const promises = images.map((image) => deleteImage(image));

  await Promise.all(promises).then(() => {
    dispatch(decrementSaving());
  });
};

export function useProject(id: string) {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(load(id));
  }, [dispatch, id]);

  return useSelector((state: RootState) => state.project);
}

export function selectedConnectionSelector(state: RootState) {
  if (state.connections.selected) {
    return state.connections.selected;
  }
  if (state.connections.connections.length > 0) {
    return state.connections.connections[0].id;
  }
  return;
}

export function useProjects() {
  const dispatch = useDispatch();

  const connectionID = useSelector(selectedConnectionSelector);

  const connectionsStatus = useSelector(
    (state: RootState) => state.connections.status
  );
  const connections = useSelector(
    (state: RootState) => state.connections.connections
  );
  const projectsStatus = useSelector(
    (state: RootState) => state.projects.status
  );
  const projects = useSelector((state: RootState) => state.projects.projects);

  useEffect(() => {
    dispatch(loadConnections());
  }, [dispatch]);

  useEffect(() => {
    if (connectionID) {
      dispatch(loadProjects(connectionID));
    }
  }, [dispatch, connectionID, connections]);

  return {
    connections: {
      status: connectionsStatus,
      data: connections,
    },
    projects: {
      status: projectsStatus,
      data: projects,
    },
  };
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
