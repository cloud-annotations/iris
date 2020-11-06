import React, { useCallback, useEffect, useState } from "react";

import { sync } from "@iris/store/dist/project";
import { useDispatch, useSelector } from "react-redux";

import { Canvas, CrossHair, EmptySet } from "@iris/components";
import { RootState } from "@iris/store";

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

function DrawingPanel({ headCount }: any) {
  const dispatch = useDispatch();
  const selectedTool =
    useSelector((state: RootState) => state.project.ui?.selectedTool) ?? "";

  const highlightedBox =
    useSelector((state: RootState) => state.project.ui?.highlightedBox) ?? "";

  const boxes =
    useSelector((state: RootState) => {
      const image = state.project.ui?.selectedImages[0];
      if (state.project.annotations && image) {
        return state.project.annotations[image];
      }
      return;
    }) || [];

  const projectID = useSelector((state: RootState) => state.project.id);
  const activeImage = useSelector(
    (state: RootState) => state.project.ui?.selectedImages[0]
  );
  const activeLabel =
    useSelector((state: RootState) => state.project.ui?.selectedCategory) ?? "";
  const labels =
    useSelector((state: RootState) => state.project.categories) ?? [];

  const [bboxes, onlyLabels] = partition(
    boxes,
    (box) => box.tool !== undefined
  );

  const handleControlChange = useCallback(
    (isPressed) => {
      dispatch({ type: "project/selectTool", payload: isPressed ? MOVE : BOX });
    },
    [dispatch]
  );

  useIsControlPressed(handleControlChange);
  useToggleLabel(activeLabel, labels, (label) =>
    dispatch({ type: "project/selectCategory", payload: label })
  );

  const handleDeleteLabel = useCallback(
    (annotation) => () => {
      dispatch(
        sync({
          type: "project/deleteAnnotation",
          payload: annotation,
        })
      );
    },
    [dispatch]
  );

  const cmap = labels.reduce((acc: any, label: string, i: number) => {
    acc[label] = uniqueColor(i, labels.length);
    return acc;
  }, {});

  const activeColor = cmap[activeLabel] ?? "white";

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
          {onlyLabels.map((box: any) => (
            <div className={styles.label}>
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
      {activeImage ? (
        <CrossHair color={activeColor} active={selectedTool === BOX}>
          <Canvas
            mode={selectedTool === "move" ? "move" : "draw"}
            image={`/api/projects/${projectID}/images/${activeImage}`}
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
      ) : (
        <EmptySet show />
      )}
    </div>
  );
}

export default DrawingPanel;
