/**
 * @TODO(crookse) This can probably use Line. Line wouldn't necessariliy be a
 * dependency of the lib. It would be a dependency of the build process.
 *
 * This script takes TypeScript files that follow Deno's requirements of (e.g.,
 * `import` statements require `.ts` extensions) and converts them to a portable
 * format that other non-Deno processes can use.
 *
 * For example, running `deno run -A ./console/build_esm_lib.ts ./src ./mod.ts`
 * will do the following:
 *
 *   1. Create a directory to build the portable TypeScript code. The directory
 *      in this context is called the "workspace directory" and lives at
 *      `./tmp/conversion_workspace` directory.
 *   2. Copy `./src` into the workspace directory.
 *   3. Copy `./mod.ts` into the workspace directory.
 *   4. Remove all `.ts` extensions from all `import` and `export` statements in
 *      all files in the workspace directory.
 *
 * Now that all `.ts` extensions are removed from the `import` and `export`
 * statements, the workspace directory can be used by other processes. For
 * example, `tsc` can be used on the workspace directory to compile the code
 * down to a specific format like CommonJS for Node applications and a plain
 * JavaScript module syntax for browser applications.
 *
 * @param Deno.args A list of directories and files containing TypeScript files
 * that this script should convert.
 */

import { copySync, emptyDirSync, ensureDirSync, walk } from "./deps.ts";
const decoder = new TextDecoder();
const encoder = new TextEncoder();
const args = Deno.args.slice();

const debug = optionEnabled("--debug");
const debugContents = optionEnabled("--debug-contents");
const workspace = optionValue("--workspace");

Promise
  .resolve((() => {
    createWorkspace();
    logDebug(`Options:`, { debug, debugContents });
  })())
  .then(convertCode)
  .then(() => Deno.exit(0))
  .catch((error) => {
    logDebug(error);
    Deno.exit(1);
  });

/**
 * Convert the code given to this script.
 */
async function convertCode(): Promise<void> {
  logDebug("\nStarting .ts extension removal process.\n");

  for await (const entry of walk(workspace)) {
    if (!entry.isFile) {
      continue;
    }

    logDebug(`Removing .ts extensions from ${entry.path}.`);
    removeTsExtensions(entry.path);
    logDebug("Moving to next file.");
    logDebug("");
  }

  logDebug("Done removing .ts extensions from source files.");
}

/**
 * Create the workspace directory.
 */
function createWorkspace() {
  logDebug(`Creating ${workspace}.`);
  emptyDirSync("./node_modules");
  emptyDirSync(workspace);
  ensureDirSync(workspace);

  for (const item of args) {
    const nonDotFilename = item.replace("./", "/");
    logDebug(`Copying ${item} to ${workspace}${nonDotFilename}.`);
    copySync(item, workspace + nonDotFilename, { overwrite: true });
  }
}

/**
 * Remove the .ts extensions for runtimes that do not require it.
 */
function removeTsExtensions(filename: string): void {
  // Step 1: Read contents
  let contents = decoder.decode(Deno.readFileSync(filename));

  // Step 2: Create an array of import/export statements from the contents
  const importStatements = contents.match(
    /(import.+\.ts";)|(import.+((\n|\r)\s.+)+(\n|\r).+\.ts";)/g,
  );
  const exportStatements = contents.match(
    /(export.+\.ts";)|(export.+((\n|\r)\s.+)+(\n|\r).+\.ts";)/g,
  );

  // FIXME(crookse) This is a temporary fix for removing .ts extensions from the
  // the `interfaces.ts` import statement in `spy_stub_builder.ts`. For some
  // reason, Windows (in the CI) is not removing the `.ts` extension from the
  // `interfaces.ts` import statement.
  if (filename.includes("spy_stub_builder.ts")) {
    contents = contents.replace("../interfaces.ts", "../interfaces");
  }

  // Step 3: Remove all .ts extensions from the import/export statements
  const newImportStatements = importStatements?.map((statement: string) => {
    return statement.replace(/\.ts";/, `";`);
  });

  const newExportStatements = exportStatements?.map((statement: string) => {
    return statement.replace(/\.ts";/, `";`);
  });

  // Step 4: Replace the original contents with the new contents
  if (newImportStatements) {
    importStatements?.forEach((statement: string, index: number) => {
      contents = contents.replace(statement, newImportStatements[index]);
    });
  }
  if (newExportStatements) {
    exportStatements?.forEach((statement: string, index: number) => {
      contents = contents.replace(statement, newExportStatements[index]);
    });
  }

  if (debugContents) {
    logDebug(`New contents (without .ts extensions):`);
    logDebug(contents);
  }

  // Step 5: Rewrite the original file without .ts extensions
  logDebug(`Overwriting ${filename} with new contents.`);
  Deno.writeFileSync(filename, encoder.encode(contents));
  logDebug("File written.");
}

/**
 * Log output.
 * @param msg The message to log.
 */
function logDebug(...msg: unknown[]): void {
  if (!debug) {
    return;
  }

  console.log(...msg);
}

/**
 * Is the given option enabled?
 * @param option The name of the option (e.g., `--debug`).
 * @returns True if yes, false if no.
 */
function optionEnabled(option: string): boolean {
  const optionIndex = args.indexOf(option);
  const enabled = optionIndex !== -1;

  if (enabled) {
    args.splice(optionIndex, 1);
  }

  return enabled;
}

/**
 * What is the given option value?
 * @param option The name of the option (e.g., `--workspace`).
 * @returns The value of the option if the option exists.
 */
function optionValue(option: string): boolean {
  const extractedOption = args.filter((arg) => arg.includes(option));

  if (!extractedOption.length) {
    return;
  }

  args.splice(args.indexOf(extractedOption[0], 1));

  return extractedOption[0].replace(option + "=", "");
}
