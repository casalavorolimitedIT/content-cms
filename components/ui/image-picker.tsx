"use client";

import { useRef } from "react";
import { ImageUpload01Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Label } from "@/components/ui/label";

function ErrorMsg({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-xs text-destructive mt-1">{msg}</p>;
}

export function ImagePicker({
  value,
  onChange,
  error,
  label = "Cover Image",
}: {
  value: File | null;
  onChange: (f: File | null) => void;
  error?: string;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const preview = value ? URL.createObjectURL(value) : null;

  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      <div
        onClick={() => !value && inputRef.current?.click()}
        className={`relative flex items-center justify-center rounded-lg border-2 border-dashed transition-colors overflow-hidden
          ${value ? "border-transparent" : "border-muted-foreground/30 hover:border-[#ff6900]/60 cursor-pointer"}
          ${error ? "border-destructive" : ""}
          h-36 bg-muted/30`}
      >
        {preview ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="preview" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
              }}
              className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-colors"
            >
              <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="w-3.5 h-3.5" />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <HugeiconsIcon icon={ImageUpload01Icon} strokeWidth={1.5} className="w-8 h-8" />
            <span className="text-xs">Click to upload image</span>
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          onChange(f ?? null);
          e.target.value = "";
        }}
      />
      <ErrorMsg msg={error} />
    </div>
  );
}
