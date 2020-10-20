import { IFilters } from "./src/interfaces.ts";
import { commandRequiresArgs, commandIs } from "./src/cli/services/command_service.ts";
import { logInfo, logError, runTests } from "./src/test_runner.ts";
import { showHelp } from "./src/cli/options/help.ts";
import { showVersion } from "./src/cli/options/version.ts";
import { testTemplate } from "./src/cli/services/make_service.ts";

const input = Deno.args[Deno.args.length - 1];
const args = Deno.args.slice();
const filters: IFilters = {};

if (!input) {
  showHelp();
  Deno.exit(0);
}

if (args.length >= 1) {
  if (commandIs("help")) {
    showHelp();
    Deno.exit();
  }
  if (commandIs("make")) {
    make(args);
    Deno.exit();
  }
  if (commandIs("test")) {
    await test(args);
    Deno.exit();
  }
  if (commandIs("version")) {
    showVersion();
    Deno.exit();
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

function make(args: string[]) {
  commandRequiresArgs("make", args)
  args.shift();
  const testFileToCreate = args[0];
  if (!testFileToCreate.includes(".ts")) {
    logError(`Test files require a .ts extension. You passed in "${testFileToCreate}" as the test file.`);
    Deno.exit();
  }
  try {
    const file = Deno.readFileSync(testFileToCreate);
  } catch (error) {
    logInfo(`Test file "${testFileToCreate}" does not yet exist`);
    logInfo(`Creating test file "${testFileToCreate}"`);
    Deno.writeFileSync(Deno.realPathSync("./" + testFileToCreate), testTemplate);
    logInfo(`Test file "${testFileToCreate} created`);
  }
}

async function test(args: string[]): Promise<void> {
  commandRequiresArgs("test", args);

  args.shift();

  const testDirOrFile = args[0];

  await runTests(testDirOrFile, filters);
}
