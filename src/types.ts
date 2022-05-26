// deno-lint-ignore no-explicit-any
export type Constructor<T extends any> = new (...args: any[]) => T;

export type MethodArguments<Object> = Record<keyof Object, unknown[]>;

export type MethodCalls<Object> = Record<keyof Object, number>;

export type MethodOf<Object> = {
  // deno-lint-ignore no-explicit-any
  [K in keyof Object]: Object[K] extends (...args: any[]) => unknown ? K
    : never;
}[keyof Object];

export type StubReturnValue<T, R> = T extends (...args: unknown[]) => unknown
  ? () => R
  : string;
