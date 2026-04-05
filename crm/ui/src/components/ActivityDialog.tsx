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
  Textarea,
} from "@campshell/ui-components";
import { Building2, Calendar, DollarSign, Mail, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { Activity, ActivityType, Contact, Deal } from "../types.js";
import { formatCurrency } from "../utils.js";

interface ActivityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activity: Activity | null;
  contacts: Contact[];
  deals: Deal[];
  onCreate: (activity: Activity) => boolean;
  onUpdate: (activity: Activity) => boolean;
  onDelete: (id: string) => boolean;
}

const ACTIVITY_TYPES: ActivityType[] = ["call", "email", "meeting", "note"];

function generateId(): string {
  return crypto.randomUUID().slice(0, 12);
}

function toLocalDateTimeString(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function ActivityDialog({
  open,
  onOpenChange,
  activity,
  contacts,
  deals,
  onCreate,
  onUpdate,
  onDelete,
}: ActivityDialogProps) {
  const isEditing = activity !== null;
  const [title, setTitle] = useState("");
  const [type, setType] = useState<ActivityType>("call");
  const [contactId, setContactId] = useState("");
  const [dealId, setDealId] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open) {
      if (activity) {
        setTitle(activity.title);
        setType(activity.type ?? "note");
        setContactId(activity.contactId ?? "__none__");
        setDealId(activity.dealId ?? "__none__");
        setDate(toLocalDateTimeString(activity.date));
        setNotes(activity.notes ?? "");
      } else {
        setTitle("");
        setType("call");
        setContactId("__none__");
        setDealId("__none__");
        setDate(toLocalDateTimeString(new Date().toISOString()));
        setNotes("");
      }
    }
  }, [open, activity]);

  const selectedContact = contactId && contactId !== "__none__"
    ? contacts.find((c) => c.id === contactId)
    : undefined;

  const selectedDeal = dealId && dealId !== "__none__"
    ? deals.find((d) => d.id === dealId)
    : undefined;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date().toISOString();
    const data: Activity = {
      id: activity?.id ?? generateId(),
      title,
      type,
      contactId: contactId && contactId !== "__none__" ? contactId : undefined,
      dealId: dealId && dealId !== "__none__" ? dealId : undefined,
      date: new Date(date).toISOString(),
      notes: notes || undefined,
      createdAt: activity?.createdAt ?? now,
      updatedAt: now,
    };
    const ok = isEditing ? onUpdate(data) : onCreate(data);
    if (ok) onOpenChange(false);
  };

  const handleDelete = () => {
    if (activity && onDelete(activity.id)) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">{isEditing ? "Edit Activity" : "Log Activity"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 text-white">
          <div className="space-y-2">
            <Label htmlFor="activity-title">Title</Label>
            <Input
              id="activity-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Follow-up call with Jane"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="activity-type">Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as ActivityType)}>
                <SelectTrigger id="activity-type" className="text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="text-white">
                  {ACTIVITY_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="activity-date">Date</Label>
              <Input
                id="activity-date"
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="activity-contact">Contact</Label>
              <Select value={contactId} onValueChange={setContactId}>
                <SelectTrigger id="activity-contact" className="text-white">
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
              <Label htmlFor="activity-deal">Deal</Label>
              <Select value={dealId} onValueChange={setDealId}>
                <SelectTrigger id="activity-deal" className="text-white">
                  <SelectValue placeholder="Select deal" />
                </SelectTrigger>
                <SelectContent className="text-white">
                  <SelectItem value="__none__">None</SelectItem>
                  {deals.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Context cards for linked entities */}
          {(selectedContact || selectedDeal) && (
            <div className="space-y-2">
              {selectedContact && (
                <div className="rounded-md bg-muted/50 p-2.5 text-xs space-y-1">
                  <div className="font-medium">{selectedContact.name}</div>
                  {selectedContact.company && (
                    <div className="text-muted-foreground flex items-center gap-1.5">
                      <Building2 className="h-3 w-3 shrink-0" />
                      {selectedContact.company}
                    </div>
                  )}
                  {selectedContact.email && (
                    <div className="text-muted-foreground flex items-center gap-1.5">
                      <Mail className="h-3 w-3 shrink-0" />
                      {selectedContact.email}
                    </div>
                  )}
                </div>
              )}
              {selectedDeal && (
                <div className="rounded-md bg-muted/50 p-2.5 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium truncate">{selectedDeal.title}</span>
                    <Badge variant="secondary" className="text-[10px] capitalize shrink-0 ml-2">
                      {selectedDeal.stage}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    {selectedDeal.value != null && (
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {formatCurrency(selectedDeal.value)}
                      </span>
                    )}
                    {selectedDeal.closeDate && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(selectedDeal.closeDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="activity-notes">Notes</Label>
            <Textarea
              id="activity-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Optional notes..."
            />
          </div>

          <DialogFooter className="flex justify-between">
            {isEditing && (
              <Button type="button" variant="ghost" size="sm" onClick={handleDelete} className="text-destructive gap-1.5 mr-auto">
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            )}
            <Button type="submit" className="gap-1.5">
              <Plus className="h-4 w-4" />
              {isEditing ? "Save" : "Log"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
