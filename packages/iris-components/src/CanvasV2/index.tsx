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

function drawAnchorX(ctx: CanvasRenderingContext2D, { x, y }: Point) {
  const scale = window.devicePixelRatio;
  ctx.fillStyle = "#4f80ff";
  ctx.fillRect((x - 4) * scale, (y - 4) * scale, 9 * scale, 9 * scale);

  ctx.fillStyle = "#ffffff";
  ctx.fillRect((x - 3) * scale, (y - 3) * scale, 7 * scale, 7 * scale);
}

function drawAnchor(ctx: CanvasRenderingContext2D, { x, y }: Point) {
  const scale = window.devicePixelRatio;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(x * scale, y * scale, 4.5 * scale, 0, Math.PI * 2, true);
  ctx.fill();

  ctx.fillStyle = "#bebebe";
  ctx.beginPath();
  ctx.arc(x * scale, y * scale, 3.5 * scale, 0, Math.PI * 2, true);
  ctx.fill();
}

function drawMoveBox(
  ctx: CanvasRenderingContext2D,
  { x, y, width, height }: Box
) {
  const scale = window.devicePixelRatio;
  ctx.lineWidth = 1 * scale;

  ctx.strokeStyle = "black";
  ctx.setLineDash([4 * scale, 4 * scale]);
  ctx.lineDashOffset = 4 * scale;
  ctx.strokeRect(x * scale, y * scale, width * scale + 1, height * scale + 1);

  ctx.strokeStyle = "white";
  ctx.setLineDash([4 * scale, 4 * scale]);
  ctx.lineDashOffset = 0;
  ctx.strokeRect(x * scale, y * scale, width * scale + 1, height * scale + 1);
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

      c.loadImage(imageData);

      const box = { x: 0, y: 0, width: 0.5, height: 0.5 };
      c.drawBox(box);

      // const scale = window.devicePixelRatio;

      // canvasRef.current.width = width * scale;
      // canvasRef.current.height = height * scale;

      // canvasRef.current.style.width = width + "px";
      // canvasRef.current.style.height = height + "px";

      // const ctx = canvasRef.current.getContext("2d");

      // const padding = 64;

      // const { naturalWidth, naturalHeight } = imageData;

      // const spaceMaxWidth = width - 2 * padding;
      // const spaceMaxHeight = height - 2 * padding;

      // const maxWidth = Math.min(spaceMaxWidth, naturalWidth);
      // const maxHeight = Math.min(spaceMaxHeight, naturalHeight);

      // const rs = maxWidth / maxHeight;
      // const ri = naturalWidth / naturalHeight;

      // let scaledWidth;
      // let scaledHeight;

      // if (rs > ri) {
      //   scaledWidth = (naturalWidth * maxHeight) / naturalHeight;
      //   scaledHeight = maxHeight;
      // } else {
      //   scaledWidth = maxWidth;
      //   scaledHeight = (naturalHeight * maxWidth) / naturalWidth;
      // }

      // const offsetX = padding + (spaceMaxWidth - scaledWidth) / 2;
      // const offsetY = padding + (spaceMaxHeight - scaledHeight) / 2;

      // ctx?.drawImage(
      //   imageData,
      //   offsetX * scale,
      //   offsetY * scale,
      //   scaledWidth * scale,
      //   scaledHeight * scale
      // );

      if (ctx) {
        const box = { x: 0, y: 0, width: 0.5, height: 0.5 };

        drawMoveBox(ctx, {
          x: offsetX + box.x * scaledWidth,
          y: offsetY + box.y * scaledHeight,
          width: box.width * scaledWidth,
          height: box.height * scaledHeight,
        });

        drawAnchor(ctx, {
          x: offsetX + box.x * scaledWidth,
          y: offsetY + box.y * scaledHeight,
        });

        drawAnchor(ctx, {
          x: offsetX + box.x * scaledWidth + box.width * scaledWidth,
          y: offsetY + box.y * scaledHeight,
        });

        drawAnchor(ctx, {
          x: offsetX + box.x * scaledWidth + box.width * scaledWidth,
          y: offsetY + box.y * scaledHeight + box.height * scaledHeight,
        });

        drawAnchor(ctx, {
          x: offsetX + box.x * scaledWidth,
          y: offsetY + box.y * scaledHeight + box.height * scaledHeight,
        });
      }
    }
  }, [height, imageData, width]);

  return (
    <div ref={viewportRef} draggable={false} className={classes.root}>
      <canvas ref={canvasRef} />
    </div>
  );
}

export default Canvas;
