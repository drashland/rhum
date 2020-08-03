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
- [Documentation](#documentation)
- [Features](#features)
- [Why use Rhum?](#why-use-rhum)
- [Articles](#articles)
- [Contributing](#contributing)
- [License](#license)

## Quick Start

```typescript
// File: app_test.ts

import { Rhum } from "https://deno.land/x/rhum@v1.1.2/mod.ts";

let value = false;

function run() {
  return true;
}

async function close() {
  value = true;
  return value;
}

// 1. Define your test plan (usually the test file's name)
// 2. Define your test suites (usually methods being tested)
// 3. Define your test cases with assertions
Rhum.testPlan("app_test.ts", () => {
  Rhum.testSuite("run()", () => {
    Rhum.testCase("Returns true", () => {
      const result = run();
      Rhum.asserts.assertEquals(true, result);
    });
  });
  Rhum.testSuite("close()", () => {
    Rhum.testCase("Returns true", async () => {
      const result = await close();
      Rhum.asserts.assertEquals(true, result);
    });
  });
});

Rhum.run(); // <-- make sure to include this so that your tests run via `deno test`
```

```
$ deno test --allow-env

Compile file:///.deno.test.ts
running 2 tests

app_test.ts
    run()
        Returns true ... ok (4ms)
    close()
        Returns true ... ok (1ms)
```

## Documentation

[Full Documentation](https://drash.land/rhum)

## Features

- Descriptive naming for your tests
- Lightweight
- Zero dependencies
- Simple and easy to use
- Asynchronous support
- Still uses `Deno.test` under the hood
- Skip functionality
- Hooks

## Why Use Rhum?

Rhum allows you to write tests in a very descriptive way -- from a code perspective or output perspective.

Rhum is designed to aid your testing efforts -- providing many utilities as wrappers around Deno's existing `Deno.test`. Rhum is meant to improve the user experience when it comes to writing tests, such as:

- Readability for test cases
- Features that aren't available in Deno yet (hooks)

Rhum takes concepts from the following:

* <a href="https://mochajs.org/" target="_BLANK">Mocha</a> &mdash; For how you write tests in Rhum, and the use of <a href="https://mochajs.org/#hooks" target="_BLANK">hooks</a>
* <a href="https://volument.com/baretest" target="_BLANK">Baretest</a> &mdash; Being minimalistic

Rhum can be added directly into any project. All you need to do is import Rhum and you are ready to start writing tests or bring your existing tests under Rhum.

## Articles

* [Why We Created Rhum For Testing Deno Projects](https://dev.to/crookse_/why-we-created-rhum-for-testing-deno-projects-33mf)

## Contributing

Contributors are welcomed!

Please read through our [contributing guidelines](./.github/CONTRIBUTING.md). Included are directions for opening issues, coding standards, and notes on development.

## License
By contributing your code, you agree to license your contribution under the [MIT License](./LICENSE).
