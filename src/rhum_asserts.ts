import { asserts as StdAsserts } from "../deps.ts";

/* TODO(any) uncomment this block and extend RhumAsserts module with custom asserts when needed.

// deno-lint-ignore no-namespace prefer-namespace-keyword, eslint-ignore-next-line no-namespace prefer-namespace-keyword
module RhumAsserts {
    export function extraRhumSpecificAsserts() { console.log('impl'); }
}

export const asserts = {...StdAsserts, ...RhumAsserts };
export type asserts = typeof StdAsserts & typeof RhumAsserts;

*/
export interface Asserts {
  equal: Function;
  assert: Function;
  assertEquals: Function;
  assertNotEquals: Function;
  assertStrictEquals: Function;
  assertStringContains: Function;
  assertMatch: Function;
  assertArrayContains: Function;
  assertThrows: Function;
  assertThrowsAsync: Function;
  unimplemented: Function;
  unreachable: Function;
}
export const asserts: Asserts = {
  equal: StdAsserts.equal,
  assert: StdAsserts.assert,
  assertEquals: StdAsserts.assertEquals,
  assertNotEquals: StdAsserts.assertNotEquals,
  assertStrictEquals: StdAsserts.assertStrictEquals,
  assertStringContains: StdAsserts.assertStringContains,
  assertMatch: StdAsserts.assertMatch,
  assertArrayContains: StdAsserts.assertArrayContains,
  assertThrows: StdAsserts.assertThrows,
  assertThrowsAsync: StdAsserts.assertThrowsAsync,
  unimplemented: StdAsserts.unimplemented,
  unreachable: StdAsserts.unreachable,
};
//export type asserts = typeof StdAsserts;
