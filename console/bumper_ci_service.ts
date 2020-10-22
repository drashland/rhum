import { BumperService } from "../deps.ts";
import { denoVersionFiles, moduleVersionFiles } from "./files.ts";

const b = new BumperService("rhum", Deno.args);

if (b.isForPreRelease()) {
  b.bump(moduleVersionFiles);
} else {
  b.bump(denoVersionFiles);
}
