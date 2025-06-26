import { ArgumentParser } from "argparse";
import path from "path";
import { promises as fs } from "fs";

import { runServer } from "./server";

// Force exit
const forceExit = async () => {
  console.log("Script cancelled...\b");
  process.exit(0);
};
process.on("SIGTERM", forceExit);
process.on("SIGINT", forceExit);

const DEFAULT_IN = `./input`;
const DEFAULT_OUT = `./cropped`;

function parseArgs(): { dir: string; out: string; port: number } {
  const parser = new ArgumentParser({
    prog: "yarn cropper",
    description: "Trim the whitespace from a directory of SVG icons.",
  });

  parser.add_argument("--in", {
    dest: "dir",
    default: DEFAULT_IN,
    help: "The input directory of SVG files",
  });

  parser.add_argument("--out", {
    default: DEFAULT_OUT,
    help: "The output directory",
  });
  
  parser.add_argument("--port", {
    dest: "port",
    default: Math.floor(Math.random() * 901) + 8000,
    help: "The port number for the converter server.",
  });

  return parser.parse_args();
}

async function main() {
  // Parse args
  const args = parseArgs();
  const dir = path.resolve(args.dir);
  const out = path.resolve(args.out);

  if (dir === out) {
    console.log(
      "The SVG directory and the output directory cannot be the same."
    );
    process.exit(1);
  }

  // Normalize paths and create output directory
  let inStats;
  try {
    inStats = await fs.stat(dir);
  } catch (err: any) {
    if (err.code === "ENOENT") {
      console.log(`Input directory does not exist: ${dir}`);
      process.exit(1);
    } else {
      throw err;
    }
  }
  if (!inStats.isDirectory()) {
    console.log(`Path is not a directory: ${dir}`);
    process.exit(1);
  }
  await fs.mkdir(out, { recursive: true });

  console.log("\nSVG Bulk Processor");
  console.log(` * input directory: ${dir}`);
  console.log(` * output directory: ${out}\n`);

  // Start server
  await runServer({ svgDir: dir, outDir: out, port: args.port });
}
main();
