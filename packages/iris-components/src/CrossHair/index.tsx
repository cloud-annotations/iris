import React, { useRef, useEffect, useCallback } from "react";

import { createStyles, makeStyles, Theme } from "@material-ui/core";

const useStyles = makeStyles((theme: Theme) => {
  const baseStyles = createStyles({
    hair: {
      visibility: "hidden",
      position: "absolute",
      top: 0,
      left: 0,
      marginTop: -1,
      background: "transparent",
      pointerEvents: "none",
      zIndex: 2,
    },
  });

  return createStyles({
    wrapper: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      userSelect: "none",
      cursor: "none",
    },
    hairH: {
      ...baseStyles.hair,
      borderTop: "1px solid rgb(60, 255, 0)",
      borderLeft: "1px solid rgb(60, 255, 0)",
      left: 0,
      right: 0,
    },
    hairHShaddow: {
      ...baseStyles.hair,
      mixBlendMode: "difference",
      borderTop: "1px solid rgba(255, 255, 255, 0.2)",
      borderLeft: "1px solid rgba(255, 255, 255, 0.2)",
      left: 0,
      right: 0,
    },
    hairV: {
      ...baseStyles.hair,
      borderTop: "1px solid rgb(148, 148, 148)",
      borderLeft: "1px solid rgb(148, 148, 148)",
      top: 0,
      bottom: 0,
    },
    hairVShaddow: {
      ...baseStyles.hair,
      mixBlendMode: "difference",
      borderTop: "1px solid rgba(255, 255, 255, 0.2)",
      borderLeft: "1px solid rgba(255, 255, 255, 0.2)",
      top: 0,
      bottom: 0,
    },
    hairDot: {
      visibility: "hidden",
      position: "absolute",
      background: "#000000",
      marginLeft: -1,
      marginTop: -2,
      border: "1px solid rgba(255, 255, 255, 0.5)",
      width: 1,
      height: 1,
      borderRadius: 1.5,
      boxSizing: "content-box",
      backgroundClip: "padding-box",
      pointerEvents: "none",
    },
    hairCenterH: {
      visibility: "hidden",
      position: "absolute",
      background: "#000000",
      marginTop: -2,
      marginLeft: -1,
      border: "1px solid rgba(255, 255, 255, 0.5)",
      width: 5,
      height: 1,
      borderRadius: 1.5,
      boxSizing: "content-box",
      backgroundClip: "padding-box",
      pointerEvents: "none",
    },
    hairCenterV: {
      visibility: "hidden",
      position: "absolute",
      background: "#000000",
      marginTop: -2,
      marginLeft: -1,
      border: "1px solid rgba(255, 255, 255, 0.5)",
      width: 1,
      height: 5,
      borderRadius: 1.5,
      boxSizing: "content-box",
      backgroundClip: "padding-box",
      pointerEvents: "none",
    },
  });
});

interface Props {
  active?: boolean;
  children?: React.ReactNode;
  color?: string;
}

