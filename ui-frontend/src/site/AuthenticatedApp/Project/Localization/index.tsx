import React from "react";

import AutoLabelPanel from "./AutoLabelPanel";
import DrawingPanel from "./DrawingPanel";
import LayersPanel from "./LayersPanel";
import Layout from "./Layout";
import SplitLayout from "./SplitLayout";
import ToolOptionsPanel from "./ToolOptionsPanel";
import ToolsPanel from "./ToolsPanel";

const image =
  "https://www.sciencemag.org/sites/default/files/styles/article_main_image_-_1280w__no_aspect_/public/dogs_1280p_0.jpg?itok=6jQzdNB8";

function Localization() {
  return (
    <Layout
      top={<ToolOptionsPanel />}
      left={<ToolsPanel tool="box" />}
      content={
        <DrawingPanel
          headCount={6}
          tool="box"
          selectedImage={image}
          autoLabelActive={false}
          image={image}
          predictions={[]}
          activePrediction={undefined}
          hoveredBox={undefined}
        />
      }
      right={
        <SplitLayout
          expandBottom={false}
          top={<LayersPanel imageName={image} image={image} />}
          bottom={<AutoLabelPanel />}
        />
      }
      bottom={<div />}
    />
  );
}

export default Localization;
