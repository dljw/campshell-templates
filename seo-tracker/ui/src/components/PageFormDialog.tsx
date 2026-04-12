import { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogContent,
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
  Textarea,
} from "@campshell/ui-components";
import type { ContentType, Page, PageStatus } from "../types.js";

interface PageFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  page: Page | null;
  domainId?: string | null;
  onSave: (page: Page) => void;
}

export function PageFormDialog({ open, onOpenChange, page, domainId, onSave }: PageFormDialogProps) {
  const [title, setTitle] = useState("");
  const [pageUrl, setPageUrl] = useState("");
  const [status, setStatus] = useState<PageStatus>("planned");
  const [contentType, setContentType] = useState<ContentType | "">("");
  const [wordCount, setWordCount] = useState("");
  const [publishDate, setPublishDate] = useState("");
  const [organicTraffic, setOrganicTraffic] = useState("");
  const [avgPosition, setAvgPosition] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open) {
      setTitle(page?.title ?? "");
      setPageUrl(page?.pageUrl ?? "");
      setStatus(page?.status ?? "planned");
      setContentType(page?.contentType ?? "");
      setWordCount(page?.wordCount?.toString() ?? "");
      setPublishDate(page?.publishDate ?? "");
      setOrganicTraffic(page?.organicTraffic?.toString() ?? "");
      setAvgPosition(page?.avgPosition?.toString() ?? "");
      setAssignedTo(page?.assignedTo ?? "");
      setNotes(page?.notes ?? "");
    }
  }, [open, page]);

  const handleSubmit = () => {
    if (!title.trim() || !pageUrl.trim()) return;

    const now = new Date().toISOString();
    const data: Page = {
      id: page?.id ?? crypto.randomUUID().slice(0, 36).replace(/[^a-z0-9-]/g, ""),
      createdAt: page?.createdAt ?? now,
      updatedAt: now,
      title: title.trim(),
      pageUrl: pageUrl.trim(),
      status,
      ...(contentType && { contentType }),
      ...(wordCount && { wordCount: Number.parseInt(wordCount) }),
      ...(publishDate && { publishDate }),
      ...(organicTraffic && { organicTraffic: Number.parseInt(organicTraffic) }),
      ...(avgPosition && { avgPosition: Number.parseFloat(avgPosition) }),
      ...(assignedTo && { assignedTo }),
      ...(notes && { notes }),
      ...(domainId ? { domainId } : page?.domainId ? { domainId: page.domainId } : {}),
    };

    onSave(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{page ? "Edit Page" : "Add Page"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Page title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pageUrl">URL</Label>
            <Input
              id="pageUrl"
              value={pageUrl}
              onChange={(e) => setPageUrl(e.target.value)}
              placeholder="https://example.com/page"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as PageStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="drafting">Drafting</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="needs-refresh">Needs Refresh</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Content Type</Label>
              <Select value={contentType} onValueChange={(v) => setContentType(v as ContentType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blog">Blog</SelectItem>
                  <SelectItem value="landing">Landing</SelectItem>
                  <SelectItem value="guide">Guide</SelectItem>
                  <SelectItem value="tool">Tool</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="wordCount">Word Count</Label>
              <Input
                id="wordCount"
                type="number"
                min={0}
                value={wordCount}
                onChange={(e) => setWordCount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="traffic">Organic Traffic</Label>
              <Input
                id="traffic"
                type="number"
                min={0}
                value={organicTraffic}
                onChange={(e) => setOrganicTraffic(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="avgPos">Avg Position</Label>
              <Input
                id="avgPos"
                type="number"
                min={0}
                max={999}
                step={0.1}
                value={avgPosition}
                onChange={(e) => setAvgPosition(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="publishDate">Publish Date</Label>
              <Input
                id="publishDate"
                type="date"
                value={publishDate}
                onChange={(e) => setPublishDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="assignedTo">Assigned To</Label>
              <Input
                id="assignedTo"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                placeholder="Name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes..."
              rows={2}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!title.trim() || !pageUrl.trim()}>
            {page ? "Save Changes" : "Add Page"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
