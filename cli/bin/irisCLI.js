const spawn = require("child_process").spawn;
const fs = require("fs");
const path = require("path");

async function init() {
  if (process.argv[2] === "start") {
    console.log("starting...");

    // const irisRoot = path.resolve(__dirname, "../iris");
    const irisRoot = "/usr/local/lib/iris";

    const irisPath = path.resolve(__dirname, irisRoot, "iris/dist/index.js");
    const spaRoot = path.resolve(
      __dirname,
      irisRoot,
      "packages/iris-app/build"
    );

    // some of the build artifacts are missing, so rebuild the project
    if (!fs.existsSync(irisPath) || !fs.existsSync(spaRoot)) {
      console.log("Launching for the first time, building...");
      const build = spawn("make", ["install", "build"], {
        cwd: irisRoot,
        stdio: "inherit",
      });

      await new Promise((resolve, _reject) => {
        build.on("close", resolve);
      });
    }

    const iris = spawn("node", [irisPath], {
      env: {
        ...process.env,
        SPA_ROOT: spaRoot,
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
