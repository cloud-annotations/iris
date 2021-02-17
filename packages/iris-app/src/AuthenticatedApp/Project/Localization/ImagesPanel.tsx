import React, { useEffect, useRef, useCallback } from "react";

import { useDispatch, useSelector } from "react-redux";

import { endpoint } from "@iris/api";
import {
  HorizontalListController,
  ImageTile,
  showConfirmDialog,
} from "@iris/components";
import {
  ProjectState,
  useActiveImageID,
  useFilteredImageCount,
  useFilterMode,
  useImages,
  useLabelCount,
  useLabelFilter,
  useSelectedImages,
} from "@iris/core";

import styles from "./ImagesPanel.module.css";

const filterMap = {
  all: "All Images",
  labeled: "Labeled",
  unlabeled: "Unlabeled",
  byLabel: "",
};

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
  const dispatch = useDispatch();

  const projectID = useSelector((project: ProjectState) => project.meta.id);

  const filterMode = useFilterMode();
  const filter = useLabelFilter();

  const images = useImages();
  const selection = useSelectedImages();
  const activeImage = useActiveImageID();

  const range = selection.map((s) => images.indexOf(s));

  const selectedIndex = images.findIndex((i) => i.id === activeImage);

  const labels = useLabelCount();

  // const annotations = useAnnotations();

  const cells = images.map((i) => {
    const e = endpoint("/images/:imageID", {
      path: { imageID: i.id },
      query: { projectID: projectID },
    });
    return (
      <ImageTile
        // TODO
        status="success"
        // status={i.status}
        url={e}
        targets={
          undefined
          // filter !== undefined
          //   ? annotations[i.id]
          //       .filter((a) => a.label === filter)
          //       .map((a) => a.targets)
          //   : undefined
        }
        onError={() => {
          // dispatch(
          //   editImage({
          //     id: i.id,
          //     status: "error",
          //     date: "",
          //   })
          // );
        }}
      />
    );
  });

  const handleSelectionChanged = useCallback(
    (selection, key) => {
      if (key.shiftKey) {
        // TODO
      } else if (key.ctrlKey) {
        // dispatch(toggleSelectedImage(images[selection].id));
      } else {
        // dispatch(selectImages(images[selection].id));
      }
    },
    [dispatch, images]
  );

  const scrollElementRef = useRef(null);
  useBlockSwipeBack(scrollElementRef);

  const handleDelete = useCallback(
    (label) => async (e: any) => {
      e.stopPropagation();
      const deleteTheLabel = await showConfirmDialog({
        title: "Delete label?",
        body: `This will also delete any bounding boxes with the label "${label}".`,
        primary: "Delete",
        danger: true,
      });
      if (deleteTheLabel) {
        // dispatch(deleteCategory(label));
      }
    },
    [dispatch]
  );

  const handleFilterChange = useCallback(
    (e) => {
      switch (e.target.value) {
        case "all":
          // dispatch(showAllImages());
          break;
        case "labeled":
          // dispatch(showLabeledImages());
          break;
        case "unlabeled":
          // dispatch(showUnlabeledImages());
          break;
      }
    },
    [dispatch]
  );

  const handleClickLabel = useCallback(
    (label) => () => {
      // dispatch(filterByLabel(label));
    },
    [dispatch]
  );

  const filterImageModeCount = useFilteredImageCount();

  return (
    <div className={styles.wrapper}>
      <div className={styles.labelFilterWrapper}>
        {filter !== undefined ? (
          <>
            <div className={styles.labelCount}>
              {filterImageModeCount.toLocaleString()}
            </div>
            <div
              onClick={handleClickLabel(undefined)}
              className={styles.filterNotSelected}
            >
              {filterMode === undefined
                ? filterMap["all"]
                : filterMap[filterMode]}
            </div>
          </>
        ) : (
          <>
            <div className={styles.labelCount}>
              {filterImageModeCount.toLocaleString()}
            </div>
            <select
              className={styles.filter}
              onChange={handleFilterChange}
              value={filterMode}
            >
              <option value="all">{filterMap["all"]}</option>
              <option value="labeled">{filterMap["labeled"]}</option>
              <option value="unlabeled">{filterMap["unlabeled"]}</option>
            </select>
          </>
        )}

        <div ref={scrollElementRef} className={styles.labelList}>
          {Object.keys(labels).map((label) => (
            <div
              key={label}
              className={
                filter === label ? styles.selectedLabelItem : styles.labelItem
              }
              onClick={handleClickLabel(label)}
            >
              <div>{label}</div>
              <div className={styles.labelItemCount}>
                {labels[label].toLocaleString()}
              </div>
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
