import { useState } from "react";
import { Label } from "recharts";
import { ErrorMsg, FormField, HOURS, MINUTES, PERIODS } from "./add-post";
import { ImagePicker } from "@/components/ui/image-picker";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { CalendarAdd01Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { Field } from "formik";
import { Input } from "@/components/ui/input";
import { WYSIWYGEditor } from "@/components/ui/wysiwyg-editor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { cn } from "@/lib/utils";

interface Website {
  id: number;
  name: string;
  url: string;
  status: string;
}

export function ToggleField({
  label,
  description,
  value,
  onChange,
  error,
}: {
  label: string;
  description?: string;
  value: boolean;
  onChange: (value: boolean) => void;
  error?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <button
          type="button"
          onClick={() => onChange(!value)}
          className={cn(
            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            value ? "bg-gray-200" : "bg-[#ff6900]",
          )}
        >
          <span
            className={cn(
              "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
              value ? "translate-x-1" : "translate-x-6",
            )}
          />
        </button>
      </div>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      <ErrorMsg msg={error} />
    </div>
  );
}

export function ShowtimePicker({
  value,
  onChange,
  error,
}: {
  value: string[];
  onChange: (times: string[]) => void;
  error?: string;
}) {
  const [hour, setHour] = useState("12");
  const [minute, setMinute] = useState("00");
  const [period, setPeriod] = useState("AM");

  const add = () => {
    const time = `${hour}:${minute} ${period}`;
    if (!value.includes(time)) onChange([...value, time]);
  };

  const remove = (t: string) => onChange(value.filter((v) => v !== t));

  return (
    <div className="flex flex-col gap-1.5">
      <Label>Showtimes</Label>
      <div className="flex items-center gap-2">
        <select
          value={hour}
          onChange={(e) => setHour(e.target.value)}
          className="h-9 rounded-md border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {HOURS.map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>
        <span className="text-muted-foreground text-sm">:</span>
        <select
          value={minute}
          onChange={(e) => setMinute(e.target.value)}
          className="h-9 rounded-md border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {MINUTES.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <div className="flex rounded-md border border-input overflow-hidden text-sm">
          {PERIODS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={`px-2.5 h-9 transition-colors ${
                period === p
                  ? "bg-[#ff6900] text-white"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          className="h-9 px-3 text-sm"
          onClick={add}
        >
          Add
        </Button>
      </div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-1">
          {value.map((t) => (
            <span
              key={t}
              className="flex items-center gap-1 bg-muted text-sm px-2.5 py-1 rounded-full"
            >
              {t}
              <button
                type="button"
                onClick={() => remove(t)}
                className="text-muted-foreground hover:text-foreground"
              >
                <HugeiconsIcon
                  icon={Cancel01Icon}
                  strokeWidth={2}
                  className="w-3 h-3"
                />
              </button>
            </span>
          ))}
        </div>
      )}
      <ErrorMsg msg={error} />
    </div>
  );
}

export function ScheduleLater({
  scheduled,
  onToggle,
  errors,
  touched,
}: {
  scheduled: boolean;
  onToggle: () => void;
  errors: any;
  touched: any;
}) {
  return (
    <div className="flex flex-col gap-3 pt-1">
      <button
        type="button"
        onClick={onToggle}
        className={`flex items-center gap-2 text-sm font-medium w-fit transition-colors ${
          scheduled
            ? "text-[#ff6900]"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <HugeiconsIcon
          icon={CalendarAdd01Icon}
          strokeWidth={2}
          className="w-4 h-4"
        />
        Schedule for later
      </button>
      {scheduled && (
        <div className="pl-6 border-l-2 border-[#ff6900]/40">
          <FormField
            label="Date & Time"
            error={touched.scheduledAt && errors.scheduledAt}
          >
            <Field as={Input} name="scheduledAt" type="datetime-local" />
          </FormField>
        </div>
      )}
    </div>
  );
}

export function ArticleForm({
  errors,
  touched,
  setFieldValue,
  values,
  websites,
}: any) {
  return (
    <>
      <FormField label="Title" error={touched.title && errors.title}>
        <Field as={Input} name="title" placeholder="Article title" />
      </FormField>

      <FormField
        label="Website to update"
        error={touched.website && errors.website}
      >
        <Select onValueChange={(v) => setFieldValue("website", v)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select website" />
          </SelectTrigger>
          <SelectContent>
            {websites.map((website: Website) => (
              <SelectItem key={website.id} value={website.url}>
                {website.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>

      <ImagePicker
        value={values.image}
        onChange={(f) => setFieldValue("image", f)}
        error={touched.image && errors.image}
      />

      <FormField label="Content" error={touched.content && errors.content}>
        <WYSIWYGEditor
          value={values.content}
          onChange={(content) => setFieldValue("content", content)}
          placeholder="Write your article..."
        />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Category" error={touched.category && errors.category}>
          <Select onValueChange={(v) => setFieldValue("category", v)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {["technology", "lifestyle", "politics", "sports", "culture"].map(
                (c) => (
                  <SelectItem key={c} value={c} className="capitalize">
                    {c}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>
        </FormField>
      </div>

      <div className="border-t pt-4 mt-2">
        <ToggleField
          label="Post visibility"
          description="Turn this off to hide the post from the public view"
          value={values.is_hidden}
          onChange={(v) => setFieldValue("is_hidden", v)}
          error={touched.is_hidden && errors.is_hidden}
        />
      </div>
    </>
  );
}

export function CinemaForm({
  errors,
  touched,
  setFieldValue,
  values,
  websites,
}: any) {
  return (
    <>
      <FormField label="Title" error={touched.title && errors.title}>
        <Field as={Input} name="title" placeholder="Movie title" />
      </FormField>

      <FormField
        label="Website to update"
        error={touched.website && errors.website}
      >
        <Select onValueChange={(v) => setFieldValue("website", v)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select website" />
          </SelectTrigger>
          <SelectContent>
            {websites.map((website: Website) => (
              <SelectItem key={website.id} value={website.url}>
                {website.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>

      <ImagePicker
        value={values.image}
        onChange={(f) => setFieldValue("image", f)}
        error={touched.image && errors.image}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Genre" error={touched.category && errors.category}>
          <Select onValueChange={(v) => setFieldValue("category", v)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select genre" />
            </SelectTrigger>
            <SelectContent>
              {[
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
              ].map((g) => (
                <SelectItem key={g} value={g} className="capitalize">
                  {g}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        <FormField label="Rating" error={touched.rated && errors.rated}>
          <Select onValueChange={(v) => setFieldValue("rated", v)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select rating" />
            </SelectTrigger>
            <SelectContent>
              {["G", "PG", "PG-13", "R", "NC-17"].map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      </div>

      <ShowtimePicker
        value={values.times}
        onChange={(t) => setFieldValue("times", t)}
        error={touched.times && (errors.times as string)}
      />

      <FormField label="Status" error={touched.status && errors.status}>
        <Select onValueChange={(v) => setFieldValue("status", v)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="now showing">Now Showing</SelectItem>
            <SelectItem value="coming soon">Coming Soon</SelectItem>
          </SelectContent>
        </Select>
      </FormField>

      <div className="border-t pt-4 mt-2">
        <ToggleField
          label="Post visibility"
          description="Turn this off to hide the post from the public view"
          value={values.is_hidden}
          onChange={(v) => setFieldValue("is_hidden", v)}
          error={touched.is_hidden && errors.is_hidden}
        />
      </div>
    </>
  );
}

export function EventForm({
  errors,
  touched,
  setFieldValue,
  values,
  websites,
}: any) {
  return (
    <>
      <FormField label="Title" error={touched.title && errors.title}>
        <Field as={Input} name="title" placeholder="Event name" />
      </FormField>

      <FormField
        label="Website to update"
        error={touched.website && errors.website}
      >
        <Select onValueChange={(v) => setFieldValue("website", v)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select website" />
          </SelectTrigger>
          <SelectContent>
            {websites.map((website: Website) => (
              <SelectItem key={website.id} value={website.url}>
                {website.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>

      <ImagePicker
        value={values.image}
        onChange={(f) => setFieldValue("image", f)}
        error={touched.image && errors.image}
      />

      <FormField
        label="Description"
        error={touched.description && errors.description}
      >
        <WYSIWYGEditor
          value={values.description}
          onChange={(content) => setFieldValue("description", content)}
          placeholder="What's this event about?"
        />
      </FormField>

      <FormField label="Location" error={touched.location && errors.location}>
        <Field as={Input} name="location" placeholder="Venue or address" />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Date" error={touched.date && errors.date}>
          <Field as={Input} name="date" type="date" />
        </FormField>
        <FormField label="Time" error={touched.time && errors.time}>
          <Field as={Input} name="time" type="time" />
        </FormField>
      </div>

      <FormField label="Status" error={touched.status && errors.status}>
        <Select onValueChange={(v) => setFieldValue("status", v)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="upcoming">Upcoming</SelectItem>
            <SelectItem value="ongoing">Ongoing</SelectItem>
            <SelectItem value="past">Past</SelectItem>
          </SelectContent>
        </Select>
      </FormField>

      <div className="border-t pt-4 mt-2">
        <ToggleField
          label="Post visibility"
          description="Turn this off to hide the post from the public view"
          value={values.is_hidden}
          onChange={(v) => setFieldValue("is_hidden", v)}
          error={touched.is_hidden && errors.is_hidden}
        />
      </div>
    </>
  );
}
