#!/usr/bin/env node

if (process.argv[2] === "start") {
  console.log("starting...");
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
