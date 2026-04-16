/* eslint-disable no-console */
const childProcess = require("node:child_process");

const originalSpawn = childProcess.spawn;
const originalSpawnSync = childProcess.spawnSync;

function isEsbuildExe(command) {
  if (typeof command !== "string") return false;
  const normalized = command.replace(/\//g, "\\").toLowerCase();
  if (!normalized.includes("\\node_modules\\")) return false;
  return normalized.endsWith("\\esbuild.exe");
}

function wrapSpawn(original) {
  return function spawnWithFallback(command, args, options) {
    // Some Windows environments (AV / policy) block direct spawning of `esbuild.exe`
    // and raise EPERM asynchronously. Route through `cmd /c` to avoid that class
    // of failure for both sync and async spawn calls.
    if (isEsbuildExe(command)) {
      return original(
        "cmd",
        ["/c", command, ...(Array.isArray(args) ? args : [])],
        options,
      );
    }

    return original(command, args, options);
  };
}

childProcess.spawn = wrapSpawn(originalSpawn);
childProcess.spawnSync = wrapSpawn(originalSpawnSync);
