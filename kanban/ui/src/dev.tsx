import { useState } from "react";
import { createRoot } from "react-dom/client";
import { KanbanApp } from "./index";
import type { Card, Column, KanbanData } from "./types";

import card1 from "../../defaults/cards/welcome-card-1.json";
import card2 from "../../defaults/cards/welcome-card-2.json";
import card3 from "../../defaults/cards/welcome-card-3.json";
import columnsData from "../../defaults/columns.json";

const columns: Column[] = columnsData.columns as Column[];

// Include seed cards plus extras to showcase all visual features
const initialCards: Card[] = [
  card1 as Card,
  card2 as Card,
  card3 as Card,
  {
    id: "dev-card-urgent",
    title: "Fix authentication bug",
    column: "in-progress",
    priority: "urgent",
    labels: ["backend", "security"],
    dueDate: "2026-03-19",
    assignee: "agent",
    order: 1,
    createdAt: "2026-03-18T10:00:00.000Z",
  },
  {
    id: "dev-card-done",
    title: "Set up CI pipeline",
    column: "done",
    priority: "medium",
    labels: ["infra"],
    assignee: "darren",
    order: 0,
    createdAt: "2026-03-17T08:00:00.000Z",
  },
  {
    id: "dev-card-review",
    title: "Review API design doc",
    column: "review",
    priority: "high",
    dueDate: "2026-03-25",
    order: 0,
    createdAt: "2026-03-20T14:00:00.000Z",
  },
];

function DevApp() {
  const [data, setData] = useState<KanbanData>({ columns, cards: initialCards });

  const handleMoveCard = (cardId: string, toColumn: string, newOrder: number) => {
    setData((prev) => {
      const card = prev.cards.find((c) => c.id === cardId);
      if (!card) return prev;

      const now = new Date().toISOString();
      const fromColumn = card.column;

      // Get target column cards (excluding moved card), sorted by order
      const targetCards = prev.cards
        .filter((c) => c.column === toColumn && c.id !== cardId)
        .sort(
          (a, b) => (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER),
        );

      // Insert moved card
      const movedCard: Card = { ...card, column: toColumn, order: newOrder, updatedAt: now };
      const reordered = [...targetCards];
      reordered.splice(newOrder, 0, movedCard);

      // Build updated cards map
      const updatedMap = new Map<string, Card>();
      for (let i = 0; i < reordered.length; i++) {
        updatedMap.set(reordered[i].id, { ...reordered[i], order: i, updatedAt: now });
      }

      // Re-order source column if cross-column
      if (fromColumn !== toColumn) {
        const sourceCards = prev.cards
          .filter((c) => c.column === fromColumn && c.id !== cardId)
          .sort(
            (a, b) => (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER),
          );
        for (let i = 0; i < sourceCards.length; i++) {
          if (sourceCards[i].order !== i) {
            updatedMap.set(sourceCards[i].id, { ...sourceCards[i], order: i, updatedAt: now });
          }
        }
      }

      const newCards = prev.cards.map((c) => updatedMap.get(c.id) ?? c);
      return { ...prev, cards: newCards };
    });
  };

  return <KanbanApp data={data} onMoveCard={handleMoveCard} />;
}

const el = document.getElementById("root");
if (!el) throw new Error("Missing #root element");
const root = createRoot(el);
root.render(<DevApp />);
