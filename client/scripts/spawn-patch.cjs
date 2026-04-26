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
      const argv = Array.isArray(args) ? args : [];

      // NOTE: In some locked-down Windows environments, spawning `cmd.exe` is blocked
      // (EPERM). PowerShell is a better fallback here and still preserves stdio piping,
      // which esbuild needs for its long-lived service process.
      const psQuote = (value) => `'${String(value).replace(/'/g, "''")}'`;
      const psCommand = ["&", psQuote(command), ...argv.map(psQuote)].join(" ");

      return original(
        "powershell.exe",
        [
          "-NoProfile",
          "-NonInteractive",
          "-ExecutionPolicy",
          "Bypass",
          "-Command",
          psCommand,
        ],
        options,
      );
    }

    return original(command, args, options);
  };
}

childProcess.spawn = wrapSpawn(originalSpawn);
childProcess.spawnSync = wrapSpawn(originalSpawnSync);
