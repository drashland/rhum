<p align="center">
  [Insert new logo here]
  <h1 align="center">Rhum</h1>
</p>
<p align="center">A Lightweight Testing Framework for Deno</p>
<p align="center">
  <a href="https://github.com/drashland/rhum/releases">
    <img src="https://img.shields.io/github/release/drashland/rhum.svg?color=bright_green&label=latest">
  </a>
  <a href="https://github.com/drashland/rhum/actions">
    <img src="https://img.shields.io/github/workflow/status/drashland/rhum/master?label=ci">
  </a>
  <a href="https://discord.gg/SgejNXq">
    <img src="https://img.shields.io/badge/chat-on%20discord-blue">
  </a>
  <a href="https://twitter.com/drash_land">
    <img src="https://img.shields.io/twitter/url?label=%40drash_land&style=social&url=https%3A%2F%2Ftwitter.com%2Fdrash_land">
  </a>
</p>

---

## Table of Contents
- [Quick Start](#quick-start)
- [Features](#features)
- [Documentation](#documentation)
- [Why use Rhum?](#why-use-rhum)
- [Contributing](#contributing)
- [License](#license)

## Quick Start

Create your test plan:

```typescript
// File: app_test.ts

import { Rhum } from "https://deno.land/x/rhum@v1.0.0/mod.ts";

let value = false;

function run() {
  return true;
}

async function close() {
  value = true;
  return value;
}

Rhum.testPlan("app_test.ts", () => {
  // Run the first test suite
  Rhum.testSuite("run()", () => {
    Rhum.testCase("Returns true", () => {
      const result = run();
      Rhum.asserts.assertEquals(true, result);
    });
  });
  // Run the second test suite
  Rhum.testSuite("close()", () => {
    Rhum.testCase("Returns true", async () => {
      const result = await close();
      Rhum.asserts.assertEquals(true, result);
    });
  });
});
```

Run your test plan:

```
$ deno test app_test.ts
```

Read the output:

```
Compile file:///.deno.test.ts
running 2 tests

app_test.ts
    run()
        Returns true ... ok (3ms)
    close()
        Returns true ... ok (1ms)

test result: ok. 2 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out (4ms)
```

## Features

- Descriptive naming for your tests
- Lightweight
- Zero dependencies
- Simple and easy to use
- Asynchronous support
- Still uses `Deno.test` under the hood
- Skip functionality
- Mock requests

## Documentation

### `Rhum.testPlan`

Groups up test suites to describe a test plan. Usually, a test plan is per file and contains the tests and suites for a single file.

```typescript
Rhum.testPlan("app_test.ts", () => {
    ...
    ...
    ...
});
```

### `Rhum.testSuite`

A test suite usually describes a method or property name, and groups up all test cases for that method or property. There can be as many test suites under a test plan as you want.

```typescript
Rhum.testPlan("app_test.ts", () => {
  Rhum.testSuite("run()", () => {
    ...
    ...
    ...
  });
  Rhum.testSuite("close()", () => {
    ...
    ...
    ...
  });
});
```

### `Rhum.testCase`

A test case is grouped by a test suite and it is what makes the assertions - it is the test. A suite can have as many test cases as you want. Test cases can also be asynchronous.

```typescript
Rhum.testPlan("app_test.ts", () => {
  Rhum.testSuite("run()", () => {
    Rhum.testCase("should return true", () => {
      Rhum.assert.assertEquals(run(), true);
    });
    Rhum.testCase("should return false", () => {
      Rhum.assert.assertEquals(run(), false);
    });
  });
});
```

### `Rhum.asserts`

The [asserts](https://deno.land/std/testing/asserts.ts) module, but attached to `Rhum`.

```typescript
Rhum.asserts.assertEquals(true, true) // pass
Rhum.asserts.assertEquals(true, false) // fail
```

### `Rhum.skip`

Allows a test case, suite or plan to be skipped when the tests are ran.

```typescript
Rhum.testPlan("app_test.ts", () => {
  Rhum.Skip("run()", () => { // Will not run this block
    Rhum.testCase("Returns true", () => {
      ...
    })
  })
  Rhum.testSuite("close()", () => {
    Rhum.testCase("Returns true", () => {
      ...
    })
  })
})
```

### `Rhum.mocks`

An object of to help you create mock objects for Deno.

### `Rhum.mocks.ServerRequest`

* `Rhum.mocks.ServerRequest`

    Creates a mock object of a [ServerRequest](https://deno.land/std/http/server.ts).

    ```typescript
    const mockRequest = Rhum.mocks.ServerRequest("/api/users/1", "GET", {
      headers: {
        "Content-Type": "application/json",
        "Token": "Rhum"
      },
      body: JSON.stringify({
        hello: "world"
      }),
    });
    ```

## Why Use Rhum?

Rhum allows you to write tests in a very descriptive way, this could be from a code perspective, or output perspective.

Rhum is designed to aid in testing your projects, providing many utilities as wrappers around Deno's existing `Deno.test`. Rhum is meant to improve the user experience when it comes to writing tests, such as:

- Readability for test cases
- Features that aren't available in Deno yet (hooks)

Rhum takes concepts from the following:

* <a href="https://mochajs.org/" target="_BLANK">Mocha</a> &mdash; For how you write tests in Rhum, and the use of <a href="https://mochajs.org/#hooks" target="_BLANK">hooks</a>

Rhum can be added directly into any project. All you need to do is import Rhum and you are ready to either start writing tests, and bring your existing tests under Rhum.

## Contributing

Contributors are welcomed!

Please read through our [contributing guidelines](./.github/CONTRIBUTING.md). Included are directions for opening issues, coding standards, and notes on development.

## License
By contributing your code, you agree to license your contribution under the [MIT License](./LICENSE).
