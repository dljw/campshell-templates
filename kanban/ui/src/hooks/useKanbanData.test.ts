import type { ServerMessage } from "@campshell/core";
import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { KanbanCard, KanbanColumn } from "./useKanbanData.js";
import type { UseWebSocketReturn, ValidationError } from "./useWebSocket.js";

// --- Mock useWebSocket ---

let mockStatus: UseWebSocketReturn["status"] = "disconnected";
let mockValidationErrors: ValidationError[] = [];
const mockWriteFile = vi.fn(() => true);
const mockDeleteFile = vi.fn(() => true);
const fileEventCallbacks = new Set<(event: ServerMessage) => void>();

vi.mock("./useWebSocket.js", () => ({
  useWebSocket: () => ({
    get status() {
      return mockStatus;
    },
    writeFile: mockWriteFile,
    deleteFile: mockDeleteFile,
    onFileEvent: (cb: (event: ServerMessage) => void) => {
      fileEventCallbacks.add(cb);
      return () => fileEventCallbacks.delete(cb);
    },
    get validationErrors() {
      return mockValidationErrors;
    },
  }),
}));

// Import after mock setup
const { useKanbanData } = await import("./useKanbanData.js");

function emitEvent(event: ServerMessage) {
  for (const cb of fileEventCallbacks) {
    cb(event);
  }
}

const sampleCards: KanbanCard[] = [
  {
    id: "card-001",
    title: "First card",
    column: "todo",
    createdAt: "2026-03-20T00:00:00Z",
  },
  {
    id: "card-002",
    title: "Second card",
    column: "doing",
    createdAt: "2026-03-20T00:00:00Z",
  },
];

const orderedCards: KanbanCard[] = [
  { id: "a", title: "A", column: "todo", order: 0, createdAt: "2026-03-20T00:00:00Z" },
  { id: "b", title: "B", column: "todo", order: 1, createdAt: "2026-03-20T00:00:00Z" },
  { id: "c", title: "C", column: "todo", order: 2, createdAt: "2026-03-20T00:00:00Z" },
  { id: "d", title: "D", column: "doing", order: 0, createdAt: "2026-03-20T00:00:00Z" },
  { id: "e", title: "E", column: "doing", order: 1, createdAt: "2026-03-20T00:00:00Z" },
];

const sampleColumns: KanbanColumn[] = [
  { id: "todo", name: "To Do", order: 0 },
  { id: "doing", name: "Doing", order: 1 },
  { id: "done", name: "Done", order: 2 },
];

