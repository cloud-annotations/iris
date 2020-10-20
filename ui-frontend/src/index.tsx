import React from "react";

import CssBaseline from "@material-ui/core/CssBaseline";
import { ThemeProvider } from "@material-ui/core/styles";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { BrowserRouter as Router } from "react-router-dom";
import { RecoilRoot } from "recoil";
import { SWRConfig } from "swr";

import App from "./App";
import store from "./store";
import theme from "./theme";
import { fetcher } from "./util/fetcher";

import "./index.css";
import "./bx-overrides.css";
import "carbon-components/css/carbon-components.min.css";

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
              <RecoilRoot>
                <App />
              </RecoilRoot>
            </SWRConfig>
          </Provider>
        </Router>
      </ThemeProvider>
    </React.StrictMode>,
    document.getElementById("root")
  );
}

export default initReactApp;
