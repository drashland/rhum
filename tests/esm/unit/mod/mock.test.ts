import { Mock } from "../../../../lib/esm/mod";
import { assertEquals, assertThrows } from "../../jest_assertions";

interface IRequestOptions {
  headers?: Record<string, string>;
  method?: string;
}

class Request {
  public options: IRequestOptions;
  public url: string;
  public headers: Map<string, string>;
  public method: string;

  constructor(
    url: string,
    options: IRequestOptions
  ) {
    this.url = url;
    this.options = options;
    this.headers = this.createHeaders(options.headers ?? {});
    this.method = options.method ? options.method : "get";
  }

  createHeaders(headers: Record<string, string>) {
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
  public name: string;
  constructor(name: string) {
    this.name = name;
  }
}

class TestObjectTwoMore {
  public name: string;
  public array: string[];
  constructor(name: string, array: string[]) {
    this.name = name;
    this.array = array;
  }
}

class TestObjectThree {
  public hello(): void {
    return;
  }

  public test(): string {
    this.hello();
    this.hello();
    return "World";
  }
}

class TestObjectFourBuilder {
  #something_one?: string;
  #something_two?: string;

  get something_one(): string | undefined {
    return this.#something_one;
  }

  set something_one(value: string | undefined) {
    this.#something_one = value;
  }

  get something_two(): string | undefined {
    return this.#something_two;
  }

  someComplexMethod(): this {
    this.#setSomethingOne();
    this.#setSomethingTwo();
    return this;
  }

  #setSomethingOne(): void {
    this.#something_one = "one";
  }

  #setSomethingTwo(): void {
    this.#something_two = "two";
  }
}

class RandomError extends Error {}
class RandomError2 extends Error {
  public name = "RandomError2Name";
  public message = "Some message not by the constructor.";
}

class MathService {
  public add(
    num1: number,
    num2: number,
    useNestedAdd = false,
  ): number {
    if (useNestedAdd) {
      return this.nestedAdd(num1, num2);
    }
    return num1 + num2;
  }

  public nestedAdd(num1: number, num2: number): number {
    return num1 + num2;
  }
}

class TestObjectLotsOfDataMembers {
  public name: string;
  #age = 0;
  protected math_service: MathService;
  protected protected_property = "I AM PROTECTED PROPERTY.";
  constructor(name: string, mathService: MathService) {
    this.math_service = mathService;
    this.name = name;
  }
  public sum(
    num1: number,
    num2: number,
    useNestedAdd = false,
  ): number {
    const sum = this.math_service.add(num1, num2, useNestedAdd);
    return sum;
  }
  protected protectedMethod() {
    return "I AM A PROTECTED METHOD.";
  }

  public get age() {
    return this.#age;
  }

  public set age(val: number) {
    this.#age = val;
  }
}

class TestRequestHandler {
  // deno-lint-ignore require-await
  async handle(request: Request): Promise<string | Error> {
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
    (): void => {
      const mock = Mock(TestObjectOne);
      assertEquals(mock.constructor.name, "MockBuilder");
  });

  describe(".create()", () => {
    it(
      "creates mock object",
      (): void => {
        const mock = Mock(TestObjectTwo).create();
        assertEquals(mock.name, undefined);
        assertEquals(mock.is_mock, true);
    });
  });

  describe(".withConstructorArgs(...)", () => {
    it(
      "can take 1 arg",
      (): void => {
        const mock = Mock(TestObjectTwo)
          .withConstructorArgs("some name")
          .create();
        assertEquals(mock.name, "some name");
        assertEquals(mock.is_mock, true);
    });

    it(
      "can take more than 1 arg",
      (): void => {
        const mock = Mock(TestObjectTwoMore)
          .withConstructorArgs("some name", ["hello"])
          .create();
        assertEquals(mock.name, "some name");
        assertEquals(mock.array, ["hello"]);
        assertEquals(mock.is_mock, true);

        const mockMathService = Mock(MathService)
          .create();
        const mockTestObject = Mock(TestObjectLotsOfDataMembers)
          .withConstructorArgs("has mocked math service", mockMathService)
          .create();
        assertEquals(mockMathService.calls.add, 0);
        mockTestObject.sum(1, 1);
        assertEquals(mockMathService.calls.add, 1);
    });
  });

