import { BufReader, ServerRequest } from "../../deps.ts";

export interface MockServerRequestOptions {
  headers: { [key: string]: string };
  body?: Deno.Buffer;
  server?: any; // TODO what is server type
}

export interface MockServerRequest extends ServerRequest {
  server?: any; // TODO what is server type
}

export interface RequestRespondOutput extends Response { // TODO
  send: () => RequestRespondOutput;
}

export const MockServerRequest = function (
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
    if (options.server) {
      request.server = options.server;
    }
  }

  //
  // Stub `respond()` so we don't run into the following error:
  //
  //   TypeError: Cannot read property 'write' of undefined
  //
  request.respond = function respond(output: any) { // TODO RequestRespondOutput & different method signature than original
    output.send = function () {
      if (
        output.status === 301 ||
        output.status === 302
      ) {
        return output;
      }
    };
    return output;
  };

  return request;
};
