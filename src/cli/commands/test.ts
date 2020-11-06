import { runTests } from "../../test_runner.ts";
import { IOptions } from "../../interfaces.ts";
import { LoggerService } from "../../../deps.ts";
import { getOptionValue } from "../../services/option_service.ts";

const options: IOptions = {
  deno_flags: "",
};

export async function test(args: string[]): Promise<void> {
  args.forEach((arg: string) => {
    if (!options.test_case) {
      options.test_case = getOptionValue(arg, "--filter-test-case");
    }
    if (!options.test_suite) {
      options.test_suite = getOptionValue(arg, "--filter-test-suite");
    }
    if (!options.ignore) {
      options.ignore = getOptionValue(arg, "--ignore");
    }
    if (
      arg == "--allow-run" ||
      arg == "--allow-net" ||
      arg == "--allow-write"
    ) {
      options.deno_flags += (" " + arg);
    }
  });

  if (options.test_case && options.test_suite) {
    LoggerService.logError(
      "You cannot use --filter-test-case and --filter-test-suite together. Please specify one option.",
    );
    Deno.exit(1);
  }

  const testFileOrDir = args[args.length - 1];

  if (testFileOrDir.includes("--")) {
    LoggerService.logError("Please specify a test file or directory.");
    Deno.exit(1);
  }

  await runTests(testFileOrDir, options);
}
