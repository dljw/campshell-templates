import { useEffect, useState } from "react";
import { Image as ImageIcon, Play } from "lucide-react";

export type Aspect = "square" | "9:16" | "16:9" | "4:5";

const ASPECT_CLASS: Record<Aspect, string> = {
  square: "aspect-square",
  "9:16": "aspect-[9/16]",
  "16:9": "aspect-video",
  "4:5": "aspect-[4/5]",
};

export interface MediaThumbnailProps {
  templateName: string;
  cachedRelPath?: string | null;
  liveUrl?: string;
  aspect?: Aspect;
  alt?: string;
  showVideoBadge?: boolean;
  showCarouselBadge?: number; // count of children, 0 = no badge
  className?: string;
}

export function MediaThumbnail({
  templateName,
  cachedRelPath,
  liveUrl,
  aspect = "square",
  alt = "",
  showVideoBadge = false,
  showCarouselBadge = 0,
  className = "",
}: MediaThumbnailProps) {
  // Source order: cached static URL → live URL → placeholder.
  const cachedUrl = cachedRelPath
    ? `/t/${templateName}/data/${cachedRelPath}`
    : null;
  const initialSrc = cachedUrl ?? liveUrl ?? null;

  const [src, setSrc] = useState<string | null>(initialSrc);
  const [stage, setStage] = useState<"cached" | "live" | "placeholder">(
    cachedUrl ? "cached" : liveUrl ? "live" : "placeholder",
  );

  useEffect(() => {
    setSrc(initialSrc);
    setStage(cachedUrl ? "cached" : liveUrl ? "live" : "placeholder");
  }, [initialSrc, cachedUrl, liveUrl]);

  const handleError = () => {
    if (stage === "cached" && liveUrl) {
      setSrc(liveUrl);
      setStage("live");
    } else {
      setSrc(null);
      setStage("placeholder");
    }
  };

  return (
    <div
      className={`relative bg-muted overflow-hidden ${ASPECT_CLASS[aspect]} ${className}`}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={handleError}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
          <ImageIcon className="w-8 h-8 opacity-30" />
          {liveUrl && stage === "placeholder" && (
            <span className="text-[10px] mt-1 opacity-60">expired</span>
          )}
        </div>
      )}
      {showVideoBadge && (
        <div className="absolute top-2 right-2 bg-black/60 rounded-full p-1.5 backdrop-blur-sm">
          <Play className="w-3 h-3 text-white fill-white" />
        </div>
      )}
      {showCarouselBadge > 1 && (
        <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] font-medium px-1.5 py-0.5 rounded backdrop-blur-sm">
          1/{showCarouselBadge}
        </div>
      )}
    </div>
  );
}
