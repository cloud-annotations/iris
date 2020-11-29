import { configureStore } from "@reduxjs/toolkit";

import data from "./data";
import meta from "./meta";
import ui from "./ui";

const store = configureStore({
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
  reducer: { data, meta, ui },
  devTools: process.env.NODE_ENV !== "production",
});

export type ProjectState = ReturnType<typeof store.getState>;

export default store;
