import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ajvModule, { type ValidateFunction } from "ajv";
import addFormatsModule from "ajv-formats";
import { beforeAll, describe, expect, it } from "vitest";

const Ajv = ajvModule.default ?? ajvModule;
const addFormats: (ajv: InstanceType<typeof Ajv>) => void =
  // biome-ignore lint/suspicious/noExplicitAny: ESM/CJS interop for ajv-formats
  (addFormatsModule as any).default ?? addFormatsModule;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schemaDir = path.join(__dirname, "..", "schemas");
const defaultsDir = path.join(__dirname, "..", "defaults");

async function loadJson(filePath: string): Promise<unknown> {
  return JSON.parse(await readFile(filePath, "utf-8"));
}

describe("Kanban Schemas", () => {
  const ajv = new Ajv({ allErrors: true });
  addFormats(ajv);

  let validateCard: ValidateFunction;
  let validateColumn: ValidateFunction;

  beforeAll(async () => {
    const cardSchema = await loadJson(path.join(schemaDir, "card.schema.json"));
    validateCard = ajv.compile(cardSchema as Record<string, unknown>);

    const columnSchema = await loadJson(path.join(schemaDir, "column.schema.json"));
    validateColumn = ajv.compile(columnSchema as Record<string, unknown>);
  });

  it("card schema compiles without errors", () => {
    expect(validateCard).toBeDefined();
  });

  it("column schema compiles without errors", () => {
    expect(validateColumn).toBeDefined();
  });

  describe("card validation", () => {
    it("accepts a valid card", () => {
      const valid = validateCard({
        id: "test-card-1",
        title: "Test Card",
        column: "todo",
        createdAt: "2026-03-21T00:00:00.000Z",
        order: 0,
        labels: ["bug"],
        priority: "high",
      });
      expect(valid).toBe(true);
    });

    it("rejects card missing required fields", () => {
      expect(validateCard({ title: "No ID or createdAt", column: "todo" })).toBe(false);
      expect(validateCard.errors).toBeDefined();
    });

    it("rejects card with invalid id pattern", () => {
      expect(
        validateCard({
          id: "AB",
          title: "Bad ID",
          column: "todo",
          createdAt: "2026-03-21T00:00:00.000Z",
        }),
      ).toBe(false);
    });

    it("rejects card with extra properties", () => {
      expect(
        validateCard({
          id: "test-card-1",
          title: "Test",
          column: "todo",
          createdAt: "2026-03-21T00:00:00.000Z",
          unknownField: "nope",
        }),
      ).toBe(false);
    });

    it("rejects card with invalid priority enum", () => {
      expect(
        validateCard({
          id: "test-card-1",
          title: "Test",
          column: "todo",
          createdAt: "2026-03-21T00:00:00.000Z",
          priority: "critical",
        }),
      ).toBe(false);
    });

    it("rejects card with invalid date-time format", () => {
      expect(
        validateCard({
          id: "test-card-1",
          title: "Test",
          column: "todo",
          createdAt: "not-a-date",
        }),
      ).toBe(false);
    });
  });

  describe("column validation", () => {
    it("accepts valid column data", () => {
      expect(
        validateColumn({
          columns: [
            { id: "todo", name: "To Do", order: 0 },
            { id: "done", name: "Done", order: 1, color: "#10B981" },
          ],
        }),
      ).toBe(true);
    });

    it("rejects column missing required fields", () => {
      expect(validateColumn({ columns: [{ name: "No ID" }] })).toBe(false);
    });

    it("rejects column with extra properties", () => {
      expect(
        validateColumn({
          columns: [{ id: "todo", name: "To Do", order: 0, extra: true }],
        }),
      ).toBe(false);
    });

    it("rejects column with invalid color pattern", () => {
      expect(
        validateColumn({
          columns: [{ id: "todo", name: "To Do", order: 0, color: "red" }],
        }),
      ).toBe(false);
    });
  });

  describe("default seed data validation", () => {
    it("default columns.json passes column schema", async () => {
      const data = await loadJson(path.join(defaultsDir, "columns.json"));
      expect(validateColumn(data)).toBe(true);
    });

    for (const cardFile of ["welcome-card-1.json", "welcome-card-2.json", "welcome-card-3.json"]) {
      it(`default ${cardFile} passes card schema`, async () => {
        const data = await loadJson(path.join(defaultsDir, "cards", cardFile));
        const valid = validateCard(data);
        if (!valid) {
          console.error(`Validation errors for ${cardFile}:`, validateCard.errors);
        }
        expect(valid).toBe(true);
      });
    }
  });
});
