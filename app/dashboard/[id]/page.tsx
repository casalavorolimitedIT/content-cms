"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
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
} from "@hugeicons/core-free-icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/data-table";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Post {
  id: number;
  title: string;
  slug: string;
  type: "article" | "cinema" | "event";
  status: string;
  created_at: string;
  category: string;
  image?: string;
  website?: string;
  is_hidden?: boolean;
  content?: string;
  description?: string;
  location?: string;
  date?: string;
  time?: string;
  rated?: string;
  times?: string[];
  scheduled_at?: string | null;
}

function normalizeTimes(times: any): string[] {
  if (!times) return [];
  if (Array.isArray(times)) return times;
  try {
    return JSON.parse(times);
  } catch {
    return [];
  }
}

const TYPE_CONFIG = {
  article: {
    icon: News01Icon,
    label: "Article",
    bg: "bg-blue-50",
    text: "text-blue-600",
    border: "border-blue-200",
  },
  cinema: {
    icon: Film01Icon,
    label: "Cinema",
    bg: "bg-violet-50",
    text: "text-violet-600",
    border: "border-violet-200",
  },
  event: {
    icon: Calendar01Icon,
    label: "Event",
    bg: "bg-orange-50",
    text: "text-orange-600",
    border: "border-orange-200",
  },
};

const Page = () => {
  const params = useParams();
  const id = params?.id as string;
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function fetchPost() {
      if (!id) return;

      setLoading(true);
      setError(null);

      try {
        const [
          { data: article, error: e1 },
          { data: cinema, error: e2 },
          { data: event, error: e3 },
        ] = await Promise.all([
          supabase.from("articles").select("*").eq("id", id).single(),
          supabase.from("cinema").select("*").eq("id", id).single(),
          supabase.from("events").select("*").eq("id", id).single(),
        ]);
        console.log(cinema);
        if (article) {
          setPost({
            id: article.id,
            title: article.title,
            slug: article.slug,
            type: "article",
            status:
              article.scheduled_at &&
              new Date(article.scheduled_at) > new Date()
                ? "Scheduled"
                : "Live",
            created_at: article.created_at,
            category: article.category,
            image: article.image,
            website: article.website,
            is_hidden: article.is_hidden,
            content: article.content,
            scheduled_at: article.scheduled_at,
          });
        } else if (cinema) {
          setPost({
            id: cinema.id,
            title: cinema.title,
            slug: cinema.slug,
            type: "cinema",
            status:
              cinema.status === "now showing" ? "Now Showing" : "Coming Soon",
            created_at: cinema.created_at,
            category: cinema.category,
            image: cinema.image,
            website: cinema.website,
            is_hidden: cinema.is_hidden,
            rated: cinema.rated,
            times: cinema.times,
            scheduled_at: cinema.scheduled_at,
          });
        } else if (event) {
          setPost({
            id: event.id,
            title: event.title,
            slug: event.slug,
            type: "event",
            status:
              event.status === "upcoming"
                ? "Upcoming"
                : event.status === "ongoing"
                  ? "Ongoing"
                  : "Past",
            created_at: event.created_at,
            category: event.location,
            image: event.image,
            website: event.website,
            is_hidden: event.is_hidden,
            description: event.description,
            location: event.location,
            date: event.date,
            time: event.time,
            scheduled_at: event.scheduled_at,
          });
        } else {
          setError("Post not found");
        }
      } catch (err) {
        console.error("Error fetching post:", err);
        setError("Failed to load post");
      } finally {
        setLoading(false);
      }
    }

    fetchPost();
  }, [id, supabase]);

  const createMarkup = (html: string) => {
    return { __html: html };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const TypeIcon = post ? TYPE_CONFIG[post.type].icon : News01Icon;
  const typeConfig = post ? TYPE_CONFIG[post.type] : TYPE_CONFIG.article;

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

  if (error || !post) {
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
    <div className="container mx-auto px-4">
      <Link href="/dashboard">
        <Button variant="ghost" className="mb-6 gap-2">
          <HugeiconsIcon
            icon={ArrowLeft01Icon}
            strokeWidth={2}
            className="size-4"
          />
          Back to Dashboard
        </Button>
      </Link>

      <div className="mb-8">
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
          <div>
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
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
          {post.title}
        </h1>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{formatDate(post.created_at)}</span>
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
        <div className="rounded-xl overflow-hidden mb-8">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-auto max-h-96 object-cover"
          />
        </div>
      )}

      <Separator className="mb-8" />

      {post.type === "article" && (
        <div className="prose prose-lg max-w-none dark:prose-invert">
          <div
            dangerouslySetInnerHTML={createMarkup(
              post.content || "No content available",
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
              <Badge variant="secondary">{post.rated || "Not Rated"}</Badge>
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
              {(normalizeTimes(post.times) || []).map((time, i) => (
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
              <p className="text-foreground">{post.location || "TBA"}</p>
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
              <p className="text-foreground">{post.date || "TBA"}</p>
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
              <p className="text-foreground">{post.time || "TBA"}</p>
            </div>
          </div>

          <Separator />

          <div>
            <h2 className="text-xl font-semibold mb-3">About this event</h2>
            <div
              className="prose prose-sm max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={createMarkup(
                post.description || "No description available",
              )}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;
