"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { z } from "zod";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  FloppyDiskIcon,
  EyeIcon,
  EyeOff,
  Film01Icon,
  News01Icon,
  Calendar01Icon,
  Clock01Icon,
  Location01Icon,
  Link01Icon,
  Tag01Icon,
  Loading03Icon,
  CalendarAdd01Icon,
  PencilEdit01Icon,
  ViewIcon,
  Sparkle,
} from "@hugeicons/core-free-icons";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WYSIWYGEditor } from "@/components/ui/wysiwyg-editor";
import { ImagePicker } from "@/components/ui/image-picker";
import { ShowtimePicker } from "@/components/form-elements";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/data-table";
import { cn } from "@/lib/utils";
import { appToast } from "@/app/custom/toast-ui";
import { usePosts } from "@/contexts/postContext";
import Link from "next/link";

// ─── Schemas ────────────────────────────────────────────────────────────────

const ArticleSchema = z.object({
  id: z.number(),
  title: z.string(),
  content: z.string(),
  category: z.string(),
  image: z.string().optional(),
  website: z.string().optional(),
  is_hidden: z.boolean().optional(),
  scheduled_at: z.string().nullable().optional(),
  created_at: z.string(),
});

const CinemaSchema = z.object({
  id: z.number(),
  title: z.string(),
  category: z.string(),
  rated: z.string(),
  times: z.array(z.string()),
  status: z.string(),
  image: z.string().optional(),
  website: z.string().optional(),
  is_hidden: z.boolean().optional(),
  scheduled_at: z.string().nullable().optional(),
  created_at: z.string(),
});

const EventSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  location: z.string(),
  date: z.string(),
  time: z.string(),
  status: z.string(),
  image: z.string().optional(),
  website: z.string().optional(),
  is_hidden: z.boolean().optional(),
  scheduled_at: z.string().nullable().optional(),
  created_at: z.string(),
});

const SpaSchema = z.object({
  id: z.number(),
  website: z.string().optional(),
  image: z.string().optional(),
  is_hidden: z.boolean().optional(),
  categories: z.any(),
  scheduled_at: z.string().nullable().optional(),
  created_at: z.string(),
});

type Spa = z.infer<typeof SpaSchema>;
type Article = z.infer<typeof ArticleSchema>;
type Cinema = z.infer<typeof CinemaSchema>;
type Event = z.infer<typeof EventSchema>;

// ─── Types ──────────────────────────────────────────────────────────────────

type PostType = "article" | "cinema" | "event" | "spa";

interface Post {
  id: number;
  title: string;
  slug?: string;
  type: PostType;
  status: string;
  date: string;
  category: string;
  image?: string;
  website?: string;
  is_hidden?: boolean;
  originalData: Article | Cinema | Event;
  tableName: string;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const TYPE_CONFIG = {
  article: {
    icon: News01Icon,
    label: "Article",
    bg: "bg-blue-50",
    text: "text-blue-600",
    border: "border-blue-200",
    cls: "bg-blue-50 text-blue-600 border-blue-100",
  },
  cinema: {
    icon: Film01Icon,
    label: "Cinema",
    bg: "bg-violet-50",
    text: "text-violet-600",
    border: "border-violet-200",
    cls: "bg-violet-50 text-violet-600 border-violet-100",
  },
  event: {
    icon: Calendar01Icon,
    label: "Event",
    bg: "bg-orange-50",
    text: "text-orange-600",
    border: "border-orange-200",
    cls: "bg-orange-50 text-orange-600 border-orange-100",
  },
  spa: {
    icon: Sparkle,
    label: "Spa",
    bg: "bg-pink-50",
    text: "text-pink-600",
    border: "border-pink-200",
    cls: "bg-pink-50 text-pink-600 border-pink-100",
  },
};

const STATUS_OPTIONS: Partial<Record<PostType, string[]>> = {
  cinema: ["Now Showing", "Coming Soon"],
  event: ["Upcoming", "Ongoing", "Past"],
};

const ARTICLE_CATEGORIES = [
  "technology",
  "lifestyle",
  "politics",
  "sports",
  "culture",
];
const CINEMA_GENRES = [
  "action",
  "adventure",
  "comedy",
  "drama",
  "fantasy",
  "horror",
  "musicals",
  "mystery",
  "romance",
  "science fiction",
  "sports",
  "thriller",
];
const CINEMA_RATINGS = ["G", "PG", "PG-13", "R", "NC-17"];

// ─── Helpers ────────────────────────────────────────────────────────────────

function normalizeTimes(times: any): string[] {
  if (!times) return [];
  if (Array.isArray(times)) return times;
  try {
    return JSON.parse(times);
  } catch {
    return [];
  }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function createMarkup(html: string) {
  return { __html: html };
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: any;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5">
        {icon && (
          <HugeiconsIcon
            icon={icon}
            strokeWidth={1.8}
            className="size-3 text-muted-foreground/70"
          />
        )}
        <Label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
          {label}
        </Label>
      </div>
      {children}
    </div>
  );
}

function Section({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40">
        {title}
      </span>
      <div className="flex-1 h-px bg-border/50" />
    </div>
  );
}

// ─── Mode Toggle ────────────────────────────────────────────────────────────

function ModeToggle({
  mode,
  onChange,
}: {
  mode: "preview" | "edit";
  onChange: (m: "preview" | "edit") => void;
}) {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-border/50 bg-muted/30 p-1">
      {(["preview", "edit"] as const).map((m) => (
        <button
          key={m}
          onClick={() => onChange(m)}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all capitalize",
            mode === m
              ? "bg-background text-foreground shadow-sm border border-border/40"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <HugeiconsIcon
            icon={m === "preview" ? ViewIcon : PencilEdit01Icon}
            strokeWidth={2}
            className="size-3"
          />
          {m}
        </button>
      ))}
    </div>
  );
}

