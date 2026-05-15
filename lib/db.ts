// Postgres client — reads only on the public site.
//
// Uses postgres.js (works on Node + edge runtimes). One connection pool
// per process; cached on globalThis so dev-mode hot reload doesn't open
// new pools on every change.
//
// The DATABASE_URL is the same Railway Postgres the ETL pipeline writes to.
// We never write from the web layer.

import postgres from "postgres";

declare global {
  // eslint-disable-next-line no-var
  var __pg: ReturnType<typeof postgres> | undefined;
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

export const sql =
  globalThis.__pg ??
  (globalThis.__pg = postgres(process.env.DATABASE_URL, {
    prepare: false,
    ssl: "require",
    max: 5,
    idle_timeout: 20,
  }));
