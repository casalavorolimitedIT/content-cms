"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Button } from "./button";
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Link as LinkIcon,
  Quote,
  Code,
  Heading2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface WYSIWYGEditorProps {
  value?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function WYSIWYGEditor({
  value = "",
  onChange,
  placeholder = "Write your content here...",
  className,
  disabled = false,
}: WYSIWYGEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editable: !disabled,
    immediatelyRender: false,
  });

  if (!editor) {
    return null;
  }

  const addLink = () => {
    const url = prompt("Enter URL");
    if (url) {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url })
        .run();
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-md border border-input overflow-hidden",
        className,
      )}
    >
      <div className="flex items-center gap-1 flex-wrap bg-muted/30 p-2 border-b border-input">
        <Button
          size="sm"
          variant={editor.isActive("bold") ? "default" : "ghost"}
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={disabled}
          title="Bold"
          className="h-8 w-8 p-0"
        >
          <Bold className="w-4 h-4" />
        </Button>

        <Button
          size="sm"
          variant={editor.isActive("italic") ? "default" : "ghost"}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={disabled}
          title="Italic"
          className="h-8 w-8 p-0"
        >
          <Italic className="w-4 h-4" />
        </Button>

        <Button
          size="sm"
          variant={editor.isActive("strike") ? "default" : "ghost"}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={disabled}
          title="Strikethrough"
          className="h-8 w-8 p-0"
        >
          <Strikethrough className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-border" />

        <Button
          size="sm"
          variant={
            editor.isActive("heading", { level: 2 }) ? "default" : "ghost"
          }
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          disabled={disabled}
          title="Heading"
          className="h-8 w-8 p-0"
        >
          <Heading2 className="w-4 h-4" />
        </Button>

        <Button
          size="sm"
          variant={editor.isActive("bulletList") ? "default" : "ghost"}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          disabled={disabled}
          title="Bullet List"
          className="h-8 w-8 p-0"
        >
          <List className="w-4 h-4" />
        </Button>

        <Button
          size="sm"
          variant={editor.isActive("orderedList") ? "default" : "ghost"}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          disabled={disabled}
          title="Numbered List"
          className="h-8 w-8 p-0"
        >
          <ListOrdered className="w-4 h-4" />
        </Button>

        <Button
          size="sm"
          variant={editor.isActive("blockquote") ? "default" : "ghost"}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          disabled={disabled}
          title="Quote"
          className="h-8 w-8 p-0"
        >
          <Quote className="w-4 h-4" />
        </Button>

        <Button
          size="sm"
          variant={editor.isActive("codeBlock") ? "default" : "ghost"}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          disabled={disabled}
          title="Code Block"
          className="h-8 w-8 p-0"
        >
          <Code className="w-4 h-4" />
        </Button>

        <Button
          size="sm"
          variant={editor.isActive("link") ? "default" : "ghost"}
          onClick={addLink}
          disabled={disabled}
          title="Add Link"
          className="h-8 w-8 p-0"
        >
          <LinkIcon className="w-4 h-4" />
        </Button>
      </div>

      <EditorContent
        editor={editor}
        className={cn(
          "prose prose-sm dark:prose-invert max-w-none",
          "px-3 py-2 min-h-32 text-sm focus:outline-none",
        )}
      />
    </div>
  );
}
