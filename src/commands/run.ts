import { Subcommand, walkSync } from "../../deps.ts";
import { runTests } from "../test_runner.ts";
import { mimeDb } from "../mime_db.ts";

const decoder = new TextDecoder();

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - EXPORTED FUNCTIONS ////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

/**
 * Run the run subcommand.
 *
 * @param this - The subcommand object.
 */
export async function run(this: Subcommand): Promise<void> {
  if (this.hasOptionSpecified("--filter-test-case")) {
    return await runWithOptionFilterTestCase(this);
  }

  if (this.hasOptionSpecified("--filter-test-suite")) {
    return await runWithOptionFilterTestSuite(this);
  }

  await runDefault(this);
}

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - NON-EXPORTED FUNCTIONS ////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

/**
 * Is the Rhum namespace present in the specified file contents?
 *
 * @param contents - The contents of the file.
 *
 * @returns True if yes, false if no.
 */
function contentsContainRhumNamespace(contents: string): boolean {
  return contents.includes("Rhum");
}

/**
 * Filter the specified test files by test case.
 *
 * @param testFiles - The test files to search.
 * @param testCase - The test case to use as a filter.
 *
 * @returns A filtered set of test files.
 */
function filterTestFilesByTestCase(
  testFiles: string[],
  testCase: string,
): string[] {
  let ret: string[] = [];

  for (const filepath of testFiles) {
    const contents = minify(
      decoder.decode(Deno.readFileSync(filepath)),
    );
    if (contents.includes(`Rhum.testCase("${testCase}"`)) {
      ret.push(filepath);
    }
  }

  return ret;
}

/**
 * Filter the specified test files by test suite.
 *
 * @param testFiles - The test files to search.
 * @param testSuite - The test suite to use as a filter.
 *
 * @returns A filtered set of test files.
 */
function filterTestFilesByTestSuite(
  testFiles: string[],
  testSuite: string,
): string[] {
  let ret: string[] = [];

  for (const filepath in testFiles) {
    const contents = minify(
      decoder.decode(Deno.readFileSync(filepath)),
    );
    if (contents.includes(`Rhum.testSuite("${testSuite}"`)) {
      ret.push(filepath);
    }
  }

  return ret;
}

/**
 * Get all of the test files.
 *
 * @param input - The directory or file containing tests.
 *
 * @returns An array of test files containing tests.
 */
function getTestFiles(
  input: string,
): string[] {
  const testFiles: string[] = [];

  if (isFile(input)) {
    try {
      validateFile(input)
      testFiles.push(input);
    } catch (error) {
      throw new Error(`Error reading "${input}" file. See error stack below:\n${error.stack}`);
    }

    testFiles.push(input);
    return testFiles;
  }

  validateDirectory(input);

  for (const entry of walkSync(input, { includeDirs: false })) {
    if (isFile(entry.path)) {
      try {
        validateFile(entry.path)
        testFiles.push(entry.path);
      } catch (error) {
        throw new Error(`Error reading "${input}" file. See error stack below:\n${error.stack}`);
      }
    }
  }

  return testFiles;
}

/**
 * Get all of the test files containing the test case.
 *
 * @param filepath - The filepath containing the test case.
 * @param testCase - The test case to find.
 *
 * @returns Test files containing the test case.
 */
function getTestFilesWithTestCase(
  filepath: string,
  testCase: string,
): string[] {
  let testFiles: string[] = [];

  try {
    testFiles = getTestFiles(filepath);
  } catch (error) {
    const inputType = filepath.includes(".ts") ? "file" : "directory";
    throw new Error(
      `Could not get tests using "${filepath}" as the ${inputType}. See error stack below.\n${error.stack}`,
    );
  }

  testFiles = filterTestFilesByTestCase(
    testFiles,
    testCase,
  );

  return testFiles;
}

/**
 * Get all of the test files containing the test suite.
 *
 * @param filepath - The filepath containing the test suite.
 * @param testCase - The test suite to find.
 *
 * @returns Test files containing the test suite.
 */
