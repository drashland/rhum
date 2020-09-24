import { StdAsserts } from "../deps.ts";

// Saving this so i don't have to type it out for the 10th time
// export const asserts = {
//   AssertionError: StdAsserts.AssertionError,
//   _format: StdAsserts._format,
//   assert: StdAsserts.assert,
//   assertArrayContains: StdAsserts.assertArrayContains,
//   assertEquals: StdAsserts.assertEquals,
//   assertNotEquals: StdAsserts.assertNotEquals,
//   assertNotMatch: StdAsserts.assertNotMatch,
//   assertNotStrictEquals: StdAsserts.assertNotStrictEquals,
//   assertStrictEquals: StdAsserts.assertStrictEquals,
//   assertStringContains: StdAsserts.assertStringContains,
//   assertMatch: StdAsserts.assertMatch,
//   assertThrows: StdAsserts.assertThrows,
//   assertThrowsAsync: StdAsserts.assertThrowsAsync,
//   equal: StdAsserts.equal,
//   fail: StdAsserts.fail,
//   unimplemented: StdAsserts.unimplemented,
//   unreachable: StdAsserts.unreachable
// };

export const asserts = { ...StdAsserts };

export type assertions = keyof typeof StdAsserts;
