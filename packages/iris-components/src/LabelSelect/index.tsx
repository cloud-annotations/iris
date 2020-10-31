import React, { useState, useCallback, useEffect, useRef } from "react";

import { createStyles, makeStyles, Theme } from "@material-ui/core";

import { useClickOutside } from "@iris/hooks";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    labelDropDownOpen: {
      position: "relative",
      display: "flex",
      alignItems: "center",
      color: theme.palette.text.secondary,
      fontSize: 12,
      fontWeight: 500,
      padding: "3.5px 6px 3.5px 8px",
      width: 160,
      cursor: "pointer",
    },
    labelDropDown: {
      position: "relative",
      display: "flex",
      alignItems: "center",
      color: theme.palette.text.secondary,
      fontSize: 12,
      fontWeight: 500,
      padding: "3.5px 6px 3.5px 8px",
      width: 160,
      cursor: "pointer",
      "&:hover": {
        backgroundColor: theme.palette.action.hover, // highlight
        borderRadius: 4,
      },
    },
    cardOpen: {
      position: "absolute",
      top: "100%",
      left: 6,
      zIndex: 10,
      backgroundColor: theme.palette.grey[800],
      maxHeight: "calc(80vh - 174px)",
      width: 185,
      borderRadius: "0 4px 4px 4px",
      overflow: "auto",
      boxShadow:
        "0 1px 3px 0 rgba(0, 0, 0, 0.23), 0 4px 8px 3px rgba(0, 0, 0, 0.11)",
      border: `1px solid ${theme.palette.grey[600]}`, // dropDownBorder
    },
    card: {
      position: "absolute",
      top: "100%",
      left: 6,
      zIndex: 10,
      backgroundColor: theme.palette.grey[800],
      maxHeight: "calc(80vh - 174px)",
      width: 185,
      borderRadius: "0 4px 4px 4px",
      overflow: "auto",
      boxShadow:
        "0 1px 3px 0 rgba(0, 0, 0, 0.23), 0 4px 8px 3px rgba(0, 0, 0, 0.11)",
      border: `1px solid ${theme.palette.grey[600]}`, // dropDownBorder
      visibility: "hidden",
    },
    listItem: {
      padding: "10px 6px",
      overflow: "hidden",
      whiteSpace: "nowrap",
      textOverflow: "ellipsis",
      "&:hover": {
        backgroundColor: theme.palette.action.hover, // highlight
      },
    },
    editTextWrapperOpen: {
      fontFamily: '"ibm-plex-sans", Helvetica Neue, Arial, sans-serif',
      fontWeight: 500,
      fontSize: 12,
      color: theme.palette.text.primary,
      height: 19,
      width: 122,
      paddingLeft: 4,
      border: "none",
      outline: "none",
      marginRight: "auto",
      backgroundColor: theme.palette.grey[700], // textInput
      boxShadow: `0 0 0 2px ${theme.palette.primary.main}`,
    },
    editTextWrapper: {
      fontFamily: '"ibm-plex-sans", Helvetica Neue, Arial, sans-serif',
      fontWeight: 500,
      fontSize: 12,
      color: theme.palette.text.primary,
      height: 19,
      width: 122,
      paddingLeft: 4,
      border: "none",
      outline: "none",
      marginRight: "auto",
      backgroundColor: "transparent",
    },
    dropDownIcon: {
      fill: theme.palette.text.secondary,
      right: 0,
      position: "absolute",
      top: 0,
      height: "100%",
      width: 28,
      padding: " 0 8px",
    },
  })
);

export interface Props {
  labels: string[];
  activeLabel: string;
  onChange: (label: string) => any;
  onFocusChange?: (focused: boolean) => any;
}

function LabelSelect({ labels, activeLabel, onChange, onFocusChange }: Props) {
  const classes = useStyles();

  const [labelOpen, setLabelOpen] = useState(false);
  const [labelEditingValue, setEditingLabelValue] = useState(undefined);

  const inputRef = useRef<HTMLInputElement>(null);

  const setFocus = React.useCallback(
    (f) => {
      setLabelOpen(f);
      if (onFocusChange) {
        onFocusChange(f);
      }
    },
    [onFocusChange]
  );

  const ref = useRef(null);
  const handleBlur = useCallback(() => {
    setEditingLabelValue(undefined);
    setFocus(false);
  }, [setFocus]);
  useClickOutside(ref, handleBlur);

  useEffect(() => {
    // calling this directly after setEditing doesn't work, which is why we need
    // to use and effect.
    if (labelOpen && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [labelOpen]);

  const handleChange = useCallback((e) => {
    setEditingLabelValue(e.target.value);
  }, []);

  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === "Enter" && inputRef.current) {
        const newActiveLabel = inputRef.current.value.trim();
        if (newActiveLabel) {
          onChange(newActiveLabel);
        }
        setEditingLabelValue(undefined);
        setFocus(false);
      }
    },
    [onChange, setFocus]
  );

  const handleClick = useCallback(() => {
    setFocus(true);
  }, [setFocus]);

  const handleLabelChosen = useCallback(
    (label) => (e: any) => {
      e.stopPropagation();
      onChange(label);
      setEditingLabelValue(undefined);
      setFocus(false);
    },
    [onChange, setFocus]
  );

  const query = (labelEditingValue || "").trim();
  const filteredLabels =
    query === ""
      ? labels
      : labels
          // If the query is at the begining of the label.
          .filter(
            (item: any) => item.toLowerCase().indexOf(query.toLowerCase()) === 0
          )
          // Only sort the list when we filter, to make it easier to see diff.
          .sort((a: any, b: any) => a.length - b.length);

  const items = filteredLabels.map((label) => {
    return {
      label: label,
      value: label,
    };
  });

  if (query) {
    items.push({ label: `Create label "${query}"`, value: query });
  }

  return (
    <div
      ref={ref}
      onClick={handleClick}
      className={labelOpen ? classes.labelDropDownOpen : classes.labelDropDown}
    >
      {items.length > 0 && (
        <div className={labelOpen ? classes.cardOpen : classes.card}>
          {items.map((label) => (
            <div
              className={classes.listItem}
              key={label.value}
              onClick={handleLabelChosen(label.value)}
            >
              {label.label}
            </div>
          ))}
        </div>
      )}
      <input
        ref={inputRef}
        className={
          labelOpen ? classes.editTextWrapperOpen : classes.editTextWrapper
        }
        readOnly={!labelOpen}
        // disabled={!labelOpen} this causes issues in FireFox
        onChange={handleChange}
        onKeyPress={handleKeyPress}
        // We need to use undefined because an empty string is falsy
        value={
          labelEditingValue !== undefined
            ? labelEditingValue
            : activeLabel || "" // If active label happens to be undefined the component will become uncontrolled.
        }
        type="text"
      />
      <svg
        onClick={(e) => {
          if (labelOpen) {
            e.stopPropagation();
            setEditingLabelValue(undefined);
            setFocus(false);
          }
        }}
        className={classes.dropDownIcon}
        style={labelOpen ? { transform: "rotate(-180deg)" } : undefined}
        focusable="false"
        preserveAspectRatio="xMidYMid meet"
        width="12"
        height="12"
        viewBox="0 0 16 16"
        aria-hidden="true"
      >
        <path d="M8 11L3 6l.7-.7L8 9.6l4.3-4.3.7.7z" />
      </svg>
    </div>
  );
}

export default LabelSelect;
