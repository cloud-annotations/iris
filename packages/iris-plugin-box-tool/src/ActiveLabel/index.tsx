import React, { useState, useCallback, useEffect, useRef } from "react";

import { useSelector, useDispatch } from "react-redux";

import { createStyles, makeStyles } from "@material-ui/core";

const useStyles = makeStyles(() =>
  createStyles({
    labelDropDownOpen: {
      position: "relative",
      display: "flex",
      alignItems: "center",
      color: "var(--secondaryText)",
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
      color: "var(--secondaryText)",
      fontSize: 12,
      fontWeight: 500,
      padding: "3.5px 6px 3.5px 8px",
      width: 160,
      cursor: "pointer",
      "&:hover": {
        backgroundColor: "var(--highlight)",
        borderRadius: 4,
      },
    },
    cardOpen: {
      position: "absolute",
      top: "100%",
      left: 6,
      zIndex: 10,
      backgroundColor: "var(--secondaryBg)",
      maxHeight: "calc(80vh - 174px)",
      width: 185,
      borderRadius: "0 4px 4px 4px",
      overflow: "auto",
      boxShadow:
        "0 1px 3px 0 rgba(0, 0, 0, 0.23), 0 4px 8px 3px rgba(0, 0, 0, 0.11)",
      border: "1px solid var(--dropDownBorder)",
    },
    card: {
      position: "absolute",
      top: "100%",
      left: 6,
      zIndex: 10,
      backgroundColor: "var(--secondaryBg)",
      maxHeight: "calc(80vh - 174px)",
      width: 185,
      borderRadius: "0 4px 4px 4px",
      overflow: "auto",
      boxShadow:
        "0 1px 3px 0 rgba(0, 0, 0, 0.23), 0 4px 8px 3px rgba(0, 0, 0, 0.11)",
      border: "1px solid var(--dropDownBorder)",
      visibility: "hidden",
    },
    listItem: {
      padding: "10px 6px",
      overflow: "hidden",
      whiteSpace: "nowrap",
      textOverflow: "ellipsis",
      "&:hover": {
        backgroundColor: "var(--highlight)",
      },
    },
    editTextWrapperOpen: {
      fontFamily: '"ibm-plex-sans", Helvetica Neue, Arial, sans-serif',
      fontWeight: 500,
      fontSize: 12,
      color: "var(--brightText)",
      height: 19,
      width: 122,
      paddingLeft: 4,
      border: "none",
      outline: "none",
      marginRight: "auto",
      backgroundColor: "var(--textInput)",
      boxShadow: "0 0 0 2px var(--blue)",
    },
    editTextWrapper: {
      fontFamily: '"ibm-plex-sans", Helvetica Neue, Arial, sans-serif',
      fontWeight: 500,
      fontSize: 12,
      color: "var(--brightText)",
      height: 19,
      width: 122,
      paddingLeft: 4,
      border: "none",
      outline: "none",
      marginRight: "auto",
      backgroundColor: "transparent",
    },
    dropDownIcon: {
      fill: "var(--secondaryText)",
    },
  })
);

function ActiveLabel() {
  const classes = useStyles();

  const dispatch = useDispatch();
  const labels = useSelector((state: any) => state.project.categories);
  const activeLabel = useSelector(
    (state: any) => state.project.ui.selectedCategory
  );

  const [labelOpen, setLabelOpen] = useState(false);
  const [labelEditingValue, setEditingLabelValue] = useState(undefined);

  const inputRef = useRef<HTMLInputElement>(null);

  const ref = useRef(null);
  // const handleBlur = useCallback(() => {
  //   setEditingLabelValue(undefined);
  //   setLabelOpen(false);
  // }, []);
  // useOnClickOutside(ref, handleBlur);

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

  const handleKeyPress = useCallback((e) => {
    // if (e.key === "Enter") {
    //   const newActiveLabel = inputRef.current.value.trim();
    //   if (newActiveLabel) {
    //     if (!labels.includes(newActiveLabel)) {
    //       syncAction(createLabel, [newActiveLabel]);
    //     }
    //     setActiveLabel(newActiveLabel);
    //   }
    //   setEditingLabelValue(undefined);
    //   setLabelOpen(false);
    // }
  }, []);

  const handleClick = useCallback(() => {
    setLabelOpen(true);
  }, []);

  const handleLabelChosen = useCallback(
    (label) => (e: any) => {
      e.stopPropagation();
      dispatch({
        type: "project/selectCategory",
        payload: label,
      });
      setEditingLabelValue(undefined);
      setLabelOpen(false);
    },
    []
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

  return (
    <div
      ref={ref}
      onClick={handleClick}
      className={labelOpen ? classes.labelDropDownOpen : classes.labelDropDown}
    >
      {filteredLabels.length > 0 && (
        <div className={labelOpen ? classes.cardOpen : classes.card}>
          {filteredLabels.map((label: any) => (
            <div
              className={classes.listItem}
              key={label}
              onClick={handleLabelChosen(label)}
            >
              {label}
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
        className={classes.dropDownIcon}
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

export default ActiveLabel;
