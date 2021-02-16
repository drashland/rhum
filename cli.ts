import { Rhum } from "./mod.ts";
(window as any).Rhum = Rhum;

import { CliService, Subcommand, Option } from "./deps.ts";
// import { runTests } from "../test_runner.ts";
// import { run } from "./src/commands/run.ts";

const service = new CliService("Rhum")
  .description("A lightweight testing framework for Deno.")
  .command("rhum");

service
  .subcommand(new Subcommand("run")
    .description("Run tests.")
    .handler(() => {
      console.log("Running tests");
    })
    .option(new Option("--filter-test-case")
      .description("Run tests cases that match the value of this option.")
      .handler(() => {
      })
    )
    .option(new Option("--filter-test-suite")
      .description("Run tests suites that match the value of this option.")
      .handler(() => {
      })
    )
  );

service.run();
