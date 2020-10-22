import React from "react";

import { useSelector } from "react-redux";

import { RootState } from "src/store";

import styles from "./ToolOptionsPanel.module.css";

function ToolOptionsPanel() {
  const tool =
    useSelector((state: RootState) => state.project.ui?.selectedTool) ?? "";

  return (
    <div className={styles.wrapper}>
      <div className={styles.divider} />
      {window.IRIS.tools
        .get(tool)
        .options.list()
        .map((option) => {
          return (
            <React.Fragment>
              {option.component}
              <div className={styles.divider} />
            </React.Fragment>
          );
        })}
    </div>
  );
}

export default ToolOptionsPanel;
