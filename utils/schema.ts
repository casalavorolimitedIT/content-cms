import { z } from "zod";
import * as Yup from "yup";

export const ArticleSchema = z.object({
  id: z.number(),
  title: z.string(),
  subTitle: z.string().optional(),
  content: z.string(),
  category: z.string(),
  image: z.string().optional(),
  website: z.string().optional(),
  is_hidden: z.boolean().optional(),
  scheduled_at: z.string().nullable().optional(),
  created_at: z.string(),
});

export const CinemaSchema = z.object({
  id: z.number(),
  title: z.string(),
  category: z.any(),
  rated: z.string(),
  times: z.array(z.string()).optional(),
  duration: z.string(),
  status: z.string(),
  image: z.string().optional(),
  website: z.string().optional(),
  is_hidden: z.boolean().optional(),
  scheduled_at: z.string().nullable().optional(),
  created_at: z.string(),
});

export const EventSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  location: z.string(),
  date: z.string(),
  time: z.string(),
  status: z.string(),
  image: z.string().optional(),
  website: z.string().optional(),
  is_hidden: z.boolean().optional(),
  scheduled_at: z.string().nullable().optional(),
  created_at: z.string(),
});

export const SpaSchema = z.object({
  id: z.number(),
  website: z.string().optional(),
  image: z.string().optional(),
  is_hidden: z.boolean().optional(),
  categories: z.any(),
  scheduled_at: z.string().nullable().optional(),
  created_at: z.string(),
});

const scheduleShape = {
  scheduledAt: Yup.string().when("$scheduled", {
    is: true,
    then: (s) => s.required("Schedule date & time is required"),
    otherwise: (s) => s.optional(),
  }),
};

export const articleSchema = Yup.object({
  title: Yup.string().required("Title is required"),
  subTitle: Yup.string(),
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

export const cinemaSchema = Yup.object({
  title: Yup.string().required("Title is required"),
  image: Yup.mixed().required("Image is required"),
  category: Yup.mixed().required("Genre is required"),
  rated: Yup.string()
    .required("Rating is required")
    .oneOf(["G", "PG", "PG-13", "R", "NC-17"]),
  website: Yup.string().required("Website link is required"),
  times: Yup.array().of(Yup.string()).optional(),
  duration: Yup.string().required("Duration is required"),
  is_hidden: Yup.boolean().required(
    "Please choose to activate or hide this post",
  ),
  status: Yup.string()
    .required("Status is required")
    .oneOf(["now showing", "coming soon"]),
  ...scheduleShape,
});

export const eventSchema = Yup.object({
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

export const spaSchema = Yup.object({
  website: Yup.string().required("Website link is required"),
  categories: Yup.mixed().required("At least one service is required"),
  is_hidden: Yup.boolean(),
  ...scheduleShape,
});

const scheduleInitial = { scheduledAt: "" };

export const articleInitial = {
  title: "",
  subTitle: "",
  image: null as File | null,
  content: "",
  website: "",
  category: "",
  is_hidden: false,
  ...scheduleInitial,
};
export const cinemaInitial = {
  title: "",
  image: null as File | null,
  category: [],
  website: "",
  rated: "",
  times: [] as string[],
  duration: "",
  is_hidden: false,
  status: "",
  ...scheduleInitial,
};
export const eventInitial = {
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

export const spaInitial = {
  website: "",
  categories: [],
  is_hidden: false,
  ...scheduleInitial,
};
