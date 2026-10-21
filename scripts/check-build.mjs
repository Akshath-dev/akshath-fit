import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import assert from "node:assert/strict";
const root = new URL("../dist/", import.meta.url);
assert.equal(
  (await readFile(new URL("CNAME", root), "utf8")).trim(),
  "akshath.fit",
  "CNAME must preserve the existing domain",
);
async function check(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) await check(path);
    else {
      assert(!entry.name.startsWith(".env"), "Environment files must not ship");
      if (/\.(html|js|css|json)$/.test(path)) {
        const contents = await readFile(path, "utf8");
        assert(
          !contents.includes("DESIGN_PREVIEW_ONLY"),
          "Development fixtures must not ship",
        );
        assert(
          !contents.includes("/dev/preview"),
          "Preview entry must not ship",
        );
        assert(
          !/sb_secret_[A-Za-z0-9_-]{16,}/.test(contents),
          "Private API keys must not ship",
        );
        for (const token of contents.match(
          /eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g,
        ) || []) {
          try {
            assert.notEqual(
              JSON.parse(
                Buffer.from(token.split(".")[1], "base64url").toString(),
              ).role,
              "service_role",
              "Service-role credentials must not ship",
            );
          } catch (e) {
            if (e.code === "ERR_ASSERTION") throw e;
          }
        }
      }
    }
  }
}
await check(root.pathname);
console.log(
  "Build checked: domain preserved; preview fixtures, environment files, and private API keys excluded.",
);
