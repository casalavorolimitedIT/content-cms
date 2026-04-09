"use client";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ArticleForm,
  CinemaForm,
  EventForm,
  ScheduleLater,
} from "./form-elements";
import { Label } from "./ui/label";
import { createClient } from "@/lib/supabase/client";
import { appToast } from "@/app/custom/toast-ui";
import { usePosts } from "@/contexts/postContext";

type PostType = "articles" | "cinema" | "events";

const scheduleShape = {
  scheduledAt: Yup.string().when("$scheduled", {
    is: true,
    then: (s) => s.required("Schedule date & time is required"),
    otherwise: (s) => s.optional(),
  }),
};

const articleSchema = Yup.object({
  title: Yup.string().required("Title is required"),
  image: Yup.mixed().optional(),
  content: Yup.string().required("Content is required"),
  website: Yup.string().required("Website link is required"),
  is_hidden: Yup.boolean().required(
    "Please choose to activate or hide this post",
  ),
  category: Yup.string()
    .required("Category is required")
    .oneOf(["technology", "lifestyle", "politics", "sports", "culture"]),
  ...scheduleShape,
});

const cinemaSchema = Yup.object({
  title: Yup.string().required("Title is required"),
  image: Yup.mixed().required("Image is required"),
  category: Yup.string()
    .required("Genre is required")
    .oneOf([
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
    ]),
  rated: Yup.string()
    .required("Rating is required")
    .oneOf(["G", "PG", "PG-13", "R", "NC-17"]),
  website: Yup.string().required("Website link is required"),
  times: Yup.array()
    .of(Yup.string())
    .min(1, "At least one showtime is required"),
  is_hidden: Yup.boolean().required(
    "Please choose to activate or hide this post",
  ),
  status: Yup.string()
    .required("Status is required")
    .oneOf(["now showing", "coming soon"]),
  ...scheduleShape,
});

const eventSchema = Yup.object({
  title: Yup.string().required("Title is required"),
  description: Yup.string().required("Description is required"),
  location: Yup.string().required("Location is required"),
  image: Yup.mixed().optional(),
  date: Yup.string().required("Date is required"),
  website: Yup.string().required("Website link is required"),
  time: Yup.string().required("Time is required"),
  is_hidden: Yup.boolean().required(
    "Please choose to activate or hide this post",
  ),
  status: Yup.string()
    .required("Status is required")
    .oneOf(["upcoming", "ongoing", "past"]),
  ...scheduleShape,
});

const scheduleInitial = { scheduledAt: "" };

const articleInitial = {
  title: "",
  image: null as File | null,
  content: "",
  website: "",
  category: "",
  is_hidden: false,
  ...scheduleInitial,
};
const cinemaInitial = {
  title: "",
  image: null as File | null,
  category: "",
  website: "",
  rated: "",
  times: [] as string[],
  is_hidden: false,
  status: "",
  ...scheduleInitial,
};
const eventInitial = {
  title: "",
  description: "",
  location: "",
  website: "",
  image: null as File | null,
  date: "",
  time: "",
  status: "",
  is_hidden: false,
  ...scheduleInitial,
};

export function ErrorMsg({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-xs text-destructive mt-1">{msg}</p>;
}

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
export const MINUTES = ["00", "15", "30", "45"];
export const PERIODS = ["AM", "PM"];

const ROLE_TO_TYPE: Record<string, PostType> = {
  article: "articles",
  cinema: "cinema",
  event: "events",
};

const ALL_TYPES: { value: PostType; label: string }[] = [
  { value: "articles", label: "Article" },
  { value: "cinema", label: "Cinema" },
  { value: "events", label: "Event" },
];

const schemaMap = {
  articles: articleSchema,
  cinema: cinemaSchema,
  events: eventSchema,
};
const initialMap = {
  articles: articleInitial,
  cinema: cinemaInitial,
  events: eventInitial,
};

interface Website {
  id: number;
  name: string;
  url: string;
  status: string;
}

const AddPost = ({
  onClose,
  roles,
  onSuccess,
}: {
  onClose: () => void;
  roles: string[];
  onSuccess?: () => void;
}) => {
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

  const generatePrefix = (website: Website) => {
    const source = website.name || new URL(website.url).hostname;
    return source
      .toLowerCase()
      .replace(/^www\./, "")
      .replace(/\.[a-z]{2,}$/, "")
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const generateSlug = (title: string) =>
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

  const buildFullSlug = (title: string, website: Website) => {
    const prefix = generatePrefix(website);
    const slug = generateSlug(title);
    return `${prefix}-${slug}`;
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
    const slug = selectedWebsite
      ? buildFullSlug(values.title, selectedWebsite)
      : generateSlug(values.title);

    const basePayload = {
      title: values.title,
      slug: slug,
      website: values.website,
      is_hidden: values.is_hidden,
      user_id: user.id,
      created_at: new Date().toISOString(),
      ...(scheduled && values.scheduledAt
        ? { scheduled_at: values.scheduledAt }
        : { created_at: new Date().toISOString() }),
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
      }

      await submitToSupabase(values, tableName);

      appToast.success(successMessage, {
        description: scheduled
          ? "Your post has been scheduled for later."
          : "Your post is now live.",
      });

      resetForm();
      triggerRefresh();
      onClose();
      onSuccess?.();
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
    <>
      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="px-6 pt-6 pb-4 border-b">
            <h2 className="text-base font-semibold mb-3">New Post</h2>
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
          <Formik
            key={type}
            validationSchema={schemaMap[type]}
            validationContext={{ scheduled }}
            initialValues={initialMap[type]}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, setFieldValue, values, isSubmitting }) => (
              <Form className="px-6 py-5 flex flex-col gap-4">
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

                <div className="border-t pt-4 flex flex-col gap-4">
                  <ScheduleLater
                    scheduled={scheduled}
                    onToggle={() => setScheduled((s) => !s)}
                    errors={errors}
                    touched={touched}
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={onClose}
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
    </>
  );
};

export default AddPost;
