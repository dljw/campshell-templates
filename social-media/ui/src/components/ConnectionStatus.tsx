import { cn } from "@campshell/ui-components";

interface ConnectionStatusProps {
  status: "connecting" | "connected" | "disconnected";
}

export function ConnectionStatus({ status }: ConnectionStatusProps) {
  if (status === "connected") return null;

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-2 px-4 py-1.5 text-xs shrink-0 border-t border-border/40",
        status === "connecting" && "text-warning",
        status === "disconnected" && "text-destructive",
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          status === "connecting" && "bg-warning animate-pulse",
          status === "disconnected" && "bg-destructive",
        )}
      />
      {status === "connecting" ? "Connecting..." : "Disconnected"}
    </div>
  );
}
