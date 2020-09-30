import React from "react";

import AutoLabelPanel from "./AutoLabelPanel";
import DrawingPanel from "./DrawingPanel";
import ImagesPanel from "./ImagesPanel";
import LayersPanel from "./LayersPanel";
import Layout from "./Layout";
import SplitLayout from "./SplitLayout";
import ToolOptionsPanel from "./ToolOptionsPanel";
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
      right={
        <SplitLayout
          expandBottom={false}
          top={<LayersPanel />}
          bottom={<AutoLabelPanel />}
        />
      }
      bottom={<ImagesPanel />}
    />
  );
}

export default Localization;
