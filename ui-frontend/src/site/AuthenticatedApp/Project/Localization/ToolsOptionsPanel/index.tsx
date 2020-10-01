import React from "react";

import styles from "./ToolOptionsPanel.module.css";

interface ToolOptionsPanelProps {
  xxx: JSX.Element[];
}

function ToolOptionsPanel({ xxx }: ToolOptionsPanelProps) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.divider} />
      {xxx.map((element) => {
        return (
          <React.Fragment>
            {element}
            <div className={styles.divider} />
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default ToolOptionsPanel;
