import { readFile } from "node:fs/promises";
import path from "node:path";
import { readAllActivities, readAllContacts, readAllDeals } from "./helpers.js";
import type {
  Activity,
  Contact,
  Deal,
  PipelineSummary,
  QueryOptions,
  SearchResult,
} from "./types.js";
import { NotFoundError } from "./types.js";

export { NotFoundError } from "./types.js";
export type {
  Activity,
  Contact,
  Deal,
  PipelineSummary,
  QueryOptions,
  SearchResult,
} from "./types.js";

const UNSAFE_ID = /[/\\]|\.\./;

// --- Contacts ---

export async function listContacts(options: QueryOptions): Promise<Contact[]> {
  const contacts = await readAllContacts(options.dataDir);
  contacts.sort((a, b) => a.name.localeCompare(b.name));
  return contacts;
}

export async function getContact(id: string, options: QueryOptions): Promise<Contact> {
  if (UNSAFE_ID.test(id)) throw new NotFoundError(`Contact not found: ${id}`);
  const filePath = path.join(options.dataDir, "contacts", `${id}.json`);
  try {
    const raw = await readFile(filePath, "utf-8");
    return JSON.parse(raw) as Contact;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      throw new NotFoundError(`Contact not found: ${id}`);
    }
    throw err;
  }
}

// --- Deals ---

export async function listDeals(options: QueryOptions): Promise<Deal[]> {
  let deals = await readAllDeals(options.dataDir);
  if (options.stage) {
    const s = options.stage.toLowerCase();
    deals = deals.filter((d) => d.stage.toLowerCase() === s);
  }
  if (options.contactId) {
    deals = deals.filter((d) => d.contactId === options.contactId);
  }
  deals.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return deals;
}

export async function getDeal(id: string, options: QueryOptions): Promise<Deal> {
  if (UNSAFE_ID.test(id)) throw new NotFoundError(`Deal not found: ${id}`);
  const filePath = path.join(options.dataDir, "deals", `${id}.json`);
  try {
    const raw = await readFile(filePath, "utf-8");
    return JSON.parse(raw) as Deal;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      throw new NotFoundError(`Deal not found: ${id}`);
    }
    throw err;
  }
}

// --- Activities ---

export async function listActivities(options: QueryOptions): Promise<Activity[]> {
  let activities = await readAllActivities(options.dataDir);
  if (options.type) {
    const t = options.type.toLowerCase();
    activities = activities.filter((a) => a.type?.toLowerCase() === t);
  }
  if (options.contactId) {
    activities = activities.filter((a) => a.contactId === options.contactId);
  }
  if (options.dealId) {
    activities = activities.filter((a) => a.dealId === options.dealId);
  }
  activities.sort((a, b) => b.date.localeCompare(a.date));
  return activities;
}

// --- Pipeline Summary ---

export async function pipelineSummary(options: QueryOptions): Promise<PipelineSummary[]> {
  const deals = await readAllDeals(options.dataDir);
  const stages = ["lead", "proposal", "won", "lost"];
  return stages.map((stage) => {
    const stageDeals = deals.filter((d) => d.stage === stage);
    return {
      stage,
      count: stageDeals.length,
      totalValue: stageDeals.reduce((sum, d) => sum + (d.value ?? 0), 0),
    };
  });
}

// --- Search ---

export async function searchCrm(term: string, options: QueryOptions): Promise<SearchResult[]> {
  const lower = term.toLowerCase();
  const results: SearchResult[] = [];

  const contacts = await readAllContacts(options.dataDir);
  for (const c of contacts) {
    const matchedIn: string[] = [];
    if (c.name.toLowerCase().includes(lower)) matchedIn.push("name");
    if (c.email?.toLowerCase().includes(lower)) matchedIn.push("email");
    if (c.company?.toLowerCase().includes(lower)) matchedIn.push("company");
    if (matchedIn.length > 0) {
      results.push({ entity: "contacts", id: c.id, title: c.name, matchedIn });
    }
  }

  const deals = await readAllDeals(options.dataDir);
  for (const d of deals) {
    const matchedIn: string[] = [];
    if (d.title.toLowerCase().includes(lower)) matchedIn.push("title");
    if (d.notes?.toLowerCase().includes(lower)) matchedIn.push("notes");
    if (matchedIn.length > 0) {
      results.push({ entity: "deals", id: d.id, title: d.title, matchedIn });
    }
  }

  return results;
}
