import { BufReader, ServerRequest } from "../../deps.ts";

export interface MockServerRequestOptions {
  headers: { [key: string]: string };
  body?: Deno.Buffer;
}

export interface MockServerRequest extends ServerRequest {
}

export interface RequestRespondOutput extends Response { // TODO
  send: () => RequestRespondOutput;
}

export const MockServerRequestFn = function (
  url = "/",
  method = "get",
  options?: MockServerRequestOptions,
): MockServerRequest {
  let request: MockServerRequest = new ServerRequest();
  request.url = url;
  request.method = method;
  request.headers = new Headers();
  if (options) {
    if (options.headers) {
      for (let key in options.headers) {
        request.headers.set(key, options.headers[key]);
      }
    }
    if (options.body) {
      request.headers.set("Content-Length", options.body.length.toString());
      request.r = new BufReader(options.body);
    }
  }

  return request;
};
