import { BufReader, ServerRequest } from "../../deps.ts";

export const MockServerRequest = function (
  url = "/",
  method = "get",
  options?: any,
): any {
  let request: any = new ServerRequest();
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
      // Used to see if the body can be stringified, or if its a formdata object
      if (typeof options.body === "string") {
        request.headers.set("Content-Length", options.body.length.toString());
      } else if (options.body instanceof FormData) {
        let len = 0;
        options.body.forEach((value: FormDataEntryValue) => {
          if (typeof value === "string") {
            // normal input, eg .append("input", "my username")
            len += value.length
          } else {
            // file
            len += value.size
          }
        })
        request.headers.set("Content-Length", len)
      }
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
  request.respond = function respond(output: any) {
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