function CrossHair({ active, children, color }: Props) {
  const classes = useStyles();

  const wrapperRef = useRef<HTMLDivElement>(null);

  const centerDotRef = useRef<HTMLDivElement>(null);

  const centerLeftRef = useRef<HTMLDivElement>(null);
  const centerRightRef = useRef<HTMLDivElement>(null);
  const centerTopRef = useRef<HTMLDivElement>(null);
  const centerBottomRef = useRef<HTMLDivElement>(null);

  const crosshairLeftShaddowRef = useRef<HTMLDivElement>(null);
  const crosshairRightShaddowRef = useRef<HTMLDivElement>(null);
  const crosshairTopShaddowRef = useRef<HTMLDivElement>(null);
  const crosshairBottomShaddowRef = useRef<HTMLDivElement>(null);

  const crosshairLeftRef = useRef<HTMLDivElement>(null);
  const crosshairRightRef = useRef<HTMLDivElement>(null);
  const crosshairTopRef = useRef<HTMLDivElement>(null);
  const crosshairBottomRef = useRef<HTMLDivElement>(null);

  const setVisibility = useCallback((visibility: "visible" | "hidden") => {
    if (
      centerDotRef.current &&
      centerLeftRef.current &&
      centerRightRef.current &&
      centerTopRef.current &&
      centerBottomRef.current &&
      crosshairLeftShaddowRef.current &&
      crosshairRightShaddowRef.current &&
      crosshairTopShaddowRef.current &&
      crosshairBottomShaddowRef.current &&
      crosshairLeftRef.current &&
      crosshairRightRef.current &&
      crosshairTopRef.current &&
      crosshairBottomRef.current
    ) {
      centerDotRef.current.style.visibility = visibility;

      centerLeftRef.current.style.visibility = visibility;
      centerRightRef.current.style.visibility = visibility;
      centerTopRef.current.style.visibility = visibility;
      centerBottomRef.current.style.visibility = visibility;

      crosshairLeftShaddowRef.current.style.visibility = visibility;
      crosshairRightShaddowRef.current.style.visibility = visibility;
      crosshairTopShaddowRef.current.style.visibility = visibility;
      crosshairBottomShaddowRef.current.style.visibility = visibility;

      crosshairLeftRef.current.style.visibility = visibility;
      crosshairRightRef.current.style.visibility = visibility;
      crosshairTopRef.current.style.visibility = visibility;
      crosshairBottomRef.current.style.visibility = visibility;
    }
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: any) => {
      if (!wrapperRef.current) {
        return;
      }

      if (wrapperRef.current.contains(e.target)) {
        setVisibility("visible");
      }

      const rect = wrapperRef.current.getBoundingClientRect();
      const mX = e.clientX - rect.left;
      const mY = e.clientY - rect.top;

      if (
        centerDotRef.current &&
        centerLeftRef.current &&
        centerRightRef.current &&
        centerTopRef.current &&
        centerBottomRef.current &&
        crosshairLeftShaddowRef.current &&
        crosshairRightShaddowRef.current &&
        crosshairTopShaddowRef.current &&
        crosshairBottomShaddowRef.current &&
        crosshairLeftRef.current &&
        crosshairRightRef.current &&
        crosshairTopRef.current &&
        crosshairBottomRef.current
      ) {
        centerDotRef.current.style.top = `${mY}px`;
        centerDotRef.current.style.left = `${mX}px`;

        centerLeftRef.current.style.top = `${mY}px`;
        centerLeftRef.current.style.left = `${mX - 8}px`;
        centerRightRef.current.style.top = `${mY}px`;
        centerRightRef.current.style.left = `${mX + 4}px`;

        centerTopRef.current.style.left = `${mX}px`;
        centerTopRef.current.style.top = `${mY - 8}px`;
        centerBottomRef.current.style.left = `${mX}px`;
        centerBottomRef.current.style.top = `${mY + 4}px`;

        // Shaddow
        crosshairLeftShaddowRef.current.style.top = `${mY + 1}px`;
        crosshairRightShaddowRef.current.style.top = `${mY + 1}px`;
        crosshairLeftShaddowRef.current.style.width = `${mX - 11}px`;
        crosshairRightShaddowRef.current.style.left = `${mX + 12}px`;

        crosshairTopShaddowRef.current.style.left = `${mX + 1}px`;
        crosshairTopShaddowRef.current.style.height = `${mY - 11}px`;
        crosshairBottomShaddowRef.current.style.left = `${mX + 1}px`;
        crosshairBottomShaddowRef.current.style.top = `${mY + 12}px`;

        // Highlight
        crosshairLeftRef.current.style.top = `${mY}px`;
        crosshairRightRef.current.style.top = `${mY}px`;
        crosshairLeftRef.current.style.width = `${mX - 11}px`;
        crosshairRightRef.current.style.left = `${mX + 12}px`;

        crosshairTopRef.current.style.left = `${mX}px`;
        crosshairTopRef.current.style.height = `${mY - 11}px`;
        crosshairBottomRef.current.style.left = `${mX}px`;
        crosshairBottomRef.current.style.top = `${mY + 12}px`;
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [setVisibility]);

  const handleMouseEnter = useCallback(() => {
    setVisibility("visible");
  }, [setVisibility]);

  const handleMouseLeave = useCallback(() => {
    setVisibility("hidden");
  }, [setVisibility]);

  if (!active) {
    return <div>{children}</div>;
  }
  return (
    <div
      draggable={false}
      ref={wrapperRef}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      className={classes.wrapper}
    >
      {children}

      <div
        style={{ background: `padding-box ${color}` }}
        ref={centerDotRef}
        className={classes.hairDot}
      />

      <div
        style={{ background: `padding-box ${color}` }}
        ref={centerLeftRef}
        className={classes.hairCenterH}
      />
      <div
        style={{ background: `padding-box ${color}` }}
        ref={centerRightRef}
        className={classes.hairCenterH}
      />
      <div
        style={{ background: `padding-box ${color}` }}
        ref={centerTopRef}
        className={classes.hairCenterV}
      />
      <div
        style={{ background: `padding-box ${color}` }}
        ref={centerBottomRef}
        className={classes.hairCenterV}
      />

      <div ref={crosshairLeftShaddowRef} className={classes.hairHShaddow} />
      <div ref={crosshairRightShaddowRef} className={classes.hairHShaddow} />
      <div ref={crosshairTopShaddowRef} className={classes.hairVShaddow} />
      <div ref={crosshairBottomShaddowRef} className={classes.hairVShaddow} />

      <div
        style={{
          borderTop: `1px solid ${color}`,
          borderLeft: `1px solid ${color}`,
        }}
        ref={crosshairLeftRef}
        className={classes.hairH}
      />
      <div
        style={{
          borderTop: `1px solid ${color}`,
          borderLeft: `1px solid ${color}`,
        }}
        ref={crosshairRightRef}
        className={classes.hairH}
      />
      <div
        style={{
          borderTop: `1px solid ${color}`,
          borderLeft: `1px solid ${color}`,
        }}
        ref={crosshairTopRef}
        className={classes.hairV}
      />
      <div
        style={{
          borderTop: `1px solid ${color}`,
          borderLeft: `1px solid ${color}`,
        }}
        ref={crosshairBottomRef}
        className={classes.hairV}
      />
    </div>
  );
}

export default CrossHair;
