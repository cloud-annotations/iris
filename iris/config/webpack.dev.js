const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const webpack = require("webpack");
const { merge } = require("webpack-merge");
const nodeExternals = require("webpack-node-externals");

const StartServerPlugin = require("./StartServerPlugin");
const common = require("./webpack.common.js");

module.exports = merge(common, {
  entry: ["webpack/hot/poll?100", "./src/index.ts"],
  mode: "development",
  watch: true,
  devtool: "inline-source-map",
  externals: [
    nodeExternals({
      allowlist: ["webpack/hot/poll?100"],
    }),
  ],
  plugins: [
    new CleanWebpackPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new StartServerPlugin(),
  ],
});
