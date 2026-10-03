import { describe, expect, it } from "vitest";
import { InMemoryFileSystem } from "../file-system";
import { resolveModule } from "../resolver";
import { transformAndResolve } from "../transformer";

const files = new InMemoryFileSystem({
  "index.js": 'import { internalValue } from "fixture/internal";',
  "node_modules/fixture/package.json": JSON.stringify({
    name: "fixture",
    main: "index.js"
  }),
  "node_modules/fixture/index.js": 'export const rootValue = "root";',
  "node_modules/fixture/internal/index.js":
    'export const internalValue = "internal";',
  "node_modules/fixture/value.js": 'export const value = "file";',
  "node_modules/@scope/fixture/package.json": JSON.stringify({
    name: "@scope/fixture",
    main: "index.js"
  }),
  "node_modules/@scope/fixture/index.js": "export default 1;",
  "node_modules/@scope/fixture/internal.js": "export default 2;"
});

describe("package subpaths without an exports map", () => {
  it("preserves the legacy entrypoint for a root import", () => {
    expect(resolveModule("fixture", { files })).toEqual({
      path: "node_modules/fixture/index.js",
      external: false
    });
  });

  it("resolves a directory subpath instead of the root entrypoint", () => {
    expect(resolveModule("fixture/internal", { files })).toEqual({
      path: "node_modules/fixture/internal/index.js",
      external: false
    });
  });

  it("resolves a file subpath with extension inference", () => {
    expect(resolveModule("fixture/value", { files })).toEqual({
      path: "node_modules/fixture/value.js",
      external: false
    });
  });

  it("resolves a scoped package subpath", () => {
    expect(resolveModule("@scope/fixture/internal", { files })).toEqual({
      path: "node_modules/@scope/fixture/internal.js",
      external: false
    });
  });

  it("does not substitute the root for a missing subpath", () => {
    expect(resolveModule("fixture/missing", { files })).toEqual({
      path: "fixture/missing",
      external: true
    });
  });

  it("rewrites the import to the requested module", async () => {
    const result = await transformAndResolve(files, "index.js", []);
    expect(result.modules["index.js"]).toContain(
      "/node_modules/fixture/internal/index.js"
    );
  });
});