  describe("method(...)", () => {
    it(
      "requires .willReturn(...) or .willThrow(...) to be chained",
      (): void => {
        const mock = Mock(TestObjectThree).create();
        assertEquals(mock.is_mock, true);

        // Original returns "World"
        assertEquals(mock.test(), "World");

        // Don't fully pre-program the method. This should cause an error during assertions.
        mock.method("test");

        try {
          mock.test();
        } catch (error) {
          assertEquals(
            error.message,
            `Pre-programmed method "test" does not have a return value.`,
          );
        }
        assertEquals(mock.calls.test, 2);
        assertEquals(mock.calls.hello, 2);
    });

    it(
        ".willReturn(...) does not call original method and returns given value",
      (): void => {
        const mock = Mock(TestObjectThree).create();
        assertEquals(mock.is_mock, true);

        // Original returns "World"
        assertEquals(mock.test(), "World");

        // Change original to return "Hello"
        mock.method("test").willReturn("Hello");

        // Should output "Hello" and make the following calls
        assertEquals(mock.test(), "Hello");
        assertEquals(mock.calls.test, 2);
        assertEquals(mock.calls.hello, 2);
    });

    it(
      ".willReturn(...) can be performed more than once",
      (): void => {
        const mock = Mock(TestObjectThree).create();
        assertEquals(mock.is_mock, true);

        // Original returns "World"
        assertEquals(mock.test(), "World");

        // Change original to return "Hello"
        mock.method("test").willReturn("Hello");
        mock.method("test").willReturn("Hello!");

        assertEquals(mock.test(), "Hello!");
        assertEquals(mock.calls.test, 2);
        assertEquals(mock.calls.hello, 2);
    });

    it(
      ".willReturn(...) returns specified value",
      (): void => {
        const mock = Mock(TestObjectThree).create();
        assertEquals(mock.is_mock, true);

        // Original returns "World"
        assertEquals(mock.test(), "World");

        // Don't fully pre-program the method. This should cause an error during
        // assertions.
        mock
          .method("test")
          .willReturn({
            "something": "something",
          });

        assertEquals(mock.test(), { "something": "something" });
        assertEquals(mock.calls.test, 2);
        assertEquals(mock.calls.hello, 2);
    });

    it(
      ".willReturn(mock) returns the mock object (basic)",
      (): void => {
        const mock = Mock(TestObjectFourBuilder).create();
        assertEquals(mock.is_mock, true);

        mock
          .method("someComplexMethod")
          .willReturn(mock);

        assertEquals(mock.someComplexMethod(), mock);
        assertEquals(mock.calls.someComplexMethod, 1);
    });

    it(
      ".willReturn(mock) returns the mock object (extra)",
      (): void => {
        // Assert that the original implementation sets properties
        const mock1 = Mock(TestObjectFourBuilder).create();
        assertEquals(mock1.is_mock, true);
        mock1.someComplexMethod();
        assertEquals(mock1.something_one, "one");
        assertEquals(mock1.something_two, "two");
        assertEquals(mock1.calls.someComplexMethod, 1);

        // Assert that the mock implementation will not set properties
        const mock2 = Mock(TestObjectFourBuilder).create();
        assertEquals(mock2.is_mock, true);
        mock2
          .method("someComplexMethod")
          .willReturn(mock2);

        assertEquals(mock2.someComplexMethod(), mock2);
        assertEquals(mock2.something_one, undefined);
        assertEquals(mock2.something_two, undefined);
        assertEquals(mock2.calls.someComplexMethod, 1);

        // Assert that we can also use setters
        const mock3 = Mock(TestObjectFourBuilder).create();
        assertEquals(mock3.is_mock, true);
        mock3.someComplexMethod();
        assertEquals(mock3.something_one, "one");
        assertEquals(mock3.something_two, "two");
        mock3.something_one = "you got changed";
        assertEquals(mock3.something_one, "you got changed");
        assertEquals(mock3.calls.someComplexMethod, 1);
    });

    it(
      ".willThrow() causes throwing RandomError (with constructor)",
      (): void => {
        const mock = Mock(TestObjectThree).create();
        assertEquals(mock.is_mock, true);

        // Original returns "World"
        assertEquals(mock.test(), "World");

        // Make the original method throw RandomError
        mock
          .method("test")
          .willThrow(new RandomError("Random error message."));

        assertThrows(
          () => mock.test(),
          RandomError,
          "Random error message.",
        );
        assertEquals(mock.calls.test, 2);
    });

    it(
      ".willThrow() causes throwing RandomError2 (no constructor)",
      (): void => {
        const mock = Mock(TestObjectThree).create();
        assertEquals(mock.is_mock, true);

        // Original returns "World"
        assertEquals(mock.test(), "World");

        // Make the original method throw RandomError
        mock
          .method("test")
          .willThrow(new RandomError2());

        assertThrows(
          () => mock.test(),
          RandomError2,
          "Some message not by the constructor.",
        );
        assertEquals(mock.calls.test, 2);
    });

    it(
      ".expects(...).toBeCalled(...)",
      (): void => {
        const mock = Mock(TestObjectThree).create();
        assertEquals(mock.is_mock, true);

        mock.expects("hello").toBeCalled(2);
        mock.test();
        mock.verifyExpectations();
    });
  });