beforeEach(() => {
  mockStatus = "disconnected";
  mockValidationErrors = [];
  mockWriteFile.mockReset();
  mockDeleteFile.mockReset();
  fileEventCallbacks.clear();

  vi.stubGlobal(
    "fetch",
    vi.fn((url: string) => {
      if (url.includes("/errors")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            data: {
              cards: [...sampleCards],
              columns: { columns: [...sampleColumns] },
            },
          }),
      });
    }),
  );
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useKanbanData", () => {
  it("fetches initial data when connected", async () => {
    const { result, rerender } = renderHook(() => useKanbanData());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.cards).toEqual([]);

    // Simulate connection
    mockStatus = "connected";
    rerender();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.cards).toEqual(sampleCards);
    expect(result.current.columns).toEqual(sampleColumns);
    expect(fetch).toHaveBeenCalledWith("/api/kanban/data");
  });

  it("handles fetch errors gracefully", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve({ ok: false, status: 500 })),
    );

    const { result, rerender } = renderHook(() => useKanbanData());
    mockStatus = "connected";
    rerender();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.cards).toEqual([]);
    expect(result.current.columns).toEqual([]);
  });

  it("adds card on file:created event", async () => {
    const { result, rerender } = renderHook(() => useKanbanData());
    mockStatus = "connected";
    rerender();

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const newCard: KanbanCard = {
      id: "card-003",
      title: "New card",
      column: "todo",
      createdAt: "2026-03-21T00:00:00Z",
    };

    act(() =>
      emitEvent({
        type: "file:created",
        template: "kanban",
        entity: "card",
        file: "cards/card-003.json",
        data: newCard,
        source: "agent",
      }),
    );

    expect(result.current.cards).toHaveLength(3);
    expect(result.current.cards[2]).toEqual(newCard);
  });

  it("updates card on file:updated event", async () => {
    const { result, rerender } = renderHook(() => useKanbanData());
    mockStatus = "connected";
    rerender();

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const updatedCard: KanbanCard = {
      ...sampleCards[0],
      title: "Updated title",
    };

    act(() =>
      emitEvent({
        type: "file:updated",
        template: "kanban",
        entity: "card",
        file: "cards/card-001.json",
        data: updatedCard,
        source: "agent",
      }),
    );

    expect(result.current.cards[0].title).toBe("Updated title");
  });

  it("removes card on file:deleted event", async () => {
    const { result, rerender } = renderHook(() => useKanbanData());
    mockStatus = "connected";
    rerender();

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() =>
      emitEvent({
        type: "file:deleted",
        template: "kanban",
        entity: "card",
        file: "cards/card-001.json",
        source: "agent",
      }),
    );

    expect(result.current.cards).toHaveLength(1);
    expect(result.current.cards[0].id).toBe("card-002");
  });

  it("updates columns on column file:updated event", async () => {
    const { result, rerender } = renderHook(() => useKanbanData());
    mockStatus = "connected";
    rerender();

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const newColumns: KanbanColumn[] = [
      { id: "backlog", name: "Backlog", order: 0 },
      { id: "active", name: "Active", order: 1 },
    ];

    act(() =>
      emitEvent({
        type: "file:updated",
        template: "kanban",
        entity: "column",
        file: "columns.json",
        data: { columns: newColumns },
        source: "agent",
      }),
    );

    expect(result.current.columns).toEqual(newColumns);
  });

  it("createCard optimistically adds card and calls writeFile", async () => {
    const { result, rerender } = renderHook(() => useKanbanData());
    mockStatus = "connected";
    rerender();

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const newCard: KanbanCard = {
      id: "card-new",
      title: "Optimistic card",
      column: "todo",
      createdAt: "2026-03-21T00:00:00Z",
    };

    act(() => result.current.createCard(newCard));

    // Card should appear immediately
    expect(result.current.cards).toHaveLength(3);
    expect(result.current.cards[2]).toEqual(newCard);

    // writeFile should have been called
    expect(mockWriteFile).toHaveBeenCalledWith("cards/card-new.json", newCard);
  });

  it("updateCard optimistically updates card and calls writeFile", async () => {
    const { result, rerender } = renderHook(() => useKanbanData());
    mockStatus = "connected";
    rerender();

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const updated: KanbanCard = {
      ...sampleCards[0],
      title: "Optimistic update",
    };

    act(() => result.current.updateCard(updated));

    expect(result.current.cards[0].title).toBe("Optimistic update");
    expect(mockWriteFile).toHaveBeenCalledWith("cards/card-001.json", updated, undefined);
  });

  it("deleteCard optimistically removes card and calls deleteFile", async () => {
    const { result, rerender } = renderHook(() => useKanbanData());
    mockStatus = "connected";
    rerender();

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.deleteCard("card-001"));

    expect(result.current.cards).toHaveLength(1);
    expect(result.current.cards[0].id).toBe("card-002");
    expect(mockDeleteFile).toHaveBeenCalledWith("cards/card-001.json");
  });

  it("rolls back optimistic create on validation error", async () => {
    const { result, rerender } = renderHook(() => useKanbanData());
    mockStatus = "connected";
    rerender();

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const badCard: KanbanCard = {
      id: "card-bad",
      title: "Bad card",
      column: "todo",
      createdAt: "2026-03-21T00:00:00Z",
    };

    act(() => result.current.createCard(badCard));
    expect(result.current.cards).toHaveLength(3);

    // Server rejects
    act(() =>
      emitEvent({
        type: "validation:error",
        template: "kanban",
        file: "cards/card-bad.json",
        errors: [
          { keyword: "required", message: "missing", instancePath: "", schemaPath: "", params: {} },
        ],
      }),
    );

    // Optimistic card should be rolled back
    expect(result.current.cards).toHaveLength(2);
    expect(result.current.cards.find((c) => c.id === "card-bad")).toBeUndefined();
  });

  it("rolls back optimistic update on validation error", async () => {
    const { result, rerender } = renderHook(() => useKanbanData());
    mockStatus = "connected";
    rerender();

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const updated: KanbanCard = {
      ...sampleCards[0],
      title: "Bad update",
    };

    act(() => result.current.updateCard(updated));
    expect(result.current.cards[0].title).toBe("Bad update");

    // Server rejects
    act(() =>
      emitEvent({
        type: "validation:error",
        template: "kanban",
        file: "cards/card-001.json",
        errors: [
          {
            keyword: "maxLength",
            message: "too long",
            instancePath: "/title",
            schemaPath: "",
            params: {},
          },
        ],
      }),
    );

    // Should restore previous state
    expect(result.current.cards[0].title).toBe("First card");
  });

  it("rolls back optimistic delete on validation error", async () => {
    const { result, rerender } = renderHook(() => useKanbanData());
    mockStatus = "connected";
    rerender();

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.deleteCard("card-001"));
    expect(result.current.cards).toHaveLength(1);

    // Server rejects (e.g., delete not allowed)
    act(() =>
      emitEvent({
        type: "validation:error",
        template: "kanban",
        file: "cards/card-001.json",
        errors: [
          {
            keyword: "error",
            message: "cannot delete",
            instancePath: "",
            schemaPath: "",
            params: {},
          },
        ],
      }),
    );

    // Should restore the deleted card
    expect(result.current.cards).toHaveLength(2);
    expect(result.current.cards.find((c) => c.id === "card-001")).toBeDefined();
  });

  it("reconciles optimistic update with server confirmation", async () => {
    const { result, rerender } = renderHook(() => useKanbanData());
    mockStatus = "connected";
    rerender();

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const updated: KanbanCard = {
      ...sampleCards[0],
      title: "Optimistic",
    };

    act(() => result.current.updateCard(updated));

    // Server confirms with its own version
    const serverVersion: KanbanCard = {
      ...updated,
      updatedAt: "2026-03-21T12:00:00Z",
    };

    act(() =>
      emitEvent({
        type: "file:updated",
        template: "kanban",
        entity: "card",
        file: "cards/card-001.json",
        data: serverVersion,
        source: "ui",
      }),
    );

    // Should use server's authoritative version
    expect(result.current.cards[0].updatedAt).toBe("2026-03-21T12:00:00Z");
    // Should not have duplicates
    expect(result.current.cards).toHaveLength(2);
  });

  it("moveCard updates column and order", async () => {
    const { result, rerender } = renderHook(() => useKanbanData());
    mockStatus = "connected";
    rerender();

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.moveCard("card-001", "done", 5));

    expect(result.current.cards[0].column).toBe("done");
    expect(result.current.cards[0].order).toBe(5);
    expect(mockWriteFile).toHaveBeenCalledWith(
      "cards/card-001.json",
      expect.objectContaining({ column: "done", order: 5 }),
      undefined,
    );
  });

  it("updateColumns optimistically updates and calls writeFile", async () => {
    const { result, rerender } = renderHook(() => useKanbanData());
    mockStatus = "connected";
    rerender();

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const newCols: KanbanColumn[] = [{ id: "backlog", name: "Backlog", order: 0 }];

    act(() => result.current.updateColumns(newCols));

    expect(result.current.columns).toEqual(newCols);
    expect(mockWriteFile).toHaveBeenCalledWith("columns.json", {
      columns: newCols,
    });
  });

  it("passes through status from useWebSocket", () => {
    mockStatus = "connecting";
    const { result, rerender } = renderHook(() => useKanbanData());
    expect(result.current.status).toBe("connecting");

    mockStatus = "connected";
    rerender();
    expect(result.current.status).toBe("connected");
  });

  it("rolls back optimistic column update on validation error", async () => {
    const { result, rerender } = renderHook(() => useKanbanData());
    mockStatus = "connected";
    rerender();

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const originalColumns = result.current.columns;
    const badColumns: KanbanColumn[] = [{ id: "x", name: "", order: 0 }];

    act(() => result.current.updateColumns(badColumns));
    expect(result.current.columns).toEqual(badColumns);

    // Server rejects
    act(() =>
      emitEvent({
        type: "validation:error",
        template: "kanban",
        file: "columns.json",
        errors: [
          {
            keyword: "minLength",
            message: "too short",
            instancePath: "/columns/0/name",
            schemaPath: "",
            params: {},
          },
        ],
      }),
    );

    // Should restore previous columns
    expect(result.current.columns).toEqual(originalColumns);
  });

  it("createCard does not apply optimistic update when disconnected", async () => {
    const { result, rerender } = renderHook(() => useKanbanData());
    mockStatus = "connected";
    rerender();

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Simulate disconnected writeFile
    mockWriteFile.mockReturnValueOnce(false);

    const newCard: KanbanCard = {
      id: "card-phantom",
      title: "Phantom card",
      column: "todo",
      createdAt: "2026-03-21T00:00:00Z",
    };

    act(() => result.current.createCard(newCard));

    // Card should NOT appear — writeFile returned false
    expect(result.current.cards).toHaveLength(2);
    expect(result.current.cards.find((c) => c.id === "card-phantom")).toBeUndefined();
  });

  it("updateCard does not apply optimistic update when disconnected", async () => {
    const { result, rerender } = renderHook(() => useKanbanData());
    mockStatus = "connected";
    rerender();

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    mockWriteFile.mockReturnValueOnce(false);

    const updated: KanbanCard = {
      ...sampleCards[0],
      title: "Phantom update",
    };

    act(() => result.current.updateCard(updated));

    // Title should remain unchanged — writeFile returned false
    expect(result.current.cards[0].title).toBe("First card");
  });

  it("deleteCard does not apply optimistic update when disconnected", async () => {
    const { result, rerender } = renderHook(() => useKanbanData());
    mockStatus = "connected";
    rerender();

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Simulate disconnected deleteFile
    mockDeleteFile.mockReturnValueOnce(false);

    act(() => result.current.deleteCard("card-001"));

    // Card should still be there — deleteFile returned false
    expect(result.current.cards).toHaveLength(2);
    expect(result.current.cards.find((c) => c.id === "card-001")).toBeDefined();
  });

  it("updateColumns does not apply optimistic update when disconnected", async () => {
    const { result, rerender } = renderHook(() => useKanbanData());
    mockStatus = "connected";
    rerender();

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    mockWriteFile.mockReturnValueOnce(false);
    const originalColumns = result.current.columns;

    act(() => result.current.updateColumns([{ id: "x", name: "X", order: 0 }]));

    // Columns should not change
    expect(result.current.columns).toEqual(originalColumns);
  });

  // --- Error records ---

  it("fetches persisted errors from /api/kanban/errors on connect", async () => {
    const persistedErrors = [
      {
        template: "kanban",
        file: "cards/old-error.json",
        entity: "card",
        timestamp: "2026-03-20T00:00:00Z",
        rejectedData: { id: "old", title: 999 },
        errors: [
          {
            keyword: "type",
            message: "must be string",
            instancePath: "/title",
            schemaPath: "",
            params: {},
          },
        ],
      },
    ];

    vi.stubGlobal(
      "fetch",
      vi.fn((url: string) => {
        if (url.includes("/errors")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(persistedErrors),
          });
        }
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              data: {
                cards: [...sampleCards],
                columns: { columns: [...sampleColumns] },
              },
            }),
        });
      }),
    );

    const { result, rerender } = renderHook(() => useKanbanData());
    mockStatus = "connected";
    rerender();

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.errorRecords).toHaveLength(1);
    expect(result.current.errorRecords[0].file).toBe("cards/old-error.json");
    expect(result.current.errorRecords[0].rejectedData).toEqual({ id: "old", title: 999 });
  });

  it("adds error to errorRecords on validation:error event", async () => {
    const { result, rerender } = renderHook(() => useKanbanData());
    mockStatus = "connected";
    rerender();

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() =>
      emitEvent({
        type: "validation:error",
        template: "kanban",
        file: "cards/bad.json",
        errors: [
          {
            keyword: "required",
            message: "missing title",
            instancePath: "",
            schemaPath: "",
            params: {},
          },
        ],
      }),
    );

    expect(result.current.errorRecords).toHaveLength(1);
    expect(result.current.errorRecords[0].file).toBe("cards/bad.json");
  });

  it("clears errorRecords for a file on file:created event", async () => {
    const { result, rerender } = renderHook(() => useKanbanData());
    mockStatus = "connected";
    rerender();

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Add an error
    act(() =>
      emitEvent({
        type: "validation:error",
        template: "kanban",
        file: "cards/fixable.json",
        errors: [
          {
            keyword: "type",
            message: "bad type",
            instancePath: "/title",
            schemaPath: "",
            params: {},
          },
        ],
      }),
    );
    expect(result.current.errorRecords).toHaveLength(1);

    // Clear it with a successful write
    act(() =>
      emitEvent({
        type: "file:created",
        template: "kanban",
        entity: "card",
        file: "cards/fixable.json",
        data: { id: "fixable", title: "Fixed", column: "todo", createdAt: "2026-03-21T00:00:00Z" },
        source: "agent",
      }),
    );

    expect(result.current.errorRecords).toHaveLength(0);
  });

  it("clears errorRecords for a file on file:updated event", async () => {
    const { result, rerender } = renderHook(() => useKanbanData());
    mockStatus = "connected";
    rerender();

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() =>
      emitEvent({
        type: "validation:error",
        template: "kanban",
        file: "cards/fixable.json",
        errors: [
          {
            keyword: "type",
            message: "bad type",
            instancePath: "/title",
            schemaPath: "",
            params: {},
          },
        ],
      }),
    );
    expect(result.current.errorRecords).toHaveLength(1);

    act(() =>
      emitEvent({
        type: "file:updated",
        template: "kanban",
        entity: "card",
        file: "cards/fixable.json",
        data: { id: "fixable", title: "Fixed", column: "todo", createdAt: "2026-03-21T00:00:00Z" },
        source: "agent",
      }),
    );

    expect(result.current.errorRecords).toHaveLength(0);
  });

  it("dismissError removes error from errorRecords", async () => {
    const { result, rerender } = renderHook(() => useKanbanData());
    mockStatus = "connected";
    rerender();

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() =>
      emitEvent({
        type: "validation:error",
        template: "kanban",
        file: "cards/dismissed.json",
        errors: [
          { keyword: "type", message: "bad", instancePath: "/title", schemaPath: "", params: {} },
        ],
      }),
    );
    expect(result.current.errorRecords).toHaveLength(1);

    act(() => result.current.dismissError("cards/dismissed.json"));
    expect(result.current.errorRecords).toHaveLength(0);
  });

  it("replaces existing error for same file on new validation:error", async () => {
    const { result, rerender } = renderHook(() => useKanbanData());
    mockStatus = "connected";
    rerender();

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() =>
      emitEvent({
        type: "validation:error",
        template: "kanban",
        file: "cards/retry.json",
        errors: [
          {
            keyword: "type",
            message: "first attempt",
            instancePath: "/title",
            schemaPath: "",
            params: {},
          },
        ],
      }),
    );

    act(() =>
      emitEvent({
        type: "validation:error",
        template: "kanban",
        file: "cards/retry.json",
        errors: [
          {
            keyword: "required",
            message: "second attempt",
            instancePath: "/column",
            schemaPath: "",
            params: {},
          },
        ],
      }),
    );

    expect(result.current.errorRecords).toHaveLength(1);
    expect(result.current.errorRecords[0].errors[0].message).toBe("second attempt");
  });

  it("handles /api/kanban/errors fetch failure gracefully", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((url: string) => {
        if (url.includes("/errors")) {
          return Promise.resolve({ ok: false, status: 500 });
        }
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              data: {
                cards: [...sampleCards],
                columns: { columns: [...sampleColumns] },
              },
            }),
        });
      }),
    );

    const { result, rerender } = renderHook(() => useKanbanData());
    mockStatus = "connected";
    rerender();

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.errorRecords).toEqual([]);
    // Data should still load fine
    expect(result.current.cards).toEqual(sampleCards);
  });

  it("stamps _seq on WS validation errors", async () => {
    const { result, rerender } = renderHook(() => useKanbanData());
    mockStatus = "connected";
    rerender();

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() =>
      emitEvent({
        type: "validation:error",
        template: "kanban",
        file: "cards/seq-test.json",
        errors: [
          { keyword: "type", message: "bad", instancePath: "/title", schemaPath: "", params: {} },
        ],
      }),
    );

    expect(result.current.errorRecords[0]._seq).toBeDefined();
    expect(typeof result.current.errorRecords[0]._seq).toBe("number");
  });

  it("increments _seq for repeated errors on same file", async () => {
    const { result, rerender } = renderHook(() => useKanbanData());
    mockStatus = "connected";
    rerender();

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() =>
      emitEvent({
        type: "validation:error",
        template: "kanban",
        file: "cards/repeat.json",
        errors: [
          { keyword: "type", message: "first", instancePath: "/title", schemaPath: "", params: {} },
        ],
      }),
    );
    const firstSeq = result.current.errorRecords[0]._seq;

    act(() =>
      emitEvent({
        type: "validation:error",
        template: "kanban",
        file: "cards/repeat.json",
        errors: [
          {
            keyword: "type",
            message: "second",
            instancePath: "/title",
            schemaPath: "",
            params: {},
          },
        ],
      }),
    );
    const secondSeq = result.current.errorRecords[0]._seq;

    expect(secondSeq).toBeDefined();
    expect(secondSeq).toBeGreaterThan(firstSeq ?? -1);
    expect(result.current.errorRecords).toHaveLength(1);
  });
});

