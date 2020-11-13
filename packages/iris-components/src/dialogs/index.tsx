import React from "react";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  CssBaseline,
  ThemeProvider,
} from "@material-ui/core";
import ReactDOM from "react-dom";

import theme from "@iris/theme";

export function showDialog<T>(Dialog: any, props: any): Promise<T | undefined> {
  return new Promise((resolve) => {
    const dialogRoot = document.getElementById("dialog-root")!;

    const handleClose = () => {
      ReactDOM.unmountComponentAtNode(dialogRoot);
      resolve(undefined);
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

interface Props {
  title: string;
  body: string;
  primary: string;
  danger?: boolean;
  onClose: () => any;
  onAction: (value: boolean) => any;
}
function ConfirmDialog({
  title,
  body,
  primary,
  danger,
  onClose,
  onAction,
}: Props) {
  return (
    <Dialog
      open
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {body}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onAction(false)}>Cancel</Button>
        <Button onClick={() => onAction(true)} autoFocus>
          {primary}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

interface ConfirmOptions {
  title: string;
  body: string;
  primary: string;
  danger?: boolean;
}

export async function showConfirmDialog(options: ConfirmOptions) {
  return await showDialog<boolean>(ConfirmDialog, options);
}
