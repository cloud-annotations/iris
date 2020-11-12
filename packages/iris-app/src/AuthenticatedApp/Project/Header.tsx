import React from "react";

import { createStyles, makeStyles, Theme } from "@material-ui/core";
import { useSelector } from "react-redux";

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

// const menus = [
//   {
//     name: "File",
//     items: [
//       { name: "Upload media", action: () => {} },
//       { name: "Upload model zip", action: () => {} },
//       { divider: true },
//       { name: "Import dataset", action: () => {} },
//       { divider: true },
//       { name: "Export as YOLO", action: () => {} },
//       { name: "Export as Create ML", action: () => {} },
//       { name: "Export as Pascal VOC", action: () => {} },
//       {
//         name: "Export as Maximo Visual Inspection",
//         action: () => {},
//         tooltip: {
//           title: "IBM Maximo Visual Inspection",
//           description:
//             "A platform tailored for domain experts to label, train and deploy models for variety of industrial use cases. Quickly build solutions at the edge, monitor assets and inspect production lines for quality.",
//           link: "https://www.ibm.com/products/ibm-maximo-visual-inspection",
//         },
//       },
//       { name: "Export as zip", action: () => {} },
//       {
//         name: "Export as Notebook (.ipynb)",
//         action: () => {},
//         disabled: true,
//       },
//     ],
//   },
//   {
//     name: "Image", // Images (3)
//     items: [
//       { name: "Delete", action: () => {} },
//       { divider: true },
//       { name: 'Mark as "negative"', action: () => {} },
//       {
//         name: "Mark as",
//         action: () => {},
//         items: [
//           { name: "up", action: () => {} }, // dynamic
//           { name: "down", action: () => {} }, // dynamic
//         ],
//       },
//     ],
//   },
// ];

interface Props {
  name: string;
  saving: number;
}

function Header({ name, saving }: Props) {
  const classes = useStyles();

  const selected = useSelector(visibleSelectedImagesSelector).length;
  const categories = useSelector((state: RootState) => state.data.categories);

  const menus: Menu[] = [
    {
      name: "File",
      items: [{ name: "Upload media", action: () => {} }],
    },
    {
      name: selected > 1 ? `Images (${selected})` : "Image",
      items: [
        { name: "Delete", action: () => {} },
        { divider: true },
        { name: 'Mark as "negative"', action: () => {} },
        {
          name: "Mark as",
          action: () => {},
          disabled: categories.length === 0,
          items: categories.map((c) => ({ name: c, action: () => {} })),
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
