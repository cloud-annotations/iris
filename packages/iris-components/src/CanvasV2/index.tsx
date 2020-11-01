import React, { useRef, useEffect, useState } from "react";

import { createStyles, makeStyles } from "@material-ui/core";

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

function Canvas({ mode, tool, image, shapes }: Props) {
  const classes = useStyles();

  const viewportRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [width, height] = useWatchSize(viewportRef);
  const imageData = useImage(image);

  useEffect(() => {
    if (imageData && canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      canvasRef.current.width = width;
      canvasRef.current.height = height;

      const padding = 64;

      const { naturalWidth, naturalHeight } = imageData;

      const spaceMaxWidth = width - 2 * padding;
      const spaceMaxHeight = height - 2 * padding;

      const maxWidth = Math.min(spaceMaxWidth, naturalWidth);
      const maxHeight = Math.min(spaceMaxHeight, naturalHeight);

      const rs = maxWidth / maxHeight;
      const ri = naturalWidth / naturalHeight;

      let scaledWidth;
      let scaledHeight;

      if (rs > ri) {
        scaledWidth = (naturalWidth * maxHeight) / naturalHeight;
        scaledHeight = maxHeight;
      } else {
        scaledWidth = maxWidth;
        scaledHeight = (naturalHeight * maxWidth) / naturalWidth;
      }

      const offsetX = (spaceMaxWidth - scaledWidth) / 2;
      const offsetY = (spaceMaxHeight - scaledHeight) / 2;

      ctx?.drawImage(
        imageData,
        padding + offsetX,
        padding + offsetY,
        scaledWidth,
        scaledHeight
      );
    }
  }, [height, imageData, width]);

  return (
    <div ref={viewportRef} draggable={false} className={classes.root}>
      <canvas ref={canvasRef} />
    </div>
  );
}

export default Canvas;
