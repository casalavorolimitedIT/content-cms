import { UnifiedPost } from "@/contexts/postContext";
import { cn } from "@/lib/utils";
import {
  Calendar01Icon,
  Delete02Icon,
  EyeIcon,
  EyeOff,
  Film01Icon,
  News01Icon,
  Sparkle,
  ViewIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { StatusBadge } from "./data-table";

const TYPE_CONFIG = {
  article: {
    icon: News01Icon,
    label: "Article",
    cls: "bg-blue-50 text-blue-600 border-blue-100",
  },
  cinema: {
    icon: Film01Icon,
    label: "Cinema",
    cls: "bg-violet-50 text-violet-600 border-violet-100",
  },
  event: {
    icon: Calendar01Icon,
    label: "Event",
    cls: "bg-orange-50 text-orange-600 border-orange-100",
  },
  spa: {
    icon: Sparkle,
    label: "Spa",
    cls: "bg-pink-50 text-pink-600 border-pink-100",
  },
};

function TypeBadge({ type }: { type: UnifiedPost["type"] }) {
  const cfg = TYPE_CONFIG[type];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${cfg.cls}`}
    >
      <HugeiconsIcon icon={cfg.icon} strokeWidth={2} className="size-3" />
      {cfg.label}
    </span>
  );
}

export function Row({
  post,
  selected,
  onSelect,
  onDelete,
  onView,
}: {
  post: UnifiedPost;
  selected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onView: () => void;
}) {
  return (
    <tr
      className={cn(
        "group border-b border-border/40 text-sm transition-colors hover:bg-muted/30",
        selected && "bg-orange-50/40 dark:bg-orange-950/10",
      )}
    >
      <td className="w-8 px-3 py-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={onSelect}
          className="size-4 rounded border-border accent-[#ff6900] cursor-pointer"
        />
      </td>
      <td className="px-3 py-3">
        <div className="flex items-center gap-3 max-w-65">
          {post.image ? (
            <img
              src={post.image}
              alt=""
              className="size-9 rounded-lg object-cover border border-border/40 shrink-0"
            />
          ) : (
            <div className="size-9 rounded-lg bg-pink-200 border border-border/40 flex items-center justify-center shrink-0">
              <HugeiconsIcon
                icon={Sparkle}
                strokeWidth={1.5}
                className="size-4 text-pink-500"
              />
            </div>
          )}
          <button
            onClick={onView}
            className="truncate text-left font-medium text-foreground hover:text-[#ff6900] hover:underline underline-offset-2 transition-colors"
          >
            {post.title}
          </button>
        </div>
      </td>
      <td className="px-3 py-3">
        <TypeBadge type={post.type} />
      </td>
      <td className="px-3 py-3">
        <StatusBadge status={post.status} />
      </td>
      <td className="px-3 py-3">
        <span
          className={cn(
            "inline-flex items-center gap-1 text-xs font-medium",
            post.is_hidden ? "text-muted-foreground" : "text-emerald-600",
          )}
        >
          <HugeiconsIcon
            icon={post.is_hidden ? EyeOff : EyeIcon}
            strokeWidth={2}
            className="size-3.5"
          />
          {post.is_hidden ? "Hidden" : "Visible"}
        </span>
      </td>
      <td className="px-3 py-3">
        <span className="text-xs text-muted-foreground">{post.date}</span>
      </td>
      <td className="px-3 py-3">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onView}
            className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition"
            title="View"
          >
            <HugeiconsIcon
              icon={ViewIcon}
              strokeWidth={2}
              className="size-3.5"
            />
          </button>
          <button
            onClick={onDelete}
            className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-red-50 hover:text-red-500 transition"
            title="Delete"
          >
            <HugeiconsIcon
              icon={Delete02Icon}
              strokeWidth={2}
              className="size-3.5"
            />
          </button>
        </div>
      </td>
    </tr>
  );
}
