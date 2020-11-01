import { createStyles, makeStyles } from "@material-ui/core";

const useStyles = makeStyles(() =>
  createStyles({
    wrapper: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      userSelect: "none",
      cursor: "none",
      overflow: "hidden",
    },
    base: {
      visibility: "hidden",
      position: "absolute",
      pointerEvents: "none",
      zIndex: 2,
    },
    shadow: { fill: "rgba(255, 255, 255, 0.2)" },
    border: { fill: "rgba(255, 255, 255, 0.5)" },
  })
);

export default useStyles;
