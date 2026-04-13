import {
  Article,
  Cinema,
  Event,
  normalizeTimes,
  Post,
  PostType,
  Spa,
} from "@/app/dashboard/[id]/page";
import { ImagePicker } from "./ui/image-picker";
import { Field } from "./field";
import { Input } from "./ui/input";
import {
  Calendar01Icon,
  CalendarAdd01Icon,
  Clock01Icon,
  EyeIcon,
  EyeOff,
  FloppyDiskIcon,
  Link01Icon,
  Loading03Icon,
  Location01Icon,
  Sparkle,
  Tag01Icon,
} from "@hugeicons/core-free-icons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import { WYSIWYGEditor } from "./ui/wysiwyg-editor";
import { ShowtimePicker } from "./form-elements";
import { Button } from "./ui/button";
import { useEffect, useRef, useState } from "react";
import { ChevronDownIcon } from "lucide-react";

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

export function EditPane({
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
  const [isGenreOpen, setIsGenreOpen] = useState(false);
  const genreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (genreRef.current && !genreRef.current.contains(e.target as Node)) {
        setIsGenreOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const parseCategory = (category: unknown): string[] => {
    if (Array.isArray(category)) return category;
    if (typeof category === "string") {
      try {
        const parsed = JSON.parse(category);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return category ? [category] : [];
      }
    }
    return [];
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
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsGenreOpen((prev) => !prev)}
                  className="w-full h-9 px-3 rounded-md bg-muted/30 border border-border/60 text-sm text-left flex items-center justify-between"
                >
                  <span className="truncate text-muted-foreground">
                    {parseCategory((orig as Cinema).category).length
                      ? parseCategory((orig as Cinema).category)
                          .map((g) => g.charAt(0).toUpperCase() + g.slice(1))
                          .join(", ")
                      : "Select genres"}
                  </span>
                  <ChevronDownIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                </button>

                {isGenreOpen && (
                  <div className="absolute z-10 w-full mt-1 rounded-md border border-input bg-background shadow-lg max-h-60 overflow-y-auto">
                    <div className="p-2">
                      {CINEMA_GENRES.map((genre) => {
                        const selected = parseCategory(
                          (orig as Cinema).category,
                        );

                        return (
                          <label
                            key={genre}
                            className="flex items-center gap-2 px-2 py-1.5 hover:bg-muted rounded-md cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={selected.includes(genre)}
                              onChange={() => {
                                const next = selected.includes(genre)
                                  ? selected.filter((g) => g !== genre)
                                  : [...selected, genre];
                                updateOriginal("category", next);
                              }}
                              className="h-4 w-4 rounded border-input accent-[#ff6900]"
                            />
                            <span className="text-sm capitalize">{genre}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
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
