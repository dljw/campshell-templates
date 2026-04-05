import {
  Badge,
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
  Separator,
  Textarea,
  cn,
} from "@campshell/ui-components";
import { Building2, Clock, Mail, MessageSquare, Phone as PhoneIcon, Plus, Trash2, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { Activity, ActivityType, Contact, Deal, DealStage } from "../types.js";
import { formatCurrency, getInitials, smartDate } from "../utils.js";

interface DealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deal: Deal | null;
  defaultStage: DealStage;
  contacts: Contact[];
  activities: Activity[];
  onCreate: (deal: Deal) => boolean;
  onUpdate: (deal: Deal) => boolean;
  onDelete: (id: string) => boolean;
}

const STAGES: { id: DealStage; label: string; color: string }[] = [
  { id: "lead", label: "Lead", color: "bg-[var(--info-muted)] text-info" },
  { id: "proposal", label: "Proposal", color: "bg-[var(--warning-muted)] text-warning" },
  { id: "won", label: "Won", color: "bg-[var(--success-muted)] text-success" },
  { id: "lost", label: "Lost", color: "bg-muted text-muted-foreground" },
];

const STAGE_ORDER: Record<DealStage, number> = { lead: 0, proposal: 1, won: 2, lost: 2 };

const ACTIVITY_TYPE_CONFIG: Record<ActivityType, { icon: React.ReactNode; color: string }> = {
  call: { icon: <PhoneIcon className="h-3 w-3" />, color: "text-info" },
  email: { icon: <Mail className="h-3 w-3" />, color: "text-warning" },
  meeting: { icon: <Users className="h-3 w-3" />, color: "text-success" },
  note: { icon: <MessageSquare className="h-3 w-3" />, color: "text-muted-foreground" },
};

function generateId(): string {
  return crypto.randomUUID().slice(0, 12);
}

export function DealDialog({
  open,
  onOpenChange,
  deal,
  defaultStage,
  contacts,
  activities,
  onCreate,
  onUpdate,
  onDelete,
}: DealDialogProps) {
  const isEditing = deal !== null;
  const [title, setTitle] = useState("");
  const [contactId, setContactId] = useState("");
  const [value, setValue] = useState("");
  const [stage, setStage] = useState<DealStage>("lead");
  const [closeDate, setCloseDate] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open) {
      if (deal) {
        setTitle(deal.title);
        setContactId(deal.contactId ?? "__none__");
        setValue(deal.value != null ? String(deal.value) : "");
        setStage(deal.stage);
        setCloseDate(deal.closeDate ?? "");
        setNotes(deal.notes ?? "");
      } else {
        setTitle("");
        setContactId("__none__");
        setValue("");
        setStage(defaultStage);
        setCloseDate("");
        setNotes("");
      }
    }
  }, [open, deal, defaultStage]);

  const linkedContact = useMemo(() => {
    if (!deal?.contactId) return undefined;
    return contacts.find((c) => c.id === deal.contactId);
  }, [deal, contacts]);

  const relatedActivities = useMemo(() => {
    if (!deal) return [];
    return activities
      .filter((a) => a.dealId === deal.id)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [deal, activities]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date().toISOString();
    const data: Deal = {
      id: deal?.id ?? generateId(),
      title,
      contactId: contactId && contactId !== "__none__" ? contactId : undefined,
      value: value ? Number(value) : undefined,
      stage,
      closeDate: closeDate || undefined,
      notes: notes || undefined,
      createdAt: deal?.createdAt ?? now,
      updatedAt: now,
    };
    const ok = isEditing ? onUpdate(data) : onCreate(data);
    if (ok) onOpenChange(false);
  };

  const handleDelete = () => {
    if (deal && onDelete(deal.id)) {
      onOpenChange(false);
    }
  };

  const currentStageIndex = STAGE_ORDER[stage];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">{isEditing ? "Edit Deal" : "New Deal"}</DialogTitle>
        </DialogHeader>

        {isEditing && deal && (
          <div className="space-y-3 mb-2 text-white">
            {/* Contact info card */}
            {linkedContact && (
              <div className="rounded-md bg-muted/50 p-3 text-sm space-y-1.5">
                <div className="font-medium flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-semibold shrink-0">
                    {getInitials(linkedContact.name)}
                  </div>
                  <span className="truncate">{linkedContact.name}</span>
                </div>
                {linkedContact.company && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground pl-8">
                    <Building2 className="h-3 w-3 shrink-0" />
                    <span className="truncate">{linkedContact.company}</span>
                  </div>
                )}
                {linkedContact.email && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground pl-8">
                    <Mail className="h-3 w-3 shrink-0" />
                    <span className="truncate">{linkedContact.email}</span>
                  </div>
                )}
              </div>
            )}

            {/* Timestamps */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Created {smartDate(deal.createdAt)}
              </span>
              {deal.updatedAt && (
                <span>Updated {smartDate(deal.updatedAt)}</span>
              )}
            </div>

            <Separator />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-white">
          <div className="space-y-2">
            <Label htmlFor="deal-title">Title</Label>
            <Input
              id="deal-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Enterprise License"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deal-stage">Stage</Label>
              <Select value={stage} onValueChange={(v) => setStage(v as DealStage)}>
                <SelectTrigger id="deal-stage" className="text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="text-white">
                  {STAGES.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deal-value">Value ($)</Label>
              <Input
                id="deal-value"
                type="number"
                min="0"
                step="1"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deal-contact">Contact</Label>
              <Select value={contactId} onValueChange={setContactId}>
                <SelectTrigger id="deal-contact" className="text-white">
                  <SelectValue placeholder="Select contact" />
                </SelectTrigger>
                <SelectContent className="text-white">
                  <SelectItem value="__none__">None</SelectItem>
                  {contacts.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deal-close">Close Date</Label>
              <Input
                id="deal-close"
                type="date"
                value={closeDate}
                onChange={(e) => setCloseDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deal-notes">Notes</Label>
            <Textarea
              id="deal-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Optional notes..."
            />
          </div>

          {/* Related activities */}
          {isEditing && relatedActivities.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  Recent Activity ({relatedActivities.length})
                </Label>
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {relatedActivities.slice(0, 5).map((a) => {
                    const config = a.type ? ACTIVITY_TYPE_CONFIG[a.type] : ACTIVITY_TYPE_CONFIG.note;
                    return (
                      <div key={a.id} className="flex items-center gap-2 text-xs">
                        <span className={cn("shrink-0", config.color)}>{config.icon}</span>
                        <span className="truncate flex-1">{a.title}</span>
                        <span className="text-muted-foreground shrink-0">{smartDate(a.date)}</span>
                      </div>
                    );
                  })}
                  {relatedActivities.length > 5 && (
                    <p className="text-xs text-muted-foreground">+{relatedActivities.length - 5} more</p>
                  )}
                </div>
              </div>
            </>
          )}

          <DialogFooter className="flex justify-between">
            {isEditing && (
              <Button type="button" variant="ghost" size="sm" onClick={handleDelete} className="text-destructive gap-1.5 mr-auto">
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            )}
            <Button type="submit" className="gap-1.5">
              <Plus className="h-4 w-4" />
              {isEditing ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
