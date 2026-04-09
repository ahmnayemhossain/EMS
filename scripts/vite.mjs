import { spawn } from "node:child_process";
import path from "node:path";
import process from "node:process";

const args = process.argv.slice(2);

const spawnPatch = path.resolve("scripts/spawn-patch.cjs");
process.env.NODE_OPTIONS = `${process.env.NODE_OPTIONS ?? ""} --require ${spawnPatch}`.trim();

const viteCmd = path.resolve("node_modules/.bin/vite.cmd");
const child = spawn("cmd", ["/c", viteCmd, ...args], {
  stdio: "inherit",
  env: process.env,
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});

child.on("error", (err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
