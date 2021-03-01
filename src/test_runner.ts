import { colors, ConsoleLogger, readLines } from "../deps.ts";
import { ITestPlanResults } from "./interfaces.ts";

interface IOptions {
  test_case: null|string;
  test_suite: null|string;
}

/**
 * Run all tests.
 */
export async function runTests(
  testFiles: string[],
  denoFlags: string[],
  options: IOptions,
): Promise<void> {
  console.log();
  ConsoleLogger.info("Starting Rhum");

  // Define the variable that will keep track of all tests' results
  const stats: ITestPlanResults = {
    passed: 0,
    failed: 0,
    skipped: 0,
    errors: "",
  };

  ConsoleLogger.info("Running test(s)\n");

  for await (const path of testFiles) {
    // Output what file is being tested
    console.log("\n" + path);

    let cmd = [
      "deno",
      "run",
    ];

    cmd = cmd.concat(denoFlags);

    cmd.push(Deno.realPathSync(path));

    cmd.push(JSON.stringify(options));

    // Run the test file
    const p = Deno.run({
      cmd: cmd,
      stdout: "piped",
      stderr: "piped",
    });

    for await (const stderrLine of readLines(p.stderr as Deno.Reader)) {
      const line = stderrLine.trim();
      if (
        !line.includes("\u001b[0m\u001b[32mCheck\u001b[0m file:///") &&
        line != "" &&
        line != "\n" &&
        line != "\r" &&
        JSON.stringify(line != '""')
      ) {
        console.log(line);
      }
    }

    for await (const line of readLines(p.stdout as Deno.Reader)) {
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

    // Uncomment this block to debug errors within this test runner
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
