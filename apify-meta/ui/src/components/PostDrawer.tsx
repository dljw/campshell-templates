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
import { ChevronLeft, ChevronRight, Download, ExternalLink, Heart, MessageCircle, Eye, Share2 } from "lucide-react";
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
  sharesCount?: number | null;
  viewsCount?: number | null;
  videoViewCount?: number | null;
  videoPlayCount?: number | null;
  videoDurationSeconds?: number | null;
  displayUrl?: string;
  videoUrl?: string;
  hashtags?: string[];
  mentions?: string[];
  isSponsored?: boolean;
  reactions?: {
    like?: number | null;
    love?: number | null;
    haha?: number | null;
    wow?: number | null;
    sad?: number | null;
    angry?: number | null;
    care?: number | null;
  };
  link?: { url: string; title: string; description: string; image: string } | null;
  pageName?: string;
  pageUrl?: string;
  childPosts?: {
    id?: string;
    type?: string;
    displayUrl?: string;
    videoUrl?: string;
  }[];
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

export function PostDrawer({
  item,
  open,
  onClose,
  templateName,
  carouselAspect = "16:9",
}: PostDrawerProps) {
  const [carouselIdx, setCarouselIdx] = useState(0);

  if (!item) return null;

  const slides =
    item.childPosts?.length ?? 0
      ? item.childPosts!.map((c, i) => ({
          cached: item.mediaCache?.[`child-${i}-thumb`] ?? null,
          live: c.displayUrl ?? "",
          isVideo: Boolean(c.videoUrl) || c.type === "Video" || c.type === "video",
        }))
      : [
          {
            cached: item.mediaCache?.thumb ?? null,
            live: item.displayUrl ?? "",
            isVideo:
              item.mediaType === "Video" ||
              Boolean(item.videoUrl),
          },
        ];

  const safeIdx = Math.min(carouselIdx, slides.length - 1);
  const current = slides[safeIdx];
  const downloadUrl = current.cached
    ? `/t/${templateName}/data/${current.cached}`
    : current.live || null;
  const downloadName = `${item.shortcode ?? item.id ?? "post"}.jpg`;
  const views = item.viewsCount ?? item.videoViewCount ?? item.videoPlayCount ?? null;

  const totalReactions = item.reactions
    ? Object.values(item.reactions).reduce<number>(
        (sum, v) => sum + (typeof v === "number" ? v : 0),
        0,
      )
    : null;

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto p-0">
        <SheetHeader className="px-6 py-4 border-b sticky top-0 bg-background z-10">
          <SheetTitle className="text-sm font-semibold flex items-center gap-2">
            {item.pageName || item.id || "Post"}
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
                <Stat icon={<Share2 className="w-3.5 h-3.5" />} label="Shares" value={formatNumber(item.sharesCount)} />
                {views != null && (
                  <Stat icon={<Eye className="w-3.5 h-3.5" />} label="Views" value={formatNumber(views)} />
                )}
                {totalReactions != null && totalReactions > 0 && (
                  <Stat label="Total Reactions" value={formatNumber(totalReactions)} />
                )}
                {item.timestamp && (
                  <Stat label="Posted" value={new Date(item.timestamp).toLocaleString()} />
                )}
                {item.mediaType && <Stat label="Type" value={item.mediaType} />}
              </div>

              {item.reactions && totalReactions != null && totalReactions > 0 && (
                <Section title="Reactions breakdown">
                  <div className="flex flex-wrap gap-2 text-xs">
                    {(Object.entries(item.reactions) as [string, number | null | undefined][])
                      .filter(([, v]) => v != null && v > 0)
                      .map(([k, v]) => (
                        <span key={k} className="text-muted-foreground">
                          {k}: <span className="font-medium text-foreground">{v!.toLocaleString()}</span>
                        </span>
                      ))}
                  </div>
                </Section>
              )}

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

              {item.link && item.link.url && (
                <Section title="Link preview">
                  <div className="text-xs space-y-1">
                    {item.link.title && <p className="font-medium">{item.link.title}</p>}
                    {item.link.description && (
                      <p className="text-muted-foreground line-clamp-2">{item.link.description}</p>
                    )}
                    <a
                      href={item.link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline break-all"
                    >
                      {item.link.url}
                    </a>
                  </div>
                </Section>
              )}
            </TabsContent>

            <TabsContent value="caption" className="pt-4">
              <p className="text-sm whitespace-pre-wrap leading-relaxed">
                {item.caption || <span className="text-muted-foreground italic">No caption</span>}
              </p>
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
