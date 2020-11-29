import { createAsyncThunk } from "@reduxjs/toolkit";

import { api } from "@iris/api";

const load = createAsyncThunk("load", async (projectID: string, _thunkAPI) => {
  return await api.get("/project", {
    query: { projectID },
  });
});

export default load;
