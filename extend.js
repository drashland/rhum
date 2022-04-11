// deno-fmt-ignore-file
// deno-lint-ignore-file
// This code was bundled using `deno bundle` and it's not recommended to edit it manually

class Base {
    base_prop = "base prop";
}
class Hello extends Base {
    sub_prop = "sub prop";
}
new Hello();
