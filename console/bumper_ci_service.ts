import { BumperService } from "https://raw.githubusercontent.com/drashland/services/master/ci/bumper_service.ts";
import { preReleaseFiles } from "./bumper_ci_service_files.ts";

const b = new BumperService("rhum", Deno.args);

if (b.isForPreRelease()) {
  b.bump(preReleaseFiles);
}
