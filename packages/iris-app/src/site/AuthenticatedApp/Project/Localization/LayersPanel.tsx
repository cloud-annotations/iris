import React from "react";

import { LabelSelect } from "@iris/components";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";

import { Annotation, sync } from "src/state/project";
import { RootState } from "src/store";

import styles from "./LayersPanel.module.css";

const MAX_HEIGHT = 24;
const MAX_WIDTH = 24;

const transition = {
  type: "tween",
  ease: "easeOut",
  duration: 0.225,
};

interface Box {
  id: string;
  x: number;
  x2: number;
  y: number;
  y2: number;
  label: string;
}

function calculateCrop(
  x1: number,
  x2: number,
  y1: number,
  y2: number,
  imageSize: number[]
) {
  // If the boxes are still being dragged, the values might not be in the right order.
  const relativeXOffset = Math.min(x1, x2);
  const relativeYOffset = Math.min(y1, y2);
  const relativeBoxWidth = Math.abs(x2 - x1);
  const relativeBoxHeight = Math.abs(y2 - y1);

  const pixelBoxWidth = relativeBoxWidth * imageSize[0];
  const pixelBoxHeight = relativeBoxHeight * imageSize[1];
  const pixelXOffset = relativeXOffset * imageSize[0];
  const pixelYOffset = relativeYOffset * imageSize[1];

  // To prevent division by zero.
  const safeBoxWidth = Math.max(pixelBoxWidth, 1);
  const safeBoxHeight = Math.max(pixelBoxHeight, 1);

  let scale;
  let actualWidth;
  let actualHeight;

  if (safeBoxWidth > safeBoxHeight) {
    scale = MAX_WIDTH / safeBoxWidth;
    actualWidth = MAX_WIDTH;
    actualHeight = safeBoxHeight * scale;
  } else {
    scale = MAX_HEIGHT / safeBoxHeight;
    actualWidth = safeBoxWidth * scale;
    actualHeight = MAX_HEIGHT;
  }

  const xOffset = -scale * pixelXOffset;
  const yOffset = -scale * pixelYOffset;

  return {
    cropWidth: actualWidth,
    cropHeight: actualHeight,
    xOffset: xOffset,
    yOffset: yOffset,
    fullWidth: scale * imageSize[0],
    fullHeight: scale * imageSize[1],
  };
}

interface ListItemProps {
  box: Box;
  labels: string[];
  imageID: string;
  image: string;
  imageDims: number[];
}

function ListItem({ box, labels, imageID, image, imageDims }: ListItemProps) {
  const [focused, setFocused] = React.useState(false);
  const dispatch = useDispatch();

  const handleDelete = React.useCallback(() => {
    sync(
      dispatch({
        type: "project/deleteAnnotations",
        payload: { images: [imageID], annotation: box },
      })
    );
  }, [box, dispatch, imageID]);

  const handleLabelChosen = React.useCallback((_label) => {
    //   if (!labels.includes(newActiveLabel)) {
    //     syncAction(createLabel, [newActiveLabel]);
    //   }
    // syncAction(deleteBox, [imageName, box]);
    // syncAction(createBox, [imageName, { ...box, label: label }]);
  }, []);

  const handleBoxEnter = React.useCallback(
    (box) => () => {
      dispatch({ type: "project/highlightBox", payload: box });
    },
    [dispatch]
  );

  const handleBoxLeave = React.useCallback(() => {
    dispatch({ type: "project/highlightBox", payload: undefined });
  }, [dispatch]);

  const {
    cropWidth,
    cropHeight,
    xOffset,
    yOffset,
    fullWidth,
    fullHeight,
  } = calculateCrop(box.x, box.x2, box.y, box.y2, imageDims);

  return (
    <div
      className={focused ? styles.editing : styles.listItemWrapper}
      onMouseEnter={handleBoxEnter(box)}
      onMouseLeave={handleBoxLeave}
    >
      <div className={styles.thumbnailWrapper}>
        <div
          style={{
            backgroundImage: `url(${image})`,
            width: `${cropWidth}px`,
            height: `${cropHeight}px`,
            backgroundPosition: `${xOffset}px ${yOffset}px`,
            backgroundSize: `${fullWidth}px ${fullHeight}px`,
          }}
        />
      </div>
      <LabelSelect
        labels={labels}
        activeLabel={box.label}
        onChange={handleLabelChosen}
        onFocusChange={(f) => setFocused(f)}
      />
      <div onClick={handleDelete} className={styles.deleteIcon}>
        <svg height="12px" width="12px" viewBox="2 2 36 36">
          <g>
            <path d="m31.6 10.7l-9.3 9.3 9.3 9.3-2.3 2.3-9.3-9.3-9.3 9.3-2.3-2.3 9.3-9.3-9.3-9.3 2.3-2.3 9.3 9.3 9.3-9.3z" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function LayersPanel() {
  const projectID = useSelector((state: RootState) => state.project.id);
  const activeImage = useSelector(
    (state: RootState) => state.project.ui?.selectedImages[0]
  );
  const labels =
    useSelector((state: RootState) => state.project.categories) ?? [];

  const boxes = useSelector((state: RootState) => {
    const image = state.project.ui?.selectedImages[0];
    const intermediateBox = state.project.ui?.intermediateBox;
    let boxes: Annotation[] = [];
    if (state.project.annotations && image) {
      boxes = [...state.project.annotations[image]];
    }
    if (intermediateBox) {
      boxes = boxes.filter((box) => box.id !== intermediateBox.id);
      boxes = [intermediateBox, ...boxes];
    }

    return boxes;
  });

  const [imageDims, setImageDims] = React.useState([0, 0]);

  React.useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageDims([img.width, img.height]);
    };
    img.src = `/api/projects/${projectID}/images/${activeImage}`;
  }, [projectID, activeImage]);

  return (
    <div className={styles.wrapper}>
      {boxes.map((box) => (
        <motion.div
          key={box.id}
          transition={transition}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0, transition: transition }}
        >
          <ListItem
            box={box}
            labels={labels}
            image={`/api/projects/${projectID}/images/${activeImage}`}
            imageID={activeImage ?? ""}
            imageDims={imageDims}
          />
        </motion.div>
      ))}
    </div>
  );
}

export default LayersPanel;
