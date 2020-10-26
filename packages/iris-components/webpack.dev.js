const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const webpack = require("webpack");
const { merge } = require("webpack-merge");
const nodeExternals = require("webpack-node-externals");

const common = require("./webpack.common.js");

module.exports = merge(common, {
  entry: ["webpack/hot/poll?100", "./src/index.tsx"],
  mode: "development",
  watch: true,
  devtool: "inline-source-map",
  externals: {
    react: "react",
    "react-dom": "ReactDOM",
    "@material-ui/core": "@material-ui/core",
    "@reduxjs/toolkit": "@reduxjs/toolkit",
    "react-redux": "react-redux",
    // "webpack/hot/poll?100": "bloop",
  },
  // externals: [
  //   nodeExternals({
  //     allowlist: ["webpack/hot/poll?100"],
  //   }),
  //   "react",
  //   "react-dom",
  // ],
  plugins: [new CleanWebpackPlugin(), new webpack.HotModuleReplacementPlugin()],
});
