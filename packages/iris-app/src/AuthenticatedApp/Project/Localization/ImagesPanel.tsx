import React, { useEffect, useRef, useCallback } from "react";

import { deleteCategory, editImage } from "@iris/store/dist/project/data";
import {
  filterByLabel,
  selectImages,
  showAllImages,
  showLabeledImages,
  showUnlabeledImages,
  toggleSelectedImage,
} from "@iris/store/dist/project/ui";
import { useDispatch, useSelector } from "react-redux";

import {
  HorizontalListController,
  ImageTile,
  showConfirmDialog,
} from "@iris/components";
import {
  RootState,
  visibleImagesSelector,
  visibleSelectedImagesSelector,
} from "@iris/store";

import styles from "./ImagesPanel.module.css";

const filterMap = {
  all: "All Images",
  labeled: "Labeled",
  unlabeled: "Unlabeled",
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

  const projectID = useSelector((state: RootState) => state.project.id);

  const filterMode = useSelector(
    (state: RootState) => state.ui.imageFilter.mode
  );

  const filter = useSelector((state: RootState) => state.ui.imageFilter.label);

  const images = useSelector(visibleImagesSelector);
  const selection = useSelector(visibleSelectedImagesSelector);

  const range = selection.map((s) => images.indexOf(s));

  const selectedIndex = images.indexOf(selection[0]);

  const labels = useSelector((state: RootState) => {
    const categories: { [key: string]: number } = {};
    for (const c of state.data.categories) {
      categories[c] = 0;
    }
    for (const imageAnnotations of Object.values(state.data.annotations)) {
      for (const a of imageAnnotations) {
        categories[a.label] += 1;
      }
    }
    return categories;
  });

  const annotations = useSelector((state: RootState) => state.data.annotations);

  const cells = images.map((i) => (
    <ImageTile
      status={i.status}
      url={`/api/projects/${projectID}/images/${i.id}`}
      targets={
        filter !== undefined
          ? annotations[i.id].map((a) => a.targets)
          : undefined
      }
      onError={() => {
        dispatch(
          editImage({
            id: i.id,
            status: "error",
            date: "",
          })
        );
      }}
    />
  ));

  const handleSelectionChanged = useCallback(
    (selection, key) => {
      if (key.shiftKey) {
        // TODO
      } else if (key.ctrlKey) {
        dispatch(toggleSelectedImage(images[selection].id));
      } else {
        dispatch(selectImages(images[selection].id));
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
        dispatch(deleteCategory(label));
      }
    },
    [dispatch]
  );

  const handleFilterChange = useCallback(
    (e) => {
      switch (e.target.value) {
        case "all":
          dispatch(showAllImages());
          break;
        case "labeled":
          dispatch(showLabeledImages());
          break;
        case "unlabeled":
          dispatch(showUnlabeledImages());
          break;
      }
    },
    [dispatch]
  );

  const handleClickLabel = useCallback(
    (label) => () => {
      dispatch(filterByLabel(label));
    },
    [dispatch]
  );

  const filterImageModeCount = useSelector((state: RootState) => {
    const all = state.data.images?.length ?? 0;
    const labeled = Object.keys(state.data.annotations).length;
    // TODO: this logic isn't necessarily sound if an annotation exists, but the
    // file is missing.
    switch (state.ui.imageFilter.mode) {
      case "all":
        return all;
      case "labeled":
        return labeled;
      case "unlabeled":
        return all - labeled;
    }
  });

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
              {filterMap[filterMode ?? "all"]}
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
