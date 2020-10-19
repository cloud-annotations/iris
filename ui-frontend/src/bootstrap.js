import initReactApp from "./"
import initIris from "./initIris"

initIris()

try {
  const iris_plugin_box_tool = require("iris-plugin-box-tool")
  iris_plugin_box_tool.default.activate(window.IRIS)
} catch (e) {
  console.log(e)
}
try {
  const fake_fake_fake = require("fake-fake-fake")
  fake_fake_fake.default.activate(window.IRIS)
} catch (e) {
  console.log(e)
}

initReactApp()