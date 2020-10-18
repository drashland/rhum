import { walkSync } from "https://deno.land/std@0.74.0/fs/walk.ts";
import {
  blue,
  green,
  red,
  yellow,
} from "https://deno.land/std@0.74.0/fmt/colors.ts";
import { IStats, IFilters } from "./interfaces.ts";

const decoder = new TextDecoder();

/**
 * Run all tests.
 */
export async function runTests(dirOrFile: string, filters: IFilters = {}): Promise<void> {
  console.log();
  logInfo("Starting Rhum");

  // Define the object that will keep a running total of all the stats we care
  // about.
  const stats: IStats = {
    passed: 0,
    failed: 0,
    skipped: 0,
    errors: "",
  };

  logInfo("Checking test file(s)");

  let testFiles: string[];
  try {
    testFiles = getTestFiles(dirOrFile);
  } catch (error) {
    logError("Please specify a valid directory or test file. See rhum --help for more information.");
    Deno.exit(0);
  }

  logInfo("Running test(s)\n");
  for await (const path of testFiles) {
    // Run the test file
    const p = Deno.run({
      cmd: [
        "deno",
        "run",
        "-A",
        Deno.realPathSync("./" + path),
        filters.test_case as string,
        filters.test_suite as string
      ],
      stdout: "piped",
      stderr: "piped",
    });

    const stderr = decoder.decode(await p.stderrOutput());
    if (stderr) {
      // Output the error, but remove the "Check file:///" line, and replace it
      // with the test file being run
      const stderrFormatted = stderr
        .replace(/.+/, "\r")
        .replace(/\n|\r|\r\n|\n\r/g, "");
      console.log(stderrFormatted.replace("", path));
    } else {
      // Otherwise, just output the test file being run
      console.log(path);
    }

    // Output the results of the test file, but make sure to strip out the stats
    // string
    const stdout = decoder.decode(await p.output());
    // Define the stats string so that we can strip it out of the stdout results
    const statsString = new RegExp(/\{\"passed.*failed.*skipped.*/, "g");
    console.log(stdout.replace(statsString, ""));

    // Store the results from the test file in the stats. We want to keep track
    // of these stats because we want to display the overall test results when
    // Rhum is done running through all of the tests.
    const testPlanResults = JSON.parse(stdout.match(statsString)![0]);
    stats.passed += testPlanResults.passed;
    stats.failed += testPlanResults.failed;
    stats.skipped += testPlanResults.skipped;
    stats.errors += testPlanResults.errors;
  }

  // Output the errors
  console.log(stats.errors);

  // Output the overall results
  console.log(
    `\nTest Results: ${green(stats.passed.toString())} passed; ${
      red(stats.failed.toString())
    } failed; ${yellow(stats.skipped.toString())} skipped`,
  );
}

/**
 * Get the test files
 *
 * @param dirOrFile - The directory containing the tests or a test file.
 *
 * @returns An array of test files to execute using Deno.run().
 */
function getTestFiles(dirOrFile: string): string[] {
  const testFiles: string[] = [];

  if (!dirOrFile.includes(".ts")) {
    for (const entry of walkSync(dirOrFile, { includeDirs: false })) {
      if (
        entry.path.includes("mock_builder_test") ||
        entry.path.includes("basic_test")
      ) {
        continue;
      }
      testFiles.push(entry.path);
    }
  } else {
    if (!Deno.readFileSync(dirOrFile)) {
      throw new Error("Invalid test file.");
    }
    testFiles.push(dirOrFile);
  }

  return testFiles;
}

/**
 * Log an error message.
 *
 * @param message The message to log.
 */
export function logError(message: string): void {
  console.log(red("ERROR") + " " + message);
}

/**
 * Log an info message.
 *
 * @param message The message to log.
 */
export function logInfo(message: string): void {
  console.log(blue("INFO") + " " + message);
}
