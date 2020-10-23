import React from "react";

import DrawingPanel from "./DrawingPanel";
import ImagesPanel from "./ImagesPanel";
import LayersPanel from "./LayersPanel";
import Layout from "./Layout";
import ToolOptionsPanel from "./ToolsOptionsPanel";
import ToolsPanel from "./ToolsPanel";

function Localization() {
  return (
    <Layout
      top={<ToolOptionsPanel />}
      left={<ToolsPanel />}
      content={
        <DrawingPanel
          headCount={6}
          autoLabelActive={false}
          predictions={[]}
          activePrediction={undefined}
        />
      }
      right={<LayersPanel />}
      bottom={<ImagesPanel />}
    />
  );
}

export default Localization;
