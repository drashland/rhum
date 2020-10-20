import { logError } from "../../test_runner.ts";

export function commandRequiresArgs(command: string, args: string[]): void {
  if (args.length == 1) {
    logError(`The \`${command}\` command requires an argument.`);
    Deno.exit();
  }
}

export function commandIs(command: string): boolean {
  return Deno.args[0] == command;
}
