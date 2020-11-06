import { walkSync } from "https://deno.land/std@0.74.0/fs/walk.ts";
import { colors, LoggerService, readLines } from "../deps.ts";
import { IOptions, ITestPlanResults } from "./interfaces.ts";

/**
 * Run all tests.
 */
export async function runTests(
  dirOrFile: string,
  options: IOptions = {
    deno_flags: "",
  },
): Promise<void> {
  console.log();
  LoggerService.logInfo("Starting Rhum");

  // Define the variable that will keep track of all tests' results
  const stats: ITestPlanResults = {
    passed: 0,
    failed: 0,
    skipped: 0,
    errors: "",
    ignored: options.ignore ? options.ignore.split(",") : undefined,
  };

  LoggerService.logInfo("Checking test file(s)");

  let testFiles: string[];
  try {
    testFiles = getTestFiles(dirOrFile);
  } catch (error) {
    LoggerService.logError(
      "Please specify a valid directory or test file.",
    );
    Deno.exit(1);
  }

  LoggerService.logInfo("Running test(s)\n");
  for await (const path of testFiles) {
    let ignore = false;

    if (options && options.ignore) {
      options.ignore.split(",").forEach((ignoredFileOrDirectory: string) => {
        const match = ("./" + path).match(
          ignoredFileOrDirectory,
        );
        if (match && match.length > 0) {
          ignore = true;
        }
      });
    }

    if (ignore) {
      continue;
    }

    // Output what file is being tested
    console.log("\n" + path);

    const cmd = [
      "deno",
      "run",
    ];

    const denoFlags = options.deno_flags.split(" ");
    denoFlags.shift();
    denoFlags.forEach((arg: string) => {
      cmd.push(arg);
    });

    cmd.push(Deno.realPathSync("./" + path));
    cmd.push(path); // Deno.args[Deno.argslength - 1]
    cmd.push(JSON.stringify(options)); // Deno.args[Deno.argslength - 1]

    // Run the test file
    const p = Deno.run({
      cmd: cmd,
      stdout: "piped",
      stderr: "piped",
    });

    for await (const stderrLine of readLines(p.stderr)) {
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

  // Output the files that were ignored
  if (stats.ignored) {
    console.log();
    LoggerService.logInfo("Ignored files and/or directories");
    console.log();
    stats.ignored.forEach((path: string) => {
      console.log(`- ${path}`);
    });
  }
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
