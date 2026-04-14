"use client";

import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ArticleForm,
  CinemaForm,
  EventForm,
  ScheduleLater,
  SpaForm,
} from "@/components/form-elements";
import { createClient } from "@/lib/supabase/client";
import { appToast } from "@/app/custom/toast-ui";
import { usePosts } from "@/contexts/postContext";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import {
  articleInitial,
  articleSchema,
  cinemaInitial,
  cinemaSchema,
  eventInitial,
  eventSchema,
  spaInitial,
  spaSchema,
} from "@/utils/schema";

export function FormField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      {children}
      <ErrorMsg msg={error} />
    </div>
  );
}

type PostType = "articles" | "cinema" | "events" | "spa";

export function ErrorMsg({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-xs text-destructive mt-1">{msg}</p>;
}

export function TypeTab({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
        active
          ? "bg-[#ff6900] text-white"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}

export const HOURS = Array.from({ length: 12 }, (_, i) =>
  String(i + 1).padStart(2, "0"),
);
export const MINUTES = [
  "00",
  "10",
  "15",
  "20",
  "25",
  "30",
  "35",
  "40",
  "45",
  "50",
  "55",
];
export const PERIODS = ["AM", "PM"];

const ROLE_TO_TYPE: Record<string, PostType> = {
  article: "articles",
  cinema: "cinema",
  event: "events",
  spa: "spa",
};

const ALL_TYPES: { value: PostType; label: string }[] = [
  { value: "articles", label: "Article" },
  { value: "cinema", label: "Cinema" },
  { value: "events", label: "Event" },
  { value: "spa", label: "Spa" },
];

const schemaMap = {
  articles: articleSchema,
  cinema: cinemaSchema,
  events: eventSchema,
  spa: spaSchema,
};

const initialMap = {
  articles: articleInitial,
  cinema: cinemaInitial,
  events: eventInitial,
  spa: spaInitial,
};

interface Website {
  id: number;
  name: string;
  url: string;
  slug: string;
  status: string;
}

export default function AddPostPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();

  let roles: string[] = [];

  const rolesParam = searchParams?.get("roles");
  if (rolesParam) {
    roles = rolesParam.split(",");
  } else if (params?.roles) {
    const rolesString = Array.isArray(params.roles)
      ? params.roles[0]
      : params.roles;
    roles = rolesString.split(",");
  }
  const allowedTypes = ALL_TYPES.filter((t) =>
    roles.some((r) => ROLE_TO_TYPE[r] === t.value),
  );
  const defaultType = allowedTypes[0]?.value ?? "articles";
  const [type, setType] = useState<PostType>(defaultType);
  const [scheduled, setScheduled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClient();
  const [websites, setWebsites] = useState<Website[]>([]);
  const { triggerRefresh } = usePosts();

  const buildFullSlug = (website: Website) => {
    return website.slug ?? "post";
  };

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

  const uploadImage = async (file: File, userId: string) => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;
    const filePath = `posts/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("post-images")
      .upload(filePath, file);

    if (uploadError) {
      throw new Error(`Failed to upload image: ${uploadError.message}`);
    }

    const { data: urlData } = supabase.storage
      .from("post-images")
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  };

  const submitToSupabase = async (values: any, tableName: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("You must be logged in to create a post");
    }

    let imageUrl = null;
    if (values.image instanceof File) {
      imageUrl = await uploadImage(values.image, user.id);
    }
    const selectedWebsite = websites.find(
      (w) => w.url === values.website || w.id === values.website,
    );
    const slug = selectedWebsite ? buildFullSlug(selectedWebsite) : "post";

    const basePayload = {
      title: values.title,
      subTitle: values.subTitle,
      slug: slug,
      website: values.website,
      is_hidden: values.is_hidden,
      user_id: user.id,
      created_at: new Date().toISOString(),
      ...(scheduled && values.scheduledAt
        ? { scheduled_at: values.scheduledAt }
        : {}),
    };

    let payload;

    switch (tableName) {
      case "articles":
        payload = {
          ...basePayload,
          content: values.content,
          category: values.category,
          image: imageUrl,
        };
        break;

      case "cinema":
        payload = {
          ...basePayload,
          category: values.category,
          rated: values.rated,
          times: values.times,
          duration: values.duration,
          status: values.status,
          image: imageUrl,
        };
        break;

      case "events":
        payload = {
          ...basePayload,
          description: values.description,
          location: values.location,
          date: values.date,
          time: values.time,
          status: values.status,
          image: imageUrl,
        };
        break;
      case "spa":
        payload = {
          ...basePayload,
          categories: values.categories,
          image: imageUrl,
        };
        break;

      default:
        throw new Error("Invalid post type");
    }

    const { error } = await supabase.from(tableName).insert([payload]);

    if (error) {
      throw new Error(error.message);
    }

    return true;
  };

  const handleSubmit = async (values: any, { resetForm }: any) => {
    setIsSubmitting(true);

    try {
      let tableName = "";
      let successMessage = "";

      switch (type) {
        case "articles":
          tableName = "articles";
          successMessage = "Article published successfully!";
          break;
        case "cinema":
          tableName = "cinema";
          successMessage = "Movie added successfully!";
          break;
        case "events":
          tableName = "events";
          successMessage = "Event created successfully!";
          break;
        case "spa":
          tableName = "spa";
          successMessage = "Spa services published successfully!";
          break;
      }

      await submitToSupabase(values, tableName);

      appToast.success(successMessage, {
        description: scheduled
          ? "Your post has been scheduled for later."
          : "Your post is now live.",
      });

      resetForm();
      triggerRefresh();
      router.push("/dashboard");
      router.refresh();
    } catch (error: any) {
      console.error("Error submitting post:", error);
      appToast.error("Failed to create post", {
        description: error.message || "Please try again",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with back button */}
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
        <h1 className="text-2xl font-bold text-foreground">Create New Post</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Fill in the details below to publish a new post
        </p>
      </div>

      {/* Type selector */}
      <div className="mb-6">
        <label className="text-sm font-medium mb-2 block">Post Type</label>
        <div className="flex gap-1 bg-muted rounded-full p-1 w-fit">
          {allowedTypes.map((t) => (
            <TypeTab
              key={t.value}
              label={t.label}
              active={type === t.value}
              onClick={() => {
                setType(t.value);
                setScheduled(false);
              }}
            />
          ))}
        </div>
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-background rounded-xl border border-border/50 p-6">
        <Formik
          key={type}
          validationSchema={schemaMap[type]}
          validationContext={{ scheduled }}
          initialValues={initialMap[type]}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, setFieldValue, values }) => (
            <Form className="flex flex-col gap-5">
              {type === "articles" && (
                <ArticleForm
                  errors={errors}
                  touched={touched}
                  setFieldValue={setFieldValue}
                  values={values}
                  websites={websites}
                />
              )}
              {type === "cinema" && (
                <CinemaForm
                  errors={errors}
                  touched={touched}
                  setFieldValue={setFieldValue}
                  values={values}
                  websites={websites}
                />
              )}
              {type === "events" && (
                <EventForm
                  errors={errors}
                  touched={touched}
                  setFieldValue={setFieldValue}
                  values={values}
                  websites={websites}
                />
              )}
              {type === "spa" && (
                <SpaForm
                  errors={errors}
                  touched={touched}
                  setFieldValue={setFieldValue}
                  values={values}
                  websites={websites}
                />
              )}

              <div className="border-t pt-5 flex flex-col gap-4">
                <ScheduleLater
                  scheduled={scheduled}
                  onToggle={() => setScheduled((s) => !s)}
                  errors={errors}
                  touched={touched}
                />
                <div className="flex justify-start gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/dashboard")}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-[#ff6900] hover:bg-[#e05e00] text-white"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                        {scheduled ? "Scheduling..." : "Publishing..."}
                      </>
                    ) : scheduled ? (
                      "Schedule"
                    ) : (
                      "Publish"
                    )}
                  </Button>
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
