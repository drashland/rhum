const { Mock } = require("../../../../lib/cjs/mod");

class Request {
  constructor(
    url,
    options = {},
  ) {
    this.url = url;
    this.options = options;
    this.headers = this.createHeaders(options.headers);
    this.method = options.method ? options.method : "get";
  }

  createHeaders(headers) {
    const map = new Map();
    for (const header in headers) {
      const value = headers[header];
      map.set(header, value);
    }
    return map;
  }
}

class TestObjectOne {
}

class TestObjectTwo {
  constructor(name) {
    this.name = name;
  }
}

class TestObjectTwoMore {
  constructor(name, array) {
    this.name = name;
    this.array = array;
  }
}

class TestObjectThree {
  hello() {
    return;
  }

  test() {
    this.hello();
    this.hello();
    return "World";
  }
}

class TestObjectFourBuilder {
  someComplexMethod() {
    this.setSomethingOne();
    this.setSomethingTwo();
    return this;
  }

  setSomethingOne() {
    this.something_one = "one";
  }

  setSomethingTwo() {
    this.something_two = "two";
  }
}

class RandomError extends Error {}
class RandomError2 extends Error {
  name = "RandomError2Name";
  message = "Some message not by the constructor.";
}

class MathService {
  add(
    num1,
    num2,
    useNestedAdd = false,
  ) {
    if (useNestedAdd) {
      return this.nestedAdd(num1, num2);
    }
    return num1 + num2;
  }

  nestedAdd(num1, num2) {
    return num1 + num2;
  }
}

class TestObjectLotsOfDataMembers {
  age = 0;
  math_service = undefined;
  protected_property = "I AM PROTECTED PROPERTY.";
  constructor(name, mathService) {
    this.math_service = mathService;
    this.name = name;
  }
  sum(
    num1,
    num2,
    useNestedAdd = false,
  ) {
    const sum = this.math_service.add(num1, num2, useNestedAdd);
    return sum;
  }
  protectedMethod() {
    return "I AM A PROTECTED METHOD.";
  }
}

class TestRequestHandler {
  handle(request) {
    const method = request.method.toLowerCase();
    const contentType = request.headers.get("content-type");

    if (method !== "post") {
      return "Method is not post";
    }

    if (contentType !== "application/json") {
      return "Content-Type is incorrect";
    }

    return "posted";
  }
}

