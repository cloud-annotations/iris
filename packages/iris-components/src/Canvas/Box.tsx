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
  highlight: boolean;
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
    draw: {
      position: "absolute",
      border: "2px solid white",
      left: -2,
      top: -2,
      right: -2,
      bottom: -2,
      borderColor: (props: Props) => props.box.color,
    },
    inline: {
      position: "absolute",
      border: "1px solid #000000",
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
    },
    outline: {
      position: "absolute",
      border: "1px solid #000000",
      left: -3,
      top: -3,
      right: -3,
      bottom: -3,
    },
    fill: {
      position: "absolute",
      left: 1,
      top: 1,
      right: 1,
      bottom: 1,
      opacity: (props: Props) => (props.highlight ? 0.6 : 0.1),
      backgroundColor: (props) => props.box.color,
    },
  })
);

function Box({ box, highlight }: Props) {
  const classes = useStyles({ box: box, highlight: highlight });

  return (
    <div className={classes.root}>
      <div className={classes.draw} />
      <div className={classes.inline} />
      <div className={classes.outline} />
      <div className={classes.fill} />
    </div>
  );
}

export default Box;
