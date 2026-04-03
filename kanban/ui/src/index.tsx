import "./styles.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { KanbanBoard } from "./KanbanBoard";
import { ValidationPanel } from "./ValidationPanel";
import { ValidationToast } from "./ValidationToast";
import { useKanbanData } from "./hooks/useKanbanData";
import type { KanbanData, ValidationErrorDetail } from "./types";

export interface KanbanAppProps {
  data: KanbanData;
  onMoveCard?: (cardId: string, toColumn: string, newOrder: number) => void;
}

export function KanbanApp({ data, onMoveCard }: KanbanAppProps) {
  return <KanbanBoard columns={data.columns} cards={data.cards} onMoveCard={onMoveCard} />;
}

export interface KanbanDashboardProps {
  apiBase?: string;
}

export function KanbanDashboard({ apiBase }: KanbanDashboardProps) {
  const { cards, columns, isLoading, errorRecords, dismissError, moveCardBatch } =
    useKanbanData(apiBase);
  const [panelOpen, setPanelOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [toastQueue, setToastQueue] = useState<ValidationErrorDetail[]>([]);
  const prevSeqsRef = useRef(new Set<number>());

  // Sync toast queue with errorRecords: remove resolved, replace re-errors, add new
  useEffect(() => {
    const prevSeqs = prevSeqsRef.current;

    setToastQueue((prev) => {
      // Keep toasts that still have a matching error record
      let next = prev.filter((t) => errorRecords.some((e) => e.file === t.file));

      // Update existing toasts if _seq changed, add new ones
      for (const err of errorRecords) {
        if (err._seq !== undefined && !prevSeqs.has(err._seq)) {
          next = [...next.filter((t) => t.file !== err.file), err];
        }
      }

      return next;
    });

    prevSeqsRef.current = new Set(
      errorRecords.filter((e) => e._seq !== undefined).map((e) => e._seq as number),
    );
  }, [errorRecords]);

  const handleView = useCallback((file: string) => {
    setSelectedFile(file);
    setPanelOpen(true);
    setToastQueue((prev) => prev.filter((t) => t.file !== file));
  }, []);

  const handleDismissToast = useCallback((file: string) => {
    setToastQueue((prev) => prev.filter((t) => t.file !== file));
  }, []);

  const handleClosePanel = useCallback(() => {
    setPanelOpen(false);
    setSelectedFile(null);
  }, []);

  const handleOpenPanel = useCallback(() => {
    setPanelOpen(true);
    setSelectedFile(null);
  }, []);

  if (isLoading) {
    return <div className="kb-board" />;
  }

  return (
    <>
      <KanbanBoard columns={columns} cards={cards} onMoveCard={moveCardBatch} />
      {errorRecords.length > 0 && !panelOpen && (
        <button type="button" className="kb-error-indicator" onClick={handleOpenPanel}>
          {errorRecords.length} error{errorRecords.length !== 1 ? "s" : ""}
        </button>
      )}
      <ValidationToast toasts={toastQueue} onView={handleView} onDismiss={handleDismissToast} />
      {panelOpen && (
        <ValidationPanel
          errors={errorRecords}
          selectedFile={selectedFile}
          onClose={handleClosePanel}
          apiBase={apiBase}
        />
      )}
    </>
  );
}

export default KanbanDashboard;

export { KanbanBoard } from "./KanbanBoard";
export { KanbanColumn } from "./KanbanColumn";
export { KanbanCard, SortableKanbanCard } from "./KanbanCard";
export { ValidationToast } from "./ValidationToast";
export { ValidationPanel } from "./ValidationPanel";
export type { Card, Column, Priority, KanbanData, ValidationErrorDetail } from "./types";
export type { KanbanBoardProps } from "./KanbanBoard";
export type { KanbanColumnProps } from "./KanbanColumn";
export type { KanbanCardProps, SortableKanbanCardProps } from "./KanbanCard";
export type { ValidationToastProps } from "./ValidationToast";
export type { ValidationPanelProps } from "./ValidationPanel";
