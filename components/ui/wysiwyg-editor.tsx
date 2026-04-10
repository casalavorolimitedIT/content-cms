"use client";

import { useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

export interface WYSIWYGEditorProps {
  value?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ font: [] }],
  [{ size: ["small", false, "large", "huge"] }],
  ["bold", "italic", "underline", "strike"],
  [{ color: [] }, { background: [] }],
  [{ script: "sub" }, { script: "super" }],
  ["blockquote", "code-block"],
  [{ list: "ordered" }, { list: "bullet" }, { list: "check" }],
  [{ indent: "-1" }, { indent: "+1" }],
  [{ direction: "rtl" }],
  [{ align: [] }],
  ["link", "image", "video", "formula"],
  ["clean"],
];

// Inject styles once at module level — never duplicated regardless of
// how many editor instances or how many times React re-runs effects.
function ensureStyles() {
  if (typeof document === "undefined") return;

  if (!document.getElementById("quill-snow-css")) {
    const link = document.createElement("link");
    link.id = "quill-snow-css";
    link.rel = "stylesheet";
    link.href = "https://cdn.jsdelivr.net/npm/quill@2/dist/quill.snow.css";
    document.head.appendChild(link);
  }

  if (!document.getElementById("quill-custom-css")) {
    const style = document.createElement("style");
    style.id = "quill-custom-css";
    // NOTE: NO overflow:hidden on the wrapper — that clips Quill's dropdowns.
    // Dropdowns are absolutely positioned children and need to escape the wrapper.
    style.textContent = `
      .ql-custom-wrapper {
        border-radius: 0.5rem;
        border: 1px solid hsl(var(--border));
        background: hsl(var(--background));
        transition: border-color 0.15s, box-shadow 0.15s;
        /* No overflow:hidden here — it clips the picker dropdowns */
      }
      .ql-custom-wrapper:focus-within {
        border-color: #ff6900;
        box-shadow: 0 0 0 3px rgb(255 105 0 / 0.12);
      }

      /* Round the toolbar top corners to match the wrapper */
      .ql-custom-wrapper .ql-toolbar.ql-snow {
        border: none;
        border-bottom: 1px solid hsl(var(--border));
        border-radius: 0.5rem 0.5rem 0 0;
        background: hsl(var(--muted) / 0.3);
        padding: 8px;
        flex-wrap: wrap;
      }

      /* Round the container bottom corners */
      .ql-custom-wrapper .ql-container.ql-snow {
        border: none;
        border-radius: 0 0 0.5rem 0.5rem;
        font-family: inherit;
        font-size: 0.875rem;
      }

      .ql-custom-wrapper .ql-editor {
        min-height: 180px;
        padding: 12px;
        color: hsl(var(--foreground));
        caret-color: #ff6900;
        /* Prevent the editor itself from pushing content outside its container */
        overflow-y: auto;
        word-break: break-word;
      }
      .ql-custom-wrapper .ql-editor.ql-blank::before {
        color: hsl(var(--muted-foreground) / 0.5);
        font-style: normal;
      }
      .ql-custom-wrapper .ql-editor:focus { outline: none; }

      /* Toolbar button states */
      .ql-custom-wrapper .ql-toolbar button:hover,
      .ql-custom-wrapper .ql-toolbar button:focus,
      .ql-custom-wrapper .ql-toolbar button.ql-active {
        color: #ff6900 !important;
      }
      .ql-custom-wrapper .ql-toolbar button:hover .ql-stroke,
      .ql-custom-wrapper .ql-toolbar button:focus .ql-stroke,
      .ql-custom-wrapper .ql-toolbar button.ql-active .ql-stroke {
        stroke: #ff6900 !important;
      }
      .ql-custom-wrapper .ql-toolbar button:hover .ql-fill,
      .ql-custom-wrapper .ql-toolbar button:focus .ql-fill,
      .ql-custom-wrapper .ql-toolbar button.ql-active .ql-fill {
        fill: #ff6900 !important;
      }
      .ql-custom-wrapper .ql-toolbar .ql-picker-label:hover,
      .ql-custom-wrapper .ql-toolbar .ql-picker-item:hover {
        color: #ff6900 !important;
      }

      /* Embedded images */
      .ql-custom-wrapper .ql-editor img {
        max-width: 100%;
        border-radius: 6px;
        margin: 4px 0;
        cursor: pointer;
      }

      /* Disabled */
      .ql-custom-wrapper.is-disabled .ql-toolbar {
        pointer-events: none;
        opacity: 0.5;
      }
      .ql-custom-wrapper.is-disabled .ql-editor {
        pointer-events: none;
        opacity: 0.6;
        background: hsl(var(--muted) / 0.3);
      }
    `;
    document.head.appendChild(style);
  }
}

