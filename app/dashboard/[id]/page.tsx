"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { z } from "zod";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  Loading03Icon,
  PencilEdit01Icon,
  ViewIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/data-table";
import { cn } from "@/lib/utils";
import { appToast } from "@/app/custom/toast-ui";
import { usePosts } from "@/contexts/postContext";
import Link from "next/link";
import {
  ArticleSchema,
  CinemaSchema,
  EventSchema,
  SpaSchema,
} from "@/utils/schema";
import { PreviewPane } from "@/components/preview-pane";
import { EditPane } from "@/components/edit-pane";

export type Spa = z.infer<typeof SpaSchema>;
export type Article = z.infer<typeof ArticleSchema>;
export type Cinema = z.infer<typeof CinemaSchema>;
export type Event = z.infer<typeof EventSchema>;
export type PostType = "article" | "cinema" | "event" | "spa";

export interface Post {
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

export function normalizeTimes(times: any): string[] {
  if (!times) return [];
  if (Array.isArray(times)) return times;
  try {
    return JSON.parse(times);
  } catch {
    return [];
  }
}

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

interface Website {
  id: number;
  name: string;
  url: string;
  slug: string;
  status: string;
}

export default function PostPage() {
  const params = useParams();
  const id = params?.id as string;

  const [post, setPost] = useState<Post | null>(null);
  const [form, setForm] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"preview" | "edit">("preview");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isScheduled, setIsScheduled] = useState(false);
  const [websites, setWebsites] = useState<Website[]>([]);

  const supabase = createClient();
  const { triggerRefresh } = usePosts();

  const fetchWebsites = async () => {
    const { data: websitesData, error } = await supabase
      .from("websites")
      .select("*")
      .eq("status", "connected");

    if (error) {
      console.log("error getting websites", error.message);
    }
    setWebsites(websitesData || []);
  };

  useEffect(() => {
    fetchWebsites();
  }, []);

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
            websites={websites}
          />
        )}
      </div>
    </div>
  );
}
