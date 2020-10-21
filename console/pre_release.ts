import { PreReleaseCiService } from "https://raw.githubusercontent.com/drashland/services/master/ci/pre_release_ci_service.ts";

const p = new PreReleaseCiService();

p.bump(Deno.args, [
  {
    filename: "./egg.json",
    replaceTheRegex: /"version": "[0-9\.]+[0-9\.]+[0-9\.]"/,
    replaceWith: `"version": "{{ thisModulesLatestVersion }}"`,
  },
  {
    filename: "./README.md",
    replaceTheRegex: /dmm@v[0-9\.]+[0-9\.]+[0-9\.]/g,
    replaceWith: `dmm@v{{ thisModulesLatestVersion }}`,
  },
  {
    filename: "./src/commands/version.ts",
    replaceTheRegex: /version = "[0-9\.]+[0-9\.]+[0-9\.]"/,
    replaceWith: `version = "{{ thisModulesLatestVersion }}"`,
  },
]);

