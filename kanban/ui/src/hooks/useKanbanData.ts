import type { ServerMessage, WriteMeta } from "@campshell/core";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ValidationErrorDetail } from "../types.js";
import { type ValidationError, useWebSocket } from "./useWebSocket.js";

export interface KanbanCard {
  id: string;
  title: string;
  column: string;
  createdAt: string;
  description?: string;
  labels?: string[];
  priority?: "low" | "medium" | "high" | "urgent";
  dueDate?: string;
  assignee?: string;
  order?: number;
  updatedAt?: string;
}

export interface KanbanColumn {
  id: string;
  name: string;
  order: number;
  color?: string;
}

export interface UseKanbanDataReturn {
  cards: KanbanCard[];
  columns: KanbanColumn[];
  status: "connecting" | "connected" | "disconnected";
  isLoading: boolean;
  validationErrors: ValidationError[];
  errorRecords: ValidationErrorDetail[];
  createCard: (card: KanbanCard) => void;
  updateCard: (card: KanbanCard) => void;
  deleteCard: (cardId: string) => void;
  moveCard: (cardId: string, toColumn: string, order?: number) => void;
  moveCardBatch: (cardId: string, toColumn: string, newOrder: number) => void;
  updateColumns: (columns: KanbanColumn[]) => void;
  dismissError: (file: string) => void;
}

interface OptimisticEntry {
  type: "create" | "update" | "delete";
  previousCard: KanbanCard | null;
  previousColumns: KanbanColumn[] | null;
}

