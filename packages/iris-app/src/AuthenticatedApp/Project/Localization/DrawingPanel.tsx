import React, { useCallback, useEffect, useState } from "react";

import { createStyles, makeStyles, Theme } from "@material-ui/core";
import { useDispatch } from "react-redux";

import { endpoint } from "@iris/api";
import { CanvasView, CrossHair, EmptySet } from "@iris/components";
import {
  Project,
  useActiveImageStatus,
  useActiveImageID,
  useActiveLabel,
  useLabels,
  useProjectID,
  useActiveTool,
  useShapes,
} from "@iris/core";

import { uniqueColor } from "./color-utils";
import styles from "./DrawingPanel.module.css";

const MOVE = "move";
const BOX = "box";

const useIsControlPressed = (onCtrlChange: Function) => {
  const [isPressed, setIsPressed] = useState(false);
  const handleKeyDown = useCallback(
    (e) => {
      if (document.activeElement?.tagName.toLowerCase() === "input") {
        setIsPressed(false);
        onCtrlChange(false);
        return;
      }

      if ((e.ctrlKey || e.metaKey) && !e.shiftKey) {
        setIsPressed(true);
        onCtrlChange(true);
        return;
      }

      setIsPressed(false);
      onCtrlChange(false);
    },
    [onCtrlChange]
  );

  const handleKeyUp = useCallback(() => {
    setIsPressed(false);
    onCtrlChange(false);
  }, [onCtrlChange]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    document.addEventListener("msvisibilitychange", handleKeyUp);
    document.addEventListener("webkitvisibilitychange", handleKeyUp);
    document.addEventListener("visibilitychange", handleKeyUp);
    window.addEventListener("blur", handleKeyUp);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);

      document.removeEventListener("msvisibilitychange", handleKeyUp);
      document.removeEventListener("webkitvisibilitychange", handleKeyUp);
      document.removeEventListener("visibilitychange", handleKeyUp);
      window.removeEventListener("blur", handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  return isPressed;
};

const useToggleLabel = (
  activeLabel: string,
  labels: Project.Label[],
  setActiveLabel: (label: string) => void
) => {
  const handleKeyDown = useCallback(
    (e) => {
      if (document.activeElement?.tagName.toLowerCase() === "input") {
        return;
      }

      const char = e.key.toLowerCase();
      if (char === "q") {
        setActiveLabel(
          labels[
            (labels.findIndex((l) => l.id === activeLabel) + 1) % labels.length
          ].id
        );
      }
      let labelIndex = parseInt(char) - 1;
      // Treat 0 as 10 because it comes after 9 on the keyboard.
      if (labelIndex < 0) {
        labelIndex = 9;
      }
      if (labelIndex < labels.length) {
        setActiveLabel(labels[labelIndex].id);
      }
    },
    [activeLabel, labels, setActiveLabel]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    wrapper: {
      position: "absolute",
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      display: "flex",
      userSelect: "none",
      alignItems: "center",
      justifyContent: "center",
    },
    textContainer: {
      position: "absolute",
      height: 54,
      width: 430,
    },
    largeText: {
      marginBottom: 8,
      textAlign: "center",
      color: theme.palette.text.secondary,
      fontSize: 18,
    },
    smallText: {
      marginBottom: 8,
      textAlign: "center",
      color: theme.palette.text.hint,
      fontSize: 14,
    },
  })
);