// ─── Preview Mode ────────────────────────────────────────────────────────────

function PreviewPane({ post }: { post: Post }) {
  const typeConfig = TYPE_CONFIG[post.type];
  const TypeIcon = typeConfig.icon;
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

// ─── Edit Mode ───────────────────────────────────────────────────────────────

function EditPane({
  form,
  setForm,
  imageFile,
  setImageFile,
  isScheduled,
  setIsScheduled,
  isSubmitting,
  onSave,
  onCancel,
}: {
  form: Post;
  setForm: React.Dispatch<React.SetStateAction<Post | null>>;
  imageFile: File | null;
  setImageFile: (f: File | null) => void;
  isScheduled: boolean;
  setIsScheduled: (v: boolean) => void;
  isSubmitting: boolean;
  onSave: () => void;
  onCancel: () => void;
}) {
  function updateField<K extends keyof Post>(field: K, value: any) {
    setForm((f) => (f ? { ...f, [field]: value } : f));
  }

  function updateOriginal(field: string, value: any) {
    setForm((f) =>
      f ? { ...f, originalData: { ...f.originalData, [field]: value } } : f,
    );
  }

  const orig = form.originalData as any;

  return (
    <div className="space-y-5">
      <ImagePicker
        label="Cover Image"
        value={imageFile}
        onChange={setImageFile}
      />
      {!imageFile && form.image && (
        <div className="-mt-3">
          <img
            src={form.image}
            alt="current"
            className="h-36 w-full rounded-lg object-cover border border-border/40"
          />
          <p className="text-[10px] text-muted-foreground/50 mt-1">
            Current image — upload a new one to replace.
          </p>
        </div>
      )}

      <Section title="Basic Info" />

      <Field label="Title">
        <Input
          value={form.title}
          onChange={(e) => updateField("title", e.target.value)}
          className="h-9 bg-muted/30 border-border/60 text-sm focus:border-[#ff6900] focus:ring-[#ff6900]/20"
        />
      </Field>

      <Field label="Website" icon={Link01Icon}>
        <Input
          value={form.website ?? ""}
          onChange={(e) => updateField("website", e.target.value)}
          placeholder="https://example.com"
          className="h-9 bg-muted/30 border-border/60 text-sm focus:border-[#ff6900] focus:ring-[#ff6900]/20"
        />
      </Field>

      {form.type !== "article" && STATUS_OPTIONS[form.type] && (
        <Field label="Status">
          <Select
            value={form.status}
            onValueChange={(v) => updateField("status", v)}
          >
            <SelectTrigger className="h-9 bg-muted/30 border-border/60 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS[form.type]!.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      )}

      {/* Schedule */}
      <div className="flex flex-col gap-3 pt-1">
        <button
          type="button"
          onClick={() => setIsScheduled(!isScheduled)}
          className={cn(
            "flex items-center gap-2 text-sm font-medium w-fit transition-colors",
            isScheduled
              ? "text-[#ff6900]"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <HugeiconsIcon
            icon={CalendarAdd01Icon}
            strokeWidth={2}
            className="w-4 h-4"
          />
          Schedule for later
        </button>
        {isScheduled && (
          <div className="pl-6 border-l-2 border-[#ff6900]/40">
            <Field label="Date & Time">
              <Input
                type="datetime-local"
                value={orig.scheduled_at?.slice(0, 16) || ""}
                onChange={(e) => updateOriginal("scheduled_at", e.target.value)}
                className="h-9 bg-muted/30 border-border/60 text-sm focus:border-[#ff6900] focus:ring-[#ff6900]/20"
              />
            </Field>
          </div>
        )}
      </div>

      {/* ── Article fields ─────────────────────────────────────────────────── */}
      {form.type === "article" && (
        <>
          <Section title="Article Details" />
          <Field label="Category" icon={Tag01Icon}>
            <Select
              value={(orig as Article).category ?? ""}
              onValueChange={(v) => updateOriginal("category", v)}
            >
              <SelectTrigger className="h-9 bg-muted/30 border-border/60 text-sm">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {ARTICLE_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c} className="capitalize">
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          {/* WYSIWYG — loads existing HTML content so user sees formatted text */}
          <Field label="Content">
            <WYSIWYGEditor
              value={(orig as Article).content ?? ""}
              onChange={(html) => updateOriginal("content", html)}
              placeholder="Write your article content…"
            />
          </Field>
        </>
      )}

      {/* ── Cinema fields ──────────────────────────────────────────────────── */}
      {form.type === "cinema" && (
        <>
          <Section title="Cinema Details" />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Genre" icon={Tag01Icon}>
              <Select
                value={(orig as Cinema).category ?? ""}
                onValueChange={(v) => updateOriginal("category", v)}
              >
                <SelectTrigger className="h-9 bg-muted/30 border-border/60 text-sm">
                  <SelectValue placeholder="Genre" />
                </SelectTrigger>
                <SelectContent>
                  {CINEMA_GENRES.map((g) => (
                    <SelectItem key={g} value={g} className="capitalize">
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Rating">
              <Select
                value={(orig as Cinema).rated ?? ""}
                onValueChange={(v) => updateOriginal("rated", v)}
              >
                <SelectTrigger className="h-9 bg-muted/30 border-border/60 text-sm">
                  <SelectValue placeholder="Rating" />
                </SelectTrigger>
                <SelectContent>
                  {CINEMA_RATINGS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
          <ShowtimePicker
            value={normalizeTimes((orig as Cinema).times)}
            onChange={(times) => updateOriginal("times", times)}
          />
        </>
      )}

      {/* ── Event fields ───────────────────────────────────────────────────── */}
      {form.type === "event" && (
        <>
          <Section title="Event Details" />
          <Field label="Location" icon={Location01Icon}>
            <Input
              value={(orig as Event).location ?? ""}
              onChange={(e) => updateOriginal("location", e.target.value)}
              placeholder="Venue or address"
              className="h-9 bg-muted/30 border-border/60 text-sm"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Date" icon={Calendar01Icon}>
              <Input
                type="date"
                value={(orig as Event).date ?? ""}
                onChange={(e) => updateOriginal("date", e.target.value)}
                className="h-9 bg-muted/30 border-border/60 text-sm"
              />
            </Field>
            <Field label="Time" icon={Clock01Icon}>
              <Input
                type="time"
                value={(orig as Event).time ?? ""}
                onChange={(e) => updateOriginal("time", e.target.value)}
                className="h-9 bg-muted/30 border-border/60 text-sm"
              />
            </Field>
          </div>

          {/* WYSIWYG — loads existing HTML description so user sees formatted text */}
          <Field label="Description">
            <WYSIWYGEditor
              value={(orig as Event).description ?? ""}
              onChange={(html) => updateOriginal("description", html)}
              placeholder="Describe the event…"
            />
          </Field>
        </>
      )}

      {form.type === "spa" &&
        (() => {
          const getServices = (): any[] => {
            const cats = (orig as Spa).categories;
            if (!cats) return [];
            if (Array.isArray(cats)) return cats;
            try {
              return JSON.parse(cats);
            } catch {
              return [];
            }
          };

          const services = getServices();

          const updateService = (
            index: number,
            field: string,
            value: string,
          ) => {
            const updated = [...services];
            updated[index] = { ...updated[index], [field]: value };
            updateOriginal("categories", updated);
          };

          const removeService = (index: number) => {
            const updated = services.filter((_, i) => i !== index);
            updateOriginal("categories", updated);
          };

          const addService = () => {
            updateOriginal("categories", [
              ...services,
              { serviceName: "", category: "", price: "", duration: "" },
            ]);
          };

          const serviceCategories = [
            { value: "massage", label: "Massage" },
            { value: "facial", label: "Facial" },
            { value: "body treatment", label: "Body Treatment" },
            { value: "hair removal", label: "Hair Removal" },
            { value: "nail care", label: "Nail Care" },
            { value: "wellness", label: "Wellness" },
            { value: "package", label: "Package" },
            { value: "other", label: "Other" },
          ];

          return (
            <>
              <Section title="Services / Treatments" />
              <div className="space-y-3">
                {services.map((item: any, index: number) => (
                  <div
                    key={index}
                    className="flex gap-3 items-start p-3 border rounded-lg border-border/50"
                  >
                    <div className="flex-1 space-y-2">
                      <Input
                        placeholder="Service name"
                        value={item.serviceName || item.title || ""}
                        onChange={(e) =>
                          updateService(index, "serviceName", e.target.value)
                        }
                        className="h-9 bg-muted/30 border-border/60 text-sm"
                      />
                      <div className="grid grid-cols-3 gap-2">
                        <Select
                          value={item.category || ""}
                          onValueChange={(v) =>
                            updateService(index, "category", v)
                          }
                        >
                          <SelectTrigger className="h-9 bg-muted/30 border-border/60 text-sm">
                            <SelectValue placeholder="Category" />
                          </SelectTrigger>
                          <SelectContent>
                            {serviceCategories.map((cat) => (
                              <SelectItem key={cat.value} value={cat.value}>
                                {cat.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                            ₦
                          </span>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            value={item.price || ""}
                            onChange={(e) =>
                              updateService(index, "price", e.target.value)
                            }
                            className="h-9 bg-muted/30 border-border/60 text-sm pl-7"
                          />
                        </div>
                        <div className="relative">
                          <Input
                            type="number"
                            min="1"
                            step="1"
                            placeholder="60"
                            value={item.duration || ""}
                            onChange={(e) =>
                              updateService(index, "duration", e.target.value)
                            }
                            className="h-9 bg-muted/30 border-border/60 text-sm pr-10"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                            min
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeService(index)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <HugeiconsIcon
                        icon={Sparkle}
                        strokeWidth={2}
                        className="size-4"
                      />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addService}
                  className="w-full"
                >
                  + Add Service
                </Button>
              </div>
            </>
          );
        })()}

      <Section title="Visibility" />
      <button
        type="button"
        onClick={() => updateField("is_hidden", !form.is_hidden)}
        className={cn(
          "flex w-full items-center justify-between rounded-xl border px-4 py-3 transition-all",
          form.is_hidden
            ? "border-border/60 bg-muted/30"
            : "border-emerald-200 bg-emerald-50/60 dark:border-emerald-800 dark:bg-emerald-950/30",
        )}
      >
        <div className="flex items-center gap-3">
          <HugeiconsIcon
            icon={form.is_hidden ? EyeOff : EyeIcon}
            strokeWidth={1.8}
            className={cn(
              "size-4",
              form.is_hidden ? "text-muted-foreground" : "text-emerald-600",
            )}
          />
          <div className="text-left">
            <p className="text-sm font-medium">
              {form.is_hidden ? "Hidden" : "Visible"}
            </p>
            <p className="text-xs text-muted-foreground">
              {form.is_hidden
                ? "This post won't appear publicly."
                : "This post is publicly visible."}
            </p>
          </div>
        </div>
        <div
          className={cn(
            "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
            form.is_hidden ? "bg-muted-foreground/30" : "bg-emerald-500",
          )}
        >
          <span
            className={cn(
              "pointer-events-none mx-0.5 inline-block h-5 w-5 rounded-full bg-white shadow transition-transform",
              form.is_hidden ? "translate-x-0" : "translate-x-5",
            )}
          />
        </div>
      </button>

      {/* Actions */}
      <div className="flex items-center gap-2 border-t border-border/40 pt-5">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          onClick={onSave}
          disabled={isSubmitting}
          className="bg-[#ff6900] hover:bg-[#ff6900]/90 text-white"
        >
          {isSubmitting ? (
            <>
              <HugeiconsIcon
                icon={Loading03Icon}
                strokeWidth={2}
                className="size-4 animate-spin mr-2"
              />
              Saving…
            </>
          ) : (
            <>
              <HugeiconsIcon
                icon={FloppyDiskIcon}
                strokeWidth={2}
                className="size-4 mr-2"
              />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function PostPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [post, setPost] = useState<Post | null>(null);
  const [form, setForm] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"preview" | "edit">("preview");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isScheduled, setIsScheduled] = useState(false);

  const supabase = createClient();
  const { triggerRefresh } = usePosts();

  useEffect(() => {
    async function fetchPost() {
      if (!id) return;
      setLoading(true);
      setError(null);

      try {
        const [
          { data: article },
          { data: cinema },
          { data: event },
          { data: spa },
        ] = await Promise.all([
          supabase.from("articles").select("*").eq("id", id).single(),
          supabase.from("cinema").select("*").eq("id", id).single(),
          supabase.from("events").select("*").eq("id", id).single(),
          supabase.from("spa").select("*").eq("id", id).single(),
        ]);

        let fetched: Post | null = null;

        if (article) {
          fetched = {
            id: article.id,
            title: article.title,
            type: "article",
            status:
              article.scheduled_at &&
              new Date(article.scheduled_at) > new Date()
                ? "Scheduled"
                : "Live",
            date: new Date(article.created_at).toLocaleDateString(),
            category: article.category,
            image: article.image,
            website: article.website,
            is_hidden: article.is_hidden,
            originalData: article,
            tableName: "articles",
          };
        } else if (cinema) {
          fetched = {
            id: cinema.id,
            title: cinema.title,
            type: "cinema",
            status:
              cinema.status === "now showing" ? "Now Showing" : "Coming Soon",
            date: new Date(cinema.created_at).toLocaleDateString(),
            category: cinema.category,
            image: cinema.image,
            website: cinema.website,
            is_hidden: cinema.is_hidden,
            originalData: cinema,
            tableName: "cinema",
          };
        } else if (event) {
          fetched = {
            id: event.id,
            title: event.title,
            type: "event",
            status:
              event.status === "upcoming"
                ? "Upcoming"
                : event.status === "ongoing"
                  ? "Ongoing"
                  : "Past",
            date: new Date(event.created_at).toLocaleDateString(),
            category: event.location,
            image: event.image,
            website: event.website,
            is_hidden: event.is_hidden,
            originalData: event,
            tableName: "events",
          };
        } else if (spa) {
          const services = Array.isArray(spa.categories)
            ? spa.categories
            : (() => {
                try {
                  return JSON.parse(spa.categories);
                } catch {
                  return [];
                }
              })();

          fetched = {
            id: spa.id,
            title: `Spa Services`,
            type: "spa",
            status:
              spa.scheduled_at && new Date(spa.scheduled_at) > new Date()
                ? "Scheduled"
                : "Live",
            date: new Date(spa.created_at).toLocaleDateString(),
            category: "",
            image: spa.image,
            website: spa.website,
            is_hidden: spa.is_hidden,
            originalData: spa,
            tableName: "spa",
          };
        } else {
          setError("Post not found");
          return;
        }

        setPost(fetched);
        setForm(JSON.parse(JSON.stringify(fetched)));
        const hasSchedule =
          fetched.originalData.scheduled_at &&
          new Date(fetched.originalData.scheduled_at) > new Date();
        setIsScheduled(!!hasSchedule);
      } catch (err) {
        console.error("Error fetching post:", err);
        setError("Failed to load post");
      } finally {
        setLoading(false);
      }
    }

    fetchPost();
  }, [id]);

  async function uploadImage(): Promise<string | null> {
    if (!imageFile || !form) return form?.image ?? null;
    const ext = imageFile.name.split(".").pop();
    const oldImagePath = form.image?.split("/").pop();
    const path = `${form.tableName}/${form.id}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from("images")
      .upload(path, imageFile, { upsert: true });
    if (error) {
      appToast.error("Image upload failed", { description: error.message });
      return null;
    }
    if (oldImagePath && form.image) {
      await supabase.storage
        .from("images")
        .remove([`${form.tableName}/${oldImagePath}`]);
    }
    const { data } = supabase.storage.from("images").getPublicUrl(path);
    return data.publicUrl;
  }

  async function handleSave() {
    if (!form) return;
    setIsSubmitting(true);
    try {
      const imageUrl = await uploadImage();
      let updatedOriginal = { ...form.originalData } as any;
      updatedOriginal.title = form.title;
      updatedOriginal.website = form.website;
      updatedOriginal.is_hidden = form.is_hidden;
      if (imageUrl) updatedOriginal.image = imageUrl;

      if (isScheduled && (form.originalData as any).scheduled_at) {
        updatedOriginal.scheduled_at = (form.originalData as any).scheduled_at;
      } else if (!isScheduled) {
        updatedOriginal.scheduled_at = null;
      }

      if (form.type === "article") {
        updatedOriginal = {
          ...updatedOriginal,
          category: (form.originalData as Article).category,
          content: (form.originalData as Article).content,
        };
      } else if (form.type === "cinema") {
        updatedOriginal = {
          ...updatedOriginal,
          category: (form.originalData as Cinema).category,
          rated: (form.originalData as Cinema).rated,
          times: (form.originalData as Cinema).times,
          status: form.status === "Now Showing" ? "now showing" : "coming soon",
        };
      } else if (form.type === "event") {
        updatedOriginal = {
          ...updatedOriginal,
          description: (form.originalData as Event).description,
          location: (form.originalData as Event).location,
          date: (form.originalData as Event).date,
          time: (form.originalData as Event).time,
          status:
            form.status === "Upcoming"
              ? "upcoming"
              : form.status === "Ongoing"
                ? "ongoing"
                : "past",
        };
      } else if (form.type === "spa") {
        updatedOriginal = {
          ...updatedOriginal,
          categories: (form.originalData as any).categories,
        };
      }

      const { error } = await supabase
        .from(form.tableName)
        .update(updatedOriginal)
        .eq("id", form.id);
      if (error) {
        appToast.error("Failed to save", { description: error.message });
        return;
      }

      appToast.success("Saved", {
        description: `"${form.title}" updated successfully.`,
      });
      triggerRefresh();
      setPost(JSON.parse(JSON.stringify(form)));
      setMode("preview");
    } catch (err) {
      console.error(err);
      appToast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleCancel() {
    setForm(JSON.parse(JSON.stringify(post)));
    setImageFile(null);
    setMode("preview");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <HugeiconsIcon
            icon={Loading03Icon}
            strokeWidth={2}
            className="size-8 animate-spin text-[#ff6900]"
          />
          <p className="text-sm text-muted-foreground">Loading post...</p>
        </div>
      </div>
    );
  }

  if (error || !post || !form) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-muted-foreground">{error || "Post not found"}</p>
        <Link href="/dashboard">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/dashboard">
          <Button variant="ghost" className="gap-2 mb-4">
            <HugeiconsIcon
              icon={ArrowLeft01Icon}
              strokeWidth={2}
              className="size-4"
            />
            Back to Dashboard
          </Button>
        </Link>

        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {mode === "preview" ? "Post Details" : "Edit Post"}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {mode === "preview"
                ? "Viewing uploaded content"
                : "Make changes to your post"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <StatusBadge status={form.status} />
            <ModeToggle mode={mode} onChange={setMode} />
          </div>
        </div>
      </div>

      <div className="min-w-0 bg-white dark:bg-background rounded-xl border border-border/50 p-6">
        {mode === "preview" ? (
          <PreviewPane post={form} />
        ) : (
          <EditPane
            form={form}
            setForm={setForm}
            imageFile={imageFile}
            setImageFile={setImageFile}
            isScheduled={isScheduled}
            setIsScheduled={setIsScheduled}
            isSubmitting={isSubmitting}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        )}
      </div>
    </div>
  );
}
