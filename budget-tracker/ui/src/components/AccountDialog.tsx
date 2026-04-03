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
import { useState } from "react";
import type { Account, AccountSubType, AccountType } from "../types.js";

interface AccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: Account;
  onSave: (account: Account) => void;
}

function generateId(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 30) +
    "-" +
    Math.random().toString(36).slice(2, 6)
  );
}

const SUB_TYPES_BY_TYPE: Record<AccountType, AccountSubType[]> = {
  asset: ["checking", "savings", "cash", "investment", "other"],
  liability: ["credit-card", "loan", "mortgage", "other"],
  expense: [],
  revenue: [],
};

export function AccountDialog({ open, onOpenChange, initial, onSave }: AccountDialogProps) {
  const isEdit = !!initial;
  const [name, setName] = useState(initial?.name ?? "");
  const [type, setType] = useState<AccountType>(initial?.type ?? "asset");
  const [subType, setSubType] = useState<AccountSubType | "">(initial?.subType ?? "");
  const [currency, setCurrency] = useState(initial?.currency ?? "USD");
  const [balance, setBalance] = useState(initial?.balance?.toString() ?? "0");
  const [notes, setNotes] = useState(initial?.notes ?? "");

  const availableSubTypes = SUB_TYPES_BY_TYPE[type] ?? [];

  function handleTypeChange(t: AccountType) {
    setType(t);
    setSubType("");
  }

  function handleSave() {
    if (!name.trim()) return;

    const account: Account = {
      id: initial?.id ?? generateId(name),
      createdAt: initial?.createdAt ?? new Date().toISOString(),
      updatedAt: isEdit ? new Date().toISOString() : undefined,
      name: name.trim(),
      type,
      ...(subType ? { subType } : {}),
      currency: currency.toUpperCase(),
      balance: parseFloat(balance) || 0,
      ...(notes.trim() ? { notes: notes.trim() } : {}),
      active: true,
    };
    onSave(account);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Account" : "New Account"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="space-y-1.5">
            <Label>Account Name</Label>
            <Input
              placeholder="e.g. Main Checking"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => handleTypeChange(v as AccountType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asset">Asset</SelectItem>
                  <SelectItem value="liability">Liability</SelectItem>
                  <SelectItem value="revenue">Revenue</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {availableSubTypes.length > 0 && (
              <div className="space-y-1.5">
                <Label>Sub-type</Label>
                <Select value={subType} onValueChange={(v) => setSubType(v as AccountSubType)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Optional" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSubTypes.map((st) => (
                      <SelectItem key={st} value={st}>
                        {st.charAt(0).toUpperCase() + st.slice(1).replace("-", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Currency</Label>
              <Input
                placeholder="USD"
                maxLength={3}
                value={currency}
                onChange={(e) => setCurrency(e.target.value.toUpperCase())}
              />
            </div>

            {(type === "asset" || type === "liability") && (
              <div className="space-y-1.5">
                <Label>Balance</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea
              placeholder="Optional notes…"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            {isEdit ? "Save Changes" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
