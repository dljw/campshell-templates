import { useState, useEffect } from "react";
import {
  Badge,
  Button,
  cn,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
} from "@campshell/ui-components";
import type { Note, NoteStatus, NoteType, Tag } from "../types.js";
import { TAG_COLORS } from "./NotesView.js";

interface NoteFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tags: Tag[];
  onSave: (note: Note) => void;
  note: Note;
}

const NOTE_TYPES: { value: NoteType; label: string }[] = [
  { value: "daily", label: "Daily" },
  { value: "meeting", label: "Meeting" },
  { value: "project", label: "Project" },
  { value: "book", label: "Book" },
  { value: "article", label: "Article" },
  { value: "research", label: "Research" },
  { value: "reference", label: "Reference" },
  { value: "general", label: "General" },
];

const NOTE_STATUSES: { value: NoteStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "in-progress", label: "In Progress" },
  { value: "review", label: "Review" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];

export function NoteFormDialog({
  open,
  onOpenChange,
  tags,
  onSave,
  note: existingNote,
}: NoteFormDialogProps) {
  const [type, setType] = useState<NoteType | "">(existingNote?.type ?? "");
  const [status, setStatus] = useState<NoteStatus | "">(existingNote?.status ?? "");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(existingNote?.tagIds ?? []);
  const [date, setDate] = useState(existingNote?.date ?? "");
  const [author, setAuthor] = useState(existingNote?.author ?? "");
  const [source, setSource] = useState(existingNote?.source ?? "");
  const [rating, setRating] = useState(existingNote?.rating !== undefined ? String(existingNote.rating) : "");
  const [pinned, setPinned] = useState(existingNote?.pinned ?? false);

  // Reset form when opened with a new note
  useEffect(() => {
    if (open) {
      setType(existingNote?.type ?? "");
      setStatus(existingNote?.status ?? "");
      setSelectedTagIds(existingNote?.tagIds ?? []);
      setDate(existingNote?.date ?? "");
      setAuthor(existingNote?.author ?? "");
      setSource(existingNote?.source ?? "");
      setRating(existingNote?.rating !== undefined ? String(existingNote.rating) : "");
      setPinned(existingNote?.pinned ?? false);
    }
  }, [open, existingNote]);

  function handleSubmit() {
    const updated: Note = {
      ...existingNote,
      updatedAt: new Date().toISOString(),
    };

    if (type) updated.type = type;
    if (status) updated.status = status;
    if (selectedTagIds.length > 0) updated.tagIds = selectedTagIds;
    if (date) updated.date = date;
    if (author.trim()) updated.author = author.trim();
    if (source.trim()) updated.source = source.trim();
    if (rating && !Number.isNaN(Number(rating))) {
      const r = Number.parseInt(rating, 10);
      if (r >= 0 && r <= 10) updated.rating = r;
    }
    updated.pinned = pinned;

    onSave(updated);
    onOpenChange(false);
  }

  function toggleTag(tagId: string) {
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId],
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Properties</DialogTitle>
          <DialogDescription>
            Update metadata for this note.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Type & Status row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={type}
                onValueChange={(v: string) => setType(v as NoteType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {NOTE_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={status}
                onValueChange={(v: string) => setStatus(v as NoteStatus)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {NOTE_STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Tags */}
          {tags.length > 0 && (
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-1">
                {tags.map((tag) => (
                  <button
                    type="button"
                    key={tag.id}
                    onClick={() => toggleTag(tag.id)}
                  >
                    <Badge
                      variant={
                        selectedTagIds.includes(tag.id)
                          ? "default"
                          : "outline"
                      }
                      className={cn(
                        "cursor-pointer text-xs font-normal",
                        selectedTagIds.includes(tag.id) &&
                          tag.color &&
                          TAG_COLORS[tag.color],
                      )}
                    >
                      {tag.name}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Date, Author, Source row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="note-date">Date</Label>
              <Input
                id="note-date"
                type="date"
                value={date}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setDate(e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="note-rating">Rating (0-10)</Label>
              <Input
                id="note-rating"
                type="number"
                min={0}
                max={10}
                value={rating}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setRating(e.target.value)
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="note-author">Author</Label>
              <Input
                id="note-author"
                value={author}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setAuthor(e.target.value)
                }
                placeholder="Author name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="note-source">Source</Label>
              <Input
                id="note-source"
                value={source}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSource(e.target.value)
                }
                placeholder="URL or citation"
              />
            </div>
          </div>

          {/* Pinned toggle */}
          <div className="flex items-center gap-2 pt-2">
            <Button
              type="button"
              variant={pinned ? "default" : "outline"}
              size="sm"
              onClick={() => setPinned(!pinned)}
              className="w-full"
            >
              {"\u{1F4CC}"} {pinned ? "Pinned" : "Pin this note"}
            </Button>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSubmit}>
            Save Properties
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
