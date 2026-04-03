import {
  Badge,
  Button,
  cn,
  Skeleton,
} from "@campshell/ui-components";
import { Pin, Calendar, FileText } from "lucide-react";
import type { Note, Tag } from "../types.js";

interface NotesViewProps {
  notes: Note[];
  tags: Tag[];
  isLoading: boolean;
  onSelectNote: (noteId: string) => void;
  onCreateNote: () => void;
}

export const NOTE_TYPE_LABELS: Record<string, string> = {
  daily: "Daily",
  meeting: "Meeting",
  project: "Project",
  book: "Book",
  article: "Article",
  research: "Research",
  reference: "Reference",
  general: "General",
};

export const STATUS_COLORS: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  "in-progress": "bg-[var(--info-muted)] text-info",
  review: "bg-[var(--warning-muted)] text-warning",
  published: "bg-[var(--success-muted)] text-success",
  archived: "bg-muted text-muted-foreground",
};

export const TAG_COLORS: Record<string, string> = {
  red: "bg-[var(--destructive-muted)] text-destructive",
  orange: "bg-orange-500/15 text-orange-700",
  yellow: "bg-[var(--warning-muted)] text-warning",
  green: "bg-[var(--success-muted)] text-success",
  blue: "bg-[var(--info-muted)] text-info",
  purple: "bg-purple-500/15 text-purple-700",
  gray: "bg-muted text-muted-foreground",
};

function sortNotes(notes: Note[]): Note[] {
  return [...notes].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return b.createdAt.localeCompare(a.createdAt);
  });
}

export function TagBadge({ tagId, tags }: { tagId: string; tags: Tag[] }) {
  const tag = tags.find((t) => t.id === tagId);
  if (!tag) return <Badge variant="outline" className="text-[10px] font-normal px-1.5 py-0 h-5">{tagId}</Badge>;
  return (
    <Badge
      variant="secondary"
      className={cn("text-[10px] font-normal px-1.5 py-0 h-5", tag.color && TAG_COLORS[tag.color])}
    >
      {tag.name}
    </Badge>
  );
}

export function NotesView({
  notes,
  tags,
  isLoading,
  onSelectNote,
  onCreateNote,
}: NotesViewProps) {
  const sorted = sortNotes(notes);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center gap-4">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-2">
          <FileText className="w-8 h-8 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-medium">No notes yet</h2>
          <p className="text-muted-foreground text-sm max-w-sm">
            Start building your knowledge base by creating your first note.
          </p>
        </div>
        <Button onClick={onCreateNote}>Create your first note</Button>
      </div>
    );
  }

  const pinnedNotes = sorted.filter((n) => n.pinned);
  const otherNotes = sorted.filter((n) => !n.pinned);

  const NoteCard = ({ note }: { note: Note }) => (
    <div
      onClick={() => onSelectNote(note.id)}
      className="group flex flex-col gap-3 p-5 rounded-xl border border-border/50 bg-card hover:bg-muted/30 hover:border-border/80 transition-all cursor-pointer overflow-hidden"
    >
      <div className="flex items-start justify-between gap-4">
        <h3 className="font-medium leading-tight line-clamp-2 group-hover:text-primary transition-colors">
          {note.title || "Untitled"}
        </h3>
        {note.pinned && (
          <Pin className="w-4 h-4 text-muted-foreground shrink-0 fill-muted-foreground/20" />
        )}
      </div>

      <p className="text-sm text-muted-foreground line-clamp-2 flex-1">
        {note.summary || note.content || "No content"}
      </p>

      <div className="flex items-center justify-between mt-auto pt-2">
        <div className="flex flex-wrap gap-1.5 overflow-hidden max-h-6">
          {note.tagIds?.slice(0, 3).map((tid) => (
            <TagBadge key={tid} tagId={tid} tags={tags} />
          ))}
          {(note.tagIds?.length ?? 0) > 3 && (
            <Badge variant="outline" className="text-[10px] font-normal px-1.5 py-0 h-5">
              +{(note.tagIds?.length ?? 0) - 3}
            </Badge>
          )}
        </div>
        {note.date && (
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground shrink-0">
            <Calendar className="w-3 h-3" />
            {note.date}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 pb-10">
      {pinnedNotes.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Pin className="w-4 h-4" />
            Pinned
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pinnedNotes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        </div>
      )}

      {otherNotes.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Recent
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {otherNotes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
