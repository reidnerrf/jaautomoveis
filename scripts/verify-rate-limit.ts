/*
  Quick verification script for 429 rate limiting.
  It sets small window/max thresholds, imports the Express app
  (without starting the server), and hammers a write endpoint
  to confirm Retry-After and JSON response.
*/

process.env.NODE_ENV = "test";
process.env.RATE_LIMIT_WINDOW_MS = "10000"; // 10s for global limiter
process.env.RATE_LIMIT_MAX_REQUESTS = "100";
process.env.RATE_LIMIT_SKIP_GET = "true";
process.env.WRITE_LIMIT_WINDOW_MS = "5000"; // 5s for write limiter
process.env.WRITE_LIMIT_MAX = "3"; // only 3 writes allowed per window

// Ensure secrets present as some middlewares may require it in production, but we are in test
process.env.JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

import request from "supertest";
import path from "path";
// Import the TS source via ts-node register (loaded by the runner)
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { app } = require(path.join(process.cwd(), "server.ts"));

async function main() {
  const url = "/api/limit-test";
  const results: Array<{ status: number; retryAfter?: string; body?: any }> = [];
  for (let i = 1; i <= 6; i++) {
    const res = await request(app)
      .post(url)
      .set("Content-Type", "application/json")
      .send({});
    results.push({
      status: res.status,
      retryAfter: res.headers["retry-after"],
      body: res.body,
    });
  }
  // Print concise output
  // eslint-disable-next-line no-console
  console.log(
    results.map((r, idx) => `#${idx + 1} status=${r.status} retry-after=${r.retryAfter || "-"}`).join("\n")
  );
  // Show last body if 429
  const last = results[results.length - 1];
  if (last.status === 429) {
    // eslint-disable-next-line no-console
    console.log("Body:", last.body);
  }
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});

