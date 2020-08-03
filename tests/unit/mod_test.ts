import { StdAsserts as asserts } from "../../deps.ts";
import { Rhum } from "../../mod.ts";

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
  name: "Unit | Rhum | testCase() | Runs a test without failing",
  async fn(): Promise<void> {
    Rhum.testPlan("test plan", () => {
      Rhum.testSuite("test suite", () => {
        Rhum.testCase("Testing testCase", () => {
          console.log("Running!");
        });
      });
    });
  },
});

Deno.test({
  name: "Unit | Rhum | testPlan() | Registers the test plan name",
  async fn(): Promise<void> {
    let functionWasCalled = false;
    function testFn() {
      functionWasCalled = true;
      return "Hello world!";
    }
    const copyTestFn = testFn;
    Rhum.testPlan("Testing testCase", copyTestFn);
    Rhum.asserts.assert(functionWasCalled);
  },
});

Deno.test({
  name: "Unit | Rhum | testSuite() | Registers the test suite name",
  async fn(): Promise<void> {
    let functionWasCalled = false;
    function testFn() {
      functionWasCalled = true;
      return "Hello world!";
    }
    const copyTestFn = testFn;
    Rhum.testSuite("Testing testCase", copyTestFn);
    asserts.assertEquals(functionWasCalled, true);
  },
});
