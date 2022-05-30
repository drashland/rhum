import { copySync, emptyDirSync, ensureDirSync, walk } from "./deps.ts";
const decoder = new TextDecoder();
const encoder = new TextEncoder();
const workspace = "./tmp/conversion_workspace";

const debug = false;

function logDebug(msg: unknown): void {
  if (!debug) {
    return;
  }

  console.log(msg);
}

try {
  logDebug(`Creating ${workspace}.`);
  emptyDirSync(workspace);
  ensureDirSync(workspace);
  logDebug(`Copying Rhum source files to ${workspace}.`);
  copySync("./src", workspace + "/src", { overwrite: true });
  copySync("./mod.ts", workspace + "/mod.ts", { overwrite: true });
} catch (error) {
  logDebug(error);
  Deno.exit(1);
}

logDebug("Starting .ts extension removal process.");

for await (const entry of walk(workspace)) {
  if (!entry.isFile) {
    continue;
  }

  logDebug(`Removing .ts extensions from ${entry.path}.`);
  removeTsExtensions(entry.path);
  logDebug("Moving to next file.\n\n");
}

logDebug("Done removing .ts extensions from source files.");

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
    contents = contents.replace("../interfaces.ts", "../interfaces")
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

  logDebug(`New contents (without .ts extensions):`);
  logDebug(contents);

  // Step 5: Rewrite the original file without .ts extensions
  logDebug(`Overwriting ${filename} with new contents.`);
  Deno.writeFileSync(filename, encoder.encode(contents));
  logDebug("File written.");
}
