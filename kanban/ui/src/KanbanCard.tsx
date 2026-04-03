import type { DraggableAttributes, DraggableSyntheticListeners } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type React from "react";
import type { Card, Priority } from "./types";

export interface KanbanCardProps {
  card: Card;
  isDragging?: boolean;
  isOverlay?: boolean;
  style?: React.CSSProperties;
  dndRef?: (node: HTMLElement | null) => void;
  dndAttributes?: DraggableAttributes;
  dndListeners?: DraggableSyntheticListeners;
}

const PRIORITY_CLASS: Record<Priority, string> = {
  urgent: "kb-priority-badge--urgent",
  high: "kb-priority-badge--high",
  medium: "kb-priority-badge--medium",
  low: "kb-priority-badge--low",
};

function formatDueDate(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00`);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function isOverdue(dateStr: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(`${dateStr}T00:00:00`);
  return due < today;
}

export function KanbanCard({
  card,
  isDragging,
  isOverlay,
  style,
  dndRef,
  dndAttributes,
  dndListeners,
}: KanbanCardProps) {
  const hasLabels = card.labels && card.labels.length > 0;
  const hasMeta = card.dueDate || card.assignee;

  const className = [
    "kb-card",
    isDragging ? "kb-card--dragging" : "",
    isOverlay ? "kb-card--overlay" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={dndRef} className={className} style={style} {...dndAttributes} {...dndListeners}>
      {card.priority && (
        <span className={`kb-priority-badge ${PRIORITY_CLASS[card.priority]}`}>
          <span className="kb-priority-dot" />
          {card.priority}
        </span>
      )}

      <div className="kb-card-title">{card.title}</div>

      {hasLabels && (
        <div className="kb-labels">
          {card.labels?.map((label) => (
            <span key={label} className="kb-label">
              {label}
            </span>
          ))}
        </div>
      )}

      {hasMeta && (
        <div className="kb-card-meta">
          {card.dueDate && (
            <span
              className={`kb-due-date ${isOverdue(card.dueDate) ? "kb-due-date--overdue" : ""}`}
            >
              {isOverdue(card.dueDate) ? "!" : "\u{1F4C5}"} {formatDueDate(card.dueDate)}
            </span>
          )}
          {card.assignee && (
            <span className="kb-assignee">
              {"\u{1F464}"} {card.assignee}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export interface SortableKanbanCardProps {
  card: Card;
}

export function SortableKanbanCard({ card }: SortableKanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <KanbanCard
      card={card}
      isDragging={isDragging}
      style={style}
      dndRef={setNodeRef}
      dndAttributes={attributes}
      dndListeners={listeners}
    />
  );
}
