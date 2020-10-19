import { useEffect } from "react";

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
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(load(id));
  }, [dispatch, id]);

  return useSelector((state: any) => state.project);
}

interface State {
  loading: "idle" | "pending" | false;
  error?: any;
  data?: any;
}

const initialState: State = { loading: "idle" };

const projectSlice = createSlice({
  name: "project",
  initialState,
  reducers: {
    setActiveLabel(state, action) {
      state.data.activeLabel = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(load.pending, (state) => {
      state.loading = "pending";
      state.error = undefined;
      state.data = undefined;
    });
    builder.addCase(load.fulfilled, (state, { payload }) => {
      state.loading = false;
      state.error = undefined;
      state.data = payload;
      state.data.activeLabel = payload.annotations.labels[0];
    });
    builder.addCase(load.rejected, (state, { payload }) => {
      state.loading = false;
      state.error = payload;
      state.data = undefined;
    });
  },
});

export default projectSlice.reducer;
