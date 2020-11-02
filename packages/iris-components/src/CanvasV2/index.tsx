import React, { useRef, useEffect, useState, useCallback } from "react";

import { createStyles, makeStyles } from "@material-ui/core";

import CrispyCanvas from "./CrispyCanvas";

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
  })
);

interface Props {
  mode: "draw" | "move";
  tool: string;
  image: string;
  shapes: { [key: string]: any[] };
  render: { [key: string]: (c: CrispyCanvas, v: any) => void };
  actions: {
    [key: string]: {
      onMove: (coords: { x: number; y: number }) => void;
    };
  };
}

function getClientCoordinates(e: MouseEvent | TouchEvent) {
  function guard(e: MouseEvent | TouchEvent): e is MouseEvent {
    if ((e as MouseEvent).clientX && (e as MouseEvent).clientY) {
      return true;
    }
    return false;
  }
  if (guard(e)) {
    return { clientX: e.clientX, clientY: e.clientY };
  }
  return { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY };
}

function useWatchSize(ref: React.RefObject<HTMLDivElement>) {
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (ref.current) {
      setWidth(ref.current.clientWidth);
      setHeight(ref.current.clientHeight);
    }

    const handleWindowResize = () => {
      if (ref.current) {
        setWidth(ref.current.clientWidth);
        setHeight(ref.current.clientHeight);
      }
    };

    window.addEventListener("resize", handleWindowResize);
    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  }, [ref]);

  return [width, height];
}

function useImage(src: string) {
  const [image, setImage] = useState<HTMLImageElement>();

  useEffect(() => {
    const im = new Image();
    im.src = src;

    im.onload = () => {
      setImage(im);
    };
  }, [src]);

  return image;
}

function Canvas({ mode, tool, image, shapes, render, actions }: Props) {
  const classes = useStyles();

  const viewportRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [width, height] = useWatchSize(viewportRef);
  const imageData = useImage(image);

  const cRef = useRef<CrispyCanvas | null>(null);
  const stateRef = useRef({
    dragging: false,
    tool: "",
  });

  useEffect(() => {
    if (imageData && canvasRef.current) {
      const c = new CrispyCanvas(canvasRef.current, { width, height, mode });
      cRef.current = c;

      c.drawImage(imageData);

      for (const [key, val] of Object.entries(shapes)) {
        for (const v of val) {
          c.setTool(key);
          render[key](c, v);
        }
      }
    }
  }, [height, imageData, mode, render, shapes, width]);

  const handleMouseDown = useCallback(
    (e: React.SyntheticEvent) => {
      const { clientX, clientY } = getClientCoordinates(e as any);

      if (cRef.current && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();

        const x = clientX - rect.left;
        const y = clientY - rect.top;

        switch (mode) {
          case "move": {
            const clickedTool = cRef.current.toolForClick({ x, y });
            if (clickedTool) {
              stateRef.current.dragging = true;
              stateRef.current.tool = clickedTool;
            }
            return;
          }
          case "draw": {
            return;
          }
        }
      }
    },
    [mode]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      const { clientX, clientY } = getClientCoordinates(e as any);

      if (stateRef.current.dragging && canvasRef.current && cRef.current) {
        switch (mode) {
          case "move": {
            const rect = canvasRef.current.getBoundingClientRect();
            const x = clientX - rect.left;
            const y = clientY - rect.top;
            const coords = cRef.current.getCoords({ x, y });
            actions[stateRef.current.tool].onMove(coords);
            return;
          }
          case "draw": {
            return;
          }
        }
      }
    },
    [actions, mode]
  );

  const handleMouseUp = useCallback(() => {
    stateRef.current.dragging = false;
  }, []);

  useEffect(() => {
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("touchend", handleMouseUp);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("touchmove", handleMouseMove);
    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchend", handleMouseUp);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("touchmove", handleMouseMove);
    };
  }, [handleMouseMove, handleMouseUp]);

  return (
    <div ref={viewportRef} draggable={false} className={classes.root}>
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
      />
    </div>
  );
}

export default Canvas;
