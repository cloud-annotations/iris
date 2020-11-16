import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

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

export interface ProjectState {
  status: "idle" | "pending" | "success" | "error";
  saving: number;
  id?: string;
  name?: string;
  created?: string;
  error?: any;
}

const initialState: ProjectState = { saving: 0, status: "idle" };

const projectSlice = createSlice({
  name: "project",
  initialState,
  reducers: {
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
export const { decrementSaving, incrementSaving } = projectSlice.actions;
export * from "./types";
