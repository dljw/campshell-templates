import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Badge,
  Button,
} from "@campshell/ui-components";
import { ChevronLeft, ChevronRight, Download, ExternalLink, Heart, MessageCircle, Eye, Music } from "lucide-react";
import { MediaThumbnail, type Aspect } from "./MediaThumbnail.js";

export interface PostDrawerItem {
  id?: string;
  shortcode?: string;
  caption?: string;
  url?: string;
  timestamp?: string;
  mediaType?: string;
  productType?: string;
  likesCount?: number | null;
  commentsCount?: number | null;
  videoViewCount?: number | null;
  videoPlayCount?: number | null;
  videoDurationSeconds?: number | null;
  displayUrl?: string;
  videoUrl?: string;
  hashtags?: string[];
  mentions?: string[];
  taggedUsers?: string[];
  location?: { id: string; name: string } | null;
  musicInfo?: Record<string, unknown> | null;
  childPosts?: {
    id?: string;
    type?: string;
    displayUrl?: string;
    videoUrl?: string;
  }[];
  ownerUsername?: string;
  ownerFullName?: string;
  ownerProfilePicUrl?: string;
  firstComment?: string;
  latestComments?: unknown[];
  isSponsored?: boolean;
  mediaCache?: Record<string, string | null> | null;
  _raw?: Record<string, unknown> | null;
}

export interface PostDrawerProps {
  item: PostDrawerItem | null;
  open: boolean;
  onClose: () => void;
  templateName: string;
  carouselAspect?: Aspect;
}

function formatNumber(n: number | null | undefined): string {
  if (n == null) return "—";
  return n.toLocaleString();
}

function formatDuration(s: number | null | undefined): string | null {
  if (!s) return null;
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
}

export function PostDrawer({
  item,
  open,
  onClose,
  templateName,
  carouselAspect = "square",
}: PostDrawerProps) {
  const [carouselIdx, setCarouselIdx] = useState(0);

  if (!item) return null;

  // Build the gallery: prefer carousel children, else single thumb.
  const slides =
    item.childPosts?.length ?? 0
      ? item.childPosts!.map((c, i) => ({
          cached: item.mediaCache?.[`child-${i}-thumb`] ?? null,
          live: c.displayUrl ?? "",
          isVideo: Boolean(c.videoUrl) || c.type === "Video",
        }))
      : [
          {
            cached: item.mediaCache?.thumb ?? null,
            live: item.displayUrl ?? "",
            isVideo:
              item.mediaType === "Video" ||
              item.productType === "clips" ||
              Boolean(item.videoUrl),
          },
        ];

  const safeIdx = Math.min(carouselIdx, slides.length - 1);
  const current = slides[safeIdx];
  const downloadUrl = current.cached
    ? `/t/${templateName}/data/${current.cached}`
    : current.live || null;
  const downloadName = `${item.shortcode ?? item.id ?? "post"}.jpg`;
  const duration = formatDuration(item.videoDurationSeconds);
  const views = item.videoViewCount ?? item.videoPlayCount ?? null;

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto p-0">
        <SheetHeader className="px-6 py-4 border-b sticky top-0 bg-background z-10">
          <SheetTitle className="text-sm font-semibold flex items-center gap-2">
            {item.shortcode ? `@${item.ownerUsername ?? "?"} · ${item.shortcode}` : "Post"}
            {item.isSponsored && <Badge variant="secondary" className="text-[10px]">Sponsored</Badge>}
          </SheetTitle>
        </SheetHeader>

        <div className="px-6 py-5 space-y-5">
          <div className="relative">
            <MediaThumbnail
              templateName={templateName}
              cachedRelPath={current.cached}
              liveUrl={current.live}
              aspect={carouselAspect}
              showVideoBadge={current.isVideo}
            />
            {slides.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setCarouselIdx((i) => Math.max(0, i - 1))}
                  disabled={safeIdx === 0}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-1.5 disabled:opacity-30"
                  aria-label="Previous"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setCarouselIdx((i) => Math.min(slides.length - 1, i + 1))}
                  disabled={safeIdx === slides.length - 1}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-1.5 disabled:opacity-30"
                  aria-label="Next"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full">
                  {safeIdx + 1}/{slides.length}
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {item.url && (
              <Button asChild variant="outline" size="sm">
                <a href={item.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Open original
                </a>
              </Button>
            )}
            {downloadUrl && (
              <Button asChild variant="outline" size="sm">
                <a href={downloadUrl} download={downloadName}>
                  <Download className="w-3 h-3 mr-1" />
                  Download
                </a>
              </Button>
            )}
          </div>

          <Tabs defaultValue="overview">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="caption">Caption</TabsTrigger>
              <TabsTrigger value="raw">Raw JSON</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Stat icon={<Heart className="w-3.5 h-3.5" />} label="Likes" value={formatNumber(item.likesCount)} />
                <Stat icon={<MessageCircle className="w-3.5 h-3.5" />} label="Comments" value={formatNumber(item.commentsCount)} />
                {views != null && (
                  <Stat icon={<Eye className="w-3.5 h-3.5" />} label="Views" value={formatNumber(views)} />
                )}
                {duration && <Stat label="Duration" value={duration} />}
                {item.timestamp && (
                  <Stat label="Posted" value={new Date(item.timestamp).toLocaleString()} />
                )}
                {item.mediaType && <Stat label="Type" value={item.mediaType} />}
                {item.productType && <Stat label="Product" value={item.productType} />}
              </div>

              {(item.hashtags?.length ?? 0) > 0 && (
                <Section title="Hashtags">
                  <div className="flex flex-wrap gap-1">
                    {item.hashtags!.map((h) => (
                      <Badge key={h} variant="secondary" className="text-[10px]">#{h}</Badge>
                    ))}
                  </div>
                </Section>
              )}

              {(item.mentions?.length ?? 0) > 0 && (
                <Section title="Mentions">
                  <div className="flex flex-wrap gap-1">
                    {item.mentions!.map((m) => (
                      <Badge key={m} variant="outline" className="text-[10px]">@{m}</Badge>
                    ))}
                  </div>
                </Section>
              )}

              {item.musicInfo && (
                <Section title="Music">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Music className="w-3 h-3" />
                    <span>{JSON.stringify(item.musicInfo).slice(0, 120)}</span>
                  </div>
                </Section>
              )}

              {item.location && (
                <Section title="Location">
                  <p className="text-xs text-muted-foreground">{item.location.name}</p>
                </Section>
              )}
            </TabsContent>

            <TabsContent value="caption" className="pt-4">
              <p className="text-sm whitespace-pre-wrap leading-relaxed">
                {item.caption || <span className="text-muted-foreground italic">No caption</span>}
              </p>
              {item.firstComment && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs text-muted-foreground mb-1">First comment:</p>
                  <p className="text-xs">{item.firstComment}</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="raw" className="pt-4">
              {item._raw ? (
                <pre className="text-[10px] bg-muted p-3 rounded overflow-auto max-h-[400px]">
                  {JSON.stringify(item._raw, null, 2)}
                </pre>
              ) : (
                <p className="text-xs text-muted-foreground italic">
                  Not captured (this run pre-dates the _raw field).
                </p>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Stat({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] text-muted-foreground flex items-center gap-1">
        {icon}
        {label}
      </p>
      <p className="font-medium">{value}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-2">
        {title}
      </p>
      {children}
    </div>
  );
}
