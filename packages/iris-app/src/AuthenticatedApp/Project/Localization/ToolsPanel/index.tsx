import React from "react";

import { useDispatch, useSelector } from "react-redux";

import { SELECT_TOOL, ProjectState } from "@iris/core";

import styles from "./ToolsPanel.module.css";

function ToolsPanel() {
  const dispatch = useDispatch();
  const tool = useSelector((project: ProjectState) => project.data.tool.active);

  return (
    <div className={styles.wrapper}>
      {window.IRIS.tools.list().map((t) => (
        <div
          key={t.id}
          onClick={() => dispatch(SELECT_TOOL(t.id))}
          className={tool === t.id ? styles.toolActive : styles.tool}
        >
          {t.icon}
        </div>
      ))}
    </div>
  );
}

export default ToolsPanel;
