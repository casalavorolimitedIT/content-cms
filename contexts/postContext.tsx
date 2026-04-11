"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { createClient } from "@/lib/supabase/client";
import { appToast } from "@/app/custom/toast-ui";

export interface UnifiedPost {
  id: number;
  title: string;
  type: "article" | "cinema" | "event" | "spa";
  status: string;
  date: string;
  category: string;
  image?: string;
  website?: string;
  is_hidden?: boolean;
  originalData: any;
  tableName: string;
}

interface PostContextType {
  posts: UnifiedPost[];
  loading: boolean;
  refreshTrigger: number;
  triggerRefresh: () => Promise<void>;
  fetchPosts: () => Promise<void>;
  addPost: (post: UnifiedPost) => void;
  updatePost: (id: number, updatedPost: UnifiedPost) => void;
  deletePost: (id: number, tableName: string) => Promise<void>;
  bulkDeletePosts: (ids: number[]) => Promise<void>;
}

const PostContext = createContext<PostContextType | undefined>(undefined);

function resolveStatus(
  scheduled_at: string | null | undefined,
  status?: string,
): string {
  if (status) {
    if (status === "now showing") return "Now Showing";
    if (status === "coming soon") return "Coming Soon";
    if (["upcoming", "ongoing", "past"].includes(status)) {
      return status.charAt(0).toUpperCase() + status.slice(1);
    }
  }
  if (scheduled_at && new Date(scheduled_at) > new Date()) {
    return "Scheduled";
  }
  return "Live";
}

function getSpaTitle(categories: unknown): string {
  let parsedCategories: any[] = [];

  if (Array.isArray(categories)) {
    parsedCategories = categories;
  } else if (typeof categories === "string") {
    try {
      const parsed = JSON.parse(categories);
      parsedCategories = Array.isArray(parsed) ? parsed : [];
    } catch {
      parsedCategories = [];
    }
  }

  const names = parsedCategories
    .map(
      (item) =>
        item?.serviceName?.toString().trim() ||
        item?.title?.toString().trim() ||
        item?.name?.toString().trim() ||
        "",
    )
    .filter(Boolean);

  return names.join(", ") || "Spa";
}

export function PostProvider({ children }: { children: React.ReactNode }) {
  const [posts, setPosts] = useState<UnifiedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const supabase = createClient();

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const [
        { data: articles, error: e1 },
        { data: cinema, error: e2 },
        { data: events, error: e3 },
        { data: spa, error: e4 },
      ] = await Promise.all([
        supabase
          .from("articles")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("cinema")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("events")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("spa")
          .select("*")
          .order("created_at", { ascending: false }),
      ]);

      if (e1) throw e1;
      if (e2) throw e2;
      if (e3) throw e3;
      if (e4) throw e4;

      const articlePosts: UnifiedPost[] = (articles ?? []).map((a) => ({
        id: a.id,
        title: a.title,
        type: "article",
        status: resolveStatus(a.scheduled_at, a.status),
        date: new Date(a.created_at).toLocaleDateString(),
        category: a.category || "",
        image: a.image,
        website: a.website,
        is_hidden: a.is_hidden ?? false,
        originalData: a,
        tableName: "articles",
      }));

      const cinemaPosts: UnifiedPost[] = (cinema ?? []).map((m) => ({
        id: m.id,
        title: m.title,
        type: "cinema",
        status: resolveStatus(m.scheduled_at, m.status),
        date: new Date(m.created_at).toLocaleDateString(),
        category: m.category || "",
        image: m.image,
        website: m.website,
        is_hidden: m.is_hidden ?? false,
        originalData: m,
        tableName: "cinema",
      }));

      const eventPosts: UnifiedPost[] = (events ?? []).map((ev) => ({
        id: ev.id,
        title: ev.title,
        type: "event",
        status: resolveStatus(ev.scheduled_at, ev.status),
        date: new Date(ev.created_at).toLocaleDateString(),
        category: ev.location || "",
        image: ev.image,
        website: ev.website,
        is_hidden: ev.is_hidden ?? false,
        originalData: ev,
        tableName: "events",
      }));

      const spaPosts: UnifiedPost[] = (spa ?? []).map((s) => ({
        id: s.id,
        title: getSpaTitle(s.categories),
        type: "spa",
        status: resolveStatus(s.scheduled_at),
        date: new Date(s.created_at).toLocaleDateString(),
        category: "",
        image: s.image,
        website: s.website,
        is_hidden: s.is_hidden ?? false,
        originalData: s,
        tableName: "spa",
      }));

      setPosts([...articlePosts, ...cinemaPosts, ...eventPosts, ...spaPosts]);
    } catch (err) {
      console.error("Error fetching posts:", err);
      appToast.error("Failed to load posts");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const triggerRefresh = useCallback(async () => {
    setRefreshTrigger((prev) => prev + 1);
    await fetchPosts();
  }, [fetchPosts]);

  const addPost = useCallback((post: UnifiedPost) => {
    setPosts((prev) => [post, ...prev]);
  }, []);

  const updatePost = useCallback((id: number, updatedPost: UnifiedPost) => {
    setPosts((prev) =>
      prev.map((post) => (post.id === id ? updatedPost : post)),
    );
  }, []);

  const deletePost = useCallback(
    async (id: number, tableName: string) => {
      const { error } = await supabase.from(tableName).delete().eq("id", id);
      if (error) {
        appToast.error("Failed to delete post");
        throw error;
      }
      setPosts((prev) => prev.filter((post) => post.id !== id));
      await fetchPosts();
      appToast.success("Post deleted");
    },
    [supabase, fetchPosts],
  );

  const bulkDeletePosts = useCallback(
    async (ids: number[]) => {
      const postsToDelete = posts.filter((p) => ids.includes(p.id));
      const byTable = postsToDelete.reduce<Record<string, number[]>>(
        (acc, post) => {
          acc[post.tableName] = [...(acc[post.tableName] ?? []), post.id];
          return acc;
        },
        {},
      );

      const results = await Promise.all(
        Object.entries(byTable).map(([table, tableIds]) =>
          supabase.from(table).delete().in("id", tableIds),
        ),
      );

      const hasError = results.some((r) => r.error);
      if (hasError) {
        appToast.error("Some posts could not be deleted");
        throw new Error("Bulk delete failed");
      }

      setPosts((prev) => prev.filter((post) => !ids.includes(post.id)));
      await fetchPosts();
      appToast.success(`${ids.length} posts deleted`);
    },
    [posts, supabase, fetchPosts],
  );

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return (
    <PostContext.Provider
      value={{
        posts,
        loading,
        refreshTrigger,
        triggerRefresh,
        fetchPosts,
        addPost,
        updatePost,
        deletePost,
        bulkDeletePosts,
      }}
    >
      {children}
    </PostContext.Provider>
  );
}

export function usePosts() {
  const context = useContext(PostContext);
  if (context === undefined) {
    throw new Error("usePosts must be used within a PostProvider");
  }
  return context;
}
