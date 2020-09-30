import React from "react";

import { createStyles, makeStyles } from "@material-ui/core";

const bottomHeight = 64;
const expandedHeight = 241;

interface Props {
  expandBottom: boolean;
  top: JSX.Element;
  bottom: JSX.Element;
}

const useStyles = makeStyles(() =>
  createStyles({
    top: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: (expandBottom) => (expandBottom ? expandedHeight : bottomHeight),
    },
    bottom: {
      position: "absolute",
      right: 0,
      left: 0,
      bottom: 0,
      height: (expandBottom) => (expandBottom ? expandedHeight : bottomHeight),
    },
  })
);

const SplitLayout = ({ expandBottom, top, bottom }: Props) => {
  const classes = useStyles(expandBottom);

  return (
    <React.Fragment>
      <div className={classes.top}>{top}</div>
      <div className={classes.bottom}>{bottom}</div>
    </React.Fragment>
  );
};

export default SplitLayout;
