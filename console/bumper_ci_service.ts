import { BumperService } from "https://raw.githubusercontent.com/drashland/services/master/ci/bumper_service.ts";

const b = new BumperService("rhum", Deno.args);

if (BumperService.is_for_pre_release) {
  b.bump([
    {
      filename: "./README.md",
      replaceTheRegex: /dmm@v[0-9\.]+[0-9\.]+[0-9\.]/g,
      replaceWith: `dmm@v{{ thisModulesLatestVersion }}`,
    },
    {
      filename: "./egg.json",
      replaceTheRegex: /"version": "[0-9\.]+[0-9\.]+[0-9\.]"/,
      replaceWith: `"version": "{{ thisModulesLatestVersion }}"`,
    },
    {
      filename: "./mod.ts",
      replaceTheRegex: /version = ".+"/,
      replaceWith: `version = "{{ thisModulesLatestVersion }}"`,
    },
    {
      filename: "./src/cli/commands/make.ts",
      replaceTheRegex:
        `import { Rhum } from "https://deno.land/x/rhum@v1.1.4/mod.ts`,
      replaceWith:
        `import { Rhum } from "https://deno.land/x/rhum@v{{ thisModulesLatestVersion }}/mod.ts"`,
    },
    {
      filename: "./src/commands/version.ts",
      replaceTheRegex: /version = "[0-9\.]+[0-9\.]+[0-9\.]"/,
      replaceWith: `version = "v{{ thisModulesLatestVersion }}"`,
    },
  ]);
} else {
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
      filename: "./.github/workflows/pre_release.yml",
      replaceTheRegex: /deno: ["[0-9.]+[0-9.]+[0-9]"]/g,
      replaceWith: `deno: ["{{ latestDenoVersion }}"]`,
    },
  ]);
}
