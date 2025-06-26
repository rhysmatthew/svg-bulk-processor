import express from "express";
import path from "path";
import { promises as fs } from "fs";
import Handlebars from "handlebars";
import open from "open";

const STATIC_DIR = path.resolve(path.join(__dirname, "static"));

/**
 * Load the list of SVG files
 */
const getSvgList = async (dir: string) => {
  const dirFiles = await fs.readdir(dir);
  const filelist = dirFiles.filter((name) => {
    const ext = path.extname(name);
    return ext.toLowerCase() === ".svg";
  });
  filelist.sort();

  console.log(`Found ${filelist.length} SVG files.\n`);
  return filelist;
};

/**
 * Get the SVG content
 */
const readSvg = async (svgDir: string, name: string) => {
  const filepath = path.join(svgDir, name);
  const file = await fs.open(filepath);
  const content = await file.readFile();
  file.close();
  return content.toString();
};

/**
 * Save a new SVG file with formatted name
 */
const saveSvg = async (
  outDir: string,
  name: string,
  content: string,
  isOutline: boolean = false // Pass this flag as needed
) => {
  // unencode HTML
  content = content.replace(/&lt;/g, "<").replace(/&gt;/g, ">");

  // Extract base name (remove .svg extension if present)
  let baseName = name.replace(/\.svg$/i, "");

  // Remove 'Type' and 'Icon', convert to lowercase, replace non-alphanumeric with '-'
  let iconName = baseName
    .replace(/Type/gi, "")
    .replace(/Icon/gi, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-");

  // Remove leading/trailing dashes and collapse multiple dashes
  iconName = iconName.replace(/^-+/, "").replace(/-+$/, "").replace(/-+/g, "-");

  // Append '-outline' if needed
  if (isOutline) {
    iconName = `${iconName}-outline`;
  }

  // Set output file name
  const outputFileName = `icon--${iconName}.svg`;
  const iconPath = path.join(outDir, outputFileName);

  const file = await fs.open(iconPath, "w");
  await file.write(content);
  await file.close();
};

/**
 * Compile a handlebars template
 */
const template = async (templateName: string) => {
  const templatePath = path.join(
    __dirname,
    "templates",
    `${templateName}.handlebars`
  );
  const file = await fs.open(templatePath);
  const contents = await file.readFile();
  const template = Handlebars.compile(contents.toString());

  file.close();
  return template;
};

/**
 * Start the express server
 */
export const runServer = async ({
  svgDir,
  outDir,
  port,
  isOutline
}: {
  svgDir: string;
  outDir: string;
  port: number;
  isOutline: boolean;
}) => {
  let currentIdx = 0;
  let hasStatus = false;
  let svgFiles = await getSvgList(svgDir);

  const app = express();
  app.use("/static", express.static(STATIC_DIR));
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));

  const welcomeTemplate = await template("index");
  const cropTemplate = await template("crop");
  const doneTemplate = await template("done");

  /**
   * Update the status output line
   */
  const printStatusLog = (status: string) => {
    // Clear existing status
    if (hasStatus) {
      process.stdout.moveCursor(0, -1);
      process.stdout.clearLine(1);
    }
    hasStatus = true;

    const iconName = svgFiles[currentIdx];
    const idx = currentIdx + 1;
    const message = `(${idx} of ${svgFiles.length}) ${iconName} - ${status}\n`;
    process.stdout.write(message);
  };

  /**
   * Default welcome endpoint
   */
  app.get("/", (request, response) => {
    const html = welcomeTemplate({
      inputDirectory: svgDir,
      outputDirectory: outDir,
      svgCount: svgFiles.length
    });
    response.send(html);
  });

  /**
   * Crop endpoint
   */
  app.post("/crop", async (request, response) => {
    let { name, content, start } = request.body;

    if (typeof start === "undefined" && typeof content === "undefined") {
      return response.send(doneTemplate({ outputDirectory: outDir }));
    }

    // New cropping session
    if (typeof start !== "undefined") {
      // re-read the file list
      currentIdx = 0;
      svgFiles = await getSvgList(svgDir);
    }

    // Save icon content
    if (name && content) {
      const svgContent = Buffer.from(content, "base64").toString("utf8");
      printStatusLog("Saving");
      currentIdx++;
      await saveSvg(outDir, name, svgContent, isOutline);
    }

    // That was the last file
    if (currentIdx >= svgFiles.length) {
      response.send(doneTemplate({ outputDirectory: outDir }));

      console.log("Generation complete!");
      process.exit(0);
    }

    // Crop the next icon
    const iconName = svgFiles[currentIdx];
    const svgContent = await readSvg(svgDir, iconName);
    printStatusLog("Cropping");
    return response.send(cropTemplate({ name: iconName, svg: svgContent }));
  });

  app.listen(port);

  console.log(
    `🚀 Goto http://localhost:${port} to start converting (CTL+C to exit)`
  );
  open(`http://localhost:${port}`);
};