export function useKanbanData(apiBase = ""): UseKanbanDataReturn {
  const ws = useWebSocket({ template: "kanban" });
  const { status, writeFile, deleteFile, onFileEvent, validationErrors } = ws;

  const [cards, setCards] = useState<KanbanCard[]>([]);
  const [columns, setColumns] = useState<KanbanColumn[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorRecords, setErrorRecords] = useState<ValidationErrorDetail[]>([]);

  const optimisticRef = useRef(new Map<string, OptimisticEntry>());
  const errorSeqRef = useRef(0);
  const cardsRef = useRef(cards);
  cardsRef.current = cards;
  const columnsRef = useRef(columns);
  columnsRef.current = columns;

  // Fetch initial data and persisted errors when connected
  useEffect(() => {
    if (status !== "connected") return;

    let cancelled = false;
    setIsLoading(true);

    Promise.all([
      fetch(`${apiBase}/api/kanban/data`)
        .then((r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return r.json();
        })
        .catch(() => null),
      fetch(`${apiBase}/api/kanban/errors`)
        .then((r) => (r.ok ? r.json() : []))
        .catch(() => []),
    ]).then(
      ([response, errors]: [
        { data?: { cards?: KanbanCard[]; columns?: { columns: KanbanColumn[] } } } | null,
        ValidationErrorDetail[],
      ]) => {
        if (cancelled) return;
        if (response) {
          const data = response.data;
          setCards(data?.cards ?? []);
          setColumns(data?.columns?.columns ?? []);
        }
        setErrorRecords(errors);
        setIsLoading(false);
      },
    );

    return () => {
      cancelled = true;
    };
  }, [status, apiBase]);

  // Handle WebSocket events
  useEffect(() => {
    const unsub = onFileEvent((event: ServerMessage) => {
      if (event.type === "error") return;

      // Handle validation errors — rollback optimistic updates and track error
      if (event.type === "validation:error") {
        const errorDetail: ValidationErrorDetail = {
          template: event.template,
          file: event.file,
          errors: event.errors.map((e) => ({
            keyword: e.keyword,
            message: e.message,
            instancePath: e.instancePath,
            params: e.params as Record<string, unknown> | undefined,
          })),
          _seq: ++errorSeqRef.current,
        };
        setErrorRecords((prev) => {
          const filtered = prev.filter((er) => er.file !== event.file);
          return [...filtered, errorDetail];
        });

        const entry = optimisticRef.current.get(event.file);
        if (entry) {
          optimisticRef.current.delete(event.file);
          if (entry.previousColumns) {
            // Rollback column update
            setColumns(entry.previousColumns);
          } else if (entry.type === "create") {
            // Remove the optimistically added card
            const cardId = event.file.replace("cards/", "").replace(".json", "");
            setCards((prev) => prev.filter((c) => c.id !== cardId));
          } else if (entry.type === "update" && entry.previousCard) {
            // Restore previous card state
            const prevCard = entry.previousCard;
            setCards((prev) => prev.map((c) => (c.id === prevCard.id ? prevCard : c)));
          } else if (entry.type === "delete" && entry.previousCard) {
            // Re-add the deleted card
            const prevCard = entry.previousCard;
            setCards((prev) => [...prev, prevCard]);
          }
        }
        return;
      }

      const isCard = "entity" in event && event.entity === "card";
      const isColumn = "entity" in event && event.entity === "column";

      if (event.type === "file:created" || event.type === "file:updated") {
        // Clear error records on successful write
        setErrorRecords((prev) => prev.filter((er) => er.file !== event.file));

        if (isCard) {
          const cardData = event.data as KanbanCard;
          const optimistic = optimisticRef.current.get(event.file);

          if (optimistic) {
            // Reconcile: replace optimistic data with server's authoritative version
            optimisticRef.current.delete(event.file);
            setCards((prev) => prev.map((c) => (c.id === cardData.id ? cardData : c)));
          } else {
            // External event: add or update
            setCards((prev) => {
              const idx = prev.findIndex((c) => c.id === cardData.id);
              if (idx >= 0) {
                const next = [...prev];
                next[idx] = cardData;
                return next;
              }
              return [...prev, cardData];
            });
          }
        } else if (isColumn) {
          const colData = event.data as { columns: KanbanColumn[] };
          optimisticRef.current.delete(event.file);
          setColumns(colData.columns);
        }
      } else if (event.type === "file:deleted") {
        if (isCard) {
          const cardId = event.file.replace("cards/", "").replace(".json", "");
          const optimistic = optimisticRef.current.get(event.file);
          if (optimistic) {
            optimisticRef.current.delete(event.file);
          }
          setCards((prev) => prev.filter((c) => c.id !== cardId));
        }
      }
    });

    return unsub;
  }, [onFileEvent]);

  const createCard = useCallback(
    (card: KanbanCard) => {
      const file = `cards/${card.id}.json`;
      if (!writeFile(file, card)) return;
      optimisticRef.current.set(file, {
        type: "create",
        previousCard: null,
        previousColumns: null,
      });
      setCards((prev) => [...prev, card]);
    },
    [writeFile],
  );

  const updateCard = useCallback(
    (card: KanbanCard, meta?: WriteMeta) => {
      const file = `cards/${card.id}.json`;
      if (!writeFile(file, card, meta)) return;
      const prev = cardsRef.current.find((c) => c.id === card.id) ?? null;
      optimisticRef.current.set(file, {
        type: "update",
        previousCard: prev,
        previousColumns: null,
      });
      setCards((prevCards) => prevCards.map((c) => (c.id === card.id ? card : c)));
    },
    [writeFile],
  );

  const deleteCardFn = useCallback(
    (cardId: string) => {
      const file = `cards/${cardId}.json`;
      if (!deleteFile(file)) return;
      const prev = cardsRef.current.find((c) => c.id === cardId) ?? null;
      optimisticRef.current.set(file, {
        type: "delete",
        previousCard: prev,
        previousColumns: null,
      });
      setCards((prevCards) => prevCards.filter((c) => c.id !== cardId));
    },
    [deleteFile],
  );

  const moveCard = useCallback(
    (cardId: string, toColumn: string, order?: number) => {
      const card = cardsRef.current.find((c) => c.id === cardId);
      if (!card) return;
      const updated: KanbanCard = {
        ...card,
        column: toColumn,
        ...(order !== undefined ? { order } : {}),
        updatedAt: new Date().toISOString(),
      };
      updateCard(updated);
    },
    [updateCard],
  );

  const moveCardBatch = useCallback(
    (cardId: string, toColumn: string, newOrder: number) => {
      const card = cardsRef.current.find((c) => c.id === cardId);
      if (!card) return;

      const now = new Date().toISOString();

      // Get target column cards (excluding moved card), sorted by order
      const targetCards = cardsRef.current
        .filter((c) => c.column === toColumn && c.id !== cardId)
        .sort(
          (a, b) => (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER),
        );

      // Insert moved card at newOrder position
      const movedCard: KanbanCard = {
        ...card,
        column: toColumn,
        order: newOrder,
        updatedAt: now,
      };
      const reorderedTarget = [...targetCards];
      reorderedTarget.splice(newOrder, 0, movedCard);

      // Reassign sequential orders and collect updates
      const updates: KanbanCard[] = [];
      for (let i = 0; i < reorderedTarget.length; i++) {
        const c = reorderedTarget[i];
        if (c.id === cardId || c.order !== i) {
          updates.push({ ...c, order: i, updatedAt: now });
        }
      }

      // Apply all updates through updateCard (optimistic + WebSocket)
      const isMovingColumns = card.column !== toColumn;
      for (const u of updates) {
        if (u.id === cardId && isMovingColumns) {
          const name = card.title || cardId;
          updateCard(u, { description: `Moved card "${name}" from ${card.column} to ${toColumn}` });
        } else if (u.id !== cardId) {
          updateCard(u, { silent: true });
        } else {
          updateCard(u);
        }
      }
    },
    [updateCard],
  );

  const updateColumnsFn = useCallback(
    (cols: KanbanColumn[]) => {
      const file = "columns.json";
      if (!writeFile(file, { columns: cols })) return;
      optimisticRef.current.set(file, {
        type: "update",
        previousCard: null,
        previousColumns: columnsRef.current,
      });
      setColumns(cols);
    },
    [writeFile],
  );

  const dismissError = useCallback((file: string) => {
    setErrorRecords((prev) => prev.filter((er) => er.file !== file));
  }, []);

  return {
    cards,
    columns,
    status,
    isLoading,
    validationErrors,
    errorRecords,
    createCard,
    updateCard,
    deleteCard: deleteCardFn,
    moveCard,
    moveCardBatch,
    updateColumns: updateColumnsFn,
    dismissError,
  };
}
