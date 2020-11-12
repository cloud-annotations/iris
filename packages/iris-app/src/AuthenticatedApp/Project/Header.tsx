import React from "react";

import { addAnnotations } from "@iris/store/dist/project/data";
import { createStyles, makeStyles, Theme } from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
// @ts-ignore
import { v4 as uuidv4 } from "uuid";

import { RootState, visibleSelectedImagesSelector } from "@iris/store";

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
    projectIcon: {
      background: "black",
      borderRadius: 4,
      padding: 6,
      width: 46,
      height: 44,
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

  const dispatch = useDispatch();

  const selected = useSelector(visibleSelectedImagesSelector);
  const categories = useSelector((state: RootState) => state.data.categories);

  const menus: Menu[] = [
    {
      name: "File",
      items: [
        {
          name: "Upload media",
          action: () => {
            console.log("Upload media");
          },
        },
      ],
    },
    {
      name: selected.length > 1 ? `Images (${selected.length})` : "Image",
      items: [
        {
          name: "Delete",
          action: () => {
            console.log("Delete");
          },
        },
        { divider: true },
        {
          name: 'Mark as "negative"',
          action: () => {
            console.log('Mark as "negative"');
          },
        },
        {
          name: "Mark as",
          disabled: categories.length === 0,
          items: categories.map((c) => ({
            name: c,
            action: () => {
              console.log("Mark as", c);
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
        <svg className={classes.projectIcon} viewBox="0 0 200 200">
          <rect fill="white" x="35" y="35" width="20" height="20" />
          <rect fill="white" x="145" y="35" width="20" height="20" />
          <rect fill="white" x="35" y="145" width="20" height="20" />
          <rect fill="white" x="145" y="145" width="20" height="20" />
          <rect fill="white" x="45" y="55" width="10" height="90" />
          <rect fill="white" x="145" y="55" width="10" height="90" />
          <rect fill="white" x="55" y="45" width="90" height="10" />
          <rect fill="white" x="55" y="145" width="90" height="10" />
        </svg>
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
  const name = useSelector((state: RootState) => state.project.name);
  const saving = useSelector((state: RootState) => state.project.saving);
  return <Header name={name ?? ""} saving={saving} />;
}

export default HeaderController;