function CanvasWrapper({
  image,
  status,
  activeColor,
  selectedTool,
  projectID,
  shapes,
}: any) {
  const classes = useStyles();

  const imageUrl = endpoint("/images/:imageID", {
    path: { imageID: image },
    query: { projectID: projectID },
  });

  switch (status) {
    case "success":
      return (
        <CrossHair color={activeColor} active={selectedTool === BOX}>
          <CanvasView
            mode={selectedTool === "move" ? "move" : "draw"}
            image={imageUrl}
            tool={selectedTool}
            shapes={shapes}
            render={window.IRIS.tools
              .list()
              .reduce((acc: { [key: string]: any }, cur) => {
                acc[cur.id] = (...args: any[]) =>
                  cur.canvasPlugin.render(...args);
                return acc;
              }, {})}
            actions={window.IRIS.tools
              .list()
              .reduce((acc: { [key: string]: any }, cur) => {
                acc[cur.id] = {
                  onTargetMove: (...args: any[]) =>
                    cur.canvasPlugin.onTargetMove(...args),
                  onMouseDown: (...args: any[]) =>
                    cur.canvasPlugin.onMouseDown(...args),
                  onMouseMove: (...args: any[]) =>
                    cur.canvasPlugin.onMouseMove(...args),
                  onMouseUp: (...args: any[]) =>
                    cur.canvasPlugin.onMouseUp(...args),
                };
                return acc;
              }, {})}
          />
        </CrossHair>
      );
    case "error":
      return (
        <div className={classes.wrapper}>
          <div className={classes.textContainer}>
            <div className={classes.largeText}>
              An error occurred while loading the image
            </div>
            <div className={classes.smallText}>
              Try refreshing the page and make sure the image file is valid.
            </div>
          </div>
        </div>
      );
    default:
      return <EmptySet show />;
  }
}

function DrawingPanel() {
  const dispatch = useDispatch();

  const selectedTool = useActiveTool();
  const highlightedBox = "";
  const activeImageID = useActiveImageID();
  const activeImageStatus = useActiveImageStatus();
  const shapes = useShapes();
  const projectID = useProjectID();
  const activeLabel = useActiveLabel();
  const labels = useLabels();

  const handleControlChange = useCallback(
    (isPressed) => {
      // dispatch(selectTool(isPressed ? MOVE : BOX));
    },
    [dispatch]
  );

  // TODO: move this to the toolbar component
  useIsControlPressed(handleControlChange);

  // TODO: move this to the tool options component
  useToggleLabel(activeLabel, labels, (label) => {
    // dispatch(selectCategory(label))
  });

  const handleDeleteLabel = useCallback(
    (annotation) => () => {
      if (activeImageID) {
        // dispatch(deleteAnnotations({ images: [activeImage.id], annotation }));
      }
    },
    [activeImageID, dispatch]
  );

  const cmap = labels.reduce((acc: { [key: string]: string }, label, i) => {
    acc[label.id] = uniqueColor(i, labels.length);
    return acc;
  }, {});

  const activeColor = cmap[activeLabel] ?? "white";

  const headCount = 10;
  const maxBubbles = 3;
  const othersCount = Math.max(headCount - 1, 0);
  const clippedCount = Math.min(othersCount, maxBubbles);
  const overflowCount = othersCount - maxBubbles;

  const modifiedShapes = shapes.map((shape) => {
    return {
      color: cmap[shape.label],
      highlight: highlightedBox === shape.id,
      ...shape,
    };
  });

  return (
    <div className={styles.wrapper}>
      <div className={styles.roomHolder}>
        {[...new Array(clippedCount)].map(() => (
          <div className={styles.chatHead}>
            <div>
              <svg
                className={styles.chatHeadIcon}
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="2 2 28 28"
              >
                <path d="M16 2a14 14 0 1 0 14 14A14 14 0 0 0 16 2zm0 5a4.5 4.5 0 1 1-4.5 4.5A4.49 4.49 0 0 1 16 7zm8 17.92a11.93 11.93 0 0 1-16 0v-.58A5.2 5.2 0 0 1 13 19h6a5.21 5.21 0 0 1 5 5.31v.61z"></path>
              </svg>
            </div>
          </div>
        ))}
        {overflowCount > 0 && (
          <div className={styles.chatHeadOverflow}>
            <div>+{overflowCount}</div>
          </div>
        )}
      </div>
      <CanvasWrapper
        image={activeImageID}
        // TODO
        // status={activeImageStatus}
        status={"success"}
        activeColor={activeColor}
        selectedTool={selectedTool}
        projectID={projectID}
        shapes={modifiedShapes}
      />
    </div>
  );
}

export default DrawingPanel;
