import { showHelp } from "./src/cli/options/help.ts";
import { showVersion } from "./src/cli/options/version.ts";
import { logInfo, logError, runTests } from "./src/test_runner.ts";
import { IFilters } from "./src/interfaces.ts";

const input = Deno.args[Deno.args.length - 1];
const args = Deno.args;
const filters: IFilters = {};

if (!input) {
  showHelp();
  Deno.exit(0);
}

if (input) {
  if (input.includes("--")) {
    if (input.trim() == "--version") {
      showVersion();
      Deno.exit(0);
    }
    if (input.trim() == "--help") {
      showHelp();
      Deno.exit(0);
    }
    showHelp();
    Deno.exit(0);
  }

  if (input.trim().includes("make:test")) {
    logError("You must specify a test file. See --help for more information.");
    if (Deno.args.length <= 1) {
      Deno.exit(0);
    }
    logInfo("Creating test file");
    Deno.exit(0);
  }
}

if (args.length > 1) {
  args.forEach((arg: string) => {
    if (arg.includes("--filter-test-case")) {
      filters.test_case = getFilterTestCaseValue(arg);
    }
    if (arg.includes("--filter-test-suite")) {
      filters.test_suite = getFilterTestSuiteValue(arg);
    }
  });

  if (filters.test_case && filters.test_suite) {
    console.log();
    logError(
      "You cannot specify both --filter-test-case and --filter-test-suite in one command. See --help for more information.",
    );
    Deno.exit(0);
  }
}

function getFilterTestCaseValue(arg: string): string {
  const match = arg.match(/--filter-test-case=.+/);
  return match![0].split("=")[1];
}

function getFilterTestSuiteValue(arg: string): string {
  const match = arg.match(/--filter-test-suite=.+/);
  return match![0].split("=")[1];
}

runTests(input, filters);
