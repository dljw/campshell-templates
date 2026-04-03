interface ConnectionStatusProps {
  status: "connecting" | "connected" | "disconnected";
}

export function ConnectionStatus({ status }: ConnectionStatusProps) {
  if (status === "connected") return null;

  return (
    <div className="fixed bottom-4 right-4 flex items-center gap-2 rounded-full bg-background border border-border px-3 py-1.5 text-xs shadow-sm">
      <span
        className={`h-2 w-2 rounded-full ${
          status === "connecting" ? "bg-yellow-500 animate-pulse" : "bg-red-500"
        }`}
      />
      <span className="text-muted-foreground">
        {status === "connecting" ? "Connecting…" : "Disconnected"}
      </span>
    </div>
  );
}
