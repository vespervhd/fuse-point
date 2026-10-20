/**
 * NarmStore test runner.
 *
 *   npm test            -> static checks only (fast, no network, runs pre-deploy)
 *   npm run test:smoke  -> static checks + live smoke test against BASE_URL
 *
 * Exit code is 1 if any check fails.
 */
import { checkNoServerHandlers } from "./static/no-server-handlers.mjs";
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

let failed = false;

// 1. Static: no event handlers in server components (regression for 2026-10-16)
{
  const { files, violations } = checkNoServerHandlers(process.cwd());
  console.log(`[test] static/no-server-handlers: scanned ${files} tsx files`);
  if (violations.length) {
    failed = true;
    console.error("[test] FAIL: event handlers found in server components:");
    for (const v of violations) console.error(`  ${v}`);
  } else {
    console.log("[test] PASS: no event handlers in server components");
  }
}

// 2. TypeScript (already the project's gate)
{
  console.log("[test] running tsc --noEmit...");
  const r = spawnSync("npx", ["tsc", "--noEmit"], { stdio: "inherit", cwd: process.cwd() });
  if (r.status !== 0) {
    failed = true;
    console.error("[test] FAIL: tsc --noEmit");
  } else {
    console.log("[test] PASS: tsc --noEmit");
  }
}

// 3. Unit tests (Vitest, pure logic — no DB/network)
{
  console.log("[test] running unit tests (vitest)...");
  const vitestBin = join(process.cwd(), "node_modules", ".bin", "vitest");
  if (!existsSync(vitestBin)) {
    failed = true;
    console.error("[test] FAIL: vitest not installed (run npm install)");
  } else {
    const r = spawnSync(vitestBin, ["run"], { stdio: "inherit", cwd: process.cwd() });
    if (r.status !== 0) {
      failed = true;
      console.error("[test] FAIL: unit tests");
    } else {
      console.log("[test] PASS: unit tests");
    }
  }
}

// 4. Live smoke test (opt-in: needs a deployed URL)
if (process.env.SMOKE === "1") {
  console.log("[test] running live smoke test...");
  const r = spawnSync("node", ["tests/smoke.mjs"], {
    stdio: "inherit",
    cwd: process.cwd(),
    env: process.env,
  });
  if (r.status !== 0) {
    failed = true;
    console.error("[test] FAIL: smoke test");
  }
} else {
  console.log("[test] skip: live smoke test (set SMOKE=1 to run)");
}

if (failed) {
  console.error("[test] RESULT: FAILED");
  process.exit(1);
}
console.log("[test] RESULT: ALL PASSED");
