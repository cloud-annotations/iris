import { createAsyncThunk } from "@reduxjs/toolkit";

import { api } from "@iris/api";

export const fetchConnections = createAsyncThunk(
  "[connections] Fetch",
  async () => await api.get("/connections")
);
