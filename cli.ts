import { showHelp } from "./src/cli/options/help.ts";
import { showVersion } from "./src/cli/options/version.ts";
import { logInfo, logError, runTests } from "./src/test_runner.ts";
import { wordWrap } from "./src/cli/services/help_menu_service.ts";
import { IFilters } from "./src/interfaces.ts";

const input = Deno.args[Deno.args.length - 1];
const args = Deno.args;
const filters: IFilters = {};

if (!input) {
  showHelp();
  Deno.exit(0);
}

if (args.length <= 1) {
}

if (args.length >= 1) {
  if (commandIs("make")) {
    make(args);
  }
  if (commandIs("test")) {
    test(args);
  }
}

function commandIs(command: string): boolean {
  return args[0] == command;
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
  console.log(args);

  if (!input) {
    logError("Please specify what you want to make. See --help for more information on make:{item}.");
    Deno.exit(0);
  }

  if (input == "test") {
    if (args.length <= 1) {
      logError(wordWrap("You must specify a test file to make."));
      Deno.exit(0);
    }
    logInfo("Creating test file");
    // if (Deno.readFileSync()) {
    // }
    Deno.exit(0);
  }
  Deno.exit(0);
}

function test(args: string[]): void {
  checkCommandArgs("test", args);

  args.shift();
  console.log(args);
  runTests(input, filters);
}

function checkCommandArgs(command: string, args: string[]): void {
  if (args.length == 1) {
    logError(`The \`${command}\` command requires an argument. See \`rhum --help\` for more information.`);
    Deno.exit();
  }
}

