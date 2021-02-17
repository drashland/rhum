import {
  ConsoleLogger,
  Args,
  Option,
  Subcommand,
  walkSync
} from "../../deps.ts";
import { runTests } from "../test_runner.ts";

const decoder = new TextDecoder();

/**
 * Get the deno flags (e.g., --allow-all) from the specified args.
 *
 * @param args -  The args containing (if any) Deno flags.
 *
 * @returns An array of Deno flags.
 */
function getDenoFlags(args: Args): string[] {
  let ret: string[] = [];

  if (
    args.store.has("-A")
    || args.store.has("--allow-all")
  ) {
    ret.push("--allow-all");
  } else {
    if (args.store.has("--allow-net")) {
      ret.push("--allow-net");
    }
    if (args.store.has("--allow-read")) {
      ret.push("--allow-read");
    }
    if (args.store.has("--allow-run")) {
      ret.push("--allow-run");
    }
    if (args.store.has("--allow-write")) {
      ret.push("--allow-write");
    }
  }

  return ret;
}

/**
 * Get the test files.
 *
 * @param dirOrFile - The directory containing the tests or a test file.
 *
 * @returns An array of test files to execute using Deno.run().
 */
export function getTestFiles(
  dirOrFile: string
): string[] {
  const testFiles: string[] = [];

  if (!dirOrFile.includes(".ts")) {
    for (const entry of walkSync(dirOrFile, { includeDirs: false })) {
      if (entry.path.includes(".ts")) {
        const contents = decoder.decode(Deno.readFileSync(entry.path));
        if (!contents.includes("Rhum")) {
          ConsoleLogger.error(
            `${entry.path} does not contain the Rhum namespace.
            `
          );
          Deno.exit(1);
        }
        testFiles.push(entry.path);
      }
    }
  } else {
    if (!Deno.readFileSync(dirOrFile)) {
      throw new Error("Invalid test file.");
    }
    testFiles.push(dirOrFile);
  }

  return testFiles;
}

export function getTestFilesWithTestCase(
  dirOrFile: string,
  testCase: string
): string[] {
  const testFiles: string[] = [];

  if (!dirOrFile.includes(".ts")) {
    for (const entry of walkSync(dirOrFile, { includeDirs: false })) {
      if (entry.path.includes(".ts")) {
        const contents = decoder.decode(Deno.readFileSync(entry.path));
        if (!contents.includes("Rhum")) {
          ConsoleLogger.error(
            `${entry.path} does not contain the Rhum namespace.
            `
          );
          Deno.exit(1);
        }
        if (contents.includes(`Rhum.testCase("${testCase}")`)) {
          testFiles.push(entry.path);
        }
      }
    }
  } else {
    const contents = decoder.decode(Deno.readFileSync(dirOrFile));
    if (!contents) {
      throw new Error("Invalid test file.");
    }
    if (!contents.includes(`Rhum.testCase("${testCase}")`)) {
    }
    testFiles.push(dirOrFile);
  }

  return testFiles;
}

export async function run(
  this: Subcommand,
  args: Args
): Promise<void> {
  if (this.runWithOption("--filter-test-case")) {
    return await runWithOptionFilterTestCase(
      this.getOption("--filter-test-case"),
      args
    );
  }

  if (this.runWithOption("--filter-test-suite")) {
    return await runWithOptionFilterTestSuite(
      this.getOption("--filter-test-suite"),
      args
    );
  }

  await runDefault(this, args);
}

async function runDefault(
  context: Subcommand,
  args: Args
): Promise<void> {
  let testFiles: string[] = [];

  const filepathArr = Array.from(args.store).pop();
  if (!filepathArr) {
    return context.showHelp();
  }

  const filepath = filepathArr[0];

  try {
    testFiles = getTestFiles(filepath);
  } catch (error) {
  }

  if (testFiles.length <= 0) {
    return context.showHelp();
  }

  await runTests(
    testFiles,
    getDenoFlags(args)
  );
}

export async function runWithOptionFilterTestCase(
  context: Option,
  args: Args
): Promise<void> {
  let testFiles: string[] = [];

  const testCase = context.value;
  if (!testCase) {
    return context.showHelp();
  }

  const filepathArr = Array.from(args.store).pop();
  if (!filepathArr) {
    return context.showHelp();
  }

  const filepath = filepathArr[0];

  try {
    testFiles = getTestFilesWithTestCase(
      filepath,
      testCase
    );
  } catch (error) {
  }

  if (testFiles.length <= 0) {
    return context.showHelp();
  }

  await runTests(
    testFiles,
    getDenoFlags(args)
  );
}

export async function runWithOptionFilterTestSuite(
  context: Option,
  args: Args
): Promise<void> {
}
