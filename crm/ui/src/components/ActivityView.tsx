import {
  Badge,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  cn,
} from "@campshell/ui-components";
import { Mail, MessageSquare, Phone, Plus, Users } from "lucide-react";
import { useMemo, useState } from "react";
import type { Activity, ActivityType, Contact, Deal } from "../types.js";
import { smartDate } from "../utils.js";
import { ActivityDialog } from "./ActivityDialog.js";

interface ActivityViewProps {
  activities: Activity[];
  contacts: Contact[];
  deals: Deal[];
  createActivity: (activity: Activity) => boolean;
  updateActivity: (activity: Activity) => boolean;
  deleteActivity: (id: string) => boolean;
}

const TYPE_CONFIG: Record<ActivityType, { icon: React.ReactNode; color: string }> = {
  call: { icon: <Phone className="h-3.5 w-3.5" />, color: "bg-[var(--info-muted)] text-info" },
  email: { icon: <Mail className="h-3.5 w-3.5" />, color: "bg-[var(--warning-muted)] text-warning" },
  meeting: { icon: <Users className="h-3.5 w-3.5" />, color: "bg-[var(--success-muted)] text-success" },
  note: { icon: <MessageSquare className="h-3.5 w-3.5" />, color: "bg-muted text-muted-foreground" },
};


export function ActivityView({
  activities,
  contacts,
  deals,
  createActivity,
  updateActivity,
  deleteActivity,
}: ActivityViewProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  const contactMap = useMemo(() => {
    const map = new Map<string, Contact>();
    for (const c of contacts) map.set(c.id, c);
    return map;
  }, [contacts]);

  const dealMap = useMemo(() => {
    const map = new Map<string, Deal>();
    for (const d of deals) map.set(d.id, d);
    return map;
  }, [deals]);

  const sorted = useMemo(
    () => [...activities].sort((a, b) => b.date.localeCompare(a.date)),
    [activities],
  );

  const handleNew = () => {
    setEditingActivity(null);
    setDialogOpen(true);
  };

  const handleEdit = (activity: Activity) => {
    setEditingActivity(activity);
    setDialogOpen(true);
  };

  return (
    <>
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-end">
          <Button size="sm" onClick={handleNew} className="gap-1.5">
            <Plus className="h-4 w-4" />
            Log activity
          </Button>
        </div>

        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center gap-2">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm">No activities yet</p>
            <p className="text-muted-foreground text-xs">Log your first call, email, or meeting.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10" />
                <TableHead>Activity</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Deal</TableHead>
                <TableHead className="text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((activity) => {
                const config = activity.type ? TYPE_CONFIG[activity.type] : TYPE_CONFIG.note;
                const contact = activity.contactId ? contactMap.get(activity.contactId) : undefined;
                const deal = activity.dealId ? dealMap.get(activity.dealId) : undefined;
                return (
                  <TableRow
                    key={activity.id}
                    className="cursor-pointer"
                    data-campshell-entity={`crm/activity/activities/${activity.id}.json`}
                    onClick={() => handleEdit(activity)}
                  >
                    <TableCell>
                      <div className={cn("w-7 h-7 rounded-full flex items-center justify-center", config.color)}>
                        {config.icon}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm text-white">{activity.title}</p>
                        {activity.notes && (
                          <p className="text-xs text-muted-foreground truncate max-w-xs">{activity.notes}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {contact?.name ?? "\u2014"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {deal?.title ?? "\u2014"}
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {smartDate(activity.date)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      <ActivityDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        activity={editingActivity}
        contacts={contacts}
        deals={deals}
        onCreate={createActivity}
        onUpdate={updateActivity}
        onDelete={deleteActivity}
      />
    </>
  );
}
