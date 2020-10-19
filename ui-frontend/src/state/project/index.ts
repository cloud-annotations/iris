import React from "react";

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";

import API from "src/util/api";
import { fetcher } from "src/util/fetcher";

const appstaticAPI = new API();

const load = createAsyncThunk(
  "project/load",
  async (projectID: string, _thunkAPI) => {
    const command = appstaticAPI.endpoint("/api/projects/:id", {
      path: {
        id: projectID,
      },
    });
    const response = await fetcher(command as string);
    return response;
  }
);

export function useProject(id: string) {
  const project = useSelector((state: any) => state.project);

  const dispatch = useDispatch();

  React.useEffect(() => {
    dispatch(load(id));
  }, [dispatch, id]);

  return project;
}

interface Bloop {
  data: any;
  loading: string;
}
const initialState: Bloop = { data: {}, loading: "idle" };

const projectSlice = createSlice({
  name: "project",
  initialState,
  reducers: {
    set(_state, action) {
      return action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(load.fulfilled, (state, { payload }) => {
      state.data = payload;
    });
  },
});

export default projectSlice.reducer;
