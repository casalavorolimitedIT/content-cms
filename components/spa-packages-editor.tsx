"use client";

import { useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowDown01Icon,
  ArrowUp01Icon,
  Delete02Icon,
  ImageUpload01Icon,
  Loading03Icon,
  PencilEdit01Icon,
} from "@hugeicons/core-free-icons";
import { createClient } from "@/lib/supabase/client";
import { appToast } from "@/app/custom/toast-ui";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { cn } from "@/lib/utils";

export interface SpaPackage {
  name: string;
  image: string;
  items: string[];
  tagline: string;
  price: string;
}

const emptyPackage: SpaPackage = {
  name: "",
  image: "",
  items: [],
  tagline: "",
  price: "",
};

export function parsePackages(packages: unknown): SpaPackage[] {
  if (Array.isArray(packages)) return packages;
  if (typeof packages === "string") {
    try {
      const parsed = JSON.parse(packages);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

// 190000 -> ₦190K, 1500000 -> ₦1.5M
export function formatPackagePrice(price: string | number) {
  const n = Number(price);
  if (!price || Number.isNaN(n)) return "";
  if (n >= 1_000_000) return `₦${+(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `₦${+(n / 1_000).toFixed(1)}K`;
  return `₦${n}`;
}

async function uploadPackageImage(file: File) {
  const supabase = createClient();
  const ext = file.name.split(".").pop();
  const path = `spa-packages/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage
    .from("post-images")
    .upload(path, file);
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from("post-images").getPublicUrl(path);
  return data.publicUrl;
}

function PackageImage({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    try {
      onChange(await uploadPackageImage(file));
    } catch (err) {
      appToast.error("Image upload failed", {
        description: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div
      onClick={() => !uploading && inputRef.current?.click()}
      className={cn(
        "relative h-32 w-full overflow-hidden rounded-lg border-2 border-dashed cursor-pointer bg-muted/30 flex items-center justify-center",
        value
          ? "border-transparent"
          : "border-muted-foreground/30 hover:border-[#ff6900]/60",
      )}
    >
      {value && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="" className="h-full w-full object-cover" />
      )}
      {(uploading || !value) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-xs text-muted-foreground bg-background/60">
          <HugeiconsIcon
            icon={uploading ? Loading03Icon : ImageUpload01Icon}
            strokeWidth={2}
            className={cn("size-5", uploading && "animate-spin")}
          />
          {uploading ? "Uploading…" : "Upload package image"}
        </div>
      )}
      {value && !uploading && (
        <span className="absolute bottom-2 right-2 rounded bg-black/60 px-2 py-0.5 text-[10px] text-white">
          Click to replace
        </span>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}

export type SpaView = "services" | "packages";

export function SpaViewToggle({
  value,
  onChange,
}: {
  value: SpaView;
  onChange: (v: SpaView) => void;
}) {
  return (
    <div className="flex w-full items-center gap-1 rounded-lg border border-border/50 bg-muted/30 p-1">
      {(["services", "packages"] as const).map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          className={cn(
            "flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-all",
            value === v
              ? "bg-background text-[#ff6900] shadow-sm border border-border/40"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {v === "services" ? "Spa Services" : "Spa Packages"}
        </button>
      ))}
    </div>
  );
}

export function SpaPackagesEditor({
  value,
  onChange,
}: {
  value: unknown;
  onChange: (packages: SpaPackage[]) => void;
}) {
  const packages = parsePackages(value);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const update = <K extends keyof SpaPackage>(
    index: number,
    field: K,
    v: SpaPackage[K],
  ) => {
    const next = [...packages];
    next[index] = { ...next[index], [field]: v };
    onChange(next);
  };

  const add = () => {
    onChange([...packages, { ...emptyPackage }]);
    setOpenIndex(packages.length);
  };

  const remove = (index: number) => {
    const name = packages[index].name || "this package";
    if (!window.confirm(`Delete ${name}?`)) return;
    onChange(packages.filter((_, i) => i !== index));
    setOpenIndex(null);
  };

  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= packages.length) return;
    const next = [...packages];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
    setOpenIndex(openIndex === index ? target : openIndex);
  };

  return (
    <div className="space-y-3">
      {packages.map((pkg, index) => {
        const isOpen = openIndex === index;
        return (
          <div key={index} className="rounded-lg border border-border/60">
            <div className="flex items-center gap-3 p-3">
              {pkg.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={pkg.image}
                  alt=""
                  className="size-10 rounded-md object-cover"
                />
              ) : (
                <div className="size-10 rounded-md bg-muted" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium uppercase">
                  {pkg.name || "Untitled package"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {pkg.items?.length ?? 0} item
                  {pkg.items?.length === 1 ? "" : "s"}
                  {pkg.price && ` · ${formatPackagePrice(pkg.price)}`}
                </p>
              </div>
              <div className="flex items-center">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                >
                  <HugeiconsIcon icon={ArrowUp01Icon} className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={index === packages.length - 1}
                  onClick={() => move(index, 1)}
                >
                  <HugeiconsIcon icon={ArrowDown01Icon} className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className={cn(isOpen && "text-[#ff6900]")}
                >
                  <HugeiconsIcon icon={PencilEdit01Icon} className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(index)}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <HugeiconsIcon icon={Delete02Icon} className="size-4" />
                </Button>
              </div>
            </div>

            {isOpen && (
              <div className="space-y-3 border-t border-border/60 p-3">
                <PackageImage
                  value={pkg.image}
                  onChange={(url) => update(index, "image", url)}
                />
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2 space-y-1.5">
                    <Label>Package name</Label>
                    <Input
                      placeholder="e.g. Tranquility Escape"
                      value={pkg.name}
                      onChange={(e) => update(index, "name", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Price</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                        ₦
                      </span>
                      <Input
                        type="number"
                        min="0"
                        placeholder="190000"
                        value={pkg.price}
                        onChange={(e) => update(index, "price", e.target.value)}
                        className="pl-7"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>What&apos;s included (one per line)</Label>
                  <Textarea
                    placeholder={`Aroma therapy massage - 1hr\nStrawberry scrub - 45mins\nGentle glow retreat (facial)`}
                    value={(pkg.items ?? []).join("\n")}
                    onChange={(e) =>
                      update(index, "items", e.target.value.split("\n"))
                    }
                    onBlur={(e) =>
                      update(
                        index,
                        "items",
                        e.target.value
                          .split("\n")
                          .map((s) => s.trim())
                          .filter(Boolean),
                      )
                    }
                    className="min-h-24 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Tagline</Label>
                  <Input
                    placeholder="e.g. Designed for deep relaxation and stress relief."
                    value={pkg.tagline}
                    onChange={(e) => update(index, "tagline", e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}

      {packages.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed rounded-lg text-muted-foreground">
          <p className="text-sm">No packages added yet</p>
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={add}
        className="w-full"
      >
        + Add Package
      </Button>
    </div>
  );
}
