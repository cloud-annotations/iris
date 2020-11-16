import React from "react";
import ReactDOM from "react-dom";

import { CssBaseline, ThemeProvider } from "@material-ui/core";

import theme from "@iris/theme";

import { DIALOG_ROOT_ID } from ".";

export function showDialog<T>(Dialog: any, props: any): Promise<T> {
  return new Promise((resolve) => {
    const dialogRoot = document.getElementById(DIALOG_ROOT_ID);

    if (dialogRoot === null) {
      return resolve();
    }

    const handleClose = () => {
      ReactDOM.unmountComponentAtNode(dialogRoot);
      resolve();
    };

    const handleAction = (value: T) => {
      ReactDOM.unmountComponentAtNode(dialogRoot);
      resolve(value);
    };

    ReactDOM.render(
      <React.StrictMode>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Dialog onClose={handleClose} onAction={handleAction} {...props} />
        </ThemeProvider>
      </React.StrictMode>,
      dialogRoot
    );
  });
}
