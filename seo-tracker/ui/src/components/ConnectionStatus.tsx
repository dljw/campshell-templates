import { Badge } from "@campshell/ui-components";

interface ConnectionStatusProps {
  status: "connecting" | "connected" | "disconnected";
}

const config = {
  connecting: { label: "Connecting", variant: "outline" as const, dot: "bg-amber-400 animate-pulse" },
  connected: { label: "Connected", variant: "outline" as const, dot: "bg-emerald-400" },
  disconnected: { label: "Disconnected", variant: "destructive" as const, dot: "bg-red-400" },
};

export function ConnectionStatus({ status }: ConnectionStatusProps) {
  const { label, variant, dot } = config[status];

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Badge variant={variant} className="gap-1.5 text-xs font-normal px-2.5 py-1">
        <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
        {label}
      </Badge>
    </div>
  );
}
