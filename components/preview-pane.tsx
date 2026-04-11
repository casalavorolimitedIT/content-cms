import { HugeiconsIcon } from "@hugeicons/react";
import { Badge } from "./ui/badge";
import { StatusBadge } from "./data-table";
import {
  Calendar01Icon,
  Clock01Icon,
  EyeOff,
  Film01Icon,
  Link01Icon,
  Location01Icon,
  Tag01Icon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { Separator } from "./ui/separator";
import { createMarkup, formatDate, TYPE_CONFIG } from "@/utils/type-configs";
import {
  Article,
  Cinema,
  normalizeTimes,
  Event,
  Post,
} from "@/app/dashboard/[id]/page";

export function PreviewPane({ post }: { post: Post }) {
  const typeConfig = TYPE_CONFIG[post.type];
  const TypeIcon: any = typeConfig.icon;
  const orig = post.originalData as any;

  return (
    <div className="min-w-0 space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div
            className={cn(
              "flex size-12 items-center justify-center rounded-xl",
              typeConfig.bg,
              typeConfig.text,
            )}
          >
            <HugeiconsIcon
              icon={TypeIcon}
              strokeWidth={1.8}
              className="size-6"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant="outline"
              className={cn(typeConfig.border, typeConfig.text)}
            >
              {typeConfig.label}
            </Badge>
            <StatusBadge status={post.status} />
            {post.is_hidden && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <HugeiconsIcon
                  icon={EyeOff}
                  strokeWidth={2}
                  className="size-3.5"
                />
                Hidden
              </span>
            )}
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
          {post.title}
        </h1>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{formatDate(orig.created_at)}</span>
          {post.website && (
            <>
              <span>•</span>
              <a
                href={post.website}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#ff6900] transition flex items-center gap-1"
              >
                <HugeiconsIcon
                  icon={Link01Icon}
                  strokeWidth={2}
                  className="size-3.5"
                />
                Visit Website
              </a>
            </>
          )}
        </div>
      </div>

      {post.image && (
        <div className="rounded-xl overflow-hidden">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-auto max-h-96 object-cover"
          />
        </div>
      )}

      <Separator />

      {post.type === "article" && (
        <div className="prose prose-lg dark:prose-invert max-w-none min-w-0 overflow-x-auto">
          <div
            className="quill-content"
            dangerouslySetInnerHTML={createMarkup(
              (orig as Article).content || "No content available",
            )}
          />
          <div className="mt-6 pt-4 border-t">
            <span className="text-muted-foreground text-sm">Category:</span>
            <Badge variant="secondary" className="ml-2 capitalize">
              {post.category || "Uncategorized"}
            </Badge>
          </div>
        </div>
      )}
      {post.type === "cinema" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <HugeiconsIcon
                  icon={Tag01Icon}
                  strokeWidth={2}
                  className="size-4"
                />
                <span className="text-sm">Genre</span>
              </div>
              <Badge variant="secondary" className="capitalize">
                {post.category || "Unknown"}
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <HugeiconsIcon
                  icon={Film01Icon}
                  strokeWidth={2}
                  className="size-4"
                />
                <span className="text-sm">Rating</span>
              </div>
              <Badge variant="secondary">
                {(orig as Cinema).rated || "Not Rated"}
              </Badge>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <HugeiconsIcon
                icon={Clock01Icon}
                strokeWidth={2}
                className="size-4"
              />
              <span className="text-sm">Showtimes</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {normalizeTimes((orig as Cinema).times).map((time, i) => (
                <Badge key={i} variant="outline" className="px-3 py-1">
                  {time}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}

      {post.type === "event" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <HugeiconsIcon
                  icon={Location01Icon}
                  strokeWidth={2}
                  className="size-4"
                />
                <span className="text-sm">Location</span>
              </div>
              <p className="text-foreground">
                {(orig as Event).location || "TBA"}
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <HugeiconsIcon
                  icon={Calendar01Icon}
                  strokeWidth={2}
                  className="size-4"
                />
                <span className="text-sm">Date</span>
              </div>
              <p className="text-foreground">{(orig as Event).date || "TBA"}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <HugeiconsIcon
                  icon={Clock01Icon}
                  strokeWidth={2}
                  className="size-4"
                />
                <span className="text-sm">Time</span>
              </div>
              <p className="text-foreground">{(orig as Event).time || "TBA"}</p>
            </div>
          </div>
          <Separator />
          <div>
            <h2 className="text-xl font-semibold mb-3">About this event</h2>
            <div
              className="prose prose-sm max-w-none dark:prose-invert quill-content min-w-0 overflow-x-auto"
              dangerouslySetInnerHTML={createMarkup(
                (orig as Event).description || "No description available",
              )}
            />
          </div>
        </div>
      )}

      {post.type === "spa" &&
        (() => {
          const services: any[] = Array.isArray(orig.categories)
            ? orig.categories
            : (() => {
                try {
                  return JSON.parse(orig.categories);
                } catch {
                  return [];
                }
              })();

          const grouped = services.reduce<Record<string, any[]>>((acc, s) => {
            const key = s.category || "other";
            acc[key] = [...(acc[key] ?? []), s];
            return acc;
          }, {});

          return (
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="text-sm">
                  {services.length} service{services.length !== 1 ? "s" : ""}{" "}
                  available
                </span>
              </div>
              {Object.entries(grouped).map(([category, items]) => (
                <div key={category} className="space-y-2">
                  <h3 className="text-xs font-semibold tracking-widest text-muted-foreground/60 capitalize">
                    {category.replace(/_/g, " ")}
                  </h3>
                  <div className="divide-y divide-border/40 rounded-xl border border-border/50 overflow-hidden">
                    {items.map((item: any, i: number) => (
                      <div
                        key={i}
                        className="flex items-center justify-between px-4 py-3 bg-white dark:bg-background hover:bg-muted/30 transition-colors"
                      >
                        <span className="text-sm font-medium text-foreground">
                          {item.serviceName || item.title}
                        </span>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {item.duration && (
                            <span className="flex items-center gap-1">
                              <HugeiconsIcon
                                icon={Clock01Icon}
                                strokeWidth={2}
                                className="size-3.5"
                              />
                              {item.duration} min
                            </span>
                          )}
                          {item.price && (
                            <span className="font-semibold text-foreground">
                              ₦{Number(item.price).toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          );
        })()}
    </div>
  );
}
