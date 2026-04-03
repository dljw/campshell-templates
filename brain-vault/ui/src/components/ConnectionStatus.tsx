import { Badge, cn } from "@campshell/ui-components";

interface ConnectionStatusProps {
  status: "connecting" | "connected" | "disconnected";
}

const STATUS_CONFIG: Record<
  string,
  { label: string; dotClass: string }
> = {
  connected: { label: "Connected", dotClass: "bg-success" },
  connecting: { label: "Connecting", dotClass: "bg-warning animate-pulse" },
  disconnected: { label: "Disconnected", dotClass: "bg-destructive" },
};

export function ConnectionStatus({ status }: ConnectionStatusProps) {
  const { label, dotClass } = STATUS_CONFIG[status];
  return (
    <div className="fixed bottom-3 right-3 z-50">
      <Badge variant="outline" className="gap-1.5 text-xs">
        <span className={cn("size-1.5 rounded-full", dotClass)} />
        {label}
      </Badge>
    </div>
  );
}
