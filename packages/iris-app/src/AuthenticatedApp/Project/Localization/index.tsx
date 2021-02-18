import React from "react";

import DrawingPanel from "./DrawingPanel";
import ImagesPanel from "./ImagesPanel";
import Layout from "./Layout";
import ShapesPanel from "./ShapesPanel";
import ToolOptionsPanel from "./ToolsOptionsPanel";
import ToolsPanel from "./ToolsPanel";

function Localization() {
  return (
    <Layout
      top={<ToolOptionsPanel />}
      left={<ToolsPanel />}
      content={<DrawingPanel />}
      right={<ShapesPanel />}
      bottom={<ImagesPanel />}
    />
  );
}

export default Localization;
