import { walkSync } from "https://deno.land/std@0.74.0/fs/walk.ts";
import { green, red, yellow } from "https://deno.land/std@0.74.0/fmt/colors.ts";
import { IPlan, ICase, IStats } from "./interfaces.ts";

const decoder = new TextDecoder();

export async function runTests(dirOrFile: string): Promise<void> {

  const stats: IStats = {
    passed: 0,
    failed: 0,
    skipped: 0,
    errors: "",
  };

  console.log("\nStarting Rhum ...");

  console.log("\nGathering test files ...");

  const testFiles = getTestFiles(dirOrFile);

  console.log("\nRunning tests ...\n");

  for await (const path of testFiles) {
    console.log(path);
    const p = Deno.run({
      cmd: [
        "deno",
        "run",
        "-A",
        Deno.realPathSync("./" + path),
      ],
      stdout: "piped",
      stderr: "piped",
    });
    const stdout = decoder.decode(await p.output());

    // const stderr = decoder.decode(await p.stderrOutput());

    // if (stderr) {
    //   errors += stderr + "\n";
    // }

    // Define the stats string so that we can strip it out of the stdout results
    const statsString = new RegExp(/\{\"passed.*failed.*skipped.*/, "g");

    // Output the results of the test file
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
    testFiles.push(dirOrFile);
  }

  return testFiles;
}
