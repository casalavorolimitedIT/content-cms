"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Loading03Icon,
  Delete02Icon,
  PencilEdit01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  ArrowLeftDoubleIcon,
  ArrowRightDoubleIcon,
  Search01Icon,
  Cancel01Icon,
  ArrowUpDownIcon,
  ArrowUp01Icon,
  ArrowDown01Icon,
  EyeIcon,
  EyeOff,
  Film01Icon,
  News01Icon,
  Calendar01Icon,
  GridIcon,
  ViewIcon,
  Sparkle,
} from "@hugeicons/core-free-icons";
import { ActionModal } from "@/app/custom/action-modal";
import { cn } from "@/lib/utils";
import { usePosts, UnifiedPost } from "@/contexts/postContext";
import { Badge } from "@/components/ui/badge";

export function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; dot: string }> = {
    Live: { bg: "bg-[#E1F5EE]", text: "text-[#085041]", dot: "bg-[#1D9E75]" },
    Scheduled: {
      bg: "bg-[#FAEEDA]",
      text: "text-[#ff6900]",
      dot: "bg-[#ff6900]",
    },
    "Now Showing": {
      bg: "bg-[#E1F5EE]",
      text: "text-[#085041]",
      dot: "bg-[#1D9E75]",
    },
    "Coming Soon": {
      bg: "bg-[#FAEEDA]",
      text: "text-[#ff6900]",
      dot: "bg-[#ff6900]",
    },
    Upcoming: {
      bg: "bg-[#FAEEDA]",
      text: "text-[#ff6900]",
      dot: "bg-[#ff6900]",
    },
    Ongoing: {
      bg: "bg-[#E1F5EE]",
      text: "text-[#085041]",
      dot: "bg-[#1D9E75]",
    },
    Past: { bg: "bg-[#F1EFE8]", text: "text-[#444441]", dot: "bg-[#888780]" },
  };
  const c = config[status] ?? config["Live"];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${c.bg} ${c.text}`}
    >
      <span className={`size-1.5 rounded-full ${c.dot}`} />
      {status}
    </span>
  );
}

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

function SortHeader({
  label,
  sortKey,
  current,
  dir,
  onSort,
}: {
  label: string;
  sortKey: string;
  current: string | null;
  dir: "asc" | "desc";
  onSort: (k: string) => void;
}) {
  const active = current === sortKey;
  return (
    <button
      onClick={() => onSort(sortKey)}
      className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition"
    >
      {label}
      <HugeiconsIcon
        icon={
          active
            ? dir === "asc"
              ? ArrowUp01Icon
              : ArrowDown01Icon
            : ArrowUpDownIcon
        }
        strokeWidth={2}
        className="size-3 text-muted-foreground/50"
      />
    </button>
  );
}

function Row({
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
            <div className="size-9 rounded-lg bg-muted border border-border/40 flex items-center justify-center shrink-0">
              <HugeiconsIcon
                icon={Sparkle}
                strokeWidth={1.5}
                className="size-4 text-muted-foreground/40"
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

export function DataTable() {
  const router = useRouter();
  const { posts, loading, deletePost, bulkDeletePosts, fetchPosts } =
    usePosts();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(0);
  const pageSize = 10;
  const [editingPost, setEditingPost] = useState<UnifiedPost | null>(null);
  const [deletingPost, setDeletingPost] = useState<UnifiedPost | null>(null);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const filtered = useMemo(() => {
    let rows = posts.filter((r) => {
      const matchSearch =
        !search || r.title.toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === "All" || r.type === typeFilter;
      return matchSearch && matchType;
    });
    if (sortKey) {
      rows = [...rows].sort((a, b) => {
        const av =
          sortKey === "date" ? new Date(a.date).getTime() : (a as any)[sortKey];
        const bv =
          sortKey === "date" ? new Date(b.date).getTime() : (b as any)[sortKey];
        return sortDir === "asc" ? (av > bv ? 1 : -1) : av < bv ? 1 : -1;
      });
    }
    return rows;
  }, [posts, search, typeFilter, sortKey, sortDir]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = filtered.slice(page * pageSize, (page + 1) * pageSize);
  const allSelected =
    pageRows.length > 0 && pageRows.every((r) => selected.has(r.id));
  const someSelected = pageRows.some((r) => selected.has(r.id));

  function handleSort(key: string) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(0);
  }

  function toggleAll() {
    setSelected((s) => {
      const next = new Set(s);
      if (allSelected) {
        pageRows.forEach((r) => next.delete(r.id));
      } else {
        pageRows.forEach((r) => next.add(r.id));
      }
      return next;
    });
  }

  async function handleSave(updated: UnifiedPost) {
    await fetchPosts();
    setEditingPost(null);
  }

  async function confirmDelete() {
    if (!deletingPost) return;
    try {
      await deletePost(deletingPost.id, deletingPost.tableName);
      setSelected(new Set());
      setDeletingPost(null);
    } catch {
      // error toast already handled in context
    }
  }

  async function confirmBulkDelete() {
    const ids = [...selected];
    try {
      await bulkDeletePosts(ids);
      setSelected(new Set());
    } catch {
      // error toast already handled in context
    } finally {
      setIsBulkDeleting(false);
    }
  }

  const types = ["All", "article", "cinema", "event", "spa"];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3">
          <HugeiconsIcon
            icon={Loading03Icon}
            strokeWidth={2}
            className="size-7 animate-spin text-[#ff6900]"
          />
          <p className="text-sm text-muted-foreground">Loading posts…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 px-4 lg:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-52 max-w-sm">
          <HugeiconsIcon
            icon={Search01Icon}
            strokeWidth={2}
            className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none"
          />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            placeholder="Search posts…"
            className="h-9 w-full rounded-lg border border-border/60 bg-background pl-9 pr-8 text-sm placeholder:text-muted-foreground/50 outline-none focus:border-[#ff6900] focus:ring-2 focus:ring-[#ff6900]/15 transition"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
            >
              <HugeiconsIcon
                icon={Cancel01Icon}
                strokeWidth={2}
                className="size-3.5"
              />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1 rounded-lg border border-border/50 bg-muted/30 p-1">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => {
                setTypeFilter(t);
                setPage(0);
              }}
              className={cn(
                "rounded-md px-3 py-1 text-xs font-medium transition-all capitalize",
                typeFilter === t
                  ? "bg-background text-foreground shadow-sm border border-border/40"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {selected.size > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-[#ff6900]/30 bg-[#ff6900]/5 px-4 py-2.5">
          <span className="text-sm font-medium text-[#ff6900]">
            {selected.size} selected
          </span>
          <div className="ml-auto flex gap-3">
            <button
              onClick={() => setSelected(new Set())}
              className="text-xs text-muted-foreground hover:text-foreground transition"
            >
              Clear
            </button>
            <button
              onClick={() => setIsBulkDeleting(true)}
              className="text-xs text-red-500 hover:text-red-600 font-medium transition"
            >
              Delete selected
            </button>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-border/50 bg-white dark:bg-background">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-muted/40">
                <th className="w-10 px-3 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected && !allSelected;
                    }}
                    onChange={toggleAll}
                    className="size-4 rounded border-border accent-[#ff6900] cursor-pointer"
                  />
                </th>
                <th className="px-3 py-3 text-left">
                  <SortHeader
                    label="Title"
                    sortKey="title"
                    current={sortKey}
                    dir={sortDir}
                    onSort={handleSort}
                  />
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Type
                </th>
                <th className="px-3 py-3 text-left">
                  <SortHeader
                    label="Status"
                    sortKey="status"
                    current={sortKey}
                    dir={sortDir}
                    onSort={handleSort}
                  />
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Visibility
                </th>
                <th className="px-3 py-3 text-left">
                  <SortHeader
                    label="Date"
                    sortKey="date"
                    current={sortKey}
                    dir={sortDir}
                    onSort={handleSort}
                  />
                </th>
                <th className="w-24 px-3 py-3" />
              </tr>
            </thead>
            <tbody>
              {pageRows.length ? (
                pageRows.map((post) => (
                  <Row
                    key={`${post.tableName}-${post.id}`}
                    post={post}
                    selected={selected.has(post.id)}
                    onSelect={() =>
                      setSelected((s) => {
                        const n = new Set(s);
                        n.has(post.id) ? n.delete(post.id) : n.add(post.id);
                        return n;
                      })
                    }
                    onDelete={() => setDeletingPost(post)}
                    onView={() => router.push(`/dashboard/${post.id}`)}
                  />
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="py-16 text-center text-sm text-muted-foreground"
                  >
                    No posts match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span className="text-xs">
          {filtered.length === 0
            ? "No results"
            : `${page * pageSize + 1}–${Math.min((page + 1) * pageSize, filtered.length)} of ${filtered.length}`}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage(0)}
            disabled={page === 0}
            className="flex size-7 items-center justify-center rounded-md border border-border/50 bg-background hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <HugeiconsIcon
              icon={ArrowLeftDoubleIcon}
              strokeWidth={2}
              className="size-3.5"
            />
          </button>
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="flex size-7 items-center justify-center rounded-md border border-border/50 bg-background hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <HugeiconsIcon
              icon={ArrowLeft01Icon}
              strokeWidth={2}
              className="size-3.5"
            />
          </button>
          <span className="px-2 text-xs">
            {page + 1} / {pageCount}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            disabled={page >= pageCount - 1}
            className="flex size-7 items-center justify-center rounded-md border border-border/50 bg-background hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              strokeWidth={2}
              className="size-3.5"
            />
          </button>
          <button
            onClick={() => setPage(pageCount - 1)}
            disabled={page >= pageCount - 1}
            className="flex size-7 items-center justify-center rounded-md border border-border/50 bg-background hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <HugeiconsIcon
              icon={ArrowRightDoubleIcon}
              strokeWidth={2}
              className="size-3.5"
            />
          </button>
        </div>
      </div>

      <ActionModal
        preset="delete"
        open={!!deletingPost}
        onOpenChange={(open) => {
          if (!open) setDeletingPost(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Post"
        description={
          deletingPost ? (
            <>
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground">
                "{deletingPost.title}"
              </span>
              ? This cannot be undone.
            </>
          ) : (
            ""
          )
        }
      />

      <ActionModal
        preset="delete"
        open={isBulkDeleting}
        onOpenChange={(open) => {
          if (!open) setIsBulkDeleting(false);
        }}
        onConfirm={confirmBulkDelete}
        title={`Delete ${selected.size} Posts`}
        description="This will permanently delete all selected posts. This action cannot be undone."
        confirmText={`Delete ${selected.size} Posts`}
      />
    </div>
  );
}
