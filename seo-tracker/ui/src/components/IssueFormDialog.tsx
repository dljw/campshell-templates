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
import type { Issue, IssuePriority, IssueStatus, IssueType } from "../types.js";

interface IssueFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  issue: Issue | null;
  domainId?: string | null;
  onSave: (issue: Issue) => void;
}

export function IssueFormDialog({ open, onOpenChange, issue, domainId, onSave }: IssueFormDialogProps) {
  const [title, setTitle] = useState("");
  const [issueType, setIssueType] = useState<IssueType>("other");
  const [affectedPage, setAffectedPage] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<IssuePriority>("medium");
  const [status, setStatus] = useState<IssueStatus>("open");

  useEffect(() => {
    if (open) {
      setTitle(issue?.title ?? "");
      setIssueType(issue?.issueType ?? "other");
      setAffectedPage(issue?.affectedPage ?? "");
      setDescription(issue?.description ?? "");
      setPriority(issue?.priority ?? "medium");
      setStatus(issue?.status ?? "open");
    }
  }, [open, issue]);

  const handleSubmit = () => {
    if (!title.trim()) return;

    const now = new Date().toISOString();
    const data: Issue = {
      id: issue?.id ?? crypto.randomUUID().slice(0, 36).replace(/[^a-z0-9-]/g, ""),
      createdAt: issue?.createdAt ?? now,
      updatedAt: now,
      title: title.trim(),
      issueType,
      ...(affectedPage && { affectedPage }),
      ...(description && { description }),
      priority,
      status,
      ...(domainId ? { domainId } : issue?.domainId ? { domainId: issue.domainId } : {}),
    };

    onSave(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{issue ? "Edit Issue" : "Report Issue"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief description of the issue"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={issueType} onValueChange={(v) => setIssueType(v as IssueType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="speed">Speed</SelectItem>
                  <SelectItem value="mobile">Mobile</SelectItem>
                  <SelectItem value="indexing">Indexing</SelectItem>
                  <SelectItem value="structure">Structure</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as IssuePriority)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as IssueStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="affectedPage">Affected Page URL</Label>
            <Input
              id="affectedPage"
              value={affectedPage}
              onChange={(e) => setAffectedPage(e.target.value)}
              placeholder="https://example.com/page"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description of the issue..."
              rows={4}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!title.trim()}>
            {issue ? "Save Changes" : "Report Issue"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
