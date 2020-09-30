import React, { useCallback, useEffect, useRef, useState } from "react";

import { motion } from "framer-motion";

import useOnClickOutside from "src/hooks/useOnClickOutside";

import styles from "./LayersPanel.module.css";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
  activeBoxState,
  boxesState,
  hoverBoxState,
  imageState,
  labelsState,
} from "../state";

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
  // setHoveredBox: Function;
  box: Box;
  labels: string[];
  imageID: string;
  image: string;
  imageDims: number[];
}

function ListItem({
  // setHoveredBox,
  box,
  labels,
  imageID,
  image,
  imageDims,
}: ListItemProps) {
  const setHoveredBox = useSetRecoilState(hoverBoxState);
  const [labelOpen, setLabelOpen] = useState(false);

  const [labelEditingValue, setEditingLabelValue] = useState(undefined);

  const inputRef = useRef<HTMLInputElement>(null);

  const handleEdit = useCallback(() => {
    setLabelOpen(true);
  }, []);

  const handleDelete = useCallback(() => {
    // syncAction(deleteBox, [imageName, box]);
  }, []);

  useEffect(() => {
    // calling this directly after setEditing doesn't work, which is why we need
    // to use and effect.
    if (labelOpen && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [labelOpen]);

  const ref = useRef(null);
  const handleBlur = useCallback(() => {
    setEditingLabelValue(undefined);
    setLabelOpen(false);
  }, []);
  useOnClickOutside(ref, handleBlur);

  const handleChange = useCallback((e) => {
    setEditingLabelValue(e.target.value);
  }, []);

  const handleKeyPress = useCallback((e) => {
    if (e.key === "Enter") {
      // const newActiveLabel = inputRef.current.value.trim();
      // if (newActiveLabel) {
      //   if (!labels.includes(newActiveLabel)) {
      //     syncAction(createLabel, [newActiveLabel]);
      //   }
      //   syncAction(deleteBox, [imageName, box]);
      //   syncAction(createBox, [imageName, { ...box, label: newActiveLabel }]);
      // }
      setEditingLabelValue(undefined);
      setLabelOpen(false);
    }
  }, []);

  const handleLabelChosen = useCallback(
    (label) => (e: any) => {
      e.stopPropagation();
      // syncAction(deleteBox, [imageName, box]);
      // syncAction(createBox, [imageName, { ...box, label: label }]);
      setEditingLabelValue(undefined);
      setLabelOpen(false);
    },
    []
  );

  const query = (labelEditingValue || "").trim();
  const filteredLabels =
    query === ""
      ? labels
      : labels
          // If the query is at the begining of the label.
          .filter(
            (item) => item.toLowerCase().indexOf(query.toLowerCase()) === 0
          )
          // Only sort the list when we filter, to make it easier to see diff.
          .sort((a, b) => a.length - b.length);

  const handleBoxEnter = useCallback(
    (box) => () => {
      setHoveredBox(box);
    },
    [setHoveredBox]
  );

  const handleBoxLeave = useCallback(() => {
    setHoveredBox(undefined);
  }, [setHoveredBox]);

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
      className={labelOpen ? styles.editing : styles.listItemWrapper}
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
      <div ref={ref} className={styles.dropDownWrapper}>
        {filteredLabels.length > 0 && (
          <div className={labelOpen ? styles.cardOpen : styles.card}>
            {filteredLabels.map((label) => (
              <div
                className={styles.listItem}
                key={label}
                onClick={handleLabelChosen(label)}
              >
                {label}
              </div>
            ))}
          </div>
        )}
        <input
          ref={inputRef}
          className={styles.editTextWrapper}
          readOnly={!labelOpen}
          disabled={!labelOpen}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          // We need to use undefined because and empty string is falsy
          value={
            labelEditingValue !== undefined ? labelEditingValue : box.label
          }
          type="text"
        />
      </div>
      <div onClick={handleEdit} className={styles.editIcon}>
        <svg height="12px" width="12px" viewBox="2 2 36 36">
          <g>
            <path d="m30 2.5l-5 5 7.5 7.5 5-5-7.5-7.5z m-27.5 27.5l0 7.5 7.5 0 20-20-7.5-7.5-20 20z m7.5 5h-5v-5h2.5v2.5h2.5v2.5z" />
          </g>
        </svg>
      </div>
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
  const image = useRecoilValue(imageState) || "";
  const labels = useRecoilValue(labelsState);
  const activeBox = useRecoilValue(activeBoxState);
  const boxes = useRecoilValue(boxesState);

  const [imageDims, setImageDims] = useState([0, 0]);

  let mergedBoxes = [...boxes];

  if (activeBox) {
    mergedBoxes = mergedBoxes.filter((box) => box.id !== activeBox.id);
    mergedBoxes.unshift(activeBox);
  }

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageDims([img.width, img.height]);
    };
    img.src = image;
  }, [image]);

  return (
    <div className={styles.wrapper}>
      {mergedBoxes.map((box) => (
        <motion.div
          key={box.id}
          positionTransition={transition}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0, transition: transition }}
        >
          <ListItem
            box={box}
            labels={labels}
            image={image}
            imageID=""
            imageDims={imageDims}
          />
        </motion.div>
      ))}
    </div>
  );
}

export default LayersPanel;
