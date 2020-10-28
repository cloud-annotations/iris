import React from "react";

import theme from "@iris/theme";
import CssBaseline from "@material-ui/core/CssBaseline";
import { ThemeProvider } from "@material-ui/core/styles";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { BrowserRouter as Router } from "react-router-dom";
import { SWRConfig } from "swr";

import App from "./App";
import store from "./store";
import { fetcher } from "./util/fetcher";

import "./index.css";

const swrOptions = {
  errorRetryCount: 3,
  fetcher: fetcher,
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
            </SWRConfig>
          </Provider>
        </Router>
      </ThemeProvider>
    </React.StrictMode>,
    document.getElementById("root")
  );
}

export default initReactApp;
