/**
 * Describes the type as a constructable object using the `new` keyword.
 */
// deno-lint-ignore no-explicit-any
export type Constructor<T extends any> = new (...args: any[]) => T;

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

/**
 * Describes the `MockExtension#calls` property.
 *
 * This is a record where the key is the method that was called and the value is
 * the number of times the method was called.
 */
export type MockMethodCalls<Object> = Record<keyof Object, number>;

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

/**
 * Describes the type as a method of the given generic `Object`.
 *
 * This is used for type-hinting in places like `.verify("someMethod")`.
 */
export type MethodOf<Object> = {
  // deno-lint-ignore no-explicit-any
  [K in keyof Object]: Object[K] extends (...args: any[]) => unknown ? K
    : never;
}[keyof Object];
