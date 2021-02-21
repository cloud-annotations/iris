import { createSelector } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";

import { Project } from "./data";
import { ProjectState } from "./store";

const getImageFilter = (project: Pick<ProjectState, "data">) =>
  project.data.images.filter;
const getAnnotations = (project: Pick<ProjectState, "data">) =>
  project.data.annotations.data;
const getImages = (project: Pick<ProjectState, "data">) =>
  project.data.images.data;

export const getResolvedImages = createSelector(
  [getImages, getAnnotations],
  (images, annotations) => {
    return Object.values(images).map((i) => {
      return {
        ...i,
        resolvedAnnotations: i.annotations.map((a) => annotations[a]),
      };
    });
  }
);

function hasLabels(image: Project.Image) {
  return image.annotations !== undefined && image.annotations.length > 0;
}

function hasLabel(image: Project.ResolvedImage, label?: string) {
  if (!hasLabels(image)) {
    return false;
  }
  return image.resolvedAnnotations.find((a) => a.label === label) !== undefined;
}

export const getVisibleImages = createSelector(
  [getResolvedImages, getImageFilter],
  (images, filter) => {
    switch (filter.mode) {
      case "labeled":
        return images.filter((i) => hasLabels(i));
      case "unlabeled":
        return images.filter((i) => !hasLabels(i));
      case "byLabel":
        return images.filter((i) => hasLabel(i, filter.label));
      default:
        return images;
    }
  }
);

////////////////////////////////////////////////////////////////////////////////
// Project Metadata
////////////////////////////////////////////////////////////////////////////////
export function useProjectName() {
  return useSelector((project: ProjectState) => project.meta.name);
}

export function useProjectID() {
  return useSelector((project: ProjectState) => project.meta.id);
}

export function useProjectStatus() {
  return useSelector((project: ProjectState) => {
    if (project.meta.status === "success" && project.meta.saving > 0) {
      return "saving";
    }
    return project.meta.status;
  });
}

////////////////////////////////////////////////////////////////////////////////
// Project
////////////////////////////////////////////////////////////////////////////////
export function useSelectedImagesCount() {
  // return useSelector(visibleSelectedImagesSelector).length;
  return 0;
}

export function useSelectedImages() {
  return useSelector((project: ProjectState) => project.data.images.selection);
}

export function useLabels() {
  return useSelector((project: ProjectState) =>
    Object.values(project.data.labels.data)
  );
}

export function useActiveTool() {
  // NOTE: window.IRIS.tools.list()[1].id
  return useSelector((project: ProjectState) => project.data.tool.active);
}

// export function useHighlightedBox() {
//   return useSelector((project: ProjectState) => project.data.highlightedBox);
// }

export function useActiveImageID() {
  // return useSelector(activeImageSelector);
  return useSelector((project: ProjectState) => project.data.images.active);
}

export function useActiveImageStatus() {
  // TODO:
  // return useSelector(
  //   (project: ProjectState) =>
  //     project.data.images.data[project.data.images.active].status
  // );
  return "success";
}

export function useShapes() {
  return useSelector((project: ProjectState) => {
    const activeImageID = project.data.images.active;

    if (activeImageID !== undefined) {
      const image = project.data.images.data[activeImageID];
      const annotations = image.annotations.map(
        (aID) => project.data.annotations.data[aID]
      );
      return annotations;
    }

    return [];
  });
}

export function useActiveLabel() {
  return useSelector((project: ProjectState) => project.data.labels.active);
}

export function useHeadCount() {
  return useSelector((project: ProjectState) => project.room.headCount ?? 0);
}

export function useFilterMode() {
  return useSelector(
    (project: ProjectState) => project.data.images.filter.mode
  );
}

export function useLabelFilter() {
  return useSelector(
    (project: ProjectState) => project.data.images.filter.label
  );
}

export function useFilteredImageCount() {
  return useImages().length;
}

export function useImages() {
  return useSelector(getVisibleImages);
}

interface LabelInfo extends Project.Label {
  count: number;
}
export function useLabelsWithInfo() {
  return useSelector((project: ProjectState) => {
    const categories: { [key: string]: LabelInfo } = {};
    for (const l of Object.values(project.data.labels.data)) {
      categories[l.name] = { ...l, count: 0 };
    }
    for (const a of Object.values(project.data.annotations.data)) {
      categories[project.data.labels.data[a.label].name].count += 1;
    }
    return Object.values(categories);
  });
}

export function useAnnotations() {
  return useSelector(getAnnotations);
}

// NOTE: to self.
// We should use an active image along with a selection array. This seems like
// duplicated work and unnecessary to track then active image instead just
// having the first index of the selection be the "active" image. However, an
// explicit active image is useful because we need to explicitly set which room
// the user is in. So having both be explicit makes it less bug prone.
