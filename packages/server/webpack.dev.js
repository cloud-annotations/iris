const path = require("path");
const cluster = require("cluster");

const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const webpack = require("webpack");
const { merge } = require("webpack-merge");
const nodeExternals = require("webpack-node-externals");

const common = require("./webpack.common.js");

class StartServerPlugin {
  apply(compiler) {
    const { output } = compiler.options;
    compiler.hooks.afterEmit.tapAsync(
      "StartServerPlugin",
      (_compilation, callback) => {
        if (this.worker && this.worker.isConnected()) {
          callback();
          return;
        }

        cluster.setupMaster({
          exec: path.join(output.path, output.filename),
          execArgv: [],
          args: [],
        });

        cluster.on("online", (worker) => {
          this.worker = worker;
          callback();
        });

        cluster.fork();
      }
    );
  }
}

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
