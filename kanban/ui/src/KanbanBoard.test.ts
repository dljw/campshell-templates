import { describe, expect, it } from "vitest";
import { computeDropPosition } from "./KanbanBoard";
import type { Card } from "./types";

const columnIds = new Set(["todo", "doing", "done"]);

const cards: Card[] = [
  { id: "a", title: "A", column: "todo", order: 0, createdAt: "2026-03-20T00:00:00Z" },
  { id: "b", title: "B", column: "todo", order: 1, createdAt: "2026-03-20T00:00:00Z" },
  { id: "c", title: "C", column: "todo", order: 2, createdAt: "2026-03-20T00:00:00Z" },
  { id: "d", title: "D", column: "doing", order: 0, createdAt: "2026-03-20T00:00:00Z" },
  { id: "e", title: "E", column: "doing", order: 1, createdAt: "2026-03-20T00:00:00Z" },
];

function buildCardsByColumn(cards: Card[]): Map<string, Card[]> {
  const map = new Map<string, Card[]>();
  for (const id of columnIds) {
    map.set(id, []);
  }
  for (const card of cards) {
    map.get(card.column)?.push(card);
  }
  return map;
}

const cardsByColumn = buildCardsByColumn(cards);

describe("computeDropPosition", () => {
  it("same-column downward reorder: A(0) dropped on B(1)", () => {
    const result = computeDropPosition("a", "b", columnIds, cards, cardsByColumn);
    expect(result).toEqual({ targetColumnId: "todo", newOrder: 1 });
  });

  it("same-column downward reorder: A(0) dropped on C(2)", () => {
    const result = computeDropPosition("a", "c", columnIds, cards, cardsByColumn);
    expect(result).toEqual({ targetColumnId: "todo", newOrder: 2 });
  });

  it("same-column upward reorder: C(2) dropped on A(0)", () => {
    const result = computeDropPosition("c", "a", columnIds, cards, cardsByColumn);
    expect(result).toEqual({ targetColumnId: "todo", newOrder: 0 });
  });

  it("same-column upward reorder: C(2) dropped on B(1)", () => {
    const result = computeDropPosition("c", "b", columnIds, cards, cardsByColumn);
    expect(result).toEqual({ targetColumnId: "todo", newOrder: 1 });
  });

  it("cross-column drop: A(todo) dropped on D(doing, 0)", () => {
    const result = computeDropPosition("a", "d", columnIds, cards, cardsByColumn);
    expect(result).toEqual({ targetColumnId: "doing", newOrder: 0 });
  });

  it("cross-column drop: A(todo) dropped on E(doing, 1)", () => {
    const result = computeDropPosition("a", "e", columnIds, cards, cardsByColumn);
    expect(result).toEqual({ targetColumnId: "doing", newOrder: 1 });
  });

  it("column-level drop on empty column appends at 0", () => {
    const result = computeDropPosition("a", "done", columnIds, cards, cardsByColumn);
    expect(result).toEqual({ targetColumnId: "done", newOrder: 0 });
  });

  it("column-level drop on non-empty column appends to end", () => {
    // Dropping A (from todo) onto the "doing" column container
    const result = computeDropPosition("a", "doing", columnIds, cards, cardsByColumn);
    expect(result).toEqual({ targetColumnId: "doing", newOrder: 2 });
  });

  it("column-level drop on own non-empty column appends to end excluding self", () => {
    // Dropping A (from todo) onto the "todo" column container
    const result = computeDropPosition("a", "todo", columnIds, cards, cardsByColumn);
    // 3 cards in todo, minus A = 2
    expect(result).toEqual({ targetColumnId: "todo", newOrder: 2 });
  });

  it("returns null when dropping on non-existent card", () => {
    const result = computeDropPosition("a", "nonexistent", columnIds, cards, cardsByColumn);
    expect(result).toBeNull();
  });
});
