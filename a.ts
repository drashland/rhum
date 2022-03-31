import { Rhum } from "./mod.ts";
export class Logger {
  public constructor(types: string[] = []) {
  }
}

const logger = Rhum.mock(Logger).withConstructorArgs("types", ["info"])
  .create();
