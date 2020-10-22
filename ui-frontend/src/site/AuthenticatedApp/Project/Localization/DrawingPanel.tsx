import React, { useCallback, useEffect, useState } from "react";

import { useDispatch, useSelector } from "react-redux";

import Canvas, { BOX, MOVE } from "src/common/Canvas/Canvas";
import CrossHair from "src/common/CrossHair/CrossHair";
import EmptySet from "src/common/EmptySet/EmptySet";
import { RootState } from "src/store";

import { uniqueColor } from "./color-utils";
import styles from "./DrawingPanel.module.css";

const iou = (boxA: any, boxB: any) => {
  const xA = Math.max(boxA.bbox[0], boxB.x);
  const yA = Math.max(boxA.bbox[1], boxB.y);
  const xB = Math.min(boxA.bbox[0] + boxA.bbox[2], boxB.x2);
  const yB = Math.min(boxA.bbox[1] + boxA.bbox[3], boxB.y2);

  const interArea = (xB - xA) * (yB - yA);

  const boxAArea =
    (boxA.bbox[0] + boxA.bbox[2] - boxA.bbox[0]) *
    (boxA.bbox[1] + boxA.bbox[3] - boxA.bbox[1]);
  const boxBArea = (boxB.x2 - boxB.x) * (boxB.y2 - boxB.y);

  const iou = interArea / (boxAArea + boxBArea - interArea);

  return iou;
};

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

  const handleKeyUp = useCallback(
    (e) => {
      setIsPressed(false);
      onCtrlChange(false);
    },
    [onCtrlChange]
  );

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

// const useToggleLabel = (activeLabel, labels, setActiveLabel) => {
//   const handleKeyDown = useCallback(
//     (e) => {
//       if (document.activeElement.tagName.toLowerCase() === "input") {
//         return;
//       }

//       const char = e.key.toLowerCase();
//       if (char === "q") {
//         setActiveLabel(
//           labels[(labels.indexOf(activeLabel) + 1) % labels.length]
//         );
//       }
//       let labelIndex = parseInt(char) - 1;
//       // Treat 0 as 10 because it comes after 9 on the keyboard.
//       if (labelIndex < 0) {
//         labelIndex = 9;
//       }
//       if (labelIndex < labels.length) {
//         setActiveLabel(labels[labelIndex]);
//       }
//     },
//     [activeLabel, labels, setActiveLabel]
//   );

//   useEffect(() => {
//     document.addEventListener("keydown", handleKeyDown);
//     return () => {
//       document.removeEventListener("keydown", handleKeyDown);
//     };
//   }, [handleKeyDown]);
// };

function partition<T>(array: T[], isValid: (item: T) => boolean) {
  return array.reduce(
    ([pass, fail]: T[][], item) => {
      return isValid(item) ? [[...pass, item], fail] : [pass, [...fail, item]];
    },
    [[], []]
  );
}

