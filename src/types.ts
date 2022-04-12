// deno-lint-ignore no-explicit-any
export type Constructor<T extends any> = new (...args: any[]) => T;

export type MethodCalls<Object> = Record<keyof Object, number>;

export type MethodOf<Object> = {
  [K in keyof Object]: Object[K] extends (...args: unknown[]) => unknown ? K : never;
}[keyof Object];

export type MemberOf<Object> = {
  [K in keyof Object]: Object[K];
}[keyof Object];

export type MockedObject = { [k: string]: unknown };

export type StubReturnValue<T, R> = T extends (...args: unknown[]) => unknown ? () => R
  : string;
