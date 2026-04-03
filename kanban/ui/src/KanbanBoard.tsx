import {
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useCallback, useMemo, useState } from "react";
import { KanbanCard } from "./KanbanCard";
import { KanbanColumn } from "./KanbanColumn";
import type { Card, Column } from "./types";

/** Pure helper for computing drop position — exported for testing. */
export function computeDropPosition(
  activeCardId: string,
  overId: string,
  columnIds: Set<string>,
  cards: Card[],
  cardsByColumn: Map<string, Card[]>,
): { targetColumnId: string; newOrder: number } | null {
  if (columnIds.has(overId)) {
    // Dropped on column container — append to end (handles both empty and non-empty)
    const colCards = (cardsByColumn.get(overId) ?? []).filter((c) => c.id !== activeCardId);
    return { targetColumnId: overId, newOrder: colCards.length };
  }

  const overCard = cards.find((c) => c.id === overId);
  if (!overCard) return null;

  const targetColumnId = overCard.column;

  // Use UNFILTERED sorted list — matches @dnd-kit arrayMove semantics.
  // moveCardBatch splices into a filtered list, so passing the unfiltered
  // overIndex produces the correct arrayMove result.
  const columnCards = [...(cardsByColumn.get(targetColumnId) ?? [])].sort(
    (a, b) => (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER),
  );

  const overIndex = columnCards.findIndex((c) => c.id === overId);
  const newOrder = overIndex >= 0 ? overIndex : columnCards.length;

  return { targetColumnId, newOrder };
}

export interface KanbanBoardProps {
  columns: Column[];
  cards: Card[];
  onMoveCard?: (cardId: string, toColumn: string, newOrder: number) => void;
}

export function KanbanBoard({ columns, cards, onMoveCard }: KanbanBoardProps) {
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [overColumnId, setOverColumnId] = useState<string | null>(null);

  const sorted = useMemo(() => [...columns].sort((a, b) => a.order - b.order), [columns]);

  const cardsByColumn = useMemo(() => {
    const map = new Map<string, Card[]>();
    for (const col of sorted) {
      map.set(col.id, []);
    }
    for (const card of cards) {
      const arr = map.get(card.column);
      if (arr) arr.push(card);
    }
    return map;
  }, [sorted, cards]);

  const columnIds = useMemo(() => new Set(sorted.map((c) => c.id)), [sorted]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const findColumnForCard = useCallback(
    (cardId: string): string | undefined => {
      return cards.find((c) => c.id === cardId)?.column;
    },
    [cards],
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const id = event.active.id as string;
      setActiveCard(cards.find((c) => c.id === id) ?? null);
    },
    [cards],
  );

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { over } = event;
      if (!over) {
        setOverColumnId(null);
        return;
      }

      const overId = over.id as string;
      if (columnIds.has(overId)) {
        setOverColumnId(overId);
      } else {
        const col = findColumnForCard(overId);
        setOverColumnId(col ?? null);
      }
    },
    [columnIds, findColumnForCard],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      setActiveCard(null);
      setOverColumnId(null);

      if (!over || !onMoveCard) return;

      const activeCardId = active.id as string;
      const overId = over.id as string;

      const result = computeDropPosition(activeCardId, overId, columnIds, cards, cardsByColumn);
      if (!result) return;

      const { targetColumnId, newOrder } = result;

      // Don't fire if nothing changed
      const movedCard = cards.find((c) => c.id === activeCardId);
      if (movedCard && movedCard.column === targetColumnId && movedCard.order === newOrder) {
        return;
      }

      onMoveCard(activeCardId, targetColumnId, newOrder);
    },
    [onMoveCard, cards, cardsByColumn, columnIds],
  );

  const handleDragCancel = useCallback(() => {
    setActiveCard(null);
    setOverColumnId(null);
  }, []);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="kb-board">
        {sorted.map((col) => (
          <KanbanColumn
            key={col.id}
            column={col}
            cards={cardsByColumn.get(col.id) ?? []}
            isOver={overColumnId === col.id}
          />
        ))}
      </div>
      <DragOverlay dropAnimation={null}>
        {activeCard ? <KanbanCard card={activeCard} isOverlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}
