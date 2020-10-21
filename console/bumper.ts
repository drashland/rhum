import { BumperCiService } from "https://raw.githubusercontent.com/drashland/services/master/ci/bumper_ci_service.ts";

const b = new BumperCiService("rhum");

b.bump([
  {
    filename: "./.github/workflows/master.yml",
    replaceTheRegex: /deno: ["[0-9.]+[0-9.]+[0-9]"]/g,
    replaceWith: `deno: ["{{ latestDenoVersion }}"]`,
  },
  {
    filename: "./.github/workflows/bumper.yml",
    replaceTheRegex: /deno: ["[0-9.]+[0-9.]+[0-9]"]/g,
    replaceWith: `deno: ["{{ latestDenoVersion }}"]`,
  },
  {
    filename: "./mod.ts",
    replaceTheRegex: /version = ".+"/,
    replaceWith: `version = "{{ thisModulesLatestVersion }}"`,
  },
  {
    filename: "./src/cli/commands/make.ts",
    replaceTheRegex: `import { Rhum } from "https://deno.land/x/rhum@v1.1.4/mod.ts`,
    replaceWith: `import { Rhum } from "https://deno.land/x/rhum@{{ thisModulesLatestVersion }}/mod.ts"`,
  },
]);
