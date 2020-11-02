import { StdAsserts } from "../deps.ts";

// Saving this so i don't have to type it out for the 10th time
// export const asserts = {
//   AssertionError: StdAsserts.AssertionError,
//   _format: StdAsserts._format,
//   assert: StdAsserts.assert,
//   assertArrayIncludes: StdAsserts.assertArrayIncludes,
//   assertEquals: StdAsserts.assertEquals,
//   assertNotEquals: StdAsserts.assertNotEquals,
//   assertNotMatch: StdAsserts.assertNotMatch,
//   assertNotStrictEquals: StdAsserts.assertNotStrictEquals,
//   assertStrictEquals: StdAsserts.assertStrictEquals,
//   assertStringIncludes: StdAsserts.assertStringIncludes,
//   assertMatch: StdAsserts.assertMatch,
//   assertThrows: StdAsserts.assertThrows,
//   assertThrowsAsync: StdAsserts.assertThrowsAsync,
//   equal: StdAsserts.equal,
//   fail: StdAsserts.fail,
//   unimplemented: StdAsserts.unimplemented,
//   unreachable: StdAsserts.unreachable
// };

export const asserts = {
  ...StdAsserts,
  assertArrayContains: StdAsserts.assertArrayIncludes,
  assertStringContains: StdAsserts.assertStringIncludes,
};

export type assertions = keyof typeof asserts;
