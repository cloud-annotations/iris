import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import API from "@iris/api";

import { RootState } from "..";

const appstaticAPI = new API();

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
    return await request.do();
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
    builder.addCase(loadProjects.rejected, (_state, { payload }) => {
      return {
        status: "error",
        error: payload,
        projects: [],
      };
    });
  },
});

export default projectSlice.reducer;
