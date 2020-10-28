import React, { useEffect, useRef, useCallback } from "react";

import { useDispatch, useSelector } from "react-redux";

import HorizontalListController from "src/common/HorizontalList/HorizontalListController";
import ImageTileV4 from "src/common/ImageTile/ImageTileV4";
import { RootState } from "src/store";

import styles from "./ImagesPanel.module.css";

const blockSwipeBack = (element: any) => (e: any) => {
  e.stopPropagation();
  if (!element.contains(e.target)) {
    return;
  }

  e.preventDefault();
  const max = element.scrollWidth - element.offsetWidth;
  const scrollPosition =
    Math.abs(e.deltaX) > Math.abs(e.deltaY)
      ? element.scrollLeft + e.deltaX
      : element.scrollLeft + e.deltaY;
  element.scrollLeft = Math.max(0, Math.min(max, scrollPosition));
};

const useBlockSwipeBack = (ref: any) => {
  useEffect(() => {
    const current = ref.current;
    document.addEventListener("mousewheel", blockSwipeBack(current), {
      passive: false,
    });
    return () => {
      document.removeEventListener("mousewheel", blockSwipeBack(current));
    };
  }, [ref]);
};

function ImagesPanel() {
  const imageFilter: any = true;
  const allImageCount = 0;

  const dispatch = useDispatch();

  const projectID = useSelector((state: RootState) => state.project.id);
  const images = useSelector((state: RootState) =>
    Object.keys(state.project.annotations || {})
  );

  const range = useSelector((state: RootState) => {
    const images = Object.keys(state.project.annotations || {});
    const selection = state.project.ui?.selectedImages;
    if (selection) {
      return selection.map((s) => images.indexOf(s));
    }
    return [];
  });

  const selectedIndex = useSelector((state: RootState) => {
    const images = Object.keys(state.project.annotations || {});
    const selection = state.project.ui?.selectedImages;
    if (selection) {
      return images.indexOf(selection[0]);
    }
    return 0;
  });

  const labels: { [key: string]: string } = {
    dog: (10).toLocaleString(),
    cat: (20).toLocaleString(),
  };
  const cells = images.map((i) => {
    return <ImageTileV4 url={`/api/projects/${projectID}/images/${i}`} />;
  });

  const handleSelectionChanged = useCallback(
    (selection, key) => {
      if (key.shiftKey) {
        // TODO
      } else if (key.ctrlKey) {
        dispatch({
          type: "project/toggleSelectedImage",
          payload: images[selection],
        });
      } else {
        dispatch({
          type: "project/selectImages",
          payload: images[selection],
        });
      }
    },
    [dispatch, images]
  );

  //////////

  const scrollElementRef = useRef(null);
  useBlockSwipeBack(scrollElementRef);

  const handleDelete = useCallback(
    (_label) => (e: any) => {
      e.stopPropagation();
      // const deleteTheLabel = window.confirm(
      //   `Are you sure you want to delete the label "${label}"? This action will delete any bounding boxes associated with this label.`
      // );
      // if (deleteTheLabel) {
      //   syncAction(deleteLabel, [label]);
      // }
    },
    []
  );

  const handleClickLabel = useCallback(
    (_label) => () => {
      // handleImageFilterChange({ target: { value: label } });
    },
    []
  );

  const actualLabelMode =
    imageFilter !== true && imageFilter !== false && imageFilter !== undefined;

  return (
    <div className={styles.wrapper}>
      <div className={styles.labelFilterWrapper}>
        {actualLabelMode ? (
          <>
            <div className={styles.labelCount}>
              {allImageCount.toLocaleString()}
            </div>
            <div
              onClick={handleClickLabel("all")}
              className={styles.filterNotSelected}
            >
              All Images
            </div>
          </>
        ) : (
          <>
            <div className={styles.labelCount}>
              {images.length.toLocaleString()}
            </div>
            <select
              className={styles.filter}
              // onChange={handleImageFilterChange}
            >
              <option value="all">All Images</option>
              <option value="labeled">Labeled</option>
              <option value="unlabeled">Unlabeled</option>
            </select>
          </>
        )}

        <div ref={scrollElementRef} className={styles.labelList}>
          {Object.keys(labels).map((label) => (
            <div
              key={label}
              className={
                imageFilter === label
                  ? styles.selectedLabelItem
                  : styles.labelItem
              }
              onClick={handleClickLabel(label)}
            >
              <div>{label}</div>
              <div className={styles.labelItemCount}>{labels[label]}</div>
              <div onClick={handleDelete(label)} className={styles.deleteIcon}>
                <svg height="12px" width="12px" viewBox="2 2 36 36">
                  <g>
                    <path d="m31.6 10.7l-9.3 9.3 9.3 9.3-2.3 2.3-9.3-9.3-9.3 9.3-2.3-2.3 9.3-9.3-9.3-9.3 2.3-2.3 9.3 9.3 9.3-9.3z" />
                  </g>
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className={styles.imageList}>
        <HorizontalListController
          items={images}
          cells={cells}
          range={range}
          selection={selectedIndex}
          onSelectionChanged={handleSelectionChanged}
        />
      </div>
    </div>
  );
}

export default ImagesPanel;
