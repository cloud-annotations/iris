import produce from "immer";
import { v4 as uuidv4 } from "uuid";

import { store, CanvasPlugin, Canvas } from "@iris/core";

function constructBox(shape: Canvas.Shape) {
  if (shape.targets === undefined) {
    return;
  }
  const xMin = Math.min(...shape.targets.map((t) => t.x));
  const yMin = Math.min(...shape.targets.map((t) => t.y));
  const xMax = Math.max(...shape.targets.map((t) => t.x));
  const yMax = Math.max(...shape.targets.map((t) => t.y));

  return { x: xMin, y: yMin, width: xMax - xMin, height: yMax - yMin };
}

class BoxCanvasPlugin implements CanvasPlugin {
  editing: string | null = null;
  dragging = false;

  onTargetMove(point: Canvas.Point, { shapeID, targetID }: Canvas.TouchTarget) {
    // const image = visibleSelectedImagesSelector(store.getState())[0];
    // if (image === undefined) {
    //   return;
    // }

    // const graphs = store.getState().data.annotations[image.id];
    // if (graphs === undefined) {
    //   return;
    // }

    // const shape = graphs.find((s) => s.id === shapeID);
    // if (shape === undefined) {
    //   // this should never happen.
    //   console.error("BOX.onMove: shape is undefined");
    //   return;
    // }

    // const newShape = produce(shape, (draft) => {
    //   const { targets, connections } = draft;
    //   if (targets === undefined || connections === undefined) {
    //     // this should never happen.
    //     console.error("BOX.onMove: missing stuff is undefined");
    //     return;
    //   }

    //   const txy = targets.find((t) => t.id === targetID);

    //   if (txy === undefined) {
    //     // this should never happen.
    //     console.error("BOX.onMove: target is undefined");
    //     return;
    //   }

    //   const connect = connections[txy.id];

    //   const tx = targets.find((t) => t.id === connect.x);
    //   const ty = targets.find((t) => t.id === connect.y);

    //   if (tx !== undefined && ty !== undefined) {
    //     txy.x = coords.x;
    //     txy.y = coords.y;

    //     tx.x = coords.x;
    //     ty.y = coords.y;
    //   }
    // });

    // store.dispatch(
    //   editAnnotations({
    //     images: [image.id],
    //     annotation: {
    //       ...newShape,
    //     },
    //   })
    // );
    return;
  }

  onMouseDown() {
    this.dragging = true;
  }

  onMouseMove(point: Canvas.Point) {
    // if (this.dragging === false) {
    //   return;
    // }
    // const image = visibleSelectedImagesSelector(store.getState())[0];
    // if (image === undefined) {
    //   return;
    // }
    // if (this.editing === null) {
    //   const category =
    //     selectedCategorySelector(store.getState()) ?? "Untitled Label";
    //   const id = uuidv4();
    //   this.editing = id;
    //   store.dispatch(
    //     addAnnotations({
    //       images: [image.id],
    //       annotation: {
    //         id: id,
    //         label: category,
    //         tool: "box",
    //         connections: {
    //           [`${id}-0`]: {
    //             x: `${id}-1`,
    //             y: `${id}-3`,
    //           },
    //           [`${id}-1`]: {
    //             x: `${id}-0`,
    //             y: `${id}-2`,
    //           },
    //           [`${id}-2`]: {
    //             x: `${id}-3`,
    //             y: `${id}-1`,
    //           },
    //           [`${id}-3`]: {
    //             x: `${id}-2`,
    //             y: `${id}-0`,
    //           },
    //         },
    //         targets: [
    //           { id: `${id}-0`, x: coords.x, y: coords.y },
    //           { id: `${id}-1`, x: coords.x, y: coords.y },
    //           { id: `${id}-2`, x: coords.x, y: coords.y },
    //           { id: `${id}-3`, x: coords.x, y: coords.y },
    //         ],
    //       },
    //     })
    //   );
    //   return;
    // }
    // const graphs = store.getState().data.annotations[image.id];
    // if (graphs === undefined) {
    //   return;
    // }
    // const box = graphs.find((b) => b.id === this.editing);
    // if (box) {
    //   const newBox = produce(box, (draft) => {
    //     if (draft.targets === undefined) {
    //       return;
    //     }
    //     draft.targets[1].y = coords.y;
    //     draft.targets[2].x = coords.x;
    //     draft.targets[2].y = coords.y;
    //     draft.targets[3].x = coords.x;
    //   });
    //   store.dispatch(
    //     editAnnotations({
    //       images: [image.id],
    //       annotation: {
    //         ...newBox,
    //       },
    //     })
    //   );
    // }
  }

  onMouseUp(point: Canvas.Point, xScale: number, yScale: number) {
    // if (this.dragging === true && this.editing === null) {
    //   // click then click mode (vs drag to draw)
    //   return;
    // }
    // const image = visibleSelectedImagesSelector(store.getState())[0];
    // if (image === undefined) {
    //   return;
    // }
    // const graphs = store.getState().data.annotations[image.id];
    // if (graphs === undefined) {
    //   return;
    // }
    // const box = graphs.find((b) => b.id === this.editing);
    // if (box?.targets !== undefined) {
    //   const xMin = Math.min(...box.targets.map((t) => t.x));
    //   const yMin = Math.min(...box.targets.map((t) => t.y));
    //   const xMax = Math.max(...box.targets.map((t) => t.x));
    //   const yMax = Math.max(...box.targets.map((t) => t.y));
    //   const width = xMax - xMin;
    //   const height = yMax - yMin;
    //   if (width * xScale <= 4 && height * yScale <= 4) {
    //     // click then click mode (vs drag to draw)
    //     return;
    //   }
    // }
    // this.dragging = false;
    // this.editing = null;
  }

  render(ctx: Canvas.Context, shape: Canvas.Shape) {
    const box = constructBox(shape);
    if (box === undefined) {
      return;
    }

    ctx.drawBox(box, {
      color: "red",
      highlight: false,
    });
  }
}

export default BoxCanvasPlugin;
