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
} from "@campshell/ui-components";
import type { Backlink, BacklinkStatus, LinkType, Page } from "../types.js";

interface BacklinkFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  backlink: Backlink | null;
  pages: Page[];
  domainId?: string | null;
  onSave: (backlink: Backlink) => void;
}

export function BacklinkFormDialog({
  open,
  onOpenChange,
  backlink,
  pages,
  domainId,
  onSave,
}: BacklinkFormDialogProps) {
  const [sourceDomain, setSourceDomain] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [targetPageId, setTargetPageId] = useState("");
  const [anchorText, setAnchorText] = useState("");
  const [linkType, setLinkType] = useState<LinkType>("dofollow");
  const [domainAuthority, setDomainAuthority] = useState("");
  const [dateDiscovered, setDateDiscovered] = useState("");
  const [status, setStatus] = useState<BacklinkStatus>("active");

  useEffect(() => {
    if (open) {
      setSourceDomain(backlink?.sourceDomain ?? "");
      setSourceUrl(backlink?.sourceUrl ?? "");
      setTargetPageId(backlink?.targetPageId ?? "");
      setAnchorText(backlink?.anchorText ?? "");
      setLinkType(backlink?.linkType ?? "dofollow");
      setDomainAuthority(backlink?.domainAuthority?.toString() ?? "");
      setDateDiscovered(backlink?.dateDiscovered ?? "");
      setStatus(backlink?.status ?? "active");
    }
  }, [open, backlink]);

  const handleSubmit = () => {
    if (!sourceDomain.trim() || !sourceUrl.trim()) return;

    const now = new Date().toISOString();
    const data: Backlink = {
      id: backlink?.id ?? crypto.randomUUID().slice(0, 36).replace(/[^a-z0-9-]/g, ""),
      createdAt: backlink?.createdAt ?? now,
      updatedAt: now,
      sourceDomain: sourceDomain.trim(),
      sourceUrl: sourceUrl.trim(),
      ...(targetPageId && { targetPageId }),
      ...(anchorText && { anchorText }),
      linkType,
      ...(domainAuthority && { domainAuthority: Number.parseInt(domainAuthority) }),
      ...(dateDiscovered && { dateDiscovered }),
      status,
      ...(domainId ? { domainId } : backlink?.domainId ? { domainId: backlink.domainId } : {}),
    };

    onSave(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{backlink ? "Edit Backlink" : "Add Backlink"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="space-y-2">
            <Label htmlFor="sourceDomain">Source Domain</Label>
            <Input
              id="sourceDomain"
              value={sourceDomain}
              onChange={(e) => setSourceDomain(e.target.value)}
              placeholder="e.g. techblog.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sourceUrl">Source URL</Label>
            <Input
              id="sourceUrl"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://techblog.com/article"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="anchorText">Anchor Text</Label>
            <Input
              id="anchorText"
              value={anchorText}
              onChange={(e) => setAnchorText(e.target.value)}
              placeholder="Link text"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Link Type</Label>
              <Select value={linkType} onValueChange={(v) => setLinkType(v as LinkType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dofollow">Dofollow</SelectItem>
                  <SelectItem value="nofollow">Nofollow</SelectItem>
                  <SelectItem value="ugc">UGC</SelectItem>
                  <SelectItem value="sponsored">Sponsored</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as BacklinkStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                  <SelectItem value="disavowed">Disavowed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="da">Domain Authority (0-100)</Label>
              <Input
                id="da"
                type="number"
                min={0}
                max={100}
                value={domainAuthority}
                onChange={(e) => setDomainAuthority(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="discovered">Date Discovered</Label>
              <Input
                id="discovered"
                type="date"
                value={dateDiscovered}
                onChange={(e) => setDateDiscovered(e.target.value)}
              />
            </div>
          </div>

          {pages.length > 0 && (
            <div className="space-y-2">
              <Label>Target Page</Label>
              <Select value={targetPageId} onValueChange={setTargetPageId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select target page" />
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
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!sourceDomain.trim() || !sourceUrl.trim()}>
            {backlink ? "Save Changes" : "Add Backlink"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
