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
  Separator,
  Textarea,
} from "@campshell/ui-components";
import { Clock, Handshake, MessageSquare, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { Activity, Contact, Deal } from "../types.js";
import { formatCurrency, getInitials, smartDate } from "../utils.js";

interface ContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact: Contact | null;
  deals: Deal[];
  activities: Activity[];
  onCreate: (contact: Contact) => boolean;
  onUpdate: (contact: Contact) => boolean;
  onDelete: (id: string) => boolean;
}

function generateId(): string {
  return crypto.randomUUID().slice(0, 12);
}

export function ContactDialog({
  open,
  onOpenChange,
  contact,
  deals,
  activities,
  onCreate,
  onUpdate,
  onDelete,
}: ContactDialogProps) {
  const isEditing = contact !== null;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open) {
      if (contact) {
        setName(contact.name);
        setEmail(contact.email ?? "");
        setPhone(contact.phone ?? "");
        setCompany(contact.company ?? "");
        setNotes(contact.notes ?? "");
      } else {
        setName("");
        setEmail("");
        setPhone("");
        setCompany("");
        setNotes("");
      }
    }
  }, [open, contact]);

  const linkedDeals = useMemo(() => {
    if (!contact) return [];
    return deals.filter((d) => d.contactId === contact.id);
  }, [contact, deals]);

  const linkedActivities = useMemo(() => {
    if (!contact) return [];
    return activities.filter((a) => a.contactId === contact.id);
  }, [contact, activities]);

  const totalDealValue = useMemo(
    () => linkedDeals.reduce((sum, d) => sum + (d.value ?? 0), 0),
    [linkedDeals],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date().toISOString();
    const data: Contact = {
      id: contact?.id ?? generateId(),
      name,
      email: email || undefined,
      phone: phone || undefined,
      company: company || undefined,
      notes: notes || undefined,
      createdAt: contact?.createdAt ?? now,
      updatedAt: now,
    };
    const ok = isEditing ? onUpdate(data) : onCreate(data);
    if (ok) onOpenChange(false);
  };

  const handleDelete = () => {
    if (contact && onDelete(contact.id)) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">{isEditing ? "Edit Contact" : "New Contact"}</DialogTitle>
        </DialogHeader>

        {isEditing && contact && (
          <div className="space-y-3 mb-2 text-white">
            {/* Avatar + name header */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm shrink-0">
                {getInitials(contact.name)}
              </div>
              <div className="min-w-0">
                <p className="font-medium truncate">{contact.name}</p>
                {contact.company && (
                  <p className="text-xs text-muted-foreground truncate">{contact.company}</p>
                )}
              </div>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Handshake className="h-3.5 w-3.5" />
                {linkedDeals.length} deal{linkedDeals.length !== 1 ? "s" : ""}
                {totalDealValue > 0 && ` · ${formatCurrency(totalDealValue)}`}
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare className="h-3.5 w-3.5" />
                {linkedActivities.length} activit{linkedActivities.length !== 1 ? "ies" : "y"}
              </span>
            </div>

            {/* Linked deals list */}
            {linkedDeals.length > 0 && (
              <div className="space-y-1">
                {linkedDeals.slice(0, 3).map((d) => (
                  <div key={d.id} className="flex items-center justify-between text-xs rounded bg-muted/50 px-2.5 py-1.5">
                    <span className="truncate">{d.title}</span>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      {d.value != null && (
                        <span className="text-muted-foreground">{formatCurrency(d.value)}</span>
                      )}
                      <Badge variant="secondary" className="text-[10px] capitalize">
                        {d.stage}
                      </Badge>
                    </div>
                  </div>
                ))}
                {linkedDeals.length > 3 && (
                  <p className="text-xs text-muted-foreground px-1">+{linkedDeals.length - 3} more</p>
                )}
              </div>
            )}

            {/* Timestamps */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Created {smartDate(contact.createdAt)}
              </span>
              {contact.updatedAt && (
                <span>Updated {smartDate(contact.updatedAt)}</span>
              )}
            </div>

            <Separator />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-white">
          <div className="space-y-2">
            <Label htmlFor="contact-name">Name</Label>
            <Input
              id="contact-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Jane Smith"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact-email">Email</Label>
              <Input
                id="contact-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact-phone">Phone</Label>
              <Input
                id="contact-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1-555-0100"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-company">Company</Label>
            <Input
              id="contact-company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Acme Corp"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-notes">Notes</Label>
            <Textarea
              id="contact-notes"
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
              {isEditing ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
