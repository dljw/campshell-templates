import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { SortableKanbanCard } from "./KanbanCard";
import type { Card, Column } from "./types";

export interface KanbanColumnProps {
  column: Column;
  cards: Card[];
  isOver?: boolean;
}

function sortCards(cards: Card[]): Card[] {
  return [...cards].sort((a, b) => {
    const orderA = a.order ?? Number.MAX_SAFE_INTEGER;
    const orderB = b.order ?? Number.MAX_SAFE_INTEGER;
    return orderA - orderB;
  });
}

export function KanbanColumn({ column, cards, isOver }: KanbanColumnProps) {
  const sorted = sortCards(cards);
  const cardIds = sorted.map((c) => c.id);

  const { setNodeRef } = useDroppable({ id: column.id });

  return (
    <div className={`kb-column ${isOver ? "kb-column--drag-over" : ""}`}>
      <div className="kb-column-header">
        <div className="kb-column-color" style={{ background: column.color ?? "#52525b" }} />
        <span className="kb-column-name">{column.name}</span>
        <span className="kb-column-count">{cards.length}</span>
      </div>

      <div ref={setNodeRef} className="kb-column-cards">
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          {sorted.length > 0 ? (
            sorted.map((card) => <SortableKanbanCard key={card.id} card={card} />)
          ) : (
            <div className="kb-column-empty">No cards yet</div>
          )}
        </SortableContext>
      </div>
    </div>
  );
}
