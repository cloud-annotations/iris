import React, { useEffect, useRef, useCallback } from "react";

import {
  filterByLabel,
  showAllImages,
  showLabeledImages,
  showUnlabeledImages,
} from "@iris/store/dist/project";
import { useDispatch, useSelector } from "react-redux";

import {
  HorizontalListController,
  ImageTile,
  CollageImageTile,
} from "@iris/components";
import { RootState } from "@iris/store";

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

  const images = useSelector((state: RootState) => {
    if (state.project.ui === undefined) {
      return [];
    }
    const all = state.project.images ?? [];
    const annotatedImages = new Set(
      Object.keys(state.project.annotations ?? {})
    );

    const _labeled = new Set<string>();
    const _unlabeled = new Set<string>();
    for (let elem of all) {
      if (annotatedImages.has(elem)) {
        _labeled.add(elem);
      } else {
        _unlabeled.add(elem);
      }
    }

    const labeled = Array.from(_labeled);
    const unlabeled = Array.from(_unlabeled);

    const filterLabel = state.project.ui.imageFilter.label;
    if (filterLabel === undefined) {
      switch (state.project.ui.imageFilter.mode) {
        case "all":
          return all;
        case "labeled":
          return labeled;
        case "unlabeled":
          return unlabeled;
      }
    }

    return labeled.filter((image) => {
      const annotations = state.project.annotations?.[image];
      if (annotations === undefined) {
        return false;
      }
      return annotations.find((a) => a.label === filterLabel) !== undefined;
    });
  });

  const filterMode = useSelector(
    (state: RootState) => state.project.ui?.imageFilter.mode
  );

  const filter = useSelector(
    (state: RootState) => state.project.ui?.imageFilter.label
  );

  const range = useSelector((state: RootState) => {
    // const images = state.project.images ?? [];
    const selection = state.project.ui?.selectedImages;
    if (selection) {
      return selection.map((s) => images.indexOf(s));
    }
    return [];
  });

  const selectedIndex = useSelector((state: RootState) => {
    // const images = state.project.images ?? [];
    const selection = state.project.ui?.selectedImages;
    if (selection) {
      // TODO: this makes sure we don't select negative one, but not sure if this
      // is really what we want? changing availabled images should reset selection, maybe?
      // this seems to work but should probably extracted everywhere we are always using the same image
      // could be dangerous when deleting things...
      return Math.max(0, images.indexOf(selection[0]));
    }
    return 0;
  });

  const labels = useSelector((state: RootState) => {
    const categories: { [key: string]: number } = {};
    for (const c of state.project.categories ?? []) {
      categories[c] = 0;
    }
    for (const imageAnnotations of Object.values(
      state.project.annotations ?? []
    )) {
      for (const a of imageAnnotations) {
        categories[a.label] += 1;
      }
    }
    return categories;
  });

  const annotations = useSelector((state: RootState) => {
    return state.project.annotations ?? {};
  });

  // TODO: we need to find a better way to inject props
  const cells = images.map((i) => {
    if (filter !== undefined) {
      return (
        // @ts-ignore
        <CollageImageTile
          targets={annotations[i].map((a) => a.targets)}
          url={`/api/projects/${projectID}/images/${i}`}
        />
      );
    }
    // @ts-ignore
    return <ImageTile url={`/api/projects/${projectID}/images/${i}`} />;
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

  const scrollElementRef = useRef(null);
  useBlockSwipeBack(scrollElementRef);

  const handleDelete = useCallback(
    (label) => (e: any) => {
      e.stopPropagation();
      const deleteTheLabel = window.confirm(
        `Are you sure you want to delete the label "${label}"? This action will delete any bounding boxes associated with this label.`
      );
      if (deleteTheLabel) {
        // TODO: delete the label
        // syncAction(deleteLabel, [label]);
      }
    },
    []
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
    const all = state.project.images?.length ?? 0;
    const labeled = Object.keys(state.project.annotations ?? {}).length;
    // TODO: this logic isn't necessarily sound if an annotation exists, but the
    // file is missing.
    switch (state.project.ui?.imageFilter.mode) {
      case "all":
        return all;
      case "labeled":
        return labeled;
      case "unlabeled":
        return all - labeled;
    }
    return 0;
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
