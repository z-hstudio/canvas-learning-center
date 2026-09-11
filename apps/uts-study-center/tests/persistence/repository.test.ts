import { mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import Database from "better-sqlite3";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildMockAcademicData } from "@/integrations/canvas/mock-data";

const temporaryDirectory = mkdtempSync(join(tmpdir(), "uts-study-center-repository-"));
const databasePath = join(temporaryDirectory, "test.db");
process.env.DATABASE_URL = `file:${databasePath}`;

let repository: typeof import("@/repositories/academic-repository");
let databaseClient: typeof import("@/lib/db").db;

beforeAll(async () => {
  const sqlite = new Database(databasePath);
  const migrationsRoot = join(process.cwd(), "prisma", "migrations");
  for (const directory of readdirSync(migrationsRoot).sort()) {
    if (directory === "migration_lock.toml") continue;
    sqlite.exec(readFileSync(join(migrationsRoot, directory, "migration.sql"), "utf8"));
  }
  sqlite.close();
  repository = await import("@/repositories/academic-repository");
  databaseClient = (await import("@/lib/db")).db;
});

afterAll(async () => {
  await databaseClient.$disconnect();
  rmSync(temporaryDirectory, { recursive: true, force: true });
});

describe("academic repository synchronization", () => {
  it("updates a moving mock timetable by application id when its fingerprint changes", async () => {
    const first = buildMockAcademicData(new Date("2026-08-29T02:00:00Z"));
    const second = buildMockAcademicData(new Date("2026-09-01T02:00:00Z"));
    expect(first.timetableEvents[0].id).toBe(second.timetableEvents[0].id);
    expect(first.timetableEvents[0].fingerprint).not.toBe(second.timetableEvents[0].fingerprint);

    await repository.saveAcademicData(first);
    await expect(repository.saveAcademicData(second)).resolves.toBeUndefined();

    const loaded = await repository.loadAcademicData(new Date("2026-09-01T02:00:00Z"));
    expect(loaded.timetableEvents).toHaveLength(second.timetableEvents.length);
    expect(loaded.timetableEvents.map((event) => event.fingerprint))
      .toEqual(second.timetableEvents.map((event) => event.fingerprint));
  });
});