export function WYSIWYGEditor({
  value = "",
  onChange,
  placeholder = "Write your content here...",
  className,
  disabled = false,
}: WYSIWYGEditorProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<any>(null);
  const onChangeRef = useRef(onChange);
  const valueRef = useRef(value);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const imageHandler = useCallback(() => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file || !quillRef.current) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        const quill = quillRef.current;
        const range = quill.getSelection(true);
        quill.insertEmbed(range.index, "image", base64);
        quill.setSelection(range.index + 1);
      };
      reader.readAsDataURL(file);
    };
  }, []);

  useEffect(() => {
    // ── Guard: if a Quill instance already lives in the wrapper, bail out.
    // This is what stops React 18 Strict Mode's double-invoke from creating
    // two toolbars. The cleanup below physically removes all Quill DOM before
    // the second run, so this guard only fires if something external re-mounts.
    if (!wrapperRef.current) return;
    if (wrapperRef.current.querySelector(".ql-toolbar")) return;

    ensureStyles();

    let quill: any = null;

    async function init() {
      if (!wrapperRef.current) return;

      // Still check after the async gap — Strict Mode cleanup may have fired.
      if (wrapperRef.current.querySelector(".ql-toolbar")) return;

      const { default: Quill } = await import("quill");

      // Optional image resize
      try {
        const mod = await import("quill-image-resize-module-react");
        const ImageResize = mod.default ?? mod;
        if (ImageResize) Quill.register("modules/imageResize", ImageResize);
      } catch {
        // not installed — fine
      }

      if (!wrapperRef.current) return;
      // One final DOM check after all awaits
      if (wrapperRef.current.querySelector(".ql-toolbar")) return;

      // Create a fresh inner div for Quill to mount into.
      // We never hand wrapperRef itself to Quill — that div is our styled shell.
      const editorDiv = document.createElement("div");
      wrapperRef.current.appendChild(editorDiv);

      const modules: Record<string, any> = {
        toolbar: {
          container: TOOLBAR_OPTIONS,
          handlers: { image: imageHandler },
        },
        history: { delay: 1000, maxStack: 100, userOnly: true },
      };

      quill = new Quill(editorDiv, {
        theme: "snow",
        placeholder,
        readOnly: disabled,
        modules,
      });

      if (valueRef.current) {
        quill.clipboard.dangerouslyPasteHTML(valueRef.current);
      }

      quill.on("text-change", () => {
        const html = quill.getSemanticHTML();
        const isEmpty =
          quill.getText().trim().length === 0 &&
          !quill.getContents().ops?.some((op: any) => op.insert?.image);
        onChangeRef.current?.(isEmpty ? "" : html);
      });

      quillRef.current = quill;
    }

    init();

    return () => {
      // Physically remove every Quill-generated DOM node from the wrapper.
      // This ensures a clean slate if React re-runs the effect (Strict Mode).
      quillRef.current = null;
      if (wrapperRef.current) {
        wrapperRef.current.innerHTML = "";
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync external value → editor (e.g. after Cancel resets the form)
  useEffect(() => {
    if (!quillRef.current) return;
    const quill = quillRef.current;
    const current = quill.getSemanticHTML();
    if (value !== current) {
      const sel = quill.getSelection();
      quill.clipboard.dangerouslyPasteHTML(value ?? "");
      if (sel) quill.setSelection(Math.min(sel.index, quill.getLength() - 1));
    }
    valueRef.current = value;
  }, [value]);

  // Sync disabled prop
  useEffect(() => {
    if (!quillRef.current) return;
    quillRef.current.enable(!disabled);
  }, [disabled]);

  return (
    <div
      ref={wrapperRef}
      className={cn("ql-custom-wrapper", disabled && "is-disabled", className)}
    />
  );
}
