"use strict";

const spawn = require("child_process").spawn;

function init() {
  if (process.argv[2] === "start") {
    console.log("starting...");

    const iris = spawn("node", ["/usr/local/lib/.iris/iris/dist/index.js"], {
      env: {
        ...process.env,
        SPA_ROOT: "/usr/local/lib/.iris/packages/iris-app/build",
      },
    });

    iris.stdout.on("data", (data) => {
      console.log(`stdout: ${data}`);
    });
  }

  if (process.argv[2] === "dev") {
    console.log("starting in dev mode...");
  }

  if (process.argv[2] === "build") {
    console.log("building...");
  }

  if (
    process.argv[2] === "ui" &&
    process.argv[3] === "install" &&
    process.argv[4]
  ) {
    console.log(`installing UI plugin: ${process.argv[4]}...`);
    if (process.argv[5] !== "--no-build") {
      console.log("building...");
    }
  }

  if (
    process.argv[2] === "server" &&
    process.argv[3] === "install" &&
    process.argv[4]
  ) {
    console.log(`installing server plugin: ${process.argv[4]}...`);
    if (process.argv[5] !== "--no-build") {
      console.log("building...");
    }
  }
}

module.exports = {
  init,
};
