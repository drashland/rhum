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
  <a href="https://www.youtube.com/watch?v=WhG5hLrcaVQ&list=PLlFUbR9MhiNU9VlCi97JkahXyDYcL_vUz&ab_channel=drashland">
    <img src="https://img.shields.io/badge/Tutorials-YouTube-red">
  </a>
</p>

---

### Features

- Descriptive naming for your tests
- Lightweight
- Zero 3rd party dependencies
- Simple and easy to use
- Asynchronous support
- Still uses `Deno.test` under the hood
- Skip functionality
- Mock requests
- Hooks

### Getting Started

To add Rhum to your project, follow the quick start guide
[here](https://drash.land/rhum/#/#quickstart).

### Why Use Rhum?

Rhum allows you to write tests in a very descriptive way -- from a code
perspective or output perspective.

Rhum is designed to aid your testing efforts -- providing many utilities as
wrappers around Deno's existing `Deno.test`. Rhum is meant to improve the user
experience when it comes to writing tests, such as:

- Readability for test cases
- Features that aren't available in Deno yet (hooks)

Rhum takes concepts from the following:

- <a href="https://mochajs.org/" target="_BLANK">Mocha</a> &mdash; For how you
  write tests in Rhum, and the use of
  <a href="https://mochajs.org/#hooks" target="_BLANK">hooks</a>
- <a href="https://volument.com/baretest" target="_BLANK">Baretest</a> &mdash;
  Being minimalistic

Rhum can be added directly into any project. All you need to do is import Rhum
and you are ready to start writing tests or bring your existing tests under
Rhum.

---

Want to contribute? Follow the Contributing Guidelines
[here](https://github.com/drashland/.github/blob/master/CONTRIBUTING.md). All
code is released under the [MIT License](./LICENSE).
