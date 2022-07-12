const spawn = require("child_process").spawn;
const fs = require("fs");
const path = require("path");

const { Command } = require("commander");

const command = new Command()
  .command("start")
  .option("-w, --watch")
  .option("--rebuild")
  .description("TODO: description")
  .action((opts) => {
    if (opts.watch === true) {
      watch(opts);
      return;
    }
    start(opts);
  });

async function start(opts) {
  console.log("starting...");
  const resolvedRoot = path.resolve(__dirname, "../../..");

  const irisPath = path.resolve(resolvedRoot, "iris/dist/index.js");
  const spaRoot = path.resolve(resolvedRoot, "packages/iris-app/build");

  // some of the build artifacts are missing, so rebuild the project
  if (opts.rebuild || !fs.existsSync(irisPath) || !fs.existsSync(spaRoot)) {
    console.log("Launching for the first time, building...");
    const build = spawn("make", ["install", "build"], {
      cwd: resolvedRoot,
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

async function watch(_opts) {
  console.log("watching...");

  const resolvedRoot = path.resolve(__dirname, "../../..");

  const irisPath = path.resolve(resolvedRoot, "iris/dist/index.js");

  const build = spawn("make", ["install", "build"], {
    cwd: resolvedRoot,
    stdio: "inherit",
  });

  await new Promise((resolve, _reject) => {
    build.on("close", resolve);
  });

  spawn("node", [irisPath], {
    env: {
      ...process.env,
    },
    stdio: "inherit",
  });

  const watch = spawn("make", ["watch"], {
    cwd: resolvedRoot,
    stdio: "inherit",
  });

  await new Promise((resolve, _reject) => {
    watch.on("close", resolve);
  });
}

module.exports = command;
