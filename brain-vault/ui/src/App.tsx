import { useEffect, useState } from "react";
import { Button } from "@campshell/ui-components";
import { FileText, Tags, Plus } from "lucide-react";
import type { UseBrainVaultDataReturn } from "./hooks/useBrainVaultData.js";
import { NotesView } from "./components/NotesView.js";
import { TagsView } from "./components/TagsView.js";
import { ConnectionStatus } from "./components/ConnectionStatus.js";
import { NoteDetailPage } from "./components/NoteDetailPage.js";

interface AppProps {
  data: UseBrainVaultDataReturn;
}

type PageState =
  | { view: "notes" }
  | { view: "tags" }
  | { view: "detail"; noteId: string; isEditing?: boolean };

export function App({ data }: AppProps) {
  const [page, setPage] = useState<PageState>({ view: "notes" });

  // Redirect to list if the viewed note no longer exists
  const detailNote =
    page.view === "detail"
      ? data.notes.find((n) => n.id === page.noteId)
      : undefined;

  useEffect(() => {
    if (page.view === "detail" && !detailNote) {
      setPage({ view: "notes" });
    }
  }, [page, detailNote]);

  const handleCreateNote = () => {
    const newNoteId = crypto.randomUUID();
    data.createNote({
      id: newNoteId,
      title: "Untitled",
      createdAt: new Date().toISOString(),
      content: "",
      type: "general",
      status: "draft",
    });
    setPage({ view: "detail", noteId: newNoteId, isEditing: true });
  };

  if (page.view === "detail" && detailNote) {
    return (
      <>
        <NoteDetailPage
          key={detailNote.id}
          note={detailNote}
          notes={data.notes}
          tags={data.tags}
          initialIsEditing={page.isEditing}
          onBack={() => setPage({ view: "notes" })}
          onNavigateToNote={(id) => setPage({ view: "detail", noteId: id })}
          onDeleteNote={(id) => {
            if (data.deleteNote(id)) {
              setPage({ view: "notes" });
            }
          }}
          onUpdateNote={data.updateNote}
        />
        <ConnectionStatus status={data.status} />
      </>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      {/* Clean Top Nav */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border/40 shrink-0">
        <div className="flex items-center gap-6">
          <h1 className="text-lg font-semibold tracking-tight">Vault</h1>
          <nav className="flex items-center gap-2">
            <Button
              variant={page.view === "notes" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setPage({ view: "notes" })}
              className="gap-2"
            >
              <FileText className="w-4 h-4" />
              Notes
            </Button>
            <Button
              variant={page.view === "tags" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setPage({ view: "tags" })}
              className="gap-2"
            >
              <Tags className="w-4 h-4" />
              Tags
            </Button>
          </nav>
        </div>
        <Button size="sm" onClick={handleCreateNote} className="gap-2">
          <Plus className="w-4 h-4" />
          New Note
        </Button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-5xl mx-auto">
          {page.view === "notes" && (
            <NotesView
              notes={data.notes}
              tags={data.tags}
              isLoading={data.isLoading}
              onSelectNote={(id) => setPage({ view: "detail", noteId: id })}
              onCreateNote={handleCreateNote}
            />
          )}
          {page.view === "tags" && (
            <TagsView
              tags={data.tags}
              isLoading={data.isLoading}
              onUpdateTags={data.updateTags}
            />
          )}
        </div>
      </main>

      <ConnectionStatus status={data.status} />
    </div>
  );
}