  // TODO(crookse) Put the below tests into one of the groups above this line

  describe("call count for outside nested function is increased", () => {
    const mockMathService = Mock(MathService)
      .create();
    const mockTestObject = Mock(TestObjectLotsOfDataMembers)
      .withConstructorArgs("has mocked math service", mockMathService)
      .create();
    assertEquals(mockMathService.calls.add, 0);
    assertEquals(mockMathService.calls.nestedAdd, 0);
    mockTestObject.sum(1, 1, true);
    assertEquals(mockMathService.calls.add, 1);
    assertEquals(mockMathService.calls.nestedAdd, 1);
  });

  describe("can mock getters and setters", () => {
    const mock = Mock(TestObjectLotsOfDataMembers)
      .create();
    mock.age = 999;
    assertEquals(mock.age, 999);
  });

  describe("native request mock", () => {
    it("handles async requests", async () => {

      const router = Mock(TestRequestHandler).create();

      const reqPost = new Request("https://google.com", {
        method: "post",
        headers: {
          "content-type": "application/json",
        },
      });
      assertEquals(router.calls.handle, 0);
      assertEquals(await router.handle(reqPost), "posted");
      assertEquals(router.calls.handle, 1);

      const reqPostNotJson = new Request("https://google.com", {
        method: "post",
      });
      assertEquals(router.calls.handle, 1);
      assertEquals(
        await router.handle(reqPostNotJson),
        "Content-Type is incorrect",
      );
      assertEquals(router.calls.handle, 2);

      const reqGet = new Request("https://google.com", {
        method: "get",
      });

      assertEquals(router.calls.handle, 2);
      assertEquals(
        await router.handle(reqGet),
        "Method is not post",
      );
      assertEquals(router.calls.handle, 3);
    });
  });

  describe("sets the default value for getters", () => {
    class Game {
    }

    class PlayersEngine {
      private game = new Game();
      get Game() {
        return this.game;
      }
      set Game(val: Game) {
        this.game = val;
      }
    }

    const mock = Mock(PlayersEngine).create();
    assertEquals(mock.Game instanceof Game, true);
  });
});
