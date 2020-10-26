import initReactApp from "./"
import initIris from "./initIris"

initIris()

try {
  const _iris_plugin_box_tool = require("@iris/plugin-box-tool")
  _iris_plugin_box_tool.default.activate(window.IRIS)
} catch (e) {
  console.log(e)
}

initReactApp()