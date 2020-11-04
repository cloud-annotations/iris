import CrispyCanvas from "@iris/components/dist/Canvas/CrispyCanvas";
import produce from "immer";

import store from "@iris/store";

class CanvasPlugin {
  onTargetMove(coords: any, target: any) {}

  onMouseDown() {}

  onMouseMove() {}

  onMouseUp() {}

  render(c: CrispyCanvas, v: any) {}
}

class BoxCanvasPlugin extends CanvasPlugin {
  private editing = null;
  private dragging = false;

  onTargetMove(coords: any, { shapeID, targetID }: any) {
    const image = store.getState().project.ui?.selectedImages[0];
    if (image === undefined) {
      return;
    }

    const boxes = store.getState().project.annotations?.[image];
    if (boxes === undefined) {
      return;
    }

    const bb2 = boxes.map((box) => {
      return {
        color: "red",
        highlight: false,
        id: box.id,
        connections: {
          [`${box.id}-0`]: {
            x: `${box.id}-1`,
            y: `${box.id}-3`,
          },
          [`${box.id}-1`]: {
            x: `${box.id}-0`,
            y: `${box.id}-2`,
          },
          [`${box.id}-2`]: {
            x: `${box.id}-3`,
            y: `${box.id}-1`,
          },
          [`${box.id}-3`]: {
            x: `${box.id}-2`,
            y: `${box.id}-0`,
          },
        },
        targets: [
          { id: `${box.id}-0`, x: box.x, y: box.y },
          { id: `${box.id}-1`, x: box.x, y: box.y2 },
          { id: `${box.id}-2`, x: box.x2, y: box.y2 },
          { id: `${box.id}-3`, x: box.x2, y: box.y },
        ],
      };
    });

    const shape = bb2.find((s) => s.id === shapeID);
    if (shape === undefined) {
      // this should never happen.
      console.error("BOX.onMove: shape is undefined");
      return;
    }

    const { targets, connections } = shape;

    const txy = targets.find((t) => t.id === targetID);

    if (txy === undefined) {
      // this should never happen.
      console.error("BOX.onMove: target is undefined");
      return;
    }

    const connect = connections[txy.id];

    const tx = targets.find((t) => t.id === connect.x);
    const ty = targets.find((t) => t.id === connect.y);

    if (tx !== undefined && ty !== undefined) {
      // TODO: don't mutate...
      txy.x = coords.x;
      txy.y = coords.y;

      tx.x = coords.x;
      ty.y = coords.y;
    }

    const xMin = Math.min(...targets.map((t) => t.x));
    const yMin = Math.min(...targets.map((t) => t.y));
    const xMax = Math.max(...targets.map((t) => t.x));
    const yMax = Math.max(...targets.map((t) => t.y));

    store.dispatch({
      type: "project/editAnnotations",
      payload: {
        images: [image],
        annotation: {
          id: shapeID,
          label: store.getState().project.ui?.selectedCategory, // TODO: use the actual label...
          x: xMin,
          y: yMin,
          x2: xMax,
          y2: yMax,
        },
      },
    });
    return;
  }

  onMouseDown() {
    this.dragging = true;
  }

  onMouseMove() {
    return;
  }

  onMouseUp() {
    return;
  }

  render(c: CrispyCanvas, blob: any) {
    const xMin = Math.min(...blob.targets.map((t: any) => t.x));
    const yMin = Math.min(...blob.targets.map((t: any) => t.y));
    const xMax = Math.max(...blob.targets.map((t: any) => t.x));
    const yMax = Math.max(...blob.targets.map((t: any) => t.y));
    const x = xMin;
    const y = yMin;
    const width = xMax - xMin;
    const height = yMax - yMin;

    c.drawBox(
      { x, y, width, height },
      { color: blob.color, highlight: blob.highlight }
    );
  }
}

export default BoxCanvasPlugin;
