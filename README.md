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

1. Install the Rhum CLI.

```shell
deno install --allow-write --allow-read -f --reload https://deno.land/x/rhum@v1.1.4/mod.ts
```

2. Create your test file.

```typescript
// File: tests/app_test.ts

import { Rhum } from "https://deno.land/x/rhum@v1.1.4/mod.ts";

let value = false;

function run() {
  return true;
}

async function close() {
  value = true;
  return value;
}

Rhum.testPlan(() => {
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

```

3. Run your tests.

```
$ rhum test tests/

INFO Starting Rhum
INFO Checking test file(s)
INFO Running tests

tests/app_test.ts
    run()
        PASS Returns true
    close()
        PASS Returns true

Test Results: 8 passed; 1 failed; 0 skipped
```

## Documentation

* [Full Documentation](https://drash.land/rhum)

* [CLI](https://drash.land/rhum/#/cli)

* [Lifecycle Diagram](https://drash.land/rhum/#/lifecycle-diagram)

* [Older Versions](https://drash.land/rhum/#/archive)

    * [v1.x](https://drash.land/rhum/#/archive/v1x)

## Features

- Descriptive naming for your tests
- Lightweight
- Zero dependencies
- Simple and easy to use
- Asynchronous support
- Skip functionality
- Hooks

## Why Use Rhum?

Rhum allows you to write tests in a very descriptive way -- from a code perspective or output perspective.

Rhum is designed to aid your testing efforts by providing you with many utilities that facilitate streamlined testing. Rhum is meant to improve the development experience when it comes to testing, such as:

- Improved test output
- Hooks
- Stubs and mocks

Rhum takes concepts from the following:

* <a href="https://mochajs.org/" target="_BLANK">Mocha</a> &mdash; For how you write tests in Rhum, and the use of <a href="https://mochajs.org/#hooks" target="_BLANK">hooks</a>
* <a href="https://volument.com/baretest" target="_BLANK">Baretest</a> &mdash; Being minimalistic

Rhum can be added directly into any project. All you need to do is import Rhum and you are ready to start writing tests -- whether it be migrating to Rhum or just using it for its assertion calls.

## Articles

* [Why We Created Rhum For Testing Deno Projects](https://dev.to/crookse_/why-we-created-rhum-for-testing-deno-projects-33mf)

## Contributing

Contributors are welcomed!

Please read through our [contributing guidelines](./.github/CONTRIBUTING.md). Included are directions for opening issues, coding standards, and notes on development.

## License

By contributing your code, you agree to license your contribution under the [MIT License](./LICENSE).
