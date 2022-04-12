import type {
  MethodCalls,
  MethodOf,
} from "./types.ts";

export interface IError {
  name: string;
  message?: string;
}

export interface IPreProgrammedMethod<ReturnValue> {
  willReturn(returnValue: ReturnValue): void;
  willThrow(error: IError): void;
}

export interface IFake<OriginalObject> {
  is_fake: boolean;

  init(
    original: OriginalObject,
    methodsToTrack: string[],
  ): void;

  method<ReturnValueType>(
    methodName: MethodOf<OriginalObject>
  ): IPreProgrammedMethod<ReturnValueType>;
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
  ): IPreProgrammedMethod<ReturnValueType>;
}
