"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Cancel01Icon,
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
} from "@hugeicons/core-free-icons";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ImagePicker } from "@/components/ui/image-picker";
import { ShowtimePicker } from "@/components/form-elements";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "./data-table";
import { createClient } from "@/lib/supabase/client";
import { appToast } from "@/app/custom/toast-ui";
import { cn } from "@/lib/utils";
import { usePosts } from "@/contexts/postContext";

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

type Article = z.infer<typeof ArticleSchema>;
type Cinema = z.infer<typeof CinemaSchema>;
type Event = z.infer<typeof EventSchema>;

type Post = {
  id: number;
  title: string;
  type: "article" | "cinema" | "event";
  status: string;
  date: string;
  category: string;
  image?: string;
  website?: string;
  is_hidden?: boolean;
  originalData: Article | Cinema | Event;
  tableName: string;
};

const TYPE_ICON = {
  article: News01Icon,
  cinema: Film01Icon,
  event: Calendar01Icon,
};

const STATUS_OPTIONS: Partial<Record<Post["type"], string[]>> = {
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

function normalizeTimes(times: any): string[] {
  if (!times) return [];
  if (Array.isArray(times)) return times;
  try {
    return JSON.parse(times);
  } catch {
    return [];
  }
}

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

interface DetailDrawerProps {
  post: Post;
  onClose: () => void;
  onSave: (updated: Post) => void;
}

export default function DetailDrawer({
  post,
  onClose,
  onSave,
}: DetailDrawerProps) {
  const [form, setForm] = useState<Post>(() =>
    JSON.parse(JSON.stringify(post)),
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isScheduled, setIsScheduled] = useState<any>(false);
  const supabase = createClient();
  const { triggerRefresh } = usePosts();

  useEffect(() => {
    setForm(JSON.parse(JSON.stringify(post)));
    const hasSchedule =
      post.originalData.scheduled_at &&
      new Date(post.originalData.scheduled_at) > new Date();
    setIsScheduled(hasSchedule);
  }, [post]);

  const TypeIcon = TYPE_ICON[form.type];

  function updateField<K extends keyof Post>(field: K, value: any) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function updateOriginal(field: string, value: any) {
    setForm((f) => ({
      ...f,
      originalData: { ...f.originalData, [field]: value },
    }));
  }

  async function uploadImage(): Promise<string | null> {
    if (!imageFile) return form.image ?? null;

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
    setIsSubmitting(true);
    try {
      const imageUrl = await uploadImage();

      let updatedOriginal = { ...form.originalData };

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
      }

      const { error } = await supabase
        .from(form.tableName)
        .update(updatedOriginal)
        .eq("id", form.id);

      if (error) {
        appToast.error("Failed to save", { description: error.message });
        return;
      }

      const updatedPost: Post = {
        ...form,
        image: imageUrl ?? form.image,
        originalData: updatedOriginal,
        status: isScheduled ? "Scheduled" : form.status,
      };

      onSave(updatedPost);
      appToast.success("Saved", {
        description: `"${form.title}" updated successfully.${isScheduled ? " Will be published on schedule." : ""}`,
      });
      triggerRefresh();
      onClose();
    } catch (error) {
      console.error(error);
      appToast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/25 backdrop-blur-[2px]"
        onClick={onClose}
      />

      <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-110 flex-col bg-background border-l border-border/50 shadow-2xl">
        <div className="flex items-center gap-3 border-b border-border/40 px-5 py-4">
          <div
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-lg",
              form.type === "article" && "bg-blue-100 text-blue-600",
              form.type === "cinema" && "bg-violet-100 text-violet-600",
              form.type === "event" && "bg-orange-100 text-orange-600",
            )}
          >
            <HugeiconsIcon
              icon={TypeIcon}
              strokeWidth={1.8}
              className="size-4"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold tracking-widest text-muted-foreground/50 capitalize">
              Edit {form.type}
            </p>
            <h2 className="text-sm font-semibold text-foreground truncate">
              {form.title}
            </h2>
          </div>
          <div className="flex items-center gap-1.5">
            <StatusBadge status={form.status} />
            <button
              onClick={onClose}
              className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted transition"
            >
              <HugeiconsIcon
                icon={Cancel01Icon}
                strokeWidth={2}
                className="size-4"
              />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
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

          {/* Schedule Toggle */}
          <div className="flex flex-col gap-3 pt-1">
            <button
              type="button"
              onClick={() => setIsScheduled(!isScheduled)}
              className={`flex items-center gap-2 text-sm font-medium w-fit transition-colors ${
                isScheduled
                  ? "text-[#ff6900]"
                  : "text-muted-foreground hover:text-foreground"
              }`}
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
                    value={
                      (form.originalData as any).scheduled_at?.slice(0, 16) ||
                      ""
                    }
                    onChange={(e) =>
                      updateOriginal("scheduled_at", e.target.value)
                    }
                    className="h-9 bg-muted/30 border-border/60 text-sm focus:border-[#ff6900] focus:ring-[#ff6900]/20"
                  />
                </Field>
              </div>
            )}
          </div>

          {form.type === "article" && (
            <>
              <Section title="Article Details" />
              <Field label="Category" icon={Tag01Icon}>
                <Select
                  value={(form.originalData as Article).category ?? ""}
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
              <Field label="Content">
                <Textarea
                  value={(form.originalData as Article).content ?? ""}
                  onChange={(e) => updateOriginal("content", e.target.value)}
                  placeholder="Write your article content..."
                  className="min-h-40 bg-muted/30 border-border/60 text-sm focus:border-[#ff6900] focus:ring-[#ff6900]/20 resize-none"
                />
              </Field>
            </>
          )}

          {form.type === "cinema" && (
            <>
              <Section title="Cinema Details" />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Genre" icon={Tag01Icon}>
                  <Select
                    value={(form.originalData as Cinema).category ?? ""}
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
                    value={(form.originalData as Cinema).rated ?? ""}
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
                value={normalizeTimes((form.originalData as Cinema).times)}
                onChange={(times) => updateOriginal("times", times)}
              />
            </>
          )}

          {form.type === "event" && (
            <>
              <Section title="Event Details" />
              <Field label="Location" icon={Location01Icon}>
                <Input
                  value={(form.originalData as Event).location ?? ""}
                  onChange={(e) => updateOriginal("location", e.target.value)}
                  placeholder="Venue or address"
                  className="h-9 bg-muted/30 border-border/60 text-sm"
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Date" icon={Calendar01Icon}>
                  <Input
                    type="date"
                    value={(form.originalData as Event).date ?? ""}
                    onChange={(e) => updateOriginal("date", e.target.value)}
                    className="h-9 bg-muted/30 border-border/60 text-sm"
                  />
                </Field>
                <Field label="Time" icon={Clock01Icon}>
                  <Input
                    type="time"
                    value={(form.originalData as Event).time ?? ""}
                    onChange={(e) => updateOriginal("time", e.target.value)}
                    className="h-9 bg-muted/30 border-border/60 text-sm"
                  />
                </Field>
              </div>
              <Field label="Description">
                <Textarea
                  value={(form.originalData as Event).description ?? ""}
                  onChange={(e) =>
                    updateOriginal("description", e.target.value)
                  }
                  placeholder="Describe the event..."
                  className="min-h-30 bg-muted/30 border-border/60 text-sm resize-none"
                />
              </Field>
            </>
          )}

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
        </div>

        <div className="flex items-center gap-2 border-t border-border/40 px-5 py-4">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg border border-border/60 px-4 py-2 text-sm text-muted-foreground hover:bg-muted transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#ff6900] px-4 py-2 text-sm font-semibold text-white hover:bg-[#ff6900]/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <HugeiconsIcon
                  icon={Loading03Icon}
                  strokeWidth={2}
                  className="size-4 animate-spin"
                />
                Saving…
              </>
            ) : (
              <>
                <HugeiconsIcon
                  icon={FloppyDiskIcon}
                  strokeWidth={2}
                  className="size-4"
                />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
