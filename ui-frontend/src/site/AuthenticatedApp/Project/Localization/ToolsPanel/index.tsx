import React from "react";

import { useRecoilState } from "recoil";

import { toolState } from "src/state/localization";

import styles from "./ToolsPanel.module.css";

function ToolsPanel() {
  const [tool, setActiveTool] = useRecoilState(toolState);

  return (
    <div className={styles.wrapper}>
      {window.IRIS.tools.list().map((t) => {
        return (
          <div
            onClick={() => setActiveTool(t.id)}
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
