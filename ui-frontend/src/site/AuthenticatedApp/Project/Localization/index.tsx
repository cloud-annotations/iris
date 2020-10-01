import React, { useEffect, useState } from "react";

import settings from "src/plugins/settings";

import AutoLabelPanel from "./AutoLabelPanel";
import DrawingPanel from "./DrawingPanel";
import ImagesPanel from "./ImagesPanel";
import LayersPanel from "./LayersPanel";
import Layout from "./Layout";
import SplitLayout from "./SplitLayout";
import ToolOptionsPanel from "./ToolsOptionsPanel";
import ToolsPanel from "./ToolsPanel";

const toolbar = Promise.all(
  settings.toolbarOptions.map((option) => import(option))
);

function usePlugins(plugins: any) {
  const [_plugins, _setPlugins] = useState([]);
  useEffect(() => {
    plugins.then((loadedPlugins: any) => {
      _setPlugins(loadedPlugins);
    });
  }, [plugins]);
  return _plugins;
}

function Localization() {
  const toolbarOptions = usePlugins(toolbar);
  return (
    <Layout
      top={<ToolOptionsPanel xxx={toolbarOptions} />}
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
