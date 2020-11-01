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
    move: {
      position: "absolute",
      border: "1px solid white",
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
    },
  })
);

function Move({ box }: Props) {
  const classes = useStyles({ box: box });

  return (
    <div className={classes.root}>
      <div className={classes.move} />
    </div>
  );
}

export default Move;
