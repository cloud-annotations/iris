import { Middleware } from "@reduxjs/toolkit";
import { Manager } from "socket.io-client";

import { api } from "@iris/api";

import { editImage } from "./data";
import { decrementSaving, incrementSaving } from "./meta";
import store, { ProjectState } from "./store";
import { setRoomSize } from "./ui";

const manager = new Manager();
const socket = manager.socket("/");

socket.on("roomSize", (res: number) => {
  store.dispatch(setRoomSize(res));
});

socket.on("patch", (res: any) => {
  store.dispatch({ ...res, meta: { doNotEmit: true } });
});

socket.emit("join", { image: "boop" });

export const persist: Middleware = (storeAPI) => (next) => async (action) => {
  const result = next(action);

  // only persist data changes
  if (action.type?.startsWith("data/") && action.meta?.doNotEmit !== true) {
    storeAPI.dispatch(incrementSaving());

    const state = storeAPI.getState() as ProjectState;

    socket.emit("patch", action);

    try {
      await api.put("/project", {
        query: { projectID: state.meta.id },
        headers: {
          "Content-Type": "application/json",
        },
        json: {
          version: "v2",
          labels: state.data.categories,
          annotations: state.data.annotations,
        },
      });
    } catch {
      // TODO
    }

    if (action.type === "data/removeImages") {
      const promises = action.payload.map(async (image: string) => {
        try {
          await api.del("/images/:imageID", {
            path: { imageID: image },
            query: {
              projectID: state.meta.id,
            },
          });
        } catch {
          // TODO
        }
      });

      await Promise.all(promises);
    }

    if (action.type === "data/addImages") {
      const promises = action.payload.map(async (jpeg: any) => {
        const formData = new FormData();
        formData.append(jpeg.name, jpeg.blob);
        try {
          await api.post("/images", {
            query: {
              projectID: state.meta.id,
            },
            body: formData,
          });
          storeAPI.dispatch(
            editImage({
              id: jpeg.name,
              status: "success",
              date: "",
            })
          );
        } catch (e) {
          storeAPI.dispatch(
            editImage({ id: jpeg.name, status: "error", date: "" })
          );
        }
      });

      await Promise.all(promises);
    }

    storeAPI.dispatch(decrementSaving());
  }
  return result;
};
