import { StdAsserts } from "../deps.ts";

export const asserts = {
  AssertionError: StdAsserts.AssertionError,
  _format: StdAsserts._format,
  assert: StdAsserts.assert,
  assertArrayContains: StdAsserts.assertArrayContains,
  assertEquals: StdAsserts.assertEquals,
  assertNotEquals: StdAsserts.assertNotEquals,
  assertNotMatch: StdAsserts.assertNotMatch,
  assertNotStrictEquals: StdAsserts.assertNotStrictEquals,
  assertStrictEquals: StdAsserts.assertStrictEquals,
  assertStringContains: StdAsserts.assertStringContains,
  assertThrows: StdAsserts.assertThrows,
  assertThrowsAsync: StdAsserts.assertThrowsAsync,
  equal: StdAsserts.equal,
  fail: StdAsserts.fail,
  unimplemented: StdAsserts.unimplemented,
  unreachable: StdAsserts.unreachable
};

//export type assertions = keyof typeof StdAsserts;
