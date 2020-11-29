import React from "react";

import { useDispatch, useSelector } from "react-redux";

import { selectTool, ProjectState } from "@iris/store";

import styles from "./ToolsPanel.module.css";

function ToolsPanel() {
  const dispatch = useDispatch();
  const tool = useSelector((project: ProjectState) => project.ui.selectedTool);

  return (
    <div className={styles.wrapper}>
      {window.IRIS.tools.list().map((t) => (
        <div
          key={t.id}
          onClick={() => dispatch(selectTool(t.id))}
          className={tool === t.id ? styles.toolActive : styles.tool}
        >
          {t.icon}
        </div>
      ))}
    </div>
  );
}

export default ToolsPanel;