describe("Mock()", () => {
  it(
    "creates mock builder",
    () => {
      const mock = Mock(TestObjectOne);
      expect(mock.constructor.name).toBe("MockBuilder");
    },
  );

  describe(".create()", () => {
    it(
      "creates mock object",
      () => {
        const mock = Mock(TestObjectTwo).create();
        expect(mock.name).toBe(undefined);
        expect(mock.is_mock).toBe(true);
      },
    );
  });

  describe(".withConstructorArgs(...)", () => {
    it(
      "can take 1 arg",
      () => {
        const mock = Mock(TestObjectTwo)
          .withConstructorArgs("some name")
          .create();
        expect(mock.name).toBe("some name");
        expect(mock.is_mock).toBe(true);
      },
    );

    it(
      "can take more than 1 arg",
      () => {
        const mock = Mock(TestObjectTwoMore)
          .withConstructorArgs("some name", ["hello"])
          .create();
        expect(mock.name).toBe("some name");
        expect(mock.array).toStrictEqual(["hello"]);
        expect(mock.is_mock).toBe(true);

        const mockMathService = Mock(MathService)
          .create();
        const mockTestObject = Mock(TestObjectLotsOfDataMembers)
          .withConstructorArgs("has mocked math service", mockMathService)
          .create();
        expect(mockMathService.calls.add).toBe(0);
        mockTestObject.sum(1, 1);
        expect(mockMathService.calls.add).toBe(1);
      },
    );
  });

  describe("method(...)", () => {
    it(
      "requires .willReturn(...) or .willThrow(...) to be chained",
      () => {
        const mock = Mock(TestObjectThree).create();
        expect(mock.is_mock).toBe(true);

        // Original returns "World"
        expect(mock.test()).toBe("World");

        // Don't fully pre-program the method. This should cause an error during assertions.
        mock.method("test");

        try {
          mock.test();
        } catch (error) {
          expect(error.message).toBe(
            `Pre-programmed method "test" does not have a return value.`,
          );
        }
        expect(mock.calls.test).toBe(2);
        expect(mock.calls.hello).toBe(2);
      },
    );

    it(".willReturn(...) does not call original method and returns given value", () => {
      const mock = Mock(TestObjectThree).create();
      expect(mock.is_mock).toBe(true);

      // Original returns "World"
      expect(mock.test()).toBe("World");

      // Change original to return "Hello"
      mock.method("test").willReturn("Hello");

      // Should output "Hello" and make the following calls
      expect(mock.test()).toBe("Hello");
      expect(mock.calls.test).toBe(2);
      expect(mock.calls.hello).toBe(2);
    });

    it(
      ".willReturn(...) can be performed more than once",
      () => {
        const mock = Mock(TestObjectThree).create();
        expect(mock.is_mock).toBe(true);

        // Original returns "World"
        expect(mock.test()).toBe("World");

        // Change original to return "Hello"
        mock.method("test").willReturn("Hello");
        mock.method("test").willReturn("Hello!");

        expect(mock.test()).toBe("Hello!");
        expect(mock.calls.test).toBe(2);
        expect(mock.calls.hello).toBe(2);
      },
    );

    it(
      ".willReturn(...) returns specified value",
      () => {
        const mock = Mock(TestObjectThree).create();
        expect(mock.is_mock).toBe(true);

        // Original returns "World"
        expect(mock.test()).toBe("World");

        // Don't fully pre-program the method. This should cause an error during
        // assertions.
        mock
          .method("test")
          .willReturn({
            "something": undefined,
          });

        expect(mock.test()).toStrictEqual({ "something": undefined });
        expect(mock.calls.test).toBe(2);
        expect(mock.calls.hello).toBe(2);
      },
    );

    it(".willReturn(mock) returns the mock object (basic)", () => {
      const mock = Mock(TestObjectFourBuilder).create();
      expect(mock.is_mock).toBe(true);

      mock
        .method("someComplexMethod")
        .willReturn(mock);

      expect(mock.someComplexMethod()).toBe(mock);
      expect(mock.calls.someComplexMethod).toBe(1);
    });

    it(".willReturn(mock) returns the mock object (extra)", () => {
      // Assert that the original implementation sets properties
      const mock1 = Mock(TestObjectFourBuilder).create();
      expect(mock1.is_mock).toBe(true);
      mock1.someComplexMethod();
      expect(mock1.something_one).toBe("one");
      expect(mock1.something_two).toBe("two");
      expect(mock1.calls.someComplexMethod).toBe(1);

      // Assert that the mock implementation will not set properties
      const mock2 = Mock(TestObjectFourBuilder).create();
      expect(mock2.is_mock).toBe(true);
      mock2
        .method("someComplexMethod")
        .willReturn(mock2);

      expect(mock2.someComplexMethod()).toBe(mock2);
      expect(mock2.something_one).toBe(undefined);
      expect(mock2.something_two).toBe(undefined);
      expect(mock2.calls.someComplexMethod).toBe(1);

      // Assert that we can also use setters
      const mock3 = Mock(TestObjectFourBuilder).create();
      expect(mock3.is_mock).toBe(true);
      mock3.someComplexMethod();
      expect(mock3.something_one).toBe("one");
      expect(mock3.something_two).toBe("two");
      mock3.something_one = "you got changed";
      expect(mock3.something_one).toBe("you got changed");
      expect(mock3.calls.someComplexMethod).toBe(1);
    });

    it(
      ".willThrow() causes throwing RandomError (with constructor)",
      () => {
        const mock = Mock(TestObjectThree).create();
        expect(mock.is_mock).toBe(true);

        // Original returns "World"
        expect(mock.test()).toBe("World");

        // Make the original method throw RandomError
        mock
          .method("test")
          .willThrow(new RandomError("Random error message."));

        expect(
          () => mock.test(),
        ).toThrow(new RandomError("Random error message."));
        expect(mock.calls.test).toBe(2);
      },
    );

    it(
      ".willThrow() causes throwing RandomError2 (no constructor)",
      () => {
        const mock = Mock(TestObjectThree).create();
        expect(mock.is_mock).toBe(true);

        // Original returns "World"
        expect(mock.test()).toBe("World");

        // Make the original method throw RandomError
        mock
          .method("test")
          .willThrow(new RandomError2());

        expect(() => mock.test()).toThrow(
          new RandomError2("Some message not by the constructor."),
        );
        expect(mock.calls.test).toBe(2);
      },
    );

    it(
      ".expects(...).toBeCalled(...)",
      () => {
        const mock = Mock(TestObjectThree).create();
        expect(mock.is_mock).toBe(true);

        mock.expects("hello").toBeCalled(2);
        mock.test();
        mock.verifyExpectations();
      },
    );
  });

  // TODO(crookse) Put the below tests into one of the groups above this line

  describe("call count for outside nested function is increased", () => {
    const mockMathService = Mock(MathService)
      .create();
    const mockTestObject = Mock(TestObjectLotsOfDataMembers)
      .withConstructorArgs("has mocked math service", mockMathService)
      .create();
    expect(mockMathService.calls.add).toBe(0);
    expect(mockMathService.calls.nestedAdd).toBe(0);
    mockTestObject.sum(1, 1, true);
    expect(mockMathService.calls.add).toBe(1);
    expect(mockMathService.calls.nestedAdd).toBe(1);
  });

  describe("can mock getters and setters", () => {
    const mock = Mock(TestObjectLotsOfDataMembers)
      .create();
    mock.age = 999;
    expect(mock.age).toBe(999);
  });

  describe("native request mock", () => {
    const router = Mock(TestRequestHandler).create();

    const reqPost = new Request("https://google.com", {
      method: "post",
      headers: {
        "content-type": "application/json",
      },
    });
    expect(router.calls.handle).toBe(0);
    expect(router.handle(reqPost)).toBe("posted");
    expect(router.calls.handle).toBe(1);

    const reqPostNotJson = new Request("https://google.com", {
      method: "post",
    });
    expect(router.calls.handle).toBe(1);
    expect(router.handle(reqPostNotJson)).toBe("Content-Type is incorrect");
    expect(router.calls.handle).toBe(2);

    const reqGet = new Request("https://google.com", {
      method: "get",
    });

    expect(router.calls.handle).toBe(2);
    expect(router.handle(reqGet)).toBe("Method is not post");
    expect(router.calls.handle).toBe(3);
  });

  describe("sets the default value for getters", () => {
    class Game {
    }

    class PlayersEngine {
      game = new Game();
      get Game() {
        return this.game;
      }
      set Game(val) {
        this.game = val;
      }
    }

    const mock = Mock(PlayersEngine).create();
    expect(mock.Game instanceof Game).toBe(true);
  });
});