describe("moveCardBatch", () => {
  function setupWithOrderedCards() {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              data: {
                cards: [...orderedCards],
                columns: { columns: [...sampleColumns] },
              },
            }),
        }),
      ),
    );
  }

  it("moves card to different column at position 0", async () => {
    setupWithOrderedCards();
    const { result, rerender } = renderHook(() => useKanbanData());
    mockStatus = "connected";
    rerender();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.moveCardBatch("a", "doing", 0));

    // Card "a" should now be in "doing" at position 0
    const movedCard = result.current.cards.find((c) => c.id === "a");
    expect(movedCard?.column).toBe("doing");
    expect(movedCard?.order).toBe(0);

    // "d" and "e" should shift to 1 and 2
    const d = result.current.cards.find((c) => c.id === "d");
    const e = result.current.cards.find((c) => c.id === "e");
    expect(d?.order).toBe(1);
    expect(e?.order).toBe(2);
  });

  it("moves card to different column at last position", async () => {
    setupWithOrderedCards();
    const { result, rerender } = renderHook(() => useKanbanData());
    mockStatus = "connected";
    rerender();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.moveCardBatch("a", "doing", 2));

    const movedCard = result.current.cards.find((c) => c.id === "a");
    expect(movedCard?.column).toBe("doing");
    expect(movedCard?.order).toBe(2);

    // "d" and "e" keep their positions 0 and 1
    const d = result.current.cards.find((c) => c.id === "d");
    const e = result.current.cards.find((c) => c.id === "e");
    expect(d?.order).toBe(0);
    expect(e?.order).toBe(1);
  });

  it("moves card to different column at middle position", async () => {
    setupWithOrderedCards();
    const { result, rerender } = renderHook(() => useKanbanData());
    mockStatus = "connected";
    rerender();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.moveCardBatch("a", "doing", 1));

    const movedCard = result.current.cards.find((c) => c.id === "a");
    expect(movedCard?.column).toBe("doing");
    expect(movedCard?.order).toBe(1);

    const d = result.current.cards.find((c) => c.id === "d");
    const e = result.current.cards.find((c) => c.id === "e");
    expect(d?.order).toBe(0);
    expect(e?.order).toBe(2);
  });

  it("reorders card within same column (move down)", async () => {
    setupWithOrderedCards();
    const { result, rerender } = renderHook(() => useKanbanData());
    mockStatus = "connected";
    rerender();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Move "a" (order 0) to position 2 within "todo"
    act(() => result.current.moveCardBatch("a", "todo", 2));

    const a = result.current.cards.find((c) => c.id === "a");
    const b = result.current.cards.find((c) => c.id === "b");
    const c = result.current.cards.find((c) => c.id === "c");
    expect(b?.order).toBe(0);
    expect(c?.order).toBe(1);
    expect(a?.order).toBe(2);
  });

  it("reorders card within same column (move up)", async () => {
    setupWithOrderedCards();
    const { result, rerender } = renderHook(() => useKanbanData());
    mockStatus = "connected";
    rerender();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Move "c" (order 2) to position 0 within "todo"
    act(() => result.current.moveCardBatch("c", "todo", 0));

    const a = result.current.cards.find((c) => c.id === "a");
    const b = result.current.cards.find((c) => c.id === "b");
    const c = result.current.cards.find((c) => c.id === "c");
    expect(c?.order).toBe(0);
    expect(a?.order).toBe(1);
    expect(b?.order).toBe(2);
  });

  it("calls writeFile for all affected cards", async () => {
    setupWithOrderedCards();
    const { result, rerender } = renderHook(() => useKanbanData());
    mockStatus = "connected";
    rerender();
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    mockWriteFile.mockClear();

    // Move "a" from todo to doing at position 0
    // Affected: "a" (moved), "d" (order 0→1), "e" (order 1→2), "c" (order 2→1 in source)
    act(() => result.current.moveCardBatch("a", "doing", 0));

    // Should have written for "a", "d", "e", and "c"
    expect(mockWriteFile.mock.calls.length).toBeGreaterThanOrEqual(3);
    const writtenFiles = mockWriteFile.mock.calls.map((c: unknown[]) => c[0]);
    expect(writtenFiles).toContain("cards/a.json");
    expect(writtenFiles).toContain("cards/d.json");
    expect(writtenFiles).toContain("cards/e.json");
  });

  it("is a no-op for non-existent card", async () => {
    setupWithOrderedCards();
    const { result, rerender } = renderHook(() => useKanbanData());
    mockStatus = "connected";
    rerender();
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    mockWriteFile.mockClear();

    act(() => result.current.moveCardBatch("nonexistent", "doing", 0));

    expect(mockWriteFile).not.toHaveBeenCalled();
  });

  it("moves card to empty column", async () => {
    setupWithOrderedCards();
    const { result, rerender } = renderHook(() => useKanbanData());
    mockStatus = "connected";
    rerender();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Move "a" to "done" (empty column) at position 0
    act(() => result.current.moveCardBatch("a", "done", 0));

    const movedCard = result.current.cards.find((c) => c.id === "a");
    expect(movedCard?.column).toBe("done");
    expect(movedCard?.order).toBe(0);
  });
});
