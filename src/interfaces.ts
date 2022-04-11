import type {
  MethodCalls,
  MethodOf,
} from "./types.ts";
import { PreProgrammedMethod } from "./pre_programmed_method.ts";

export interface IError {
  name: string;
  message?: string;
}

export interface IMock<OriginalObject> {
  calls: MethodCalls<OriginalObject>;
  is_mock: boolean;

  init(
    original: OriginalObject,
    methodsToTrack: string[],
  ): void;

  method<ReturnValueType>(
    methodName: MethodOf<OriginalObject>
  ): PreProgrammedMethod<OriginalObject, ReturnValueType>;
}
