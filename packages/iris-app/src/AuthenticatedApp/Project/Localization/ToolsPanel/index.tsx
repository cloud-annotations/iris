import React from "react";

import { useDispatch, useSelector } from "react-redux";

import { RootState } from "@iris/store";

import styles from "./ToolsPanel.module.css";

function ToolsPanel() {
  const dispatch = useDispatch();
  const tool = useSelector((state: RootState) => state.ui.selectedTool);

  return (
    <div className={styles.wrapper}>
      {window.IRIS.tools.list().map((t) => {
        return (
          <div
            onClick={() =>
              dispatch({ type: "project/selectTool", payload: t.id })
            }
            className={tool === t.id ? styles.toolActive : styles.tool}
          >
            {t.icon}
          </div>
        );
      })}
    </div>
  );
}

export default ToolsPanel;
