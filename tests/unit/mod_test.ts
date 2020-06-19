import { asserts } from "../../deps.ts";
import { Rhum } from "../../mod.ts";

Deno.test({
  name: "Unit | Rhum | Mocks | Assigns the correct callback",
  async fn(): Promise<void> {
    const mockReq = Rhum.Mocks.ServerRequest("https://google.com", "get", {
      headers: {
        a: "Hi",
      },
    });
    asserts.assertEquals(mockReq.url === "https://google.com", true);
    asserts.assertEquals(mockReq.method === "get", true);
    asserts.assertEquals(mockReq.headers.get("a"), "Hi");
    const res = mockReq.respond({ status: 200 });
    asserts.assertEquals(res.status, 200);
    asserts.assertEquals(typeof res.send === "function", true);
  },
});

// TODO(any) When this feature is properly implemented
// Deno.test({
//   name: "Unit | Rhum | SetUp() | Assigns the correct callback",
//   async fn(): Promise<void> {
//     function cb () {
//       return "Hello world!"
//     }
//     Rhum.SetUp(cb)
//     asserts.assertEquals(typeof Rhum.set_up_hook, "function")
//     if (Rhum.set_up_hook) {
//       asserts.assertEquals(Rhum.set_up_hook(), "Hello world!")
//     } else {
//       throw new Error("Rhum.set_up_hook should be defined")
//     }
//   }
// })

// TODO(any) When this feature is properly implemented
// Deno.test({
//   name: "Unit | Rhum | Skip() | Correctly skips the test",
//   async fn(): Promise<void> {
//
//   }
// })

// TODO(any) When this feature is properly implemented
// Deno.test({
//   name: "Unit | Rhum | TearDown() | Correctly tears down",
//   async fn(): Promise<void> {
//
//   }
// })

Deno.test({
  name: "Unit | Rhum | TestCase() | Runs a test without failing",
  async fn(): Promise<void> {
    Rhum.TestCase("Testing TestCase", () => {
      console.log("Running!");
    });
  },
});

Deno.test({
  name: "Unit | Rhum | TestPlan() | Registers the test plan name",
  async fn(): Promise<void> {
    let functionWasCalled = false;
    function testFn() {
      functionWasCalled = true;
      return "Hello world!";
    }
    const copyTestFn = testFn;
    Rhum.TestPlan("Testing TestCase", copyTestFn);
    asserts.assertEquals(functionWasCalled, true);
  },
});

Deno.test({
  name: "Unit | Rhum | TestSuite() | Registers the test suite name",
  async fn(): Promise<void> {
    let functionWasCalled = false;
    function testFn() {
      functionWasCalled = true;
      return "Hello world!";
    }
    const copyTestFn = testFn;
    Rhum.TestSuite("Testing TestCase", copyTestFn);
    asserts.assertEquals(functionWasCalled, true);
  },
});
