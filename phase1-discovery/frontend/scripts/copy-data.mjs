import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.join(__dirname, "..");
const phase1Root = path.join(frontendRoot, "..");

const sources = [
  { from: path.join(phase1Root, "data", "processed"), to: path.join(frontendRoot, "data", "processed") },
  { from: path.join(phase1Root, "outputs", "handoff"), to: path.join(frontendRoot, "data", "handoff") },
];

function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    console.warn(`[copy-data] Skip missing: ${src}`);
    return 0;
  }
  fs.mkdirSync(dest, { recursive: true });
  let count = 0;
  for (const name of fs.readdirSync(src)) {
    const from = path.join(src, name);
    const to = path.join(dest, name);
    if (fs.statSync(from).isDirectory()) {
      count += copyDir(from, to);
    } else {
      fs.copyFileSync(from, to);
      count++;
    }
  }
  return count;
}

let total = 0;
for (const { from, to } of sources) {
  const n = copyDir(from, to);
  total += n;
  console.log(`[copy-data] ${from} -> ${to} (${n} files)`);
}
console.log(`[copy-data] Done. ${total} files copied.`);
