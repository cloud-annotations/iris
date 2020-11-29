import React from "react";
import ReactDOM from "react-dom";

import { ThemeProvider, CssBaseline } from "@material-ui/core";
import { Provider } from "react-redux";
import { BrowserRouter as Router } from "react-router-dom";
import { SWRConfig } from "swr";

import { Dialog } from "@iris/components";
import { store } from "@iris/store";
import theme from "@iris/theme";

import App from "./App";

import "./index.css";

const swrOptions = {
  errorRetryCount: 3,
};

function initReactApp() {
  ReactDOM.render(
    <React.StrictMode>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Provider store={store}>
            <SWRConfig value={swrOptions}>
              <App />
              <Dialog />
            </SWRConfig>
          </Provider>
        </Router>
      </ThemeProvider>
    </React.StrictMode>,
    document.getElementById("root")
  );
}

export default initReactApp;
