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
```typescript
// File: app_test.ts

import { Rhum } from "https://deno.land/x/rhum@v1.0.0/mod.ts";

let value = false

function run () {
    console.log("Running!");
    return true
}

async function close () {
    console.log("Closing")
    return value
}

Rhum.TestPlan("app_test.ts", () => {
    
    Rhum.TestSuite("run()", () => {

        Rhum.TestCase("Returns true", () => {
            const result = run();
            Rhum.assertEquals(true, result);
        })
    })

    // TODO CORRECT IMPLEMENTATION
    before(() => {
        value = true
    })

    Rhum.TestSuite("close()", () => {

        Rhum.TestCase("Returns true", async () => {
            const result = await close();
            Rhum.assertEquals(true, result);
        })

    })

})

```

```
$ deno test --allow-run app_test.ts
// TODO SHOW OUTPUT
```

## Features

- Hooks
  - `beforeEach`
  - `beforeAll`
  - `afterEach`
  - `afterAll`
- Descriptive naming for your tests
- Lightweight
- Zero dependencies
- Simple and easy to use
- Asynchronous support
- Still uses `Deno.test` under the hood

## Documentation
ADD DOCUMENTATION ABOUT: HOOKS, IGNORING

### `Rhum.TestPlan`

Groups up test suites to describe a test plan. Usually, a test plan is per file and contains the tests and suites for a single file

```typescript
Rhum.TestPlan("app_test.ts", () => {
  Rhum.TestSuite("run()", () => {
    ...
  })
})
```

### `Rhum.TestSuite`

A test suite usually describes a method or property name, and groups up all test cases for that method or property. There can be as many test suites under a test plan as you want.

```typescript
Rhum.TestPlan("app_test.ts", () => {
  Rhum.TestSuite("run()", () => {
    ...
  })
  Rhum.TestSuite("close()", () => {
    ...
  })
})
```

### `Rhum.TestCase`

A test case is grouped by a test suite and it is what makes the assertions - it is the test. A suite can have as many test cases as you want. Test cases can also be asynchronous.

```typescript
Rhum.TestPlan("app_test.ts", () => {
  Rhum.TestSuite("run()", () => {
    Rhum.TestCase("Returns true", () => {
      Rhum.assertEquals(run(), true);
    })
    Rhum.TestCase("Returns false", () => {
      Rhum.assertEquals(run(), false);
    })
  })
})
```

### `Rhum.assertEquals`

A same implementation [assertEquals](https://deno.land/std/testing/asserts.ts) has, but attached to `Rhum`.

```typescript
Rhum.assertEquals(true, true) // pass
Rhum.assertEquals(true, false) // fail
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
