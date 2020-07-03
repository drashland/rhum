import { asserts as StdAsserts } from "../deps.ts";

/* TODO(any) uncomment this block and extend RhumAsserts module with custom asserts when needed.

// deno-lint-ignore no-namespace prefer-namespace-keyword, eslint-ignore-next-line no-namespace prefer-namespace-keyword
module RhumAsserts {
    export function extraRhumSpecificAsserts() { console.log('impl'); }
}

export const asserts = {...StdAsserts, ...RhumAsserts };
export type asserts = typeof StdAsserts & typeof RhumAsserts;

*/

export const asserts = { ...StdAsserts };
export type asserts = typeof StdAsserts;
