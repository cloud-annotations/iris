import React from "react";

import { createStyles, makeStyles } from "@material-ui/core";

interface Props {
  box: {
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
  };
}

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      position: "absolute",
      userSelect: "none",
      left: (props: Props) => props.box.x,
      top: (props: Props) => props.box.y,
      width: (props: Props) => props.box.width,
      height: (props: Props) => props.box.height,
    },
    nob: {
      position: "absolute",
      border: "1px solid white",
      width: 7,
      height: 7,
    },
    top: { top: -3 },
    left: { left: -3 },
    right: { right: -3 },
    bottom: { bottom: -3 },
  })
);

function Nobs({ box }: Props) {
  const classes = useStyles({ box: box });

  return (
    <div className={classes.root}>
      <div className={`${classes.nob} ${classes.top} ${classes.left}`} />
      <div className={`${classes.nob} ${classes.top} ${classes.right}`} />
      <div className={`${classes.nob} ${classes.bottom} ${classes.left}`} />
      <div className={`${classes.nob} ${classes.bottom} ${classes.right}`} />
    </div>
  );
}

export default Nobs;
