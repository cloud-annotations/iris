import React, { useCallback, useEffect, useState } from "react";

import { deleteAnnotations } from "@iris/store/dist/project/data";
import { selectCategory, selectTool } from "@iris/store/dist/project/ui";
import { createStyles, makeStyles, Theme } from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";

import API from "@iris/api";
import { Canvas, CrossHair, EmptySet } from "@iris/components";
import {
  RootState,
  selectedCategorySelector,
  activeImageSelector,
} from "@iris/store";

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
  labels: string[],
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
          labels[(labels.indexOf(activeLabel) + 1) % labels.length]
        );
      }
      let labelIndex = parseInt(char) - 1;
      // Treat 0 as 10 because it comes after 9 on the keyboard.
      if (labelIndex < 0) {
        labelIndex = 9;
      }
      if (labelIndex < labels.length) {
        setActiveLabel(labels[labelIndex]);
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

function partition<T>(array: T[], isValid: (item: T) => boolean) {
  return array.reduce(
    ([pass, fail]: T[][], item) => {
      return isValid(item) ? [[...pass, item], fail] : [pass, [...fail, item]];
    },
    [[], []]
  );
}

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

const api = new API();

function CanvasWrapper({
  activeImage,
  activeColor,
  selectedTool,
  projectID,
  shapes,
}: any) {
  const classes = useStyles();

  const imageUrl = api.endpoint("/api/images/:imageID", {
    path: { imageID: activeImage.id },
    query: { projectID: projectID },
  }).uri;

  switch (activeImage?.status) {
    case "success":
      return (
        <CrossHair color={activeColor} active={selectedTool === BOX}>
          <Canvas
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
  const selectedTool = useSelector(
    (state: RootState) =>
      state.ui.selectedTool ?? window.IRIS.tools.list()[1].id
  );

  const highlightedBox = useSelector(
    (state: RootState) => state.ui.highlightedBox
  );

  const activeImage = useSelector(activeImageSelector);

  const boxes = useSelector((state: RootState) => {
    if (activeImage) {
      return state.data.annotations[activeImage.id] ?? [];
    }
    return [];
  });

  const projectID = useSelector((state: RootState) => state.project.id);

  const activeLabel = useSelector(selectedCategorySelector);
  const labels = useSelector((state: RootState) => state.data.categories);

  const [bboxes, onlyLabels] = partition(
    boxes,
    (box) => box.tool !== undefined
  );

  const handleControlChange = useCallback(
    (isPressed) => {
      dispatch(selectTool(isPressed ? MOVE : BOX));
    },
    [dispatch]
  );

  useIsControlPressed(handleControlChange);
  useToggleLabel(activeLabel, labels, (label) =>
    dispatch(selectCategory(label))
  );

  const handleDeleteLabel = useCallback(
    (annotation) => () => {
      if (activeImage) {
        dispatch(deleteAnnotations({ images: [activeImage.id], annotation }));
      }
    },
    [activeImage, dispatch]
  );

  const cmap = labels.reduce((acc: any, label: string, i: number) => {
    acc[label] = uniqueColor(i, labels.length);
    return acc;
  }, {});

  const activeColor = cmap[activeLabel] ?? "white";

  const headCount = useSelector((state: RootState) => state.ui.roomSize ?? 0);

  const maxBubbles = 3;
  const othersCount = Math.max(headCount - 1, 0);
  const clippedCount = Math.min(othersCount, maxBubbles);
  const overflowCount = othersCount - maxBubbles;

  const shapes = bboxes.map((box) => {
    return {
      color: cmap[box.label],
      highlight: highlightedBox === box.id,
      ...box,
    };
  });

  return (
    <div className={styles.wrapper}>
      <div className={styles.roomHolder}>
        <div className={styles.labelHolder}>
          {onlyLabels.map((box) => (
            <div key={box.id} className={styles.label}>
              {box.label}
              <svg
                height="12px"
                width="12px"
                viewBox="2 2 36 36"
                className={styles.deleteIcon}
                onClick={handleDeleteLabel(box)}
              >
                <g>
                  <path d="m31.6 10.7l-9.3 9.3 9.3 9.3-2.3 2.3-9.3-9.3-9.3 9.3-2.3-2.3 9.3-9.3-9.3-9.3 2.3-2.3 9.3 9.3 9.3-9.3z" />
                </g>
              </svg>
            </div>
          ))}
        </div>
        {/* TODO: add multiuser support */}
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
        activeImage={activeImage}
        activeColor={activeColor}
        selectedTool={selectedTool}
        projectID={projectID}
        shapes={shapes}
      />
    </div>
  );
}

export default DrawingPanel;
