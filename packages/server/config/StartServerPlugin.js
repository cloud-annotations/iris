const path = require("path");
const cluster = require("cluster");

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

module.exports = StartServerPlugin;
