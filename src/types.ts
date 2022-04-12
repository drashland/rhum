// deno-lint-ignore no-explicit-any
export type Constructor<T extends any> = new (...args: any[]) => T;

export type MockedObject = { [k: string]: unknown };

export type Stubbed<T> = T & {
  calls: { [k in keyof T]?: T[k] extends () => void ? number : never };
  stub: (p: string, v: unknown) => void;
  is_stubbed: true;
};

export type MethodCalls<Object> = Record<keyof Object, number>;

export type MethodOf<Object> = {
  // deno-lint-ignore no-explicit-any
  [K in keyof Object]: Object[K] extends (...args: any) => any ? K : never
}[keyof Object];