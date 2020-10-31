import React, { useRef, useEffect, useCallback } from "react";

import { createStyles, makeStyles } from "@material-ui/core";

const useStyles = makeStyles(() =>
  createStyles({
    wrapper: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      userSelect: "none",
      cursor: "none",
      overflow: "hidden",
    },
    base: {
      visibility: "hidden",
      position: "absolute",
      pointerEvents: "none",
      zIndex: 2,
    },
    shadow: { fill: "rgba(255, 255, 255, 0.2)" },
    border: { fill: "rgba(255, 255, 255, 0.5)" },
  })
);

interface Props {
  active?: boolean;
  children?: React.ReactNode;
  color?: string;
}

const Pointer = React.forwardRef(({ color }: any, ref: any) => {
  const classes = useStyles();
  return (
    <svg viewBox="0 0 38 38" ref={ref} className={classes.base}>
      <g className={classes.border}>
        <rect x="0" y="16" width="14" height="6" rx="3" />
        <rect x="24" y="16" width="14" height="6" rx="3" />
        <rect x="16" y="0" width="6" height="14" rx="3" />
        <rect x="16" y="24" width="6" height="14" rx="3" />
        <rect x="16" y="16" width="6" height="6" rx="3" />
      </g>

      <g style={{ fill: color }}>
        <rect x="2" y="18" width="10" height="2" />
        <rect x="26" y="18" width="10" height="2" />
        <rect x="18" y="2" width="2" height="10" />
        <rect x="18" y="26" width="2" height="10" />
        <rect x="18" y="18" width="2" height="2" />
      </g>
    </svg>
  );
});

const Horizontal = React.forwardRef(({ color }: any, ref: any) => {
  const classes = useStyles();
  return (
    <svg
      preserveAspectRatio="none"
      viewBox="0 0 1 2"
      className={classes.base}
      ref={ref}
    >
      <rect x="0" y="0" width="1" height="1" style={{ fill: color }} />
      <rect x="0" y="1" width="1" height="1" className={classes.shadow} />
    </svg>
  );
});

const Vertical = React.forwardRef(({ color }: any, ref: any) => {
  const classes = useStyles();
  return (
    <svg
      preserveAspectRatio="none"
      viewBox="0 0 2 1"
      className={classes.base}
      ref={ref}
    >
      <rect x="0" y="0" width="1" height="1" style={{ fill: color }} />
      <rect x="1" y="0" width="1" height="1" className={classes.shadow} />
    </svg>
  );
});

function setStyle(el: HTMLElement | SVGElement | null, style: any) {
  if (el) {
    for (const [key, val] of Object.entries(style)) {
      (el.style as any)[key] = val;
    }
  }
}

function CrossHair({ active, children, color }: Props) {
  const classes = useStyles();

  const wrapperRef = useRef<HTMLDivElement>(null);

  const pointerRef = useRef<SVGSVGElement>(null);
  const leftRef = useRef<any>(null);
  const rightRef = useRef<SVGSVGElement>(null);
  const topRef = useRef<SVGSVGElement>(null);
  const bottomRef = useRef<SVGSVGElement>(null);

  const setVisibility = useCallback((visibility: "visible" | "hidden") => {
    setStyle(pointerRef.current, { visibility });
    setStyle(leftRef.current, { visibility });
    setStyle(rightRef.current, { visibility });
    setStyle(topRef.current, { visibility });
    setStyle(bottomRef.current, { visibility });
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (
        !wrapperRef.current ||
        !wrapperRef.current.contains(e.target as Node)
      ) {
        return;
      }

      const rect = wrapperRef.current.getBoundingClientRect();
      const mX = e.clientX - rect.left;
      const mY = e.clientY - rect.top;

      setStyle(pointerRef.current, {
        top: mY - 9.5,
        left: mX - 9.5,
        width: 19,
        height: 19,
      });

      setStyle(leftRef.current, {
        top: mY,
        left: 0,
        width: mX - 11,
        height: 2,
      });

      setStyle(rightRef.current, {
        top: mY,
        left: mX + 12,
        width: rect.width - (mX + 12),
        height: 2,
      });

      setStyle(topRef.current, {
        left: mX,
        width: 2,
        height: mY - 11,
      });

      setStyle(bottomRef.current, {
        top: mY + 12,
        left: mX,
        width: 2,
        height: rect.height - (mY + 12),
      });

      setVisibility("visible");
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [setVisibility]);

  const handleMouseLeave = useCallback(() => {
    setVisibility("hidden");
  }, [setVisibility]);

  if (!active) {
    return (
      <div draggable={false} className={classes.wrapper}>
        {children}
      </div>
    );
  }

  return (
    <div
      draggable={false}
      ref={wrapperRef}
      onMouseLeave={handleMouseLeave}
      className={classes.wrapper}
    >
      {children}
      <Pointer color={color} ref={pointerRef} />
      <Horizontal color={color} ref={leftRef} />
      <Horizontal color={color} ref={rightRef} />
      <Vertical color={color} ref={topRef} />
      <Vertical color={color} ref={bottomRef} />
    </div>
  );
}

export default CrossHair;
