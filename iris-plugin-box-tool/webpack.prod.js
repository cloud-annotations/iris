const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const { merge } = require("webpack-merge");
// const nodeExternals = require("webpack-node-externals");

const common = require("./webpack.common.js");

module.exports = merge(common, {
  entry: "./src/index.tsx",
  mode: "production",
  devtool: "source-map",
  // externals: [nodeExternals()],
  plugins: [new CleanWebpackPlugin()],
});
