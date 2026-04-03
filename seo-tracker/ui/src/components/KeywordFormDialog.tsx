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
import type { Keyword, KeywordIntent, KeywordStatus, Page } from "../types.js";

interface KeywordFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  keyword: Keyword | null;
  pages: Page[];
  onSave: (keyword: Keyword) => void;
}

export function KeywordFormDialog({
  open,
  onOpenChange,
  keyword,
  pages,
  onSave,
}: KeywordFormDialogProps) {
  const [term, setTerm] = useState("");
  const [pageId, setPageId] = useState("");
  const [position, setPosition] = useState("");
  const [previousPosition, setPreviousPosition] = useState("");
  const [searchVolume, setSearchVolume] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [intent, setIntent] = useState<KeywordIntent | "">("");
  const [status, setStatus] = useState<KeywordStatus>("tracking");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open) {
      setTerm(keyword?.term ?? "");
      setPageId(keyword?.pageId ?? "");
      setPosition(keyword?.position?.toString() ?? "");
      setPreviousPosition(keyword?.previousPosition?.toString() ?? "");
      setSearchVolume(keyword?.searchVolume?.toString() ?? "");
      setDifficulty(keyword?.difficulty?.toString() ?? "");
      setIntent(keyword?.intent ?? "");
      setStatus(keyword?.status ?? "tracking");
      setNotes(keyword?.notes ?? "");
    }
  }, [open, keyword]);

  const handleSubmit = () => {
    if (!term.trim()) return;

    const now = new Date().toISOString();
    const data: Keyword = {
      id: keyword?.id ?? crypto.randomUUID().slice(0, 36).replace(/[^a-z0-9-]/g, ""),
      createdAt: keyword?.createdAt ?? now,
      updatedAt: now,
      term: term.trim(),
      ...(pageId && { pageId }),
      ...(position && { position: Number.parseInt(position) }),
      ...(previousPosition && { previousPosition: Number.parseInt(previousPosition) }),
      ...(searchVolume && { searchVolume: Number.parseInt(searchVolume) }),
      ...(difficulty && { difficulty: Number.parseInt(difficulty) }),
      ...(intent && { intent }),
      status,
      ...(notes && { notes }),
    };

    onSave(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{keyword ? "Edit Keyword" : "Add Keyword"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="space-y-2">
            <Label htmlFor="term">Search Term</Label>
            <Input
              id="term"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="e.g. best project management tool"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                type="number"
                min={0}
                max={999}
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="0-999"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prevPosition">Previous Position</Label>
              <Input
                id="prevPosition"
                type="number"
                min={0}
                max={999}
                value={previousPosition}
                onChange={(e) => setPreviousPosition(e.target.value)}
                placeholder="0-999"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="volume">Search Volume</Label>
              <Input
                id="volume"
                type="number"
                min={0}
                value={searchVolume}
                onChange={(e) => setSearchVolume(e.target.value)}
                placeholder="Monthly searches"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty (0-100)</Label>
              <Input
                id="difficulty"
                type="number"
                min={0}
                max={100}
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                placeholder="0-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Intent</Label>
              <Select value={intent} onValueChange={(v) => setIntent(v as KeywordIntent)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select intent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="informational">Informational</SelectItem>
                  <SelectItem value="navigational">Navigational</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="transactional">Transactional</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as KeywordStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tracking">Tracking</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="achieved">Achieved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {pages.length > 0 && (
            <div className="space-y-2">
              <Label>Target Page</Label>
              <Select value={pageId} onValueChange={setPageId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a page" />
                </SelectTrigger>
                <SelectContent>
                  {pages.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

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
          <Button onClick={handleSubmit} disabled={!term.trim()}>
            {keyword ? "Save Changes" : "Add Keyword"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
