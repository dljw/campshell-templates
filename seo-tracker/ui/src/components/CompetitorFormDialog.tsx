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
  Textarea,
} from "@campshell/ui-components";
import type { Competitor } from "../types.js";

interface CompetitorFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  competitor: Competitor | null;
  domainId?: string | null;
  onSave: (competitor: Competitor) => void;
}

export function CompetitorFormDialog({
  open,
  onOpenChange,
  competitor,
  domainId,
  onSave,
}: CompetitorFormDialogProps) {
  const [domain, setDomain] = useState("");
  const [estimatedTraffic, setEstimatedTraffic] = useState("");
  const [domainAuthority, setDomainAuthority] = useState("");
  const [topKeywordsStr, setTopKeywordsStr] = useState("");
  const [backlinkCount, setBacklinkCount] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open) {
      setDomain(competitor?.domain ?? "");
      setEstimatedTraffic(competitor?.estimatedTraffic?.toString() ?? "");
      setDomainAuthority(competitor?.domainAuthority?.toString() ?? "");
      setTopKeywordsStr(competitor?.topKeywords?.join(", ") ?? "");
      setBacklinkCount(competitor?.backlinkCount?.toString() ?? "");
      setNotes(competitor?.notes ?? "");
    }
  }, [open, competitor]);

  const handleSubmit = () => {
    if (!domain.trim()) return;

    const now = new Date().toISOString();
    const topKeywords = topKeywordsStr
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 20);

    const data: Competitor = {
      id: competitor?.id ?? crypto.randomUUID().slice(0, 36).replace(/[^a-z0-9-]/g, ""),
      createdAt: competitor?.createdAt ?? now,
      updatedAt: now,
      domain: domain.trim(),
      ...(estimatedTraffic && { estimatedTraffic: Number.parseInt(estimatedTraffic) }),
      ...(domainAuthority && { domainAuthority: Number.parseInt(domainAuthority) }),
      ...(topKeywords.length > 0 && { topKeywords }),
      ...(backlinkCount && { backlinkCount: Number.parseInt(backlinkCount) }),
      ...(notes && { notes }),
      ...(domainId ? { domainId } : competitor?.domainId ? { domainId: competitor.domainId } : {}),
    };

    onSave(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{competitor ? "Edit Competitor" : "Add Competitor"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="space-y-2">
            <Label htmlFor="domain">Domain</Label>
            <Input
              id="domain"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="e.g. competitor.com"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="da">Domain Authority</Label>
              <Input
                id="da"
                type="number"
                min={0}
                max={100}
                value={domainAuthority}
                onChange={(e) => setDomainAuthority(e.target.value)}
                placeholder="0-100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="traffic">Est. Traffic</Label>
              <Input
                id="traffic"
                type="number"
                min={0}
                value={estimatedTraffic}
                onChange={(e) => setEstimatedTraffic(e.target.value)}
                placeholder="Monthly"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="blCount">Backlinks</Label>
              <Input
                id="blCount"
                type="number"
                min={0}
                value={backlinkCount}
                onChange={(e) => setBacklinkCount(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="topKeywords">Top Keywords</Label>
            <Input
              id="topKeywords"
              value={topKeywordsStr}
              onChange={(e) => setTopKeywordsStr(e.target.value)}
              placeholder="Comma-separated keywords (max 20)"
            />
            <p className="text-xs text-muted-foreground">Separate keywords with commas</p>
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
          <Button onClick={handleSubmit} disabled={!domain.trim()}>
            {competitor ? "Save Changes" : "Add Competitor"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
