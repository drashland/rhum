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
 *
 * @example
 * ```ts
 * {
 *   someMethod: 0,
 *   someOtherMethod: 3,
 *   someOtherOtherMethod: 2,
 * }
 * ```
 */
export type MockMethodCalls<Object> = Record<keyof Object, number>;

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

/**
 * Describes the type as a method of the given generic `Object`.
 *
 * This is used for type-hinting in places like `.verify("someMethod")`.
 *
 * @example
 * ```ts
 * class Hello {
 *   some_property = true;
 *   someMethod(): boolean { return true;}
 * }
 *
 * function callMethod(method: MethodOf<Hello>) { ... }
 *
 * callMethod("someMethod") // Ok
 *
 * // Shows the following error: Argument of type '"some_property"' is not
 * // assignable to parameter of type 'MethodOf<Hello>'
 * callMethod("some_property")
 * ```
 */
export type MethodOf<Object> = {
  // deno-lint-ignore no-explicit-any
  [K in keyof Object]: Object[K] extends (...args: any[]) => unknown ? K
    : never;
}[keyof Object];
