// deno-lint-ignore no-explicit-any
export type Constructor<T extends any> = new (...args: any[]) => T;

export type MethodArguments<Object> = Record<keyof Object, unknown[]>;

export type MethodCalls<Object> = Record<keyof Object, number>;

export type MethodOf<Object> = {
  // deno-lint-ignore no-explicit-any
  [K in keyof Object]: Object[K] extends (...args: any[]) => unknown ? K
    : never;
}[keyof Object];

export type StubReturnValue<Object, ReturnValue> = Object extends
  Constructor<Object> ? () => ReturnValue
  : ReturnValue;

/**
 * This type is callable.
 *
 * @example
 * ```ts
 * const hello: Callable<string> = () => {
 *   return "world";
 * }
 *
 * // Since `hello` is callable, we can call it
 * hello(); // => "world"
 * ```
 */
export type Callable<ReturnValue> = (...args: unknown[]) => ReturnValue;
