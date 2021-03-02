import { runTests } from "../../test_runner.ts";
import { mimeDb } from "../../mime_db.ts";
import { Subcommand, SubcommandOption, walkSync } from "../../../deps.ts";

class OptionFilterTestCase extends SubcommandOption {
  public name = "--filter-test-case";
  public description =
    "Run only test cases that match the value of this option.";
}

class OptionFilterTestSuite extends SubcommandOption {
  public name = "--filter-test-suite";
  public description =
    "Run only test suites that match the value of this option.";
}

const decoder = new TextDecoder();

export class RunSubcommand extends Subcommand {
  public signature = "run [directory|file]";
  public description = "Run tests.";
  public options = [
    OptionFilterTestCase,
    OptionFilterTestSuite,
  ];

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PUBLIC ////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  public async handle(): Promise<void> {
    const input = this.getArgument("[directory|file]");

    if (!input) {
      return this.exit(1, "error", `[directory|file] not specified.`, () => {
        this.showHelp();
      });
    }

    let testFiles = this.getTestFiles(input);

    // No tests? Get out of here.
    if (testFiles.length <= 0) {
      const inputType = this.isFile(input) ? "file" : "directory";
      this.exit(
        1,
        "error",
        `Could not find any tests in "${input}" ${inputType}.`,
      );
    }

    // Are we filtering by test suite?
    const testSuite = this.getOption("--filter-test-suite");
    if (testSuite) {
      testFiles = this.filterTestFilesByTestSuite(
        testFiles,
        testSuite,
      );
    }

    // Are we filtering by test case?
    const testCase = this.getOption("--filter-test-case");
    if (testCase) {
      testFiles = this.filterTestFilesByTestCase(
        testFiles,
        testCase,
      );
    }

    // No tests after filter? Get out of here.
    if (testFiles.length <= 0) {
      const inputType = this.isFile(input) ? "file" : "directory";
      this.exit(
        1,
        "error",
        `Could not find any tests that matched your filters in "${input}" ${inputType}.`,
      );
    }

    await runTests(
      testFiles,
      this.getDenoFlags(),
      {
        test_suite: testSuite,
        test_case: testCase,
      },
    );
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PROTECTED /////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Is the Rhum namespace present in the specified file contents?
   *
   * @param contents - The contents of the file.
   *
   * @returns True if yes, false if no.
   */
  protected contentsContainRhumNamespace(contents: string): boolean {
    let containsRhum = false;

    if (contents.includes("Rhum")) {
      if (contents.includes(".skip")) {
        containsRhum = true;
      } else {
        if (contents.includes(".testPlan")) {
          containsRhum = true;
        }
        if (contents.includes(".testSuite")) {
          containsRhum = true;
        }
        if (contents.includes(".testCase")) {
          containsRhum = true;
        }
      }
    }

    return containsRhum;
  }

  /**
   * Filter the specified test files by test case.
   *
   * @param testFiles - The test files to search.
   * @param testCase - The test case to use as a filter.
   *
   * @returns A filtered set of test files.
   */
  protected filterTestFilesByTestCase(
    testFiles: string[],
    testCase: string,
  ): string[] {
    const ret: string[] = [];

    for (const filepath of testFiles) {
      const contents = this.minifyString(
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
  protected filterTestFilesByTestSuite(
    testFiles: string[],
    testSuite: string,
  ): string[] {
    const ret: string[] = [];

    testFiles.forEach((filepath: string) => {
      const contents = this.minifyString(
        decoder.decode(Deno.readFileSync(filepath)),
      );
      if (contents.includes(`Rhum.testSuite("${testSuite}"`)) {
        ret.push(filepath);
      }
    });

    return ret;
  }

  /**
   * Get all of the test files.
   *
   * @param input - The directory or file containing tests.
   *
   * @returns An array of test files containing tests.
   */
  protected getTestFiles(
    input: string,
  ): string[] {
    const testFiles: string[] = [];

    if (this.isFile(input)) {
      if (this.isValidFile(input)) {
        testFiles.push(input);
      }
      return testFiles;
    }

    if (this.isValidDirectory(input)) {
      for (const entry of walkSync(input, { includeDirs: false })) {
        if (this.isFile(entry.path)) {
          if (this.isValidFile(entry.path)) {
            testFiles.push(entry.path);
          }
        }
      }
    }

    return testFiles;
  }

  /**
   * Is the filepath in question a file.
   *
   * @param filepath - The filepath in question.
   *
   * @returns True if yes, false if no.
   */
  protected isFile(filepath: string): boolean {
    const split = filepath.split(".");
    return this.isFileExtension(split[split.length - 1]);
  }

  /**
   * Is the extension in question a file extension?
   *
   * @param extension - The extension in question.
   *
   * @returns True if yes, false if no.
   */
  protected isFileExtension(extension: string): boolean {
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
   * Validate the directory in question.
   *
   * @param directory - The filepath in question.
   */
  protected isValidDirectory(directory: string): boolean {
    try {
      Deno.readDirSync(directory);
    } catch (error) {
      this.exit(1, "error", `Could not read "${directory}" directory.`);
    }

    return true;
  }

  /**
   * Validate the file in question.
   *
   * @param file - The file in question.
   */
  protected isValidFile(file: string): boolean {
    try {
      const contents = Deno.readFileSync(file);

      const decoded = decoder.decode(contents);
      if (!this.contentsContainRhumNamespace(decoded)) {
        return false;
      }
    } catch (error) {
      this.exit(1, "error", `Could not read "${file}" file.`);
    }

    return true;
  }

  /**
   * Minify the input string -- removing new lines and whitespace.
   *
   * @param input - The string to minify.
   *
   * @returns A minified string.
   */
  protected minifyString(input: string): string {
    return input.replace(/\n\s/g, "").replace(/\(\s+/g, "(");
  }
}
