import { readFile, readdir } from "node:fs/promises";
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

describe("Habit Tracker Schemas", () => {
	const ajv = new Ajv({ allErrors: true });
	addFormats(ajv);

	let validateHabit: ValidateFunction;
	let validateCompletion: ValidateFunction;
	let validateCategories: ValidateFunction;

	beforeAll(async () => {
		validateHabit = ajv.compile(
			(await loadJson(path.join(schemaDir, "habits.schema.json"))) as Record<string, unknown>,
		);
		validateCompletion = ajv.compile(
			(await loadJson(path.join(schemaDir, "completions.schema.json"))) as Record<
				string,
				unknown
			>,
		);
		validateCategories = ajv.compile(
			(await loadJson(path.join(schemaDir, "categories.schema.json"))) as Record<
				string,
				unknown
			>,
		);
	});

	it("all schemas compile without errors", () => {
		expect(validateHabit).toBeDefined();
		expect(validateCompletion).toBeDefined();
		expect(validateCategories).toBeDefined();
	});

	describe("habit validation", () => {
		it("accepts a valid daily habit", () => {
			expect(
				validateHabit({
					id: "morning-meditation",
					createdAt: "2026-01-01T00:00:00.000Z",
					name: "Morning Meditation",
					frequency: "daily",
					emoji: "\ud83e\uddd8",
					color: "purple",
					categoryId: "mindfulness",
				}),
			).toBe(true);
		});

		it("accepts a valid weekly habit with target", () => {
			expect(
				validateHabit({
					id: "learn-language",
					createdAt: "2026-01-01T00:00:00.000Z",
					name: "Language Practice",
					frequency: "weekly",
					target: 3,
				}),
			).toBe(true);
		});

		it("rejects habit missing required fields", () => {
			expect(validateHabit({ name: "No ID", frequency: "daily" })).toBe(false);
		});

		it("rejects habit with invalid frequency enum", () => {
			expect(
				validateHabit({
					id: "test",
					createdAt: "2026-01-01T00:00:00.000Z",
					name: "Test",
					frequency: "monthly",
				}),
			).toBe(false);
		});

		it("rejects habit with invalid color enum", () => {
			expect(
				validateHabit({
					id: "test",
					createdAt: "2026-01-01T00:00:00.000Z",
					name: "Test",
					frequency: "daily",
					color: "teal",
				}),
			).toBe(false);
		});

		it("rejects habit with extra properties", () => {
			expect(
				validateHabit({
					id: "test",
					createdAt: "2026-01-01T00:00:00.000Z",
					name: "Test",
					frequency: "daily",
					unknownField: true,
				}),
			).toBe(false);
		});
	});

	describe("completion validation", () => {
		it("accepts a valid completion", () => {
			expect(
				validateCompletion({
					id: "meditation-2026-04-01",
					createdAt: "2026-04-01T07:15:00.000Z",
					habitId: "morning-meditation",
					date: "2026-04-01",
				}),
			).toBe(true);
		});

		it("accepts a completion with notes", () => {
			expect(
				validateCompletion({
					id: "exercise-2026-04-01",
					createdAt: "2026-04-01T18:00:00.000Z",
					habitId: "exercise",
					date: "2026-04-01",
					notes: "Ran 5K today",
				}),
			).toBe(true);
		});

		it("rejects completion missing required fields", () => {
			expect(validateCompletion({ habitId: "test", date: "2026-04-01" })).toBe(false);
		});

		it("rejects completion with invalid date format", () => {
			expect(
				validateCompletion({
					id: "test-bad-date",
					createdAt: "2026-04-01T07:15:00.000Z",
					habitId: "test",
					date: "April 1",
				}),
			).toBe(false);
		});

		it("rejects completion with extra properties", () => {
			expect(
				validateCompletion({
					id: "test-extra",
					createdAt: "2026-04-01T07:15:00.000Z",
					habitId: "test",
					date: "2026-04-01",
					extraField: "nope",
				}),
			).toBe(false);
		});
	});

	describe("categories collection validation", () => {
		it("accepts valid categories", () => {
			expect(
				validateCategories({
					categories: [
						{
							id: "health",
							createdAt: "2026-01-01T00:00:00.000Z",
							name: "Health",
							color: "green",
						},
					],
				}),
			).toBe(true);
		});

		it("rejects category with invalid color enum", () => {
			expect(
				validateCategories({
					categories: [
						{
							id: "health",
							createdAt: "2026-01-01T00:00:00.000Z",
							name: "Health",
							color: "teal",
						},
					],
				}),
			).toBe(false);
		});
	});

	describe("default seed data validation", () => {
		it("categories.json passes schema", async () => {
			const data = await loadJson(path.join(defaultsDir, "categories.json"));
			expect(validateCategories(data)).toBe(true);
		});

		it("all default habits pass schema", async () => {
			const files = (await readdir(path.join(defaultsDir, "habits"))).filter((f) =>
				f.endsWith(".json"),
			);
			for (const file of files) {
				const data = await loadJson(path.join(defaultsDir, "habits", file));
				const valid = validateHabit(data);
				if (!valid) console.error(`Validation errors for ${file}:`, validateHabit.errors);
				expect(valid).toBe(true);
			}
		});

		it("all default completions pass schema", async () => {
			const files = (await readdir(path.join(defaultsDir, "completions"))).filter((f) =>
				f.endsWith(".json"),
			);
			for (const file of files) {
				const data = await loadJson(path.join(defaultsDir, "completions", file));
				const valid = validateCompletion(data);
				if (!valid)
					console.error(`Validation errors for ${file}:`, validateCompletion.errors);
				expect(valid).toBe(true);
			}
		});
	});
});
