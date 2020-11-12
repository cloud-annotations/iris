import React, { useEffect, useState, useRef } from "react";

import { createStyles, makeStyles, Theme } from "@material-ui/core";

const useStyles = makeStyles((theme: Theme) => {
  const base = createStyles({
    root: {
      position: "relative",
      userSelect: "none",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      height: 84,
      margin: "0 8px 8px 8px",
    },
  });
  return createStyles({
    normal: {
      ...base.root,
      "&:hover $image": {
        border: `2px solid ${theme.palette.primary.main}`,
      },
      "&:hover $iconWrapper": {
        opacity: 0.4,
      },
    },
    active: {
      ...base.root,
      "& $image": {
        height: "71.4%",
        margin: "0 20.328px",
        border: `2px solid ${theme.palette.primary.main}`,
      },
      "& $iconWrapper": {
        opacity: 1,
        transition: "none",
      },
      "& $highlight": {
        opacity: 1,
      },
    },
    selected: {
      ...base.root,
      "& $image": {
        height: "71.4%",
        margin: " 0 20.328px",
        border: `2px solid ${theme.palette.primary.main}`,
      },
      "&:hover $iconWrapper": {
        opacity: 0.4,
      },
      "& $highlight": {
        opacity: 1,
      },
    },
    highlight: {
      height: "100%",
      background: theme.palette.action.hover,
      position: "absolute",
      left: -6,
      right: -6,
      top: 0,
      borderRadius: 4,
      opacity: 0,
    },
    image: {
      display: "flex",
      position: "relative",
      height: "100%",
      backgroundColor: theme.palette.action.hover,
      verticalAlign: "middle",
      border: "2px solid transparent",
      borderRadius: 4,
    },
    iconWrapper: {
      position: "absolute",
      top: 8,
      right: 8,
      width: 26,
      height: 26,
      opacity: 0,
      borderRadius: "50%",
      backgroundColor: "#ffffff",
      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.25)",
    },
    icon: {
      fill: theme.palette.primary.main,
      width: 24,
      height: 24,
      margin: 1,
    },
    thumbnail: {
      display: "flex",
      flexShrink: 0,
      margin: "0 0 0 1px",
      alignItems: "center",
      justifyContent: "center",
      width: "auto",
      height: "100%",
      borderRadius: 0,
      overflow: "hidden",
      "&:first-of-type": {
        margin: 0,
        borderRadius: " 2px 1px 1px 2px",
      },
      "&:last-of-type": {
        borderRadius: "1px 2px 2px 1px",
      },
      "&:only-of-type": {
        borderRadius: 2,
      },
    },
  });
});

const MAX_HEIGHT = 80;

interface ITarget {
  x: number;
  y: number;
}

const calculateCrop = (targets: ITarget[], imageSize: number[]) => {
  const xMin = Math.min(...targets.map((t) => t.x));
  const yMin = Math.min(...targets.map((t) => t.y));
  const xMax = Math.max(...targets.map((t) => t.x));
  const yMax = Math.max(...targets.map((t) => t.y));
  const width = xMax - xMin;
  const height = yMax - yMin;

  const relativeXOffset = xMin;
  const relativeYOffset = yMin;
  const relativeBoxWidth = width;
  const relativeBoxHeight = height;

  const pixelBoxWidth = relativeBoxWidth * imageSize[0];
  const pixelBoxHeight = relativeBoxHeight * imageSize[1];
  const pixelXOffset = relativeXOffset * imageSize[0];
  const pixelYOffset = relativeYOffset * imageSize[1];

  // To prevent division by zero.
  const safeBoxWidth = Math.max(pixelBoxWidth, 1);
  const safeBoxHeight = Math.max(pixelBoxHeight, 1);

  let scale;
  let actualWidth;
  let actualHeight;

  scale = MAX_HEIGHT / safeBoxHeight;
  actualWidth = safeBoxWidth * scale;
  actualHeight = MAX_HEIGHT;

  const xOffset = -scale * pixelXOffset;
  const yOffset = -scale * pixelYOffset;

  return {
    cropWidth: actualWidth,
    cropHeight: actualHeight,
    xOffset: xOffset,
    yOffset: yOffset,
    fullWidth: scale * imageSize[0],
    fullHeight: scale * imageSize[1],
  };
};

interface ListItemProps {
  targets: ITarget[];
  url: string;
  imageSize: number[];
}

function ListItem({ targets, url, imageSize }: ListItemProps) {
  const classes = useStyles();

  const {
    cropWidth,
    cropHeight,
    xOffset,
    yOffset,
    fullWidth,
    fullHeight,
  } = calculateCrop(targets, imageSize);

  return (
    <div className={classes.thumbnail}>
      <div
        style={{
          backgroundImage: `url(${url})`,
          width: `${cropWidth}px`,
          height: `${cropHeight}px`,
          backgroundPosition: `${xOffset}px ${yOffset}px`,
          backgroundSize: `${fullWidth}px ${fullHeight}px`,
        }}
      />
    </div>
  );
}

interface CollageImageTileProps {
  state: "active" | "selected" | "normal";
  url: string;
  targets: any[];
}

const CollageImageTile = ({ state, targets, url }: CollageImageTileProps) => {
  const classes = useStyles();

  const imageRef = useRef<HTMLDivElement>(null);
  const [imageSize, setImageSize] = useState([0, 0]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach(async (entry) => {
          if (entry.isIntersecting) {
            observer.unobserve(entry.target);
            const img = new Image();
            img.onload = () => {
              setImageSize([img.width, img.height]);
            };
            img.src = url;
          }
        });
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: 0.0,
      }
    );
    const target = imageRef.current!;

    observer.observe(target);

    return () => {
      observer.unobserve(target);
    };
  }, [url]);

  return (
    <div className={classes[state]}>
      <div className={classes.highlight} />
      <div ref={imageRef} className={classes.image}>
        {targets.map((t) => (
          <ListItem targets={t} url={url} imageSize={imageSize} />
        ))}
      </div>
      <div className={classes.iconWrapper}>
        <svg
          className={classes.icon}
          width="16"
          height="16"
          viewBox="0 0 16 16"
        >
          <path d="M8 16A8 8 0 1 1 8 0a8 8 0 0 1 0 16zm3.646-10.854L6.75 10.043 4.354 7.646l-.708.708 3.104 3.103 5.604-5.603-.708-.708z" />
        </svg>
      </div>
    </div>
  );
};

export default CollageImageTile;
