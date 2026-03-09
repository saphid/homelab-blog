import { copyFile, readFile } from "node:fs/promises";
import path from "node:path";

import matter from "gray-matter";

function usage(): never {
  console.error("Usage: pnpm stage:approved -- <absolute-path-to-draft.md>");
  process.exit(1);
}

const args = process.argv.slice(2).filter((arg) => arg !== "--");
const [draftPathArg] = args;

if (!draftPathArg) {
  usage();
}

const draftPath = path.resolve(draftPathArg);
const raw = await readFile(draftPath, "utf8");
const parsed = matter(raw);

if (!parsed.data.title || !parsed.data.date) {
  throw new Error("Draft front matter must include at least title and date.");
}

const fileName = path.basename(draftPath);
const destination = path.join(process.cwd(), "_posts", fileName);

await copyFile(draftPath, destination);

console.log(`Staged approved draft: ${destination}`);
