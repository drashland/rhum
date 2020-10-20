import { IFilters } from "./src/interfaces.ts";
import { commandIs, commandRequiresArgs, logError, logInfo } from "./deps.ts";
import { runTests } from "./src/test_runner.ts";
import { showHelp } from "./src/cli/commands/help.ts";
import { showVersion } from "./src/cli/commands/version.ts";
import { testTemplate } from "./src/cli/services/make_service.ts";

const input = Deno.args[Deno.args.length - 1];
const args = Deno.args.slice();
const filters: IFilters = {};

const commands = [
  "help",
  "make",
  "test",
  "version",
];

if (!input) {
  showHelp();
  Deno.exit(0);
}

if (args.length >= 1) {
  switch (true) {
    case commandIs("help"):
      showHelp();
      Deno.exit();
    case commandIs("make"):
      make(args);
      Deno.exit();
    case commandIs("test"):
      await test(args);
      Deno.exit();
    case commandIs("version"):
      showVersion();
      Deno.exit();
    default:
      showHelp();
      Deno.exit();
  }
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

function make(args: string[]) {
  commandRequiresArgs("make", args);
  args.shift();
  let testFileToCreate = args[0];
  if (!testFileToCreate.includes(".ts")) {
    logError(
      `Test files require a .ts extension. You passed in "${testFileToCreate}" as the test file.`,
    );
    Deno.exit();
  }
  try {
    const file = Deno.readFileSync(testFileToCreate);
    logError(`"${testFileToCreate}" already exists`);
  } catch (error) {
    logInfo(`Creating "${testFileToCreate}"`);
    try {
      const pathToTestFile = testFileToCreate.split("/");
      pathToTestFile.pop();
      Deno.mkdirSync(pathToTestFile.join("/"), { recursive: true });
      Deno.writeFileSync(testFileToCreate, testTemplate);
      logInfo(`Test file "${testFileToCreate} created`);
    } catch (error) {
      logError(error.stack);
    }
  }
}

async function test(args: string[]): Promise<void> {
  commandRequiresArgs("test", args);

  args.shift();

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