function DrawingPanel({
  headCount,
  autoLabelActive,
  predictions,
  activePrediction,
}: any) {
  const dispatch = useDispatch();
  const selectedTool =
    useSelector((state: RootState) => state.project.ui?.selectedTool) ?? "";

  const intermediateBox = useSelector(
    (state: RootState) => state.project.ui?.intermediateBox
  );

  const highlightedBox =
    useSelector((state: RootState) => state.project.ui?.highlightedBox) ?? "";

  const boxes = useSelector((state: RootState) => {
    const image = state.project.ui?.selectedImages[0];
    if (state.project.annotations && image) {
      return state.project.annotations[image];
    }
    return [];
  });

  const projectID = useSelector((state: RootState) => state.project.id);
  const activeImage = useSelector(
    (state: RootState) => state.project.ui?.selectedImages[0]
  );
  const activeLabel =
    useSelector((state: RootState) => state.project.ui?.selectedCategory) ?? "";
  const labels =
    useSelector((state: RootState) => state.project.categories) ?? [];

  //////////////////////////////////
  // const latestImage = useRef(image);
  // useEffect(() => {
  //   let didCancel = false;
  //   latestImage.current = image;
  //   setPredictions([]);
  //   if (autoLabelActive && model && image) {
  //     const img = new Image();
  //     img.onload = () => {
  //       model.detect(img).then((predictions) => {
  //         const scaledPredictions = predictions.map((prediction) => {
  //           prediction.bbox[0] /= img.width;
  //           prediction.bbox[1] /= img.height;
  //           prediction.bbox[2] /= img.width;
  //           prediction.bbox[3] /= img.height;
  //           return prediction;
  //         });
  //         const bboxes = annotations[selectedImage] || [];
  //         const filteredPredictions = scaledPredictions.filter(
  //           (p) => !bboxes.some((b) => iou(p, b) > 0.5)
  //         );
  //         if (!didCancel && latestImage.current === image) {
  //           setPredictions(filteredPredictions);
  //         }
  //       });
  //     };
  //     img.src = image;
  //     return () => {
  //       didCancel = true;
  //     };
  //   }
  // }, [
  //   annotations,
  //   autoLabelActive,
  //   image,
  //   model,
  //   selectedImage,
  //   setPredictions,
  // ]);
  //////////////////////////////////

  // const rawAnnotationsForImage = annotations[selectedImage] || [];

  const [bboxes, onlyLabels] = partition(
    boxes,
    (box) =>
      box.x !== undefined &&
      box.y !== undefined &&
      box.x2 !== undefined &&
      box.y2 !== undefined
  );

  const handleControlChange = useCallback(
    (isPressed) => {
      dispatch({ type: "project/selectTool", payload: isPressed ? MOVE : BOX });
    },
    [dispatch]
  );

  useIsControlPressed(handleControlChange);
  // useToggleLabel(activeLabel, labels, setActiveLabel);

  const handleBoxStarted = useCallback(
    (box) => {
      dispatch({
        type: "project/setIntermediateBox",
        payload: box,
      });
    },
    [dispatch]
  );

  const handleBoxChanged = useCallback(
    (box) => {
      dispatch({
        type: "project/setIntermediateBox",
        payload: box,
      });
    },
    [dispatch]
  );

  const handleBoxFinished = useCallback(
    (box) => {
      // // If the active label doesn't exit, create it. We shouldn't have to trim
      // // it, because it shouldn't be anything other than `Untitled Label`.
      // if (!labels.includes(box.label)) {
      //   syncAction(createLabel, [box.label]);
      //   setActiveLabel(box.label);
      // }
      // const boxToUpdate = bboxes.find((b) => b.id === box.id);
      // if (boxToUpdate) {
      //   syncAction(deleteBox, [selectedImage, boxToUpdate]);
      //   syncAction(createBox, [selectedImage, box]);
      // } else {
      //   syncAction(createBox, [selectedImage, box]);
      // }
      dispatch({
        type: "project/setIntermediateBox",
        payload: undefined,
      });
    },
    [dispatch]
  );

  const handleDeleteLabel = useCallback(
    (label) => () => {
      // syncAction(deleteBox, [selectedImage, { label: label }]);
    },
    []
  );

  // Remove the currently drawn box from the list of boxes
  let mergedBoxes = [...bboxes];
  if (intermediateBox) {
    mergedBoxes = mergedBoxes.filter((box) => box.id !== intermediateBox.id);
    mergedBoxes.unshift(intermediateBox);
  }

  const cmap = labels.reduce((acc: any, label: string, i: number) => {
    acc[label] = uniqueColor(i, labels.length);
    return acc;
  }, {});

  const activeColor = cmap[activeLabel] || "white";

  // const activeTool = isControlPressed ? MOVE : tool

  const maxBubbles = 3;
  const othersCount = Math.max(headCount - 1, 0);
  const clippedCount = Math.min(othersCount, maxBubbles);
  const overflowCount = othersCount - maxBubbles;

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
                onClick={handleDeleteLabel(box.label)}
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
        <CrossHair
          color={activeColor}
          active={selectedTool === BOX}
          children={
            <div className={styles.canvasWrapper}>
              <Canvas
                mode={selectedTool}
                autoLabelActive={autoLabelActive}
                activeLabel={activeLabel}
                cmap={cmap}
                bboxes={mergedBoxes}
                image={`/api/projects/${projectID}/images/${activeImage}`}
                hovered={highlightedBox}
                onBoxStarted={handleBoxStarted}
                onBoxChanged={handleBoxChanged}
                onBoxFinished={handleBoxFinished}
                predictions={predictions}
                activePrediction={activePrediction}
              />
            </div>
          }
        />
      ) : (
        <EmptySet show />
      )}
    </div>
  );
}

export default DrawingPanel;
