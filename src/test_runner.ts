import { walkSync } from "https://deno.land/std@0.74.0/fs/walk.ts";
import { colors, logError, logInfo, readLines } from "../deps.ts";
import { IFilters, ITestPlanResults } from "./interfaces.ts";

/**
 * Run all tests.
 */
export async function runTests(
  dirOrFile: string,
  filters: IFilters = {},
): Promise<void> {
  console.log();
  logInfo("Starting Rhum");

  // Define the variable that will keep track of all tests' results
  const stats: ITestPlanResults = {
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
    logError(
      "Please specify a valid directory or test file.",
    );
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
        filters.test_case ?? "undefined",
        filters.test_suite ?? "undefined",
        path,
      ],
      stdout: "piped",
      stderr: "piped",
    });

    console.log("\n" + path);

    for await (const line of readLines(p.stdout)) {
      try {
        // Store the results from the test file in the stats. We want to keep
        // track of these stats because we want to display the overall test
        // results when Rhum is done running through all of the tests.
        const testPlanResults = JSON.parse(line);
        stats.passed += testPlanResults.passed;
        stats.failed += testPlanResults.failed;
        stats.skipped += testPlanResults.skipped;
        stats.errors += testPlanResults.errors;
      } catch (error) {
        // If the line is not the test plan results line, then we know it's just
        // a test suite or a test case line. So, we just console log this.
        console.log(line);
      }
    }

    // const stderr = decoder.decode(await p.stderrOutput());
    // if (stderr) {
    //   if (
    //     stderr.includes(colors.red("error")) ||
    //     stderr.includes("Expected") ||
    //     stderr.includes("Expected") ||
    //     stderr.includes("Unexpected") ||
    //     stderr.includes("Uncaught") ||
    //     stderr.includes("TypeError") ||
    //     stderr.match(/TS[0-9].+\[/) // e.g., TS2345 [ERROR]
    //   ) {
    //     console.log(stderr);
    //   } else {
    //     // Output the error, but remove the "Check file:///" line, and replace it
    //     // with the test file being run
    //     const stderrFormatted = stderr
    //       .replace(/.+/, "\r")
    //       .replace(/\n|\r|\r\n|\n\r/g, "");
    //     console.log(stderrFormatted.replace("", path));
    //   }
    // }
  }

  // Output the errors
  console.log(stats.errors);

  // Output the overall results
  console.log(
    `\nTest Results: ${colors.green(stats.passed.toString())} passed; ${
      colors.red(stats.failed.toString())
    } failed; ${colors.yellow(stats.skipped.toString())} skipped`,
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
