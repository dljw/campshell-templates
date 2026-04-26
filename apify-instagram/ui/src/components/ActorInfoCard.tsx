import { useState } from "react";
import { ChevronDown, ExternalLink, Info } from "lucide-react";
import type { ActorInfo } from "../lib/actors.js";

export interface ActorInfoCardProps {
  actor: ActorInfo;
  defaultOpen?: boolean;
}

export function ActorInfoCard({ actor, defaultOpen = false }: ActorInfoCardProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-md border border-border/60 bg-muted/30 text-xs">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 text-left hover:bg-muted/50 transition-colors rounded-md"
      >
        <div className="flex items-center gap-2 min-w-0">
          <Info className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
          <span className="font-medium truncate">About this scraper</span>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="px-3 pb-3 pt-1 space-y-2 border-t border-border/40">
          <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5">
            <span className="text-muted-foreground">Actor</span>
            <a
              href={actor.consoleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-primary inline-flex items-center gap-1 truncate hover:underline"
            >
              {actor.id}
              <ExternalLink className="w-3 h-3 shrink-0" />
            </a>
            <span className="text-muted-foreground">Pricing</span>
            <span>{actor.pricingModel}</span>
          </div>
          <p className="text-muted-foreground leading-relaxed">{actor.pricingNote}</p>
          <a
            href={actor.pricingPageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary inline-flex items-center gap-1 hover:underline"
          >
            View live pricing on Apify
            <ExternalLink className="w-3 h-3" />
          </a>
          <p className="text-[10px] text-muted-foreground italic">
            Each form submission triggers exactly one actor run. Apify charges per run/result on
            their side — costs depend on the actor's current rate and the number of results returned.
          </p>
        </div>
      )}
    </div>
  );
}
