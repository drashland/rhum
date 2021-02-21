import { CliService } from "./deps.ts";
import { make } from "./src/commands/make.ts";
import { run } from "./src/commands/run.ts";

const service = new CliService(
  "rhum",
  "Rhum",
  "A lightweight testing framework for Deno.",
  "v2.0.0",
);

service
  .addSubcommand(
    "make",
    "Make test files.",
  )
  .addHandler(
    make,
    "<FILE>"
  )
  .addOption(
    "--num-test-suites",
    "The number of test suites to make in the file. Each test suite will come with one test case.",
  );

service
  .addSubcommand(
    "run",
    "Run tests.",
  )
  .addHandler(
    run,
    "<DIRECTORY|FILE>"
  )
  .addOption(
    "--filter-test-case",
    "Run tests cases that match the value of this option.",
  )
  .addOption(
    "--filter-test-suite",
    "Run tests suites that match the value of this option.",
  );

service.run();
