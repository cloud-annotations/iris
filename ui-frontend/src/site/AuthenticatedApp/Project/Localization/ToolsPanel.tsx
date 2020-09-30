import React, { useCallback } from "react";
import { useRecoilState } from "recoil";

import { MOVE, BOX } from "src/common/Canvas/Canvas";
import { toolState } from "../state";

import styles from "./ToolsPanel.module.css";

function ToolsPanel() {
  const [tool, setActiveTool] = useRecoilState(toolState);

  const handleToolChosen = useCallback(
    (tool) => () => {
      setActiveTool(tool);
    },
    [setActiveTool]
  );

  return (
    <div className={styles.wrapper}>
      <div
        onClick={handleToolChosen(MOVE)}
        className={tool === MOVE ? styles.toolActive : styles.tool}
      >
        <svg className={styles.move} width="20" height="20" viewBox="0 0 40 40">
          <path d="M19,11h2V29H19V11Zm-8,8H29v2H11V19ZM21,35H19l-4-6H25ZM35,19v2l-6,4V15ZM5,21V19l6-4V25ZM19,5h2l4,6H15Z" />
        </svg>
      </div>

      <div
        onClick={handleToolChosen(BOX)}
        className={tool === BOX ? styles.toolActive : styles.tool}
      >
        <svg className={styles.box} width="20" height="20" viewBox="0 0 40 40">
          <rect x="4" y="8" width="32" height="24" />
        </svg>
      </div>
    </div>
  );
}

export default ToolsPanel;
