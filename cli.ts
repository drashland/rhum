import { showHelp } from "./src/options/help.ts";
import { showVersion } from "./src/options/version.ts";
import { runTests } from "./src/test_runner.ts";
import { IFilters } from "./src/interfaces.ts";

const dirOrFile = Deno.args[Deno.args.length - 1];

if (dirOrFile) {
  if (dirOrFile.includes("--")) {
    if (dirOrFile.trim() == "--version") {
      showVersion();
      Deno.exit(0);
    }
    if (dirOrFile.trim() == "--help") {
      showHelp();
      Deno.exit(0);
    }
    showHelp();
    Deno.exit(0);
  }
}

const filters: IFilters = {};

if (Deno.args.length > 1) {
  Deno.args.forEach((arg: string) => {
    if (arg.includes("--filter-test-case")) {
      filters.test_case = getFilterTestCaseValue(arg);
    }
    if (arg.includes("--filter-test-suite")) {
      filters.test_suite = getFilterTestSuiteValue(arg);
    }
  });
}

function getFilterTestCaseValue(arg: string): string {
  const match = arg.match(/--filter-test-case=.+/);
  return match![0].split("=")[1];
}

function getFilterTestSuiteValue(arg: string): string {
  const match = arg.match(/--filter-test-suite=.+/);
  return match![0].split("=")[1];
}

runTests(dirOrFile, filters);
