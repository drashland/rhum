export type TConstructorFunction<T> = {
  new (...args: unknown[]): T;
  [key: string]: unknown;
};

// deno-lint-ignore no-explicit-any
export type Constructor<T extends unknown> = new (...args: any[]) => T;

export type Mocked<T> = T & {
  calls: { [k in keyof T]: T[k] extends () => void ? number : never };
  is_mock: true;
};

export type Stubbed<T> = T & {
  calls: { [k in keyof T]?: T[k] extends () => void ? number : never };
  stub: (p: string, v: unknown) => void;
  is_stubbed: true;
};
