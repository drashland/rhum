import { Mock } from "../../../mod.ts";
import { assertEquals } from "../../deps.ts";

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
    const contentType = request.headers.get("Content-Type");

    if (method !== "post") {
      return "Method is not post";
    }

    if (contentType !== "application/json") {
      return "Content-Type is incorrect";
    }

    return "posted";
  }
}

Deno.test("mock()", async (t) => {
});
