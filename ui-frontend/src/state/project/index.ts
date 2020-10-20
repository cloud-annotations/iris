import { useEffect } from "react";

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";

import API from "src/util/api";
import { fetcher } from "src/util/fetcher";
import { RootState } from "src/store";

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

  return useSelector((state: RootState) => state.project);
}

interface UI {
  activeLabel: string;
  activeImage: string;
  highlightedBox?: string;
}

interface Annotation {
  id: string;
  label: string;
  x: number;
  x2: number;
  y: number;
  y2: number;
}

interface Annotations {
  [key: string]: Annotation[];
}

interface ProjectState {
  id?: string;
  name?: string;
  created?: string;
  loading: "idle" | "pending" | false;
  error?: any;
  labels?: string[];
  annotations?: Annotations;
  ui?: UI;
}

const initialState: ProjectState = { loading: "idle" };

const projectSlice = createSlice({
  name: "project",
  initialState,
  reducers: {
    setActiveLabel(state, { payload }) {
      if (state.ui !== undefined) {
        state.ui.activeLabel = payload;
      }
    },
    setActiveImage(state, { payload }) {
      if (state.ui !== undefined) {
        state.ui.activeImage = payload;
      }
    },
    setHighlightedBox(state, { payload }) {
      if (state.ui !== undefined) {
        state.ui.highlightedBox = payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(load.pending, (_state, _action) => {
      return {
        loading: "pending",
      };
    });
    builder.addCase(load.fulfilled, (_state, { payload }) => {
      const firstImage = Object.keys(payload.annotations.annotations)[0];
      return {
        loading: false,
        id: payload.id,
        name: payload.name,
        created: payload.created,
        labels: payload.annotations.labels,
        annotations: payload.annotations.annotations,
        ui: {
          activeLabel: payload.annotations.labels[0],
          activeImage: firstImage,
        },
      };
    });
    builder.addCase(load.rejected, (_state, { payload }) => {
      return {
        loading: false,
        error: payload,
      };
    });
  },
});

export default projectSlice.reducer;
