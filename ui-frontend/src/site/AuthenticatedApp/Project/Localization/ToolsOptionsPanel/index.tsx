import React from "react";

import { useRecoilValue } from "recoil";

import { toolState } from "src/state/localization";

import styles from "./ToolOptionsPanel.module.css";

function ToolOptionsPanel() {
  const tool = useRecoilValue(toolState);

  return (
    <div className={styles.wrapper}>
      <div className={styles.divider} />
      {window.IRIS.tools
        .get(tool)
        .options.list()
        .map((option: any) => {
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
