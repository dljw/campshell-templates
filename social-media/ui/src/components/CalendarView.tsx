import { Badge, Card, CardContent, cn, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@campshell/ui-components";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import type { UseTemplateDataReturn } from "../hooks/useTemplateData.js";
import type { Post } from "../types.js";

const PLATFORM_EMOJI: Record<string, string> = {
  instagram: "\ud83d\udcf7",
  tiktok: "\ud83c\udfb5",
  linkedin: "\ud83d\udcbc",
  youtube: "\ud83c\udfa5",
  facebook: "\ud83d\udc4d",
  lemon8: "\ud83c\udf4b",
};

const STATUS_COLORS: Record<string, string> = {
  idea: "bg-muted text-muted-foreground",
  drafting: "bg-[var(--info-muted)] text-info",
  ready: "bg-[var(--warning-muted)] text-warning",
  scheduled: "bg-[var(--info-muted)] text-info",
  published: "bg-[var(--success-muted)] text-success",
  archived: "bg-muted text-muted-foreground",
};

function getWeekDays(date: Date): Date[] {
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay() + 1);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function CalendarView({ data }: { data: UseTemplateDataReturn }) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [businessFilter, setBusinessFilter] = useState<string>("all");

  const baseDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + weekOffset * 7);
    return d;
  }, [weekOffset]);

  const weekDays = useMemo(() => getWeekDays(baseDate), [baseDate]);

  const filteredPosts = useMemo(() => {
    let result = data.posts;
    if (businessFilter !== "all") {
      result = result.filter((p) => p.businessId === businessFilter);
    }
    return result;
  }, [data.posts, businessFilter]);

  const pillarMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of data.pillars) map.set(p.id, `${p.emoji ?? ""} ${p.name}`.trim());
    return map;
  }, [data.pillars]);

  const postsByDay = useMemo(() => {
    const map = new Map<string, Post[]>();
    for (const post of filteredPosts) {
      if (!post.scheduledAt) continue;
      const d = new Date(post.scheduledAt);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      const list = map.get(key) ?? [];
      list.push(post);
      map.set(key, list);
    }
    return map;
  }, [filteredPosts]);

  const today = new Date();
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  if (data.posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center gap-4">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-2">
          <CalendarDays className="w-8 h-8 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-medium">No posts yet</h2>
          <p className="text-muted-foreground text-sm max-w-sm">
            Schedule your first post or let your AI agent plan a full week of content.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 shrink-0">
        <div className="flex items-center gap-3">
          <button type="button" className="bg-transparent p-1 rounded hover:bg-muted" onClick={() => setWeekOffset((w) => w - 1)}>
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <span className="text-sm font-medium min-w-[200px] text-center">
            {weekDays[0].toLocaleDateString("en-US", { month: "short", day: "numeric" })} — {weekDays[6].toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </span>
          <button type="button" className="bg-transparent p-1 rounded hover:bg-muted" onClick={() => setWeekOffset((w) => w + 1)}>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
          {weekOffset !== 0 && (
            <button type="button" className="bg-transparent text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded" onClick={() => setWeekOffset(0)}>
              Today
            </button>
          )}
        </div>
        <Select value={businessFilter} onValueChange={setBusinessFilter}>
          <SelectTrigger className="w-44 h-8">
            <SelectValue placeholder="All businesses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All businesses</SelectItem>
            {data.businesses.map((b) => (
              <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-7 h-full min-h-[500px]">
          {weekDays.map((day, i) => {
            const key = `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`;
            const dayPosts = postsByDay.get(key) ?? [];
            const isToday = isSameDay(day, today);

            return (
              <div key={i} className={cn("border-r border-border/30 last:border-r-0 flex flex-col", isToday && "bg-muted/30")}>
                <div className={cn("px-2 py-2 text-center border-b border-border/30 shrink-0")}>
                  <p className="text-xs text-muted-foreground">{dayNames[i]}</p>
                  <p className={cn("text-lg font-medium", isToday && "text-primary")}>{day.getDate()}</p>
                </div>
                <div className="flex-1 overflow-auto p-1.5 space-y-1.5">
                  {dayPosts.sort((a, b) => (a.scheduledAt ?? "").localeCompare(b.scheduledAt ?? "")).map((post) => (
                    <Card key={post.id} className="hover:bg-surface-raised transition-colors">
                      <CardContent className="p-2 text-xs space-y-1">
                        <div className="flex items-center gap-1">
                          <span>{PLATFORM_EMOJI[post.platform] ?? ""}</span>
                          <span className="font-medium truncate flex-1">{post.title}</span>
                        </div>
                        <div className="flex items-center justify-between gap-1">
                          <Badge variant="secondary" className={cn("text-[10px] font-normal px-1 py-0", STATUS_COLORS[post.status])}>
                            {post.status}
                          </Badge>
                          {post.scheduledAt && (
                            <span className="text-muted-foreground text-[10px]">
                              {new Date(post.scheduledAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                            </span>
                          )}
                        </div>
                        {post.pillarId && pillarMap.has(post.pillarId) && (
                          <p className="text-muted-foreground text-[10px] truncate">{pillarMap.get(post.pillarId)}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
