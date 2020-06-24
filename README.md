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

Rhum can also be used with [SuperDeno](https://github.com/asos-craigmorten/superdeno). You can also read [Craig Morten's](https://github.com/asos-craigmorten) tutorial on strengthening your testing process using both Rhum and SuperDeno, [here](https://dev.to/craigmorten/how-to-write-spec-tests-in-deno-55e8).

* Properties
    * [Rhum.asserts](#rhumasserts)
    * [Rhum.mocks](#rhummocks)
        * [Rhum.mocks.ServerRequest](#rhummocksserverrequest)
* Methods
    * [Rhum.afterAll](#rhumafterall)
    * [Rhum.afterEach](#rhumaftereach)
    * [Rhum.beforeAll](#rhumbeforeall)
    * [Rhum.beforeEach](#rhumbeforeeach)
    * [Rhum.mock](#rhummock)
    * [Rhum.run](#rhumrun)
    * [Rhum.skip](#rhumskip)
    * [Rhum.stub](#rhumstub)
    * [Rhum.testCase](#rhumtestcase)
    * [Rhum.testPlan](#rhumtestplan)
    * [Rhum.testSuite](#rhumtestsuite)
    
Alongside using `Rhum`, the `RhumRunner` is also exposed allowing you to extend it, which `Rhum` is an instance of. It has been exposed to allow you to extend it, should you have any reason or use case to do so. An example can be seen below:

```typescript
import { RhumRunner } from "https://deno.land/x/rhum@v1.0.0/mod.ts";

class MyRunner extends RhumRunner {
  ...
}
const Runner = new MyRunner();
Runner.testPlan(...); // Same as "Rhum.testPlan(...)"
```
    
### Properties
    
#### `Rhum.asserts`

The [asserts](https://deno.land/std/testing/asserts.ts) module from the [testing](https://deno.land/std/testing) module, but attached to `Rhum`.

```typescript
Rhum.asserts.assertEquals(true, true); // pass
Rhum.asserts.assertEquals(true, false); // fail
```

#### `Rhum.mocks`

An object of functions to help you mock objects.

##### `Rhum.mocks.ServerRequest`

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

### Methods

#### `Rhum.afterAll`

Used to define a hook that will execute after all test suites or test cases. If this is used inside of a test plan, then it will execute after all test suites. If this is used inside of a test suite, then it will execute after all test cases.

```typescript
Rhum.testPlan("My Plan", () => {
  Rhum.afterAll(() => {
    // Runs once after all test suites in this test plan
  });
  Rhum.testSuite("My Suite 1", () => {
    Rhum.afterAll(() => {
      // Runs once after all test cases in this test suite
    });
    Rhum.testCase("My Test Case 1", () => {
      ...
    });
  });
});
```

#### `Rhum.afterEach`

Used to define a hook that will execute after each test suite or test case. If this is used inside of a test plan, then it will execute after each test suite. If this is used inside of a test suite, then it will execute after each test case.

```typescript
Rhum.testPlan("My Plan", () => {
  Rhum.afterEach(() => {
    // Runs after each test suite in this test plan
  });
  Rhum.testSuite("My Suite 1", () => {
    Rhum.afterEach(() => {
      // Runs after each test case in this test suite
    });
    Rhum.testCase("My Test Case 1", () => {
      ...
    });
  });
});
```

#### `Rhum.beforeAll`

Used to define a hook that will execute before all test suites or test cases. If this is used inside of a test plan, then it will execute before all test suites. If this is used inside of a test suite, then it will execute before all test cases.

```typescript
Rhum.testPlan("My Plan", () => {
  Rhum.beforeAll(() => {
    // Runs once before all test suites in this test plan
  });
  Rhum.testSuite("My Suite 1", () => {
    Rhum.beforeAll(() => {
      // Runs once before all test cases in this test suite
    });
    Rhum.testCase("My Test Case 1", () => {
      ...
    });
  });
});
```

#### `Rhum.beforeEach`

Used to define a hook that will execute before each test suite or test case. If this is used inside of a test plan, then it will execute before each test suite. If this is used inside of a test suite, then it will execute before each test case.

```typescript
Rhum.testPlan("My Plan", () => {
  Rhum.beforeEach(() => {
    // Runs before each test suite in this test plan
  });
  Rhum.testSuite("My Suite 1", () => {
    Rhum.beforeEach(() => {
      // Runs before each test case in this test suite
    });
    Rhum.testCase("My Test Case 1", () => {
      ...
    });
  });
});
```
### `Rhum.mock`

Allows mocking of classes. You can also find out how many times a mock object's members are called. Once a class is mocked, all of its data members are made public. That means any protected property or method can be called without having to do any additional work.

We know this may be different than what you are used to, but in Rhum, a mock:

* Registers calls they receive
* Helps verify behavior (e.g., verify that the e-mail service is called a number of times)

```typescript
class Server {
  protected protected_property: string = "a protected property";
  protected protectedMethod(): string {
    return "a protected method";
  }
}

Rhum.testPlan("My Plan", () => {
  Rhum.testSuite("My Suite", () => {
    Rhum.testCase("My Test Case", () => {
      const mock = Rhum
        .mock(Server)
        .withConstructorArgs("arg1", "arg2", "arg3") // this call optional
        .create();
      Rhum.asserts.assertEquals(mock.protected_property, "a protected property");
      Rhum.asserts.assertEquals(mock.protectedMethod(), "a protected method");
      Rhum.asserts.assertEquals(mock.calls.protectedMethod, 1); // track how many times the method is called using {object}.calls.{method}
    });
  });
});
```

### `Rhum.run`

Runs your test plan.

```typescript
Rhum.testPlan("My Plan", () => {
  ...
});
Rhum.run();
```

### `Rhum.skip`

Allows a test plan, suite, or case to be skipped when the tests run.

```typescript
Rhum.testPlan("My Plan", () => {
  Rhum.skip("My Suite 1", () => { // will not run this block
    Rhum.testCase("My Test Case In Suite 1", () => {
      ...
    });
  });
  Rhum.testSuite("My Suite 2", () => {
    Rhum.testCase("My Test Case In Suite 2", () => {
      ...
    });
    Rhum.skip("My Other Test Case In Suite 2", () => { // will not run this block
      ...
    });
  });
});
```

### `Rhum.stub`

Allows stubbing of data members. You can also track how many times a stubbed member is called.

We know this may be different than what you are used to, but in Rhum, a stub:

* Provides canned answers to calls made during tests
* Helps verify state
* Does not respond to calls outside the scope of the test

```typescript
class Server {
  public run() {
    console.log("Server running.");
  }
  public stop() {
    console.log("Server stopped.");
  }
}

Rhum.testPlan("My Plan", () => {
  Rhum.testSuite("My Suite", () => {
    Rhum.testCase("My Test Case", () => {
      const server: any = new Server(); // note that any is used here
      // Stub a single method or stub multiple methods by chaining .stub() calls
      Rhum
        .stub(server, "run", () => {
          return "running";
        })
        .stub(server, "stop", () => {
          return "stopped";
        });
      Rhum.asserts.assertEquals(server.run(), "running"); // does not run the console.log()
      Rhum.asserts.assertEquals(server.calls.run, 1); // track how many times the method is called using {object}.calls.{method}
      Rhum.asserts.assertEquals(server.stop(), "stopped"); // does not run the console.log()
      Rhum.asserts.assertEquals(server.calls.stop, 1); // track how many times the method is called using {object}.calls.{method}
    });
  });
});
```

### `Rhum.testCase`

A test case is grouped by a test suite and it is what makes the assertions - it is the test. You can define multiple test cases under a test suite. Test cases can also be asynchronous. Test cases can only be defined inside of a test suite.

```typescript
Rhum.testPlan("My Plan", () => {
  Rhum.testSuite("My Suite 1", () => {
    Rhum.testCase("My Test Case 1", () => {
      Rhum.assert.assertEquals(something, true);
    });
    Rhum.testCase("My Test Case 2", () => {
      Rhum.assert.assertEquals(something, false);
    });
  });
});
```

### `Rhum.testPlan`

Groups up test suites to describe a test plan. Usually, a test plan is per file and contains the tests suites and test cases for a single file. Test plans are required in order to define a test suite with test cases.

```typescript
Rhum.testPlan("My Plan", () => {
    ...
});
```

### `Rhum.testSuite`

A test suite usually describes a method or property name and groups up all test cases for that method or property. You can define multiple test suites under a test plan. Test suites can only be defined inside of a test plan.

```typescript
Rhum.testPlan("My Plan", () => {
  Rhum.testSuite("My Suite 1", () => {
    ...
  });
  Rhum.testSuite("My Suite 2", () => {
    ...
  });
});
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
