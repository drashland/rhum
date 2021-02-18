import { CliService } from "./deps.ts";
import { run } from "./src/commands/run.ts";

const service = new CliService(
  "rhum",
  "Rhum",
  "A lightweight testing framework for Deno.",
  "v2.0.0",
);

service
  .subcommand(
    "make",
    "Make test files."
  )
  .handler(make)
  .option(
    service.option(
      "--num-test-suites",
      "The number of test suites to make in the file. Each test suite will come with one test case."
    )
  );

service
  .subcommand(
    "run",
    "Run tests."
  )
  .handler(run)
  .option(
    service.option(
      "--filter-test-case",
      "Run tests cases that match the value of this option. This cannot be used with the --filter-test-suite option."
    )
  )
  .option(
    service.option(
      "--filter-test-suite",
      "Run tests suites that match the value of this option. This cannot be used with the --filter-test-case option."
    )
  );

service.run();
