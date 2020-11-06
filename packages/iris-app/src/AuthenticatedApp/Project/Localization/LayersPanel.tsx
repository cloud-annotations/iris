import React from "react";

import { Annotation, sync } from "@iris/store/dist/project";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";

import { LabelSelect } from "@iris/components";
import { RootState } from "@iris/store";

import styles from "./LayersPanel.module.css";

const MAX_HEIGHT = 24;
const MAX_WIDTH = 24;

const transition = {
  type: "tween",
  ease: "easeOut",
  duration: 0.225,
};

// interface Box {
//   id: string;
//   x: number;
//   x2: number;
//   y: number;
//   y2: number;
//   label: string;
// }

function calculateCrop(
  targets: any,
  // x1: number,
  // x2: number,
  // y1: number,
  // y2: number,
  imageSize: number[]
) {
  const xMin = Math.min(...targets.map((t: any) => t.x));
  const yMin = Math.min(...targets.map((t: any) => t.y));
  const xMax = Math.max(...targets.map((t: any) => t.x));
  const yMax = Math.max(...targets.map((t: any) => t.y));
  const width = xMax - xMin;
  const height = yMax - yMin;
  // If the boxes are still being dragged, the values might not be in the right order.
  const relativeXOffset = xMin; //Math.min(x1, x2);
  const relativeYOffset = yMin; //Math.min(y1, y2);
  const relativeBoxWidth = width; //Math.abs(x2 - x1);
  const relativeBoxHeight = height; //Math.abs(y2 - y1);

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
  const projectID = useSelector((state: RootState) => state.project.id);
  const activeImage = useSelector(
    (state: RootState) => state.project.ui?.selectedImages[0]
  );
  const labels =
    useSelector((state: RootState) => state.project.categories) ?? [];

  const boxes =
    useSelector((state: RootState) => {
      const image = state.project.ui?.selectedImages[0];
      if (image !== undefined && state.project.annotations?.[image]) {
        return state.project.annotations[image];
      }
      return;
    }) || [];

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
