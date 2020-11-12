import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AppThunk } from "src";

import API from "@iris/api";

const appstaticAPI = new API();

export const load = createAsyncThunk(
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

async function uploadImage(jpeg: any, dispatch: any) {
  const formData = new FormData();
  formData.append(jpeg.name, jpeg.blob);
  try {
    await fetch(`/api/projects/x/images`, {
      method: "POST",
      body: formData,
    });
    dispatch(
      updateImage({
        id: jpeg.name,
        status: "complete",
        date: "",
      })
    );
  } catch {
    dispatch(updateImage({ id: jpeg.name, status: "error", date: "" }));
  }
}

export const uploadImages = (jpegs: any): AppThunk => async (dispatch) => {
  dispatch(incrementSaving());
  dispatch(
    setImages(
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

export interface Image {
  id: string;
  status: "idle" | "pending" | "success" | "error";
  date: string;
}

export interface ProjectState {
  status: "idle" | "pending" | "success" | "error";
  saving: number;
  id?: string;
  name?: string;
  created?: string;
  error?: any;
  images: Image[];
}

const initialState: ProjectState = { saving: 0, status: "idle", images: [] };

const projectSlice = createSlice({
  name: "project",
  initialState,
  reducers: {
    updateImage(state, { payload }) {
      const index = state.images.findIndex((i) => i.id === payload.id);
      state.images[index] = payload;
    },
    setImages(state, { payload }) {
      state.images = [...payload, ...state.images];
    },
    incrementSaving(state) {
      state.saving += 1;
    },
    decrementSaving(state) {
      state.saving -= 1;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(load.pending, (_state, _action) => {
      return {
        status: "pending",
        saving: 0,
        images: [],
      };
    });
    builder.addCase(load.fulfilled, (_state, { payload }) => {
      return {
        status: "success",
        saving: 0,
        id: payload.id,
        name: payload.name,
        created: payload.created,
        images: payload.annotations.images.map(
          (i: any): Image => ({
            id: i.id,
            date: i.date,
            status: "success",
          })
        ),
      };
    });
    builder.addCase(load.rejected, (_state, { payload }) => {
      return {
        status: "error",
        saving: 0,
        error: payload,
        images: [],
      };
    });
  },
});

export default projectSlice.reducer;
export const {
  decrementSaving,
  incrementSaving,
  setImages,
  updateImage,
} = projectSlice.actions;
export * from "./types";
