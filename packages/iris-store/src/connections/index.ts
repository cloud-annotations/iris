import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import API from "@iris/api";

const appstaticAPI = new API();

export const loadConnections = createAsyncThunk(
  "projects/loadConnections",
  async (_, _thunkAPI) => {
    const request = appstaticAPI.endpoint("/api/connections");
    return await request.do();
  }
);

export interface ProjectState {
  status: "idle" | "pending" | "success" | "error";
  connections: any[];
  selected?: string;
  error?: any;
}

const initialState: ProjectState = {
  status: "idle",
  connections: [],
};

const projectSlice = createSlice({
  name: "connections",
  initialState,
  reducers: {
    select(state, { payload }) {
      state.selected = payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loadConnections.pending, (_state, _action) => {
      return {
        status: "pending",
        connections: [],
      };
    });
    builder.addCase(loadConnections.fulfilled, (_state, { payload }) => {
      return {
        status: "success",
        connections: payload,
      };
    });
    builder.addCase(loadConnections.rejected, (_state, { payload }) => {
      return {
        status: "error",
        error: payload,
        connections: [],
      };
    });
  },
});

export default projectSlice.reducer;
export const { select } = projectSlice.actions;
