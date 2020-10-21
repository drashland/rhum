// Overview
//
// Updates deno version strings in files.
// This scripts main purpose is to aid the `bumper`,
// removing any extra manual work when we bump the deno version

let fileContent = "";
const decoder = new TextDecoder();
const encoder = new TextEncoder();

const fetchResDeno = await fetch(
  "https://cdn.deno.land/deno/meta/versions.json",
);
const denoVersions: {
  latest: string;
  versions: string[];
} = await fetchResDeno.json(); // eg { latest: "v1.3.3", versions: ["v1.3.2", ...] }
const latestDenoVersion = denoVersions.latest.replace("v", "");

const fetchResRhum = await fetch(
  "https://cdn.deno.land/rhum/meta/versions.json",
);
const rhumVersions: {
  latest: string;
  versions: string[];
} = await fetchResRhum.json(); // eg { latest: "v1.3.3", versions: ["v1.3.2", ...] }
const latestRhumVersion = denoVersions.latest;

// Master workflow
fileContent = decoder.decode(
  await Deno.readFile("./.github/workflows/master.yml"),
);
fileContent = fileContent.replace(
  /deno: ["[0-9.]+[0-9.]+[0-9]"]/g,
  `deno: ["${latestDenoVersion}"]`,
);
await Deno.writeFile(
  "./.github/workflows/master.yml",
  encoder.encode(fileContent),
);

// Bumper workflow
fileContent = decoder.decode(
  await Deno.readFile("./.github/workflows/bumper.yml"),
);
fileContent = fileContent.replace(
  /deno: ["[0-9.]+[0-9.]+[0-9]"]/g,
  `deno: ["${latestDenoVersion}"]`,
);
await Deno.writeFile(
  "./.github/workflows/bumper.yml",
  encoder.encode(fileContent),
);

// mod.ts
fileContent = decoder.decode(
  await Deno.readFile("./mod.ts"),
);
fileContent = fileContent.replace(
  /version = ".+"/,
  `version = "${latestRhumVersion}"`,
);
await Deno.writeFile(
  "./mod.ts",
  encoder.encode(fileContent),
);

// src/cli/commands/make.ts
fileContent = decoder.decode(
  await Deno.readFile("./src/cli/commands/make.ts"),
);
fileContent = fileContent.replace(
  `import { Rhum } from "https://deno.land/x/rhum@v1.1.4/mod.ts`,
  `import { Rhum } from "https://deno.land/x/rhum@${latestRhumVersion}/mod.ts"`,
);
await Deno.writeFile(
  "./src/cli/commands/make.ts",
  encoder.encode(fileContent),
);
