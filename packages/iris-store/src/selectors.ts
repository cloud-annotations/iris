import { ProjectImage } from "./data";
import { ProjectState } from "./store";

export function visibleImagesSelector(project: ProjectState) {
  const all = project.data.images ?? [];
  const annotatedImages = new Set(Object.keys(project.data.annotations));

  const _labeled = new Set<ProjectImage>();
  const _unlabeled = new Set<ProjectImage>();
  for (let elem of all) {
    if (annotatedImages.has(elem.id)) {
      _labeled.add(elem);
    } else {
      _unlabeled.add(elem);
    }
  }

  const labeled = Array.from(_labeled);
  const unlabeled = Array.from(_unlabeled);

  const filterLabel = project.ui.imageFilter.label;
  if (filterLabel === undefined) {
    switch (project.ui.imageFilter.mode) {
      case "all":
        return all;
      case "labeled":
        return labeled;
      case "unlabeled":
        return unlabeled;
    }
  }

  return labeled.filter((image) => {
    const annotations = project.data.annotations[image.id];
    if (annotations === undefined) {
      return false;
    }
    return annotations.find((a) => a.label === filterLabel) !== undefined;
  });
}

export function visibleSelectedImagesSelector(project: ProjectState) {
  const visibleImages = visibleImagesSelector(project);

  if (project.ui.selectedImages === undefined) {
    return [visibleImages[0]];
  }

  const selection = visibleImages.filter((image) =>
    project.ui.selectedImages?.includes(image.id)
  );

  if (selection.length === 0) {
    return [visibleImages[0]];
  }

  return selection;
}

export function activeImageSelector(
  project: ProjectState
): ProjectImage | undefined {
  const selection = visibleSelectedImagesSelector(project);
  return selection[0];
}

export function selectedCategorySelector(project: ProjectState) {
  if (
    project.ui.selectedCategory &&
    project.data.categories.includes(project.ui.selectedCategory)
  ) {
    return project.ui.selectedCategory;
  }
  return project.data.categories[0];
}
