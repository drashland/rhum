import { help } from "./src/cli/commands/help.ts";
import { make } from "./src/cli/commands/make.ts";
import { test } from "./src/cli/commands/test.ts";
import { version } from "./src/cli/commands/version.ts";
import { CommandService } from "./deps.ts";

const c = new CommandService(Deno.args);

c.addCommand("help", help);
c.addCommand("--help", help);
c.addCommand("version", version);
c.addCommand("--version", version);
c.addCommand("make", make, { requires_args: true });
c.addCommand("test", test, { requires_args: true });

c.executeCommand();
