import React, { useCallback, useEffect, useState } from "react";

import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";

import { endpoint } from "@iris/api";
import { LabelSelect } from "@iris/components";
import {
  RootState,
  activeImageSelector,
  Target,
  deleteAnnotations,
  editAnnotations,
  highlightBox,
} from "@iris/store";

import styles from "./LayersPanel.module.css";

const MAX_HEIGHT = 24;
const MAX_WIDTH = 24;

const transition = {
  type: "tween",
  ease: "easeOut",
  duration: 0.225,
};

function calculateCrop(targets: Target[], imageSize: number[]) {
  const xMin = Math.min(...targets.map((t) => t.x));
  const yMin = Math.min(...targets.map((t) => t.y));
  const xMax = Math.max(...targets.map((t) => t.x));
  const yMax = Math.max(...targets.map((t) => t.y));
  const width = xMax - xMin;
  const height = yMax - yMin;

  const relativeXOffset = xMin;
  const relativeYOffset = yMin;
  const relativeBoxWidth = width;
  const relativeBoxHeight = height;

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
  box: any;
  labels: string[];
  imageID: string;
  image: string;
  imageDims: number[];
}

function ListItem({ box, labels, imageID, image, imageDims }: ListItemProps) {
  const [focused, setFocused] = useState(false);
  const dispatch = useDispatch();

  const handleDelete = useCallback(() => {
    dispatch(deleteAnnotations({ images: [imageID], annotation: box }));
  }, [box, dispatch, imageID]);

  const handleLabelChosen = useCallback(
    (label) => {
      dispatch(
        editAnnotations({
          images: [imageID],
          annotation: {
            ...box,
            label: label,
          },
        })
      );
    },
    [box, dispatch, imageID]
  );

  const handleBoxEnter = useCallback(
    (box) => () => {
      dispatch(highlightBox(box.id));
    },
    [dispatch]
  );

  const handleBoxLeave = useCallback(() => {
    dispatch(highlightBox(undefined));
  }, [dispatch]);

  const {
    cropWidth,
    cropHeight,
    xOffset,
    yOffset,
    fullWidth,
    fullHeight,
  } = calculateCrop(box.targets, imageDims);

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
  const projectID = useSelector((state: RootState) => state.meta.id);
  const activeImage = useSelector(activeImageSelector);
  const labels = useSelector((state: RootState) => state.data.categories);

  const boxes = useSelector((state: RootState) => {
    if (activeImage) {
      return state.data.annotations[activeImage.id] ?? [];
    }
    return [];
  });

  const [imageDims, setImageDims] = useState([0, 0]);

  const imageUrl = endpoint("/images/:imageID", {
    path: { imageID: activeImage?.id },
    query: { projectID: projectID },
  });

  useEffect(() => {
    if (imageUrl) {
      const img = new Image();
      img.onload = () => {
        setImageDims([img.width, img.height]);
      };

      img.src = imageUrl;
    }
  }, [imageUrl]);

  return (
    <div className={styles.wrapper}>
      {boxes
        .filter((b) => b.targets !== undefined)
        .map((box) => (
          <motion.div
            key={box.id}
            transition={transition}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0, transition: transition }}
          >
            <ListItem
              box={box}
              labels={labels}
              image={imageUrl}
              imageID={activeImage?.id ?? ""}
              imageDims={imageDims}
            />
          </motion.div>
        ))}
    </div>
  );
}

export default LayersPanel;
