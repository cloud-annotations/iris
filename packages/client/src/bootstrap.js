import initReactApp from "./"
import initIris from "./initIris"

initIris()

try {
  const _iris_box_tool_extension = require("@iris/box-tool-extension")
  _iris_box_tool_extension.default.activate(window.IRIS)
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