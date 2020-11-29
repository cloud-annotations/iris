import { Action, configureStore, ThunkAction } from "@reduxjs/toolkit";

import connections from "./connections/reducer";
import project from "./project";
import data from "./project/data";
import ui from "./project/ui";
import projects from "./projects";

const store = configureStore({
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
  reducer: { connections, projects, project, ui, data },
  // @ts-ignore
  devTools: process.env.NODE_ENV !== "production",
});

export type RootState = ReturnType<typeof store.getState>;

export type AppThunk = ThunkAction<void, RootState, null, Action<string>>;

export default store;
