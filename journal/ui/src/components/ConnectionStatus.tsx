import { Badge, cn } from "@campshell/ui-components";

interface ConnectionStatusProps {
  status: "connecting" | "connected" | "disconnected";
}

export function ConnectionStatus({ status }: ConnectionStatusProps) {
  const dotClass =
    status === "connected"
      ? "bg-emerald-400"
      : status === "connecting"
        ? "bg-amber-400 animate-pulse"
        : "bg-rose-400";

  const label =
    status === "connected" ? "Live" : status === "connecting" ? "Connecting…" : "Offline";

  return (
    <div className="fixed bottom-3 right-3 z-50">
      <Badge variant="outline" className="gap-1.5 text-xs">
        <span className={cn("size-1.5 rounded-full", dotClass)} />
        {label}
      </Badge>
    </div>
  );
}
