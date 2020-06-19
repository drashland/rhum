import { asserts } from "../../../deps.ts";
import { MockServerRequest } from "../../../src/mocks/server_request.ts";

Deno.test({
  name: "Unit | Mocks | ServerRequest | Returns a valid request object",
  async fn(): Promise<void> {
    const mockReq = MockServerRequest("https://google.com", "get", {
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
