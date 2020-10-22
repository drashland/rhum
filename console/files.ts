export const regexes = {
  import_statements: /rhum\@v.+mod.ts/g,
  const_statements: /version = ".+"/g,
  yml_deno: /deno: \[".+"\]/g,
  egg_json: /"version": ".+"/,
};

export const moduleVersionFiles = [
  {
    filename: "./README.md",
    replaceTheRegex: regexes.import_statements,
    replaceWith: `rhum@v{{ thisModulesLatestVersion }}/mod.ts`,
  },
  {
    filename: "./egg.json",
    replaceTheRegex: regexes.egg_json,
    replaceWith: `"version": "{{ thisModulesLatestVersion }}"`,
  },
  {
    filename: "./mod.ts",
    replaceTheRegex: regexes.const_statements,
    replaceWith: `version = "v{{ thisModulesLatestVersion }}"`,
  },
  {
    filename: "./src/cli/commands/make.ts",
    replaceTheRegex: regexes.import_statements,
    replaceWith: `rhum@v{{ thisModulesLatestVersion }}/mod.ts"`,
  },
];

export const denoVersionFiles = [
  {
    filename: "./.github/workflows/master.yml",
    replaceTheRegex: regexes.yml_deno,
    replaceWith: `deno: ["{{ latestDenoVersion }}"]`,
  },
  {
    filename: "./.github/workflows/bumper.yml",
    replaceTheRegex: regexes.yml_deno,
    replaceWith: `deno: ["{{ latestDenoVersion }}"]`,
  },
  {
    filename: "./.github/workflows/pre_release.yml",
    replaceTheRegex: regexes.yml_deno,
    replaceWith: `deno: ["{{ latestDenoVersion }}"]`,
  },
];