function getTestFilesWithTestSuite(
  filepath: string,
  testSuite: string,
): string[] {
  let testFiles: string[] = [];

  try {
    testFiles = getTestFiles(filepath);
  } catch (error) {
    const inputType = filepath.includes(".ts") ? "file" : "directory";
    throw new Error(
      `Could not get tests using "${filepath}" as the ${inputType}. See error stack below.\n${error.stack}`,
    );
  }

  testFiles = filterTestFilesByTestSuite(
    testFiles,
    testSuite,
  );

  return testFiles;
}

/**
 * Is the filepath in question a file.
 *
 * @param filepath - The filepath in question.
 *
 * @returns True if yes, false if no.
 */
function isFile(filepath: string): boolean {
  const split = filepath.split(".");
  return isFileExtension(split[split.length - 1]);
}

/**
 * Is the extension in question a file extension?
 *
 * @param extension - The extension in question.
 *
 * @returns True if yes, false if no.
 */
function isFileExtension(extension: string): boolean {
  let fileExtensions: string[] = [];

  for (const mediaType in mimeDb) {
    const mediaTypeObj = mimeDb[mediaType];
    if (mediaTypeObj.extensions) {
      fileExtensions = fileExtensions.concat(mediaTypeObj.extensions);
    }
  }

  return fileExtensions.indexOf(extension) != -1;
}

/**
 * Minify the input string -- removing new lines and whitespace.
 *
 * @param input - The string to minify.
 *
 * @returns A minified string.
 */
function minify(input: string): string {
  return input.replace(/\n\s/g, "").replace(/\(\s+/g, "(");
}

/**
 * Run the run subcommand without any options.
 *
 * @param subcommand - The subcommand object.
 */
async function runDefault(
  subcommand: Subcommand,
): Promise<void> {
  const filepath = subcommand.user_input.last();
  const testFiles = getTestFiles(filepath);

  await runTests(
    testFiles,
    subcommand.user_input.getDenoFlagsFromDenoArgs(),
  );
}

/**
 * Run the run subcommand with --filter-test-case option.
 *
 * @param subcommand - The subcommand object.
 */
async function runWithOptionFilterTestCase(
  subcommand: Subcommand,
): Promise<void> {
  const option = subcommand.options["--filter-test-case"];
  const testCase = option.value;
  const filepath = subcommand.user_input.last();
  const testFiles = getTestFilesWithTestCase(
    filepath,
    testCase,
  );

  if (testFiles.length == 0) {
    const inputType = filepath.includes(".ts") ? "file" : "directory";
    subcommand.command.cli.logger.error(
      `The "${testCase}" test case could not be found in the "${filepath}" ${inputType}.`,
    );
    Deno.exit(1);
  }

  await runTests(
    testFiles,
    subcommand.user_input.getDenoFlagsFromDenoArgs(),
    { test_case: testCase },
  );
}

/**
 * Run the run subcommand with the --filter-test-suite option.
 *
 * @param subcommand - The subcommand object.
 */
async function runWithOptionFilterTestSuite(
  subcommand: Subcommand,
): Promise<void> {
  const option = subcommand.options["--filter-test-suite"];
  const testSuite = option.value;
  const filepath = subcommand.user_input.last();
  const testFiles = getTestFilesWithTestSuite(
    filepath,
    testSuite,
  );

  if (testFiles.length == 0) {
    const inputType = filepath.includes(".ts") ? "file" : "directory";
    subcommand.command.cli.logger.error(
      `The "${testSuite}" test suite could not be found in the "${filepath}" ${inputType}.`,
    );
    Deno.exit(1);
  }

  await runTests(
    testFiles,
    subcommand.user_input.getDenoFlagsFromDenoArgs(),
    { test_suite: testSuite },
  );
}

/**
 * Validate the filepath in question.
 *
 * @param filepath - The filepath in question.
 */
function validateDirectory(filepath: string): void {
  try {
    Deno.readDirSync(filepath);
  } catch (error) {
    throw new Error(`Error reading "${filepath}" directory. See error stack below:\n${error.stack}`);
  }
}

/**
 * Validate the filepath in question.
 *
 * @param filepath - The filepath in question.
 */
function validateFile(filepath: string): void {
  const contents = Deno.readFileSync(filepath);
  if (!contents) {
    throw new Error(`${filepath} does not exist.`);
  }

  let decoded = decoder.decode(contents);
  if (!contentsContainRhumNamespace(decoded)) {
    throw new Error(`"${filepath}" does not contain any tests.`);
  }
}
