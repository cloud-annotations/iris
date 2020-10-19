import React from "react";

import { createStyles, makeStyles, Theme } from "@material-ui/core";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

import { ProfileDropDown } from "src/common/DropDown/DropDown";

import ToolbarMenus from "./ToolbarMenus";

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
      backgroundColor: theme.palette.coolGray[90],
    },
    projectButton: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.palette.blue[60],
      height: "100%",
      width: 64,
      cursor: "pointer",
      "&:hover": {
        backgroundColor: theme.palette.blue[70],
      },
    },
    projectIcon: {
      fill: "white",
      width: 32,
      height: 32,
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

const menus = [
  {
    name: "File",
    items: [
      { name: "Upload media", action: () => {} },
      { name: "Upload model zip", action: () => {} },
      { divider: true },
      { name: "Import dataset", action: () => {} },
      { divider: true },
      { name: "Export as YOLO", action: () => {} },
      { name: "Export as Create ML", action: () => {} },
      { name: "Export as Pascal VOC", action: () => {} },
      {
        name: "Export as Maximo Visual Inspection",
        action: () => {},
        tooltip: {
          title: "IBM Maximo Visual Inspection",
          description:
            "A platform tailored for domain experts to label, train and deploy models for variety of industrial use cases. Quickly build solutions at the edge, monitor assets and inspect production lines for quality.",
          link: "https://www.ibm.com/products/ibm-maximo-visual-inspection",
        },
      },
      { name: "Export as zip", action: () => {} },
      {
        name: "Export as Notebook (.ipynb)",
        action: () => {},
        disabled: true,
      },
    ],
  },
  {
    name: "Image", // Images (3)
    items: [
      { name: "Delete", action: () => {} },
      { divider: true },
      { name: 'Mark as "negative"', action: () => {} },
      {
        name: "Mark as",
        action: () => {},
        items: [
          { name: "up", action: () => {} }, // dynamic
          { name: "down", action: () => {} }, // dynamic
        ],
      },
    ],
  },
];

interface Props {
  name: string;
  saving: number;
}

function Header({ name, saving }: Props) {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Link to="/projects" className={classes.projectButton}>
        <svg className={classes.projectIcon} viewBox="0 0 32 32">
          <path d="M11.17 6l3.42 3.41.58.59H28v16H4V6h7.17m0-2H4a2 2 0 0 0-2 2v20a2 2 0 0 0 2 2h24a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2H16l-3.41-3.41A2 2 0 0 0 11.17 4z" />
        </svg>
      </Link>
      <div className={classes.project}>
        <div className={classes.projectName}>{name}</div>
        <div className={classes.menus}>
          <ToolbarMenus menus={menus} />
          <div className={classes.saveStatus}>
            {saving > 0 ? "Saving..." : "Saved"}
          </div>
        </div>
      </div>

      <ProfileDropDown profile={{}} />
    </div>
  );
}

function HeaderController() {
  const name = useSelector((state: any) => state.project.data.name);
  const saving = 0;
  return <Header name={name} saving={saving} />;
}

export default HeaderController;
