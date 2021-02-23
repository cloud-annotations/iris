const spawn = require("child_process").spawn;
const fs = require("fs");
const path = require("path");

const { Command } = require("commander");

const command = new Command()
  .command("start")
  .option("-w, --watch")
  .description("TODO: description")
  .action((opts) => {
    if (opts.watch === true) {
      watch();
      return;
    }
    start();
  });

async function start() {
  console.log("starting...");
  const irisRoot = "/usr/local/lib/iris";

  const irisPath = path.resolve(__dirname, irisRoot, "iris/dist/index.js");
  const spaRoot = path.resolve(__dirname, irisRoot, "packages/iris-app/build");

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

  spawn("node", [irisPath], {
    env: {
      ...process.env,
      SPA_ROOT: spaRoot,
    },
    stdio: "inherit",
  });
}

async function watch() {
  console.log("watching...");
  const irisRoot = "/usr/local/lib/iris";

  const irisPath = path.resolve(__dirname, irisRoot, "iris/dist/index.js");
  const spaRoot = path.resolve(__dirname, irisRoot, "packages/iris-app/build");

  spawn("node", [irisPath], {
    env: {
      ...process.env,
      SPA_ROOT: spaRoot,
    },
    stdio: "inherit",
  });

  const build = spawn("make", ["install", "watch"], {
    cwd: irisRoot,
    stdio: "inherit",
  });

  await new Promise((resolve, _reject) => {
    build.on("close", resolve);
  });
}

module.exports = command;
