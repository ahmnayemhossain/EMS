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
    try {
      return original(command, args, options);
    } catch (err) {
      if (
        err &&
        (err.code === "EPERM" || err.code === "EINVAL") &&
        isEsbuildExe(command)
      ) {
        return original(
          "cmd",
          ["/c", command, ...(Array.isArray(args) ? args : [])],
          options,
        );
      }
      throw err;
    }
  };
}

childProcess.spawn = wrapSpawn(originalSpawn);
childProcess.spawnSync = wrapSpawn(originalSpawnSync);
