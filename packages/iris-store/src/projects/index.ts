import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import API from "@iris/api";

import { RootState } from "..";

const appstaticAPI = new API();

let previous: AbortController;
export const loadProjects = createAsyncThunk(
  "projects/loadProjects",
  async (connectionID: string, thunkAPI) => {
    const state = thunkAPI.getState() as RootState;
    const connection = state.connections.connections.find(
      (c) => c.id === connectionID
    );
    const request = appstaticAPI.endpoint("/api/projects", {
      query: {
        providerID: connection.providerID,
        connectionID: connection.id,
      },
    });

    const controller = new AbortController();
    const signal = controller.signal;

    if (previous) {
      previous.abort();
    }
    previous = controller;

    return await fetch(request.uri, { signal }).then((r) => r.json());
  }
);

export interface ProjectState {
  status: "idle" | "pending" | "success" | "error";
  projects: any[];
  error?: any;
}

const initialState: ProjectState = {
  status: "idle",
  projects: [],
};

const projectSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(loadProjects.pending, (_state, _action) => {
      return {
        status: "pending",
        projects: [],
      };
    });
    builder.addCase(loadProjects.fulfilled, (_state, { payload }) => {
      return {
        status: "success",
        projects: payload,
      };
    });
    builder.addCase(loadProjects.rejected, (state, action) => {
      if (action.error.name === "AbortError") {
        return state;
      }
      return {
        status: "error",
        error: action.error,
        projects: [],
      };
    });
  },
});

export default projectSlice.reducer;
