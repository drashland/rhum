import { runTests } from "../../test_runner.ts";
import { IFilters } from "../../interfaces.ts";
import { logError } from "../../../deps.ts";

const filters: IFilters = {};

export async function test(args: string[]): Promise<void> {
  args.forEach((arg: string) => {
    if (!filters.test_case) {
      filters.test_case = getFilterTestCaseValue(arg);
    }
    if (!filters.test_suite) {
      filters.test_suite = getFilterTestSuiteValue(arg);
    }
  });

  if (filters.test_case && filters.test_suite) {
    logError(
      "You cannot use --filter-test-case and --filter-test-suite together. Please specify one option.",
    );
    Deno.exit();
  }

  const testFileOrDir = args[args.length - 1];

  if (testFileOrDir.includes("--")) {
    logError("Please specify a test file or directory.");
    Deno.exit();
  }

  await runTests(testFileOrDir, filters);
}

function getFilterTestCaseValue(arg: string): string | null {
  const match = arg.match(/--filter-test-case=.+/);
  if (match) {
    return match[0].split("=")[1];
  }
  return null;
}

function getFilterTestSuiteValue(arg: string): string | null {
  const match = arg.match(/--filter-test-suite=.+/);
  if (match) {
    return match[0].split("=")[1];
  }

  return null;
}
