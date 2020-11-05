import CrispyCanvas from "@iris/components/dist/Canvas/CrispyCanvas";
import { Annotation } from "@iris/store/dist/project";
import produce from "immer";
// @ts-ignore
import { v4 as uuidv4 } from "uuid";

import store from "@iris/store";

class CanvasPlugin {
  onTargetMove(coords: any, target: any) {}

  onMouseDown() {}

  onMouseMove(coords: any) {}

  onMouseUp(coords: any, xScale: any, yScale: any) {}

  render(c: CrispyCanvas, v: any) {}
}

function boxToGraph(box: Annotation) {
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
}

function graphToBox(graph: any) {
  const xMin = Math.min(...graph.targets.map((t: any) => t.x));
  const yMin = Math.min(...graph.targets.map((t: any) => t.y));
  const xMax = Math.max(...graph.targets.map((t: any) => t.x));
  const yMax = Math.max(...graph.targets.map((t: any) => t.y));

  return {
    x: xMin,
    y: yMin,
    x2: xMax,
    y2: yMax,
  };
}

class BoxCanvasPlugin extends CanvasPlugin {
  editing = null;
  dragging = false;

  onTargetMove(coords: any, { shapeID, targetID }: any) {
    const image = store.getState().project.ui?.selectedImages[0];
    if (image === undefined) {
      return;
    }

    const boxes = store.getState().project.annotations?.[image];
    if (boxes === undefined) {
      return;
    }

    const graphs = boxes as any; //.map((box) => boxToGraph(box));

    const shape = graphs.find((s: any) => s.id === shapeID);
    if (shape === undefined) {
      // this should never happen.
      console.error("BOX.onMove: shape is undefined");
      return;
    }

    const newShape = produce(shape, (draft) => {
      const { targets, connections } = draft;

      const txy = targets.find((t: any) => t.id === targetID);

      if (txy === undefined) {
        // this should never happen.
        console.error("BOX.onMove: target is undefined");
        return;
      }

      const connect = connections[txy.id];

      const tx = targets.find((t: any) => t.id === connect.x);
      const ty = targets.find((t: any) => t.id === connect.y);

      if (tx !== undefined && ty !== undefined) {
        txy.x = coords.x;
        txy.y = coords.y;

        tx.x = coords.x;
        ty.y = coords.y;
      }
    });

    store.dispatch({
      type: "project/editAnnotations",
      payload: {
        images: [image],
        annotation: {
          ...newShape,
        },
      },
    });
    return;
  }

  onMouseDown() {
    console.log("onMouseDown");
    this.dragging = true;
  }

  onMouseMove(coords: any) {
    console.log("onMouseMove");
    console.log(this.dragging);
    if (this.dragging === false) {
      return;
    }
    const image = store.getState().project.ui?.selectedImages[0];
    if (image === undefined) {
      return;
    }

    if (this.editing === null) {
      const category = store.getState().project.ui?.selectedCategory;
      if (category === undefined) {
        return;
      }
      const id = uuidv4();
      this.editing = id;
      store.dispatch({
        type: "project/addAnnotations",
        payload: {
          images: [image],
          annotation: {
            id: id,
            label: category,
            tool: "box",
            connections: {
              [`${id}-0`]: {
                x: `${id}-1`,
                y: `${id}-3`,
              },
              [`${id}-1`]: {
                x: `${id}-0`,
                y: `${id}-2`,
              },
              [`${id}-2`]: {
                x: `${id}-3`,
                y: `${id}-1`,
              },
              [`${id}-3`]: {
                x: `${id}-2`,
                y: `${id}-0`,
              },
            },
            targets: [
              { id: `${id}-0`, x: coords.x, y: coords.y },
              { id: `${id}-1`, x: coords.x, y: coords.y },
              { id: `${id}-2`, x: coords.x, y: coords.y },
              { id: `${id}-3`, x: coords.x, y: coords.y },
            ],
          },
        },
      });
      return;
    }

    const boxes = store.getState().project.annotations?.[image];
    if (boxes === undefined) {
      return;
    }

    const box = boxes.find((b) => b.id === this.editing) as any;

    if (box) {
      const newBox = produce(box, (draft) => {
        draft.targets[1].y = coords.y;

        draft.targets[2].x = coords.x;
        draft.targets[2].y = coords.y;

        draft.targets[3].x = coords.x;
      });
      store.dispatch({
        type: "project/editAnnotations",
        payload: {
          images: [image],
          annotation: {
            ...newBox,
          },
        },
      });
    }
  }

  onMouseUp(_coords: any, xScale: any, yScale: any) {
    console.log("onMouseUp");
    if (this.dragging === true && this.editing === null) {
      // click then click mode (vs drag to draw)
      return;
    }

    const image = store.getState().project.ui?.selectedImages[0];
    if (image === undefined) {
      return;
    }

    const boxes = store.getState().project.annotations?.[image];
    if (boxes === undefined) {
      return;
    }

    const box = boxes.find((b) => b.id === this.editing) as any;
    if (box) {
      const xMin = Math.min(...box.targets.map((t: any) => t.x));
      const yMin = Math.min(...box.targets.map((t: any) => t.y));
      const xMax = Math.max(...box.targets.map((t: any) => t.x));
      const yMax = Math.max(...box.targets.map((t: any) => t.y));
      const width = xMax - xMin;
      const height = yMax - yMin;
      if (width * xScale <= 4 && height * yScale <= 4) {
        // click then click mode (vs drag to draw)
        return;
      }
    }

    this.dragging = false;
    this.editing = null;
  }

  render(c: CrispyCanvas, graph: any) {
    const box = graphToBox(graph);

    c.drawBox(
      { x: box.x, y: box.y, width: box.x2 - box.x, height: box.y2 - box.y },
      { color: graph.color, highlight: graph.highlight }
    );
  }
}

export default BoxCanvasPlugin;
