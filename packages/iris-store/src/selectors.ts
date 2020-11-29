import { ProjectImage } from "./project/data";
import { RootState } from "./store";

// export function selectedConnectionSelector(state: RootState) {
//   if (state.connections.selected) {
//     return state.connections.selected;
//   }
//   if (state.connections.connections.length > 0) {
//     return state.connections.connections[0].id;
//   }
//   return;
// }

export function visibleImagesSelector(state: RootState) {
  const all = state.data.images ?? [];
  const annotatedImages = new Set(Object.keys(state.data.annotations));

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

  const filterLabel = state.ui.imageFilter.label;
  if (filterLabel === undefined) {
    switch (state.ui.imageFilter.mode) {
      case "all":
        return all;
      case "labeled":
        return labeled;
      case "unlabeled":
        return unlabeled;
    }
  }

  return labeled.filter((image) => {
    const annotations = state.data.annotations[image.id];
    if (annotations === undefined) {
      return false;
    }
    return annotations.find((a) => a.label === filterLabel) !== undefined;
  });
}

export function visibleSelectedImagesSelector(state: RootState) {
  const visibleImages = visibleImagesSelector(state);

  if (state.ui.selectedImages === undefined) {
    return [visibleImages[0]];
  }

  const selection = visibleImages.filter((image) =>
    state.ui.selectedImages?.includes(image.id)
  );

  if (selection.length === 0) {
    return [visibleImages[0]];
  }

  return selection;
}

export function activeImageSelector(
  state: RootState
): ProjectImage | undefined {
  const selection = visibleSelectedImagesSelector(state);
  return selection[0];
}

export function selectedCategorySelector(state: RootState) {
  if (
    state.ui.selectedCategory &&
    state.data.categories.includes(state.ui.selectedCategory)
  ) {
    return state.ui.selectedCategory;
  }
  return state.data.categories[0];
}
