import { createReducer } from "@reduxjs/toolkit";

import { fetchConnections } from "./actions";

export interface State {
  status: "idle" | "pending" | "success" | "error";
  connections: any[];
  error?: any;
}

const initialState: State = {
  status: "idle",
  connections: [],
};

const reducer = createReducer(initialState, (builder) => {
  builder.addCase(fetchConnections.pending, (state) => {
    state.status = "pending";
  });
  builder.addCase(fetchConnections.fulfilled, (state, action) => {
    state.status = "success";
    state.connections = action.payload;
  });
  builder.addCase(fetchConnections.rejected, (state, action) => {
    state.status = "error";
    state.error = action.error;
  });
});

export default reducer;
