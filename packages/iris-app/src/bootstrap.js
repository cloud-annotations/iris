import initIris from "./initIris";
import initReactApp from "./initReactApp";

initIris();

try {
  const _iris_plugin_box_tool = require("@iris/plugin-box-tool");
  _iris_plugin_box_tool.activate(window.IRIS);
} catch (e) {
  console.log(e);
}

initReactApp();
