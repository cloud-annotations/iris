import React, { useRef, useEffect, useState } from "react";

import { createStyles, makeStyles } from "@material-ui/core";

import RetinaCanvas from "./RetinaCanvas";

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
  boxes: any[];
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

function Canvas({ mode, tool, image, boxes }: Props) {
  const classes = useStyles();

  const viewportRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [width, height] = useWatchSize(viewportRef);
  const imageData = useImage(image);

  useEffect(() => {
    if (imageData && canvasRef.current) {
      const c = new RetinaCanvas(canvasRef.current, { width, height });

      c.drawImage(imageData);

      const box = { x: 0, y: 0, width: 0.5, height: 0.5 };
      c.drawBox(box);
    }
  }, [height, imageData, width]);

  return (
    <div ref={viewportRef} draggable={false} className={classes.root}>
      <canvas ref={canvasRef} />
    </div>
  );
}

export default Canvas;
