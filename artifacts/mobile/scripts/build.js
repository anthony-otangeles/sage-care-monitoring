const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");
const distDir = path.join(projectRoot, "dist");

if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}

console.log("Exporting Expo app for the web...");
const result = spawnSync(
  "pnpm",
  ["exec", "expo", "export", "--platform", "web", "--output-dir", "dist"],
  { cwd: projectRoot, stdio: "inherit" },
);

if (result.status !== 0) {
  console.error("Web export failed");
  process.exit(result.status || 1);
}

console.log("Web build complete: dist/");
