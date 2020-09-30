import React, { useCallback } from "react";

import models from "@cloud-annotations/models";
// @ts-ignore
import { InlineLoading } from "carbon-components-react";

import { generateUUID } from "src/Utils";

import styles from "./AutoLabelPanel.module.css";

const MagicIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 37.99 33.99"
      className={styles.buttonIcon}
    >
      <path
        d="M26,12a3.49,3.49,0,0,0-4.95,0L2,31A3.5,3.5,0,0,0,7,36L26,17A3.49,3.49,0,0,0,26,12Zm-1,4-4.5,4.5-3-3L22,13a2.12,2.12,0,0,1,3,3Z"
        transform="translate(-1.01 -3)"
      />
      <path
        d="M25,10a6.84,6.84,0,0,0,7-7,6.84,6.84,0,0,0,7,7,6.84,6.84,0,0,0-7,7A6.84,6.84,0,0,0,25,10Z"
        transform="translate(-1.01 -3)"
      />
      <path
        d="M26,23a4.88,4.88,0,0,0,5-5,4.88,4.88,0,0,0,5,5,4.88,4.88,0,0,0-5,5A4.88,4.88,0,0,0,26,23Z"
        transform="translate(-1.01 -3)"
      />
      <path
        d="M5,10a6.84,6.84,0,0,0,7-7,6.84,6.84,0,0,0,7,7,6.84,6.84,0,0,0-7,7A6.84,6.84,0,0,0,5,10Z"
        transform="translate(-1.01 -3)"
      />
    </svg>
  );
};

// function Expanded({
//   handleClick,
//   predictions,
//   activePrediction,
//   setActivePrediction,
//   labels,
//   activeImage,
//   syncAction,
//   onNextImage,
// }) {
//   const handleLabel = useCallback(() => {
//     if (predictions.length <= 0) {
//       return;
//     }
//     const currentBox = predictions[activePrediction];
//     if (!labels.includes(currentBox.label)) {
//       syncAction(createLabel, [currentBox.label]);
//     }
//     syncAction(createBox, [
//       activeImage,
//       {
//         id: generateUUID(),
//         label: currentBox.label,
//         x: currentBox.bbox[0],
//         y: currentBox.bbox[1],
//         x2: currentBox.bbox[0] + currentBox.bbox[2],
//         y2: currentBox.bbox[1] + currentBox.bbox[3],
//       },
//     ]);

//     // set next prediction
//     setActivePrediction((activePrediction + 1) % predictions.length);
//   }, [
//     activeImage,
//     activePrediction,
//     labels,
//     predictions,
//     setActivePrediction,
//     syncAction,
//   ]);

//   const handleLabelAll = useCallback(() => {
//     predictions.forEach((currentBox) => {
//       if (!labels.includes(currentBox.label)) {
//         syncAction(createLabel, [currentBox.label]);
//       }
//       syncAction(createBox, [
//         activeImage,
//         {
//           id: generateUUID(),
//           label: currentBox.label,
//           x: currentBox.bbox[0],
//           y: currentBox.bbox[1],
//           x2: currentBox.bbox[0] + currentBox.bbox[2],
//           y2: currentBox.bbox[1] + currentBox.bbox[3],
//         },
//       ]);
//     });

//     // set next prediction
//     setActivePrediction(0);
//   }, [activeImage, labels, predictions, setActivePrediction, syncAction]);

//   const handleNext = useCallback(() => {
//     setActivePrediction((activePrediction + 1) % predictions.length);
//   }, [activePrediction, predictions.length, setActivePrediction]);

//   const dissable = predictions.length === 0;

//   return (
//     <div className={styles.wrapper}>
//       <div className={styles.titleBar}>
//         <div className={styles.title}>Auto label</div>
//         <div className={styles.done} onClick={handleClick}>
//           Done
//         </div>
//       </div>
//       <div
//         className={dissable ? styles.buttonLabelDissabled : styles.buttonLabel}
//         onClick={handleLabel}
//       >
//         <div className={styles.buttonText}>Accept label</div>
//       </div>
//       <div
//         className={
//           dissable ? styles.buttonLabelAllDissabled : styles.buttonLabelAll
//         }
//         onClick={handleLabelAll}
//       >
//         <div className={styles.buttonText}>Accept all labels</div>
//       </div>
//       <div className={styles.buttonNext} onClick={handleNext}>
//         <div className={styles.buttonText}>Next</div>
//       </div>
//     </div>
//   );
// }

interface Props {
  handleClick: (e: React.MouseEvent) => void;
}
function LoadingModel({ handleClick }: Props) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.buttonLoading} onClick={handleClick}>
        <div className={styles.buttonText}>Loading model</div>
        <div className={styles.loading}>
          <InlineLoading success={false} />
        </div>
      </div>
    </div>
  );
}

function Collapsed({ handleClick }: Props) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.buttonAutoLabel} onClick={handleClick}>
        <div className={styles.buttonText}>Auto label</div>
        <MagicIcon />
      </div>
    </div>
  );
}

function NoModels() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.buttonNoModel}>
        <div className={styles.buttonText}>No model available</div>
        <MagicIcon />
      </div>
    </div>
  );
}

function AutoLabelPanel() {
  const handleClick = useCallback(() => {
    // if (expanded) {
    //   setActive(false);
    //   onCollapse();
    // } else {
    //   setActive(true);
    //   if (model === undefined) {
    //     // TODO: might need to check if it's actually mobilenet ssd model...
    //     models.load(collection.models[0]).then(async (model) => {
    //       // warm up the model
    //       const image = new ImageData(1, 1);
    //       await model.detect(image);
    //       setModel(model);
    //     });
    //   }
    //   onExpand();
    // }
  }, []);

  // if (expanded && model === undefined) {
  //   return <LoadingModel handleClick={handleClick} />;
  // }
  // if (expanded) {
  //   return <Expanded handleClick={handleClick} onNextImage={onNextImage} />;
  // }

  // if (collection.models === undefined || collection.models.length === 0) {
  //   return <NoModels />;
  // }
  return <Collapsed handleClick={handleClick} />;
}

export default AutoLabelPanel;
