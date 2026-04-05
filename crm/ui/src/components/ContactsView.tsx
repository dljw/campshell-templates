import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input } from "@campshell/ui-components";
import { Building2, Clock, DollarSign, FileText, Mail, Phone, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import type { Activity, Contact, Deal } from "../types.js";
import { formatCurrency, smartDate } from "../utils.js";
import { ContactDialog } from "./ContactDialog.js";

interface ContactsViewProps {
  contacts: Contact[];
  deals: Deal[];
  activities: Activity[];
  createContact: (contact: Contact) => boolean;
  updateContact: (contact: Contact) => boolean;
  deleteContact: (id: string) => boolean;
}

export function ContactsView({ contacts, deals, activities, createContact, updateContact, deleteContact }: ContactsViewProps) {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  const { dealCountByContact, dealValueByContact } = useMemo(() => {
    const counts = new Map<string, number>();
    const values = new Map<string, number>();
    for (const d of deals) {
      if (d.contactId) {
        counts.set(d.contactId, (counts.get(d.contactId) ?? 0) + 1);
        values.set(d.contactId, (values.get(d.contactId) ?? 0) + (d.value ?? 0));
      }
    }
    return { dealCountByContact: counts, dealValueByContact: values };
  }, [deals]);

  const lastActivityByContact = useMemo(() => {
    const latest = new Map<string, string>();
    for (const a of activities) {
      if (a.contactId) {
        const existing = latest.get(a.contactId);
        if (!existing || a.date > existing) {
          latest.set(a.contactId, a.date);
        }
      }
    }
    return latest;
  }, [activities]);

  const filtered = useMemo(() => {
    if (!search) return contacts;
    const q = search.toLowerCase();
    return contacts.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.company?.toLowerCase().includes(q),
    );
  }, [contacts, search]);

  const handleNew = () => {
    setEditingContact(null);
    setDialogOpen(true);
  };

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact);
    setDialogOpen(true);
  };

  return (
    <>
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search contacts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 pl-8"
            />
          </div>
          <Button size="sm" onClick={handleNew} className="gap-1.5">
            <Plus className="h-4 w-4" />
            Add contact
          </Button>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center gap-2">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <Search className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm">
              {contacts.length === 0 ? "No contacts yet" : "No contacts match your search"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
            {filtered.map((contact) => {
              const dealCount = dealCountByContact.get(contact.id) ?? 0;
              const totalValue = dealValueByContact.get(contact.id) ?? 0;
              const lastActivity = lastActivityByContact.get(contact.id);
              return (
                <Card
                  key={contact.id}
                  className="cursor-pointer hover:bg-surface-raised transition-colors"
                  data-campshell-entity={`crm/contacts/contacts/${contact.id}.json`}
                  onClick={() => handleEdit(contact)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-white">{contact.name}</CardTitle>
                      {dealCount > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {dealCount} deal{dealCount !== 1 ? "s" : ""}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="text-sm text-white space-y-1">
                    {contact.company && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Building2 className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{contact.company}</span>
                      </div>
                    )}
                    {contact.email && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{contact.email}</span>
                      </div>
                    )}
                    {contact.phone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-3.5 w-3.5 shrink-0" />
                        <span>{contact.phone}</span>
                      </div>
                    )}
                    {contact.notes && (
                      <div className="flex items-start gap-2 text-muted-foreground/70 pt-1">
                        <FileText className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                        <span className="text-xs line-clamp-2">{contact.notes}</span>
                      </div>
                    )}
                    {(totalValue > 0 || lastActivity) && (
                      <div className="flex items-center justify-between pt-2 mt-1 border-t border-border/40">
                        {totalValue > 0 && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {formatCurrency(totalValue)}
                          </span>
                        )}
                        {lastActivity && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {smartDate(lastActivity)}
                          </span>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <ContactDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        contact={editingContact}
        deals={deals}
        activities={activities}
        onCreate={createContact}
        onUpdate={updateContact}
        onDelete={deleteContact}
      />
    </>
  );
}
