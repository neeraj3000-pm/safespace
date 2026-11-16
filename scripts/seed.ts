/**
 * Seed Supabase with synthetic data: 24 experts, 15 resources, ~420 past sessions.
 * Run once after creating the tables (supabase/schema.sql):
 *   npm run seed
 * Needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the environment (or .env.local).
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { getExperts } from "../data/experts";
import { RESOURCES } from "../data/resources";
import { generateHistory } from "../lib/history";

if (existsSync(".env.local")) {
  for (const line of readFileSync(".env.local", "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
const db = createClient(url, key, { auth: { persistSession: false } });

async function upsert(table: string, rows: object[]) {
  for (let i = 0; i < rows.length; i += 200) {
    const { error } = await db.from(table).upsert(rows.slice(i, i + 200));
    if (error) {
      console.error(`✗ ${table}: ${error.message}`);
      if (error.code === "PGRST205") console.error("  → Run supabase/schema.sql in the Supabase SQL editor first.");
      process.exit(1);
    }
  }
  console.log(`✓ ${table}: ${rows.length} rows`);
}

(async () => {
  await upsert("experts", getExperts().map(({ avatar: _a, ...e }) => e));
  await upsert("resources", RESOURCES);
  await upsert("history_sessions", generateHistory());
  console.log("Done.");
})();
