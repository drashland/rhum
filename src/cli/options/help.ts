import { createHelpMenu } from "../services/help_menu_service.ts";

export function showHelp() {
  console.log(
    createHelpMenu({
      description: "Rhum - A lightweight testing framework for Deno.",
      usage: [
        "rhum [OPTIONS] [directory|file]"
      ],
      options: {
        "--filter-test-case": "Execute the matching test case in the file(s) being tested. This option cannot be used with --filter-test-suite.",
        "--filter-test-suite": "Execute the matching test suite in the file(s) being tested. This option cannot be used with --filter-test-case.",
        "--help": "Show the help menu.",
        "--version": "Show Rhum version.",
      },
      example_usage: [
        {
          description: "Execute the matching test case in the file(s) being tested.",
          examples: [
            `rhum --filter-test-case="myTestCase" test_file.ts`,
            `rhum --filter-test-case="myTestCase" some_dir/`
          ]
        },
        {
          description: "Execute the matching test case in the file(s) being tested.",
          examples: [
            `rhum --filter-test-suite="myTestSuite" test_file.ts`,
            `rhum --filter-test-suite="myTestSuite" some_dir/`
          ]
        },
        {
          description: "Show the help menu.",
          examples: [
            "rhum --help",
          ]
        },
        {
          description: "Show the Rhum version.",
          examples: [
            "rhum --version",
          ]
        }
      ]
    })
  );
}
