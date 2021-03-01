import { Commander } from "./deps.ts";
import { RunSubcommand } from "./src/subcommands/run.ts";

const service = new Commander({
  command: "rhum",
  name: "Rhum",
  description: "A lightweight testing framework for Deno.",
  version: "v2.0.0",
  subcommands: [
    RunSubcommand
  ]
});

service.run();
