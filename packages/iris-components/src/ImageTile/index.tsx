import React from "react";

import { createStyles, makeStyles, Theme } from "@material-ui/core";

const useStyles = makeStyles((theme: Theme) => {
  const base = createStyles({
    root: {
      position: "relative",
      userSelect: "none",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      height: 84,
      margin: "0 8px 8px 8px",
    },
  });
  return createStyles({
    normal: {
      ...base.root,
      "&:hover $image": {
        border: `2px solid ${theme.palette.primary.main}`,
      },
      "&:hover $iconWrapper": {
        opacity: 0.4,
      },
    },
    active: {
      ...base.root,
      "& $image": {
        height: "71.4%",
        margin: "0 20.328px",
        border: `2px solid ${theme.palette.primary.main}`,
      },
      "& $iconWrapper": {
        opacity: 1,
        transition: "none",
      },
      "& $highlight": {
        opacity: 1,
      },
    },
    selected: {
      ...base.root,
      "& $image": {
        height: "71.4%",
        margin: " 0 20.328px",
        border: `2px solid ${theme.palette.primary.main}`,
      },
      "&:hover $iconWrapper": {
        opacity: 0.4,
      },
      "& $highlight": {
        opacity: 1,
      },
    },
    highlight: {
      height: "100%",
      background: theme.palette.action.hover,
      position: "absolute",
      left: -6,
      right: -6,
      top: 0,
      borderRadius: 4,
      opacity: 0,
    },
    image: {
      position: "relative",
      height: "100%",
      backgroundColor: theme.palette.action.hover,
      verticalAlign: "middle",
      border: "2px solid transparent",
      borderRadius: 4,
    },
    iconWrapper: {
      position: "absolute",
      top: 8,
      right: 8,
      width: 26,
      height: 26,
      opacity: 0,
      borderRadius: "50%",
      backgroundColor: "#ffffff",
      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.25)",
    },
    icon: {
      fill: theme.palette.primary.main,
      width: 24,
      height: 24,
      margin: 1,
    },
  });
});

interface ImageTileProps {
  state: "active" | "selected" | "normal";
  url: string;
}

function ImageTile({ state, url }: ImageTileProps) {
  const classes = useStyles();

  return (
    <div className={classes[state]}>
      <div className={classes.highlight} />
      <img draggable={false} className={classes.image} alt="" src={url} />
      <div className={classes.iconWrapper}>
        <svg
          className={classes.icon}
          width="16"
          height="16"
          viewBox="0 0 16 16"
        >
          <path d="M8 16A8 8 0 1 1 8 0a8 8 0 0 1 0 16zm3.646-10.854L6.75 10.043 4.354 7.646l-.708.708 3.104 3.103 5.604-5.603-.708-.708z" />
        </svg>
      </div>
    </div>
  );
}
export default ImageTile;
