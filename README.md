<p align="center">
  <img src="./logo.svg" height="250" alt="Rhum - A lightweight testing framework for Deno.">
  <h1 align="center">Rhum</h1>
</p>
<p align="center">A lightweight testing framework for Deno.</p>
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

Rhum.run();
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
- Hooks

## Documentation

* Rhum.afterAll
* Rhum.afterEach
* Rhum.asserts
* Rhum.beforeAll
* Rhum.beforeEach
* Rhum.mocks
* Rhum.run
* Rhum.skip
* Rhum.testCase
* Rhum.testPlan
* Rhum.testSuite


### `Rhum.run`

Runs your test plan.

```typescript
Rhum.testPlan(..., () => {

})
Rhum.run();
```

### `Rhum.testPlan`

Groups up test suites to describe a test plan. Usually, a test plan is per file and contains the tests suites and test cases for a single file.

```typescript
Rhum.testPlan("app_test.ts", () => {
    ...
    ...
    ...
});
```

### `Rhum.testSuite`

A test suite usually describes a method or property name and groups up all test cases for that method or property. You can define multiple test suites under a test plan.

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

A test case is grouped by a test suite and it is what makes the assertions - it is the test. You can define multiple test cases under a test suite. Test cases can also be asynchronous.

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

Allows a test plan, suite, or case to be skipped when the tests run.

```typescript
Rhum.testPlan("app_test.ts", () => {
  Rhum.skip("run()", () => { // will not run this block
    Rhum.testCase("Returns true", () => {
      ...
    });
  });
  Rhum.testSuite("close()", () => {
    Rhum.testCase("Returns true", () => {
      ...
    });
    Rhum.skip("Returns true", () => { // will not run this block
      ...
    });
  });
});
```

### `Rhum.mocks`

An object of functions to help you mock objects.

* `Rhum.mocks.ServerRequest`

    Creates a mock object of a [ServerRequest](https://deno.land/std/http/server.ts).

    ```typescript
    const encodedBody = new TextEncoder().encode(JSON.stringify({
      body_param: "hello",
    }));

    const body = new Deno.Buffer(encodedBody as ArrayBuffer);

    const mockRequest = Rhum.mocks.ServerRequest("/api/users/1", "GET", {
      headers: {
        "Content-Type": "application/json",
        "Token": "Rhum"
      },
      body: body,
    });
    ```
  
### Hooks

A variety of hooks that can be run before or after test suites and cases.

* `Rhum.beforeEach`

    If within a plan that contains test suites, the hook will be ran before each test suite.
    If within a suite that contains test cases, the hook will be ran before each test case
    
    ```typescript
    Rhum.testPlan("My Plan", () => {
      // Run the hook before each test suite
      Rhum.beforeEach(() => {
        ...
      })
      Rhum.testSuite("My Suite 1", () => {
        // Run the hook before each test case
        Rhum.beforeEach(() => {
          ...
        })
        Rhum.testCase("My Test Case 1", () => {
          ...
        })
      })
    })
    ```
  
* `Rhum.beforeAll`

    If within a plan that contains test suites, the hook will be ran before all test suites, and only once.
    If within a suite that contains test cases, the hook will be ran before all test cases, and only once
    
    ```typescript
    Rhum.testPlan("My Plan", () => {
      // Run the hook before all test suites
      Rhum.beforeAll(() => {
        ...
      })
      Rhum.testSuite("My Suite 1", () => {
        // Run the hook before all test cases
        Rhum.beforeAll(() => {
          ...
        })
        Rhum.testCase("My Test Case 1", () => {
          ...
        })
      })
    })
    ```
  
* `Rhum.afterEach`

    If within a plan that contains test suites, the hook will be ran after each test suite.
    If within a suite that contains test cases, the hook will be ran after each test case
    
    ```typescript
    Rhum.testPlan("My Plan", () => {
      // Run the hook after each test suite
      Rhum.afterEach(() => {
        ...
      })
      Rhum.testSuite("My Suite 1", () => {
        // Run the hook after each test case
        Rhum.afterEach(() => {
          ...
        })
        Rhum.testCase("My Test Case 1", () => {
          ...
        })
      })
    })
    ```
  
* `Rhum.afterAll`

    If within a plan that contains test suites, the hook will be ran after all test suites, and only once.
    If within a suite that contains test cases, the hook will be ran after all test cases, and only once
    
    ```typescript
    Rhum.testPlan("My Plan", () => {
      // Run the hook after all test suites
      Rhum.afterAll(() => {
        ...
      })
      Rhum.testSuite("My Suite 1", () => {
        // Run the hook after all test cases
        Rhum.afterAll(() => {
          ...
        })
        Rhum.testCase("My Test Case 1", () => {
          ...
        })
      })
    })
    ```

## Why Use Rhum?

Rhum allows you to write tests in a very descriptive way -- from a code perspective or output perspective.

Rhum is designed to aid your testing efforts -- providing many utilities as wrappers around Deno's existing `Deno.test`. Rhum is meant to improve the user experience when it comes to writing tests, such as:

- Readability for test cases
- Features that aren't available in Deno yet (hooks)

Rhum takes concepts from the following:

* <a href="https://mochajs.org/" target="_BLANK">Mocha</a> &mdash; For how you write tests in Rhum, and the use of <a href="https://mochajs.org/#hooks" target="_BLANK">hooks</a>
* <a href="https://volument.com/baretest" target="_BLANK">Baretest</a> &mdash; Being minimalistic

Rhum can be added directly into any project. All you need to do is import Rhum and you are ready to start writing tests or bring your existing tests under Rhum.

## Contributing

Contributors are welcomed!

Please read through our [contributing guidelines](./.github/CONTRIBUTING.md). Included are directions for opening issues, coding standards, and notes on development.

## License
By contributing your code, you agree to license your contribution under the [MIT License](./LICENSE).
