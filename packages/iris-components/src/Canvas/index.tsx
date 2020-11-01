import React, { useRef, useEffect, useCallback } from "react";

import { createStyles, makeStyles } from "@material-ui/core";

import Box from "./Box";
import Move from "./Move";
import Nobs from "./Nobs";
import TouchTargets from "./TouchTargets";

export const MOVE = "move";
export const BOX = "rect";
export const AUTO_LABEL = "auto";

const useStyles = makeStyles(() => {
  const base = createStyles({
    canvas: {
      position: "absolute", // important for safari
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
    },
  });

  return createStyles({
    root: {
      position: "relative",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "80%",
      height: "80%",
    },
    blendMode: {
      ...base.canvas,
      mixBlendMode: "difference",
    },
    normalMode: {
      ...base.canvas,
    },
    image: {
      userSelect: "none",
      maxWidth: "100%",
      maxHeight: "100%",
    },
  });
});

function generateUUID() {
  var d = new Date().getTime();
  if (Date.now) {
    d = Date.now(); //high-precision timer
  }
  var uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (
    c
  ) {
    var r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
  return uuid;
}

function Canvas({
  bboxes,
  mode,
  activeLabel,
  hovered,
  image,
  cmap,
  onBoxStarted,
  onBoxChanged,
  onBoxFinished,
}) {
  const classes = useStyles();

  const stateRef = useRef({
    image: {
      width: 0,
      height: 0,
    },
    box: undefined,
    canvasRect: undefined,
    dragging: false,
    move: [0, 0],
  });

  const canvasRef = useRef<HTMLImageElement>(null);

  const handleMouseMove = useCallback(
    (e) => {
      if (!stateRef.current.dragging) {
        return;
      }

      const { x, y, x2, y2, ...rest } = stateRef.current.box;
      const { width, height } = stateRef.current.image;

      e = (() => {
        if (e.clientX && e.clientY) {
          return e;
        }
        return e.touches[0];
      })();

      const mX = (e.clientX - stateRef.current.canvasRect.left) / width;
      const mY = (e.clientY - stateRef.current.canvasRect.top) / height;

      let newX;
      let newY;
      let newX2;
      let newY2;

      if (stateRef.current.move[0] === 0) {
        newX = mX;
        newX2 = x2;
      } else {
        newX = x;
        newX2 = mX;
      }

      if (stateRef.current.move[1] === 0) {
        newY = mY;
        newY2 = y2;
      } else {
        newY = y;
        newY2 = mY;
      }

      const computedBox = {
        x: Math.min(1, Math.max(0, newX)),
        y: Math.min(1, Math.max(0, newY)),
        x2: Math.min(1, Math.max(0, newX2)),
        y2: Math.min(1, Math.max(0, newY2)),
        ...rest,
      };

      onBoxChanged(computedBox);
    },
    [onBoxChanged]
  );

  const handleDragEnd = useCallback(() => {
    if (!stateRef.current.dragging) {
      return;
    }

    const { width, height } = stateRef.current.image;

    const { x, y, x2, y2, ...rest } = bboxes.find(
      (b) => b.id === stateRef.current.box.id
    );

    // If the box is less than or equal to 1 pixel, there was probably no drag.
    if (Math.abs(width * (x - x2)) <= 1 && Math.abs(height * (y - y2)) <= 1) {
      return;
    }

    onBoxFinished({
      x: Math.min(x, x2),
      y: Math.min(y, y2),
      x2: Math.max(x, x2),
      y2: Math.max(y, y2),
      ...rest,
    });

    stateRef.current.dragging = false;
    stateRef.current.box = undefined;
  }, [bboxes, onBoxFinished]);

  useEffect(() => {
    window.addEventListener("resize", handleWindowResize);
    document.addEventListener("mouseup", handleDragEnd);
    document.addEventListener("touchend", handleDragEnd);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("touchmove", handleMouseMove);
    return () => {
      window.removeEventListener("resize", handleWindowResize);
      document.removeEventListener("mouseup", handleDragEnd);
      document.removeEventListener("touchend", handleDragEnd);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("touchmove", handleMouseMove);
    };
  }, [handleDragEnd, handleMouseMove]);

  const handleCanvasDragStart = (e) => {
    // Start drag if it was a left click.
    if (e.button && e.button !== 0) {
      return;
    }

    if (mode !== BOX) {
      return;
    }

    // If we are still dragging then they drew too small of a box. So we are
    // in double click mode.
    if (stateRef.current.dragging) {
      handleDragEnd();
      return;
    }

    e = (() => {
      if (e.clientX && e.clientY) {
        return e;
      }
      return e.touches[0];
    })();

    const { width, height } = stateRef.current.image;

    // bug fix for mobile safari thinking there is a scroll.
    stateRef.current.canvasRect = canvasRef.current.getBoundingClientRect();
    const mX = (e.clientX - stateRef.current.canvasRect.left) / width;
    const mY = (e.clientY - stateRef.current.canvasRect.top) / height;

    const box = {
      id: generateUUID(),
      x: Math.min(1, Math.max(0, mX)),
      y: Math.min(1, Math.max(0, mY)),
      x2: Math.min(1, Math.max(0, mX)),
      y2: Math.min(1, Math.max(0, mY)),
      label: activeLabel,
    };

    onBoxStarted(box);

    stateRef.current.dragging = true;
    stateRef.current.move = [1, 1];
    stateRef.current.editingBoxId = undefined;
    stateRef.current.box = box;
  };

  const handleMouseDown = (e, boxId, move) => {
    // Start drag if it was a left click.
    if (e.button && e.button !== 0) {
      return;
    }

    if (mode !== MOVE) {
      return;
    }

    // bug fix for mobile safari thinking there is a scroll.
    this.canvasRect = this.canvasRef.current.getBoundingClientRect();

    this.move = move;
    this.dragging = true;

    this.box = bboxes.find((b) => b.id === boxId);
  };

  const handleWindowResize = () => {
    if (canvasRef.current) {
      stateRef.current.image = {
        width: canvasRef.current.clientWidth,
        height: canvasRef.current.clientHeight,
      };
    }
  };

  const handleOnImageLoad = (e: React.SyntheticEvent) => {
    stateRef.current.image = {
      width: (e.target as HTMLImageElement).clientWidth,
      height: (e.target as HTMLImageElement).clientHeight,
    };
  };

  // TODO: width and height need to be state so they redraw on window size change
  const absoluteBoxes = bboxes.map((box) => {
    const { x, y, x2, y2, label, id } = box;
    const { width, height } = stateRef.current.image;
    return {
      id: id,
      x: x > x2 ? Math.round(x2 * width) : Math.round(x * width),
      y: y > y2 ? Math.round(y2 * height) : Math.round(y * height),
      width: Math.abs(Math.round((x2 - x) * width)),
      height: Math.abs(Math.round((y2 - y) * height)),
      color: (cmap && cmap[label]) || "white",
    };
  });

  return (
    <div
      draggable={false}
      onMouseDown={handleCanvasDragStart}
      onTouchStart={handleCanvasDragStart}
      className={classes.root}
    >
      <img
        className={classes.image}
        alt=""
        draggable={false}
        src={image}
        onLoad={handleOnImageLoad}
        ref={canvasRef}
        onDragStart={(e) => {
          e.preventDefault();
        }}
      />

      {/* Move tool */}
      <div
        className={classes.blendMode}
        style={{
          width: stateRef.current.image.width,
          height: stateRef.current.image.height,
        }}
      >
        {absoluteBoxes.map((box) => (
          <div key={box.id}>
            {mode === MOVE && (
              <>
                <Move box={box} />
                <Nobs box={box} />
              </>
            )}
          </div>
        ))}
      </div>

      {/* Draw Tool */}
      <div
        className={classes.normalMode}
        style={{
          width: stateRef.current.image.width,
          height: stateRef.current.image.height,
        }}
      >
        {mode === BOX &&
          absoluteBoxes.map((box) => (
            <Box
              key={box.id}
              box={box}
              highlight={hovered && hovered.id === box.id}
            />
          ))}
      </div>

      {/* Touch Targets - must be drawn on top */}
      <div
        className={classes.normalMode}
        style={{
          width: stateRef.current.image.width,
          height: stateRef.current.image.height,
        }}
      >
        {mode === MOVE &&
          absoluteBoxes.map((box) => (
            <TouchTargets
              key={box.id}
              box={box}
              onCornerGrabbed={handleMouseDown}
            />
          ))}
      </div>
    </div>
  );
}

export default Canvas;
