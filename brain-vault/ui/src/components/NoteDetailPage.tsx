import { useState, useEffect, useRef } from "react";
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
  ScrollArea,
  Separator,
  Textarea,
} from "@campshell/ui-components";
import { 
  ArrowLeft, 
  Trash2, 
  Edit3, 
  Check, 
  Pin, 
  Calendar, 
  Tag as TagIcon, 
  Link as LinkIcon,
  Settings2
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import type { Note, Tag } from "../types.js";
import {
  NOTE_TYPE_LABELS,
  STATUS_COLORS,
  TagBadge,
} from "./NotesView.js";
import { NoteFormDialog } from "./CreateNoteDialog.js";

interface NoteDetailPageProps {
  note: Note;
  notes: Note[];
  tags: Tag[];
  initialIsEditing?: boolean;
  onBack: () => void;
  onNavigateToNote: (noteId: string) => void;
  onDeleteNote: (noteId: string) => void;
  onUpdateNote: (note: Note) => void;
}

export function NoteDetailPage({
  note,
  notes,
  tags,
  initialIsEditing = false,
  onBack,
  onNavigateToNote,
  onDeleteNote,
  onUpdateNote,
}: NoteDetailPageProps) {
  const [isEditing, setIsEditing] = useState(initialIsEditing);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [propertiesDialogOpen, setPropertiesDialogOpen] = useState(false);

  // Local state for inline editing
  const [editTitle, setEditTitle] = useState(note.title);
  const [editContent, setEditContent] = useState(note.content || "");
  
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync local state when note changes from outside
  useEffect(() => {
    setEditTitle(note.title);
    setEditContent(note.content || "");
  }, [note.title, note.content]);

  // Auto-resize textarea
  useEffect(() => {
    if (isEditing && contentTextareaRef.current) {
      contentTextareaRef.current.style.height = "auto";
      contentTextareaRef.current.style.height = `${contentTextareaRef.current.scrollHeight}px`;
    }
  }, [isEditing, editContent]);

  const handleSave = () => {
    onUpdateNote({
      ...note,
      title: editTitle.trim() || "Untitled",
      content: editContent,
      updatedAt: new Date().toISOString(),
    });
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "s" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <div className="flex flex-col h-full bg-background" onKeyDown={handleKeyDown}>
      {/* Minimal Top Bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border/40 shrink-0">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-2 -ml-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <Button size="sm" onClick={handleSave} className="gap-2">
              <Check className="w-4 h-4" />
              Save
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="gap-2">
              <Edit3 className="w-4 h-4" />
              Edit
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-destructive"
            onClick={() => setConfirmDeleteOpen(true)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="max-w-3xl mx-auto px-6 py-12 space-y-8">
          
          {/* Header Section */}
          <div className="space-y-6">
            {/* Title */}
            <div className="relative">
              {note.pinned && (
                <Pin className="absolute -left-8 top-2 w-5 h-5 text-muted-foreground fill-muted-foreground/20" />
              )}
              {isEditing ? (
                <Textarea
                  value={editTitle}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditTitle(e.target.value)}
                  className="text-4xl font-bold border-none bg-transparent p-0 focus-visible:ring-0 resize-none overflow-hidden min-h-[3rem]"
                  placeholder="Note Title"
                  rows={1}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = "auto";
                    target.style.height = `${target.scrollHeight}px`;
                  }}
                />
              ) : (
                <h1 className="text-4xl font-bold tracking-tight text-foreground break-words">
                  {note.title || "Untitled"}
                </h1>
              )}
            </div>

            {/* Properties (Notion-style) */}
            <div className="flex flex-col gap-3 py-2 text-sm">
              {/* Type & Status */}
              <div className="flex items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-2 w-32 shrink-0">
                  <Settings2 className="w-4 h-4" />
                  <span>Properties</span>
                </div>
                <div className="flex items-center gap-2 flex-1">
                  {note.type && (
                    <Badge variant="outline" className="font-normal text-xs">
                      {NOTE_TYPE_LABELS[note.type] ?? note.type}
                    </Badge>
                  )}
                  {note.status && (
                    <Badge variant="secondary" className={cn("font-normal text-xs", STATUS_COLORS[note.status])}>
                      {note.status}
                    </Badge>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 text-xs ml-auto"
                    onClick={() => setPropertiesDialogOpen(true)}
                  >
                    Edit Properties
                  </Button>
                </div>
              </div>

              {/* Date */}
              {note.date && (
                <div className="flex items-center gap-4 text-muted-foreground">
                  <div className="flex items-center gap-2 w-32 shrink-0">
                    <Calendar className="w-4 h-4" />
                    <span>Date</span>
                  </div>
                  <span className="text-foreground">{note.date}</span>
                </div>
              )}

              {/* Tags */}
              {note.tagIds && note.tagIds.length > 0 && (
                <div className="flex items-center gap-4 text-muted-foreground">
                  <div className="flex items-center gap-2 w-32 shrink-0">
                    <TagIcon className="w-4 h-4" />
                    <span>Tags</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 flex-1">
                    {note.tagIds.map((tid) => (
                      <TagBadge key={tid} tagId={tid} tags={tags} />
                    ))}
                  </div>
                </div>
              )}

              {/* Linked Notes */}
              {note.linkedNoteIds && note.linkedNoteIds.length > 0 && (
                <div className="flex items-start gap-4 text-muted-foreground">
                  <div className="flex items-center gap-2 w-32 shrink-0 mt-0.5">
                    <LinkIcon className="w-4 h-4" />
                    <span>Links</span>
                  </div>
                  <div className="flex flex-col gap-1 flex-1">
                    {note.linkedNoteIds.map((nid) => {
                      const linked = notes.find((n) => n.id === nid);
                      return (
                        <button
                          type="button"
                          key={nid}
                          className="text-primary hover:underline text-left w-fit"
                          onClick={() => onNavigateToNote(nid)}
                        >
                          {linked?.title ?? nid}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            <Separator className="opacity-50" />
          </div>

          {/* Content Section */}
          <div className="min-h-[50vh]">
            {isEditing ? (
              <Textarea
                ref={contentTextareaRef}
                value={editContent}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditContent(e.target.value)}
                className="w-full min-h-[50vh] text-base border-none bg-transparent p-0 focus-visible:ring-0 resize-none leading-relaxed"
                placeholder="Start typing your note here... (Markdown supported)"
              />
            ) : (
              <div className="prose dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-muted/50 prose-pre:border prose-pre:border-border/50 text-foreground prose-headings:text-foreground prose-strong:text-foreground prose-a:text-primary marker:text-foreground">
                {note.content ? (
                  <ReactMarkdown>{note.content}</ReactMarkdown>
                ) : (
                  <p className="text-muted-foreground italic">Empty note. Click Edit to add content.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </ScrollArea>

      <NoteFormDialog
        open={propertiesDialogOpen}
        onOpenChange={setPropertiesDialogOpen}
        tags={tags}
        onSave={onUpdateNote}
        note={note}
      />

      <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete note</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{note.title}"? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={() => {
                setConfirmDeleteOpen(false);
                onDeleteNote(note.id);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
