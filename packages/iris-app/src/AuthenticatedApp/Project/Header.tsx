import React from "react";

import { createStyles, makeStyles, Theme } from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

import { showConfirmDialog, showFileDialog } from "@iris/components";
import {
  ProjectState,
  visibleSelectedImagesSelector,
  addAnnotations,
  addImages,
  removeImages,
} from "@iris/store";

import { createJPEGs } from "./image-utils";
import ToolbarMenus from "./ToolbarMenus";
import { Menu } from "./ToolbarMenus/types";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      position: "absolute",
      display: "flex",
      alignItems: "center",
      top: 0,
      bottom: 0,
      right: 0,
      left: 0,
      backgroundColor: theme.palette.grey[800],
    },
    projectButton: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "100%",
      width: 64,
    },
    projectLink: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: 48,
      width: 48,
      borderRadius: 4,
      "&:hover": {
        backgroundColor: "var(--highlight)",
      },
    },
    projectIcon: {
      // background: "black",
      // borderRadius: 4,
      // padding: 6,
      // width: 46,
      // height: 44,
      width: 20,
      height: 20.5,
    },
    project: {
      marginLeft: 6,
      marginRight: "auto",
      height: "100%",
    },
    projectName: {
      fontSize: 18,
      color: "var(--brightText)",
      marginTop: 9,
      padding: "2px 8px",
    },
    menus: {
      display: "flex",
      fontSize: 14,
      color: "var(--secondaryText)",
      alignItems: "center",
    },
    saveStatus: {
      position: "relative",
      marginTop: 2,
      border: "1px solid transparent",
      padding: "4px 6px",
      cursor: "pointer",
      marginLeft: 14,
      color: "var(--detailText)",
    },
  })
);

interface Props {
  name: string;
  saving: number;
}

function Header({ name, saving }: Props) {
  const classes = useStyles();

  const { pathname } = useLocation();

  const dispatch = useDispatch();

  const selected = useSelector(visibleSelectedImagesSelector);
  const categories = useSelector(
    (project: ProjectState) => project.data.categories
  );

  const menus: Menu[] = [
    {
      name: "File",
      items: [
        {
          name: "Upload media",
          action: async () => {
            const files = await showFileDialog({
              accept: "image/*,video/*",
              multiple: true,
            });
            const jpegs = await createJPEGs(files);
            dispatch(addImages(jpegs));
          },
        },
      ],
    },
    {
      name: selected.length > 1 ? `Images (${selected.length})` : "Image",
      items: [
        {
          name: "Delete",
          action: async () => {
            const shouldDeleteImages = await showConfirmDialog({
              title:
                selected.length > 1
                  ? `Delete ${selected.length} images?`
                  : "Delete image?",
              primary: "Delete",
              danger: true,
            });
            if (shouldDeleteImages) {
              dispatch(removeImages(selected.map((i) => i.id)));
            }
          },
        },
        { divider: true },
        {
          name: 'Mark as "negative"',
          action: () => {
            dispatch(
              addAnnotations({
                images: selected.map((i) => i.id),
                annotation: { id: uuidv4(), label: "negative" },
              })
            );
          },
        },
        {
          name: "Mark as",
          disabled: categories.length === 0,
          items: categories.map((c) => ({
            name: c,
            action: () => {
              dispatch(
                addAnnotations({
                  images: selected.map((i) => i.id),
                  annotation: { id: uuidv4(), label: c },
                })
              );
            },
          })),
        },
      ],
    },
  ];

  return (
    <div className={classes.root}>
      <div className={classes.projectButton}>
        {pathname.startsWith("/projects/") ? (
          <Link to="/projects" className={classes.projectLink}>
            <svg className={classes.projectIcon} viewBox="0 0 40 41">
              <rect fill="white" x="0" y="0" width="8" height="8" />
              <rect fill="white" x="32" y="0" width="8" height="8" />
              <rect fill="white" x="0" y="33" width="8" height="8" />
              <rect fill="white" x="32" y="33" width="8" height="8" />
              <rect fill="white" x="4" y="8" width="4" height="25" />
              <rect fill="white" x="32" y="8" width="4" height="25" />
              <rect fill="white" x="8" y="5" width="24" height="3" />
              <rect fill="white" x="8" y="33" width="24" height="3" />
            </svg>
          </Link>
        ) : (
          <svg className={classes.projectIcon} viewBox="0 0 40 41">
            <rect fill="white" x="0" y="0" width="8" height="8" />
            <rect fill="white" x="32" y="0" width="8" height="8" />
            <rect fill="white" x="0" y="33" width="8" height="8" />
            <rect fill="white" x="32" y="33" width="8" height="8" />
            <rect fill="white" x="4" y="8" width="4" height="25" />
            <rect fill="white" x="32" y="8" width="4" height="25" />
            <rect fill="white" x="8" y="5" width="24" height="3" />
            <rect fill="white" x="8" y="33" width="24" height="3" />
          </svg>
        )}
      </div>

      <div className={classes.project}>
        <div className={classes.projectName}>{name}</div>
        <div className={classes.menus}>
          <ToolbarMenus menus={menus} />
          <div className={classes.saveStatus}>
            {saving > 0 ? "Saving..." : "Saved"}
          </div>
        </div>
      </div>
    </div>
  );
}

function HeaderController() {
  const name = useSelector((project: ProjectState) => project.meta.name);
  const saving = useSelector((project: ProjectState) => project.meta.saving);
  return <Header name={name ?? ""} saving={saving} />;
}

export default HeaderController;
