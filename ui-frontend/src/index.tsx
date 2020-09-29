import React from "react";

import CssBaseline from "@material-ui/core/CssBaseline";
import { ThemeProvider } from "@material-ui/core/styles";
import ReactDOM from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";
import { RecoilRoot } from "recoil";
import { SWRConfig } from "swr";

import App from "./App";
import theme from "./theme";
import { fetcher } from "./util/fetcher";

import "./index.css";
import "./bx-overrides.css";
import "carbon-components/css/carbon-components.min.css";

const options = {
  errorRetryCount: 3,
  fetcher: fetcher,
};

ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <SWRConfig value={options}>
          <RecoilRoot>
            <App />
          </RecoilRoot>
        </SWRConfig>
      </Router>
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
