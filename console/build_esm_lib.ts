const decoder = new TextDecoder();
const encoder = new TextEncoder();

const filesToRewrite = [
  "tmp/conversion_workspace/src/fake/fake_builder.ts",
  "tmp/conversion_workspace/src/fake/fake_mixin.ts",
  "tmp/conversion_workspace/src/mock/mock_builder.ts",
  "tmp/conversion_workspace/src/mock/mock_mixin.ts",
  "tmp/conversion_workspace/src/interfaces.ts",
  "tmp/conversion_workspace/src/pre_programmed_method.ts",
  "tmp/conversion_workspace/src/types.ts",
  "tmp/conversion_workspace/mod.ts",
];

Deno.run({ cmd: ["rm", "-r", "tmp/conversion_workspace/"] });
Deno.run({ cmd: ["mkdir", "-p", "tmp/conversion_workspace/"] });
Deno.run({ cmd: ["cp", "-r", "src/", `tmp/conversion_workspace/src`] });
Deno.run({ cmd: ["cp", "mod.ts", `tmp/conversion_workspace/mod.ts`] });

let file: any;

while (!file) {
  try {
    file = await Deno.lstat("tmp/conversion_workspace/src/fake/fake_builder.ts");
  } catch (error) {
  }
}

for (const index in filesToRewrite) {
  const file = filesToRewrite[index];

  // Step 1: Read contents
  let contents = decoder.decode(Deno.readFileSync(file));

  // Step 2: Create an array of import/export statements from the contents
  const importStatements = contents.match(/import.*";/g);
  const exportStatements = contents.match(/export.*";/g);

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

  // Step 5: Rewrite the original file without .ts extensions
  Deno.writeFileSync(file, encoder.encode(contents));
}