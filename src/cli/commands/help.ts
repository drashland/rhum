import { createHelpMenu } from "../../../deps.ts";
import { version } from "../../../mod.ts";

export function help() {
  console.log(
    createHelpMenu({
      description:
        `Rhum ${version} - A lightweight testing framework for Deno.`,
      usage: [
        "rhum [command]",
      ],
      commands: {
        "make /path/to/test/file_test.ts": "Make a test file.",
        "test [options] /path/to/tests or /path/to/test/file_test.ts":
          "Run tests by specifying a test directory or test file.",
        "help": "Show the help menu.",
        "version": "Show Rhum version.",
      },
      options: {
        "test": {
          "--filter-test-case":
            "Execute the matching test case in the file(s) being tested. This option cannot be used with --filter-test-suite.",
          "--filter-test-suite":
            "Execute the matching test suite in the file(s) being tested. This option cannot be used with --filter-test-case.",
        },
      },
      example_usage: [
        {
          description:
            "Execute the matching test case in the file(s) being tested.",
          examples: [
            `rhum test --filter-test-case="my test case" test_file.ts`,
            `rhum test --filter-test-case="my test case" some_dir/`,
          ],
        },
        {
          description:
            "Execute the matching test case in the file(s) being tested.",
          examples: [
            `rhum test --filter-test-suite="my test suite" test_file.ts`,
            `rhum test --filter-test-suite="my test suite" some_dir/`,
          ],
        },
        {
          description: "Make a test file at /my/project/tests/my_test.ts",
          examples: [
            "rhum make /my/project/tests/my_test.ts",
          ],
        },
        {
          description: "Show the help menu.",
          examples: [
            "rhum help",
          ],
        },
        {
          description: "Show the Rhum version.",
          examples: [
            "rhum version",
          ],
        },
      ],
    }),
  );
}
