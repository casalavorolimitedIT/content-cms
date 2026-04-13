"use client";

import { useState } from "react";
import {
  ErrorMsg,
  FormField,
  HOURS,
  MINUTES,
  PERIODS,
} from "@/app/dashboard/add-post/page";
import { ImagePicker } from "@/components/ui/image-picker";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CalendarAdd01Icon,
  Cancel01Icon,
  Upload01Icon,
} from "@hugeicons/core-free-icons";
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
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";

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
  label = "Show times",
  value,
  onChange,
  error,
}: {
  label?: string;
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
      <Label>{label}</Label>
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

export function DurationPicker({
  value,
  onChange,
  error,
}: {
  value?: string;
  onChange: (duration: string) => void;
  error?: string;
}) {
  const parseDuration = (duration?: string) => {
    const match = duration?.match(/^(\d{1,2})h\s(\d{2})m$/);
    return {
      hours: match?.[1]?.padStart(2, "0") ?? "01",
      minutes: match?.[2] ?? "00",
    };
  };

  const { hours, minutes } = parseDuration(value);

  const updateDuration = (nextHours: string, nextMinutes: string) => {
    onChange(`${nextHours}h ${nextMinutes}m`);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <Label>Duration</Label>
      <div className="flex items-center gap-2">
        <select
          value={hours}
          onChange={(e) => {
            const nextHours = e.target.value;
            updateDuration(nextHours, minutes);
          }}
          className="h-9 rounded-md border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {Array.from({ length: 10 }, (_, i) =>
            String(i + 1).padStart(2, "0"),
          ).map((hour) => (
            <option key={hour} value={hour}>
              {hour}
            </option>
          ))}
        </select>
        <span className="text-sm text-muted-foreground">hr</span>
        <select
          value={minutes}
          onChange={(e) => {
            const nextMinutes = e.target.value;
            updateDuration(hours, nextMinutes);
          }}
          className="h-9 rounded-md border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {MINUTES.map((minute) => (
            <option key={minute} value={minute}>
              {minute}
            </option>
          ))}
        </select>
        <span className="text-sm text-muted-foreground">min</span>
      </div>
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
  const [isGenreOpen, setIsGenreOpen] = useState<boolean>(false);
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
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsGenreOpen(!isGenreOpen)}
              className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm text-left flex items-center justify-between outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <span
                className={
                  !values.category || values.category.length === 0
                    ? "text-muted-foreground"
                    : ""
                }
              >
                {!values.category || values.category.length === 0
                  ? "Select genres..."
                  : `${values.category.length} genre${values.category.length !== 1 ? "s" : ""} selected`}
              </span>
              <svg
                className={`h-4 w-4 transition-transform ${isGenreOpen ? "rotate-180" : ""}`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {isGenreOpen && (
              <div className="absolute z-10 w-full mt-1 rounded-md border border-input bg-background shadow-lg max-h-60 overflow-y-auto">
                <div className="p-2">
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
                  ].map((genre) => (
                    <label
                      key={genre}
                      className="flex items-center gap-2 px-2 py-1.5 hover:bg-muted rounded-md cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={values.category?.includes(genre) || false}
                        onChange={() => {
                          const currentCategories = values.category || [];
                          if (currentCategories.includes(genre)) {
                            setFieldValue(
                              "category",
                              currentCategories.filter(
                                (g: string) => g !== genre,
                              ),
                            );
                          } else {
                            setFieldValue("category", [
                              ...currentCategories,
                              genre,
                            ]);
                          }
                        }}
                        className="h-4 w-4 rounded border-input accent-[#ff6900]"
                      />
                      <span className="text-sm capitalize">{genre}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Display selected genres as tags */}
          {values.category && values.category.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {values.category.map((genre: string) => (
                <span
                  key={genre}
                  className="flex items-center gap-1 bg-muted text-sm px-2.5 py-1 rounded-full capitalize"
                >
                  {genre}
                  <button
                    type="button"
                    onClick={() => {
                      setFieldValue(
                        "category",
                        values.category.filter((g: string) => g !== genre),
                      );
                    }}
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
          <ErrorMsg msg={touched.category && errors.category} />
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
        label="Show Times"
      />

      <DurationPicker
        value={values.duration}
        onChange={(duration) => setFieldValue("duration", duration)}
        error={touched.duration && errors.duration}
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

export function SpaForm({
  errors,
  touched,
  setFieldValue,
  values,
  websites,
}: any) {
  const [bulkItems, setBulkItems] = useState("");
  const [showBulkUpload, setShowBulkUpload] = useState(false);

  const handleBulkUpload = () => {
    const lines = bulkItems.split("\n");
    const parsedItems = lines
      .filter((line) => line.trim())
      .map((line) => {
        const [serviceName, category, price, duration] = line
          .split(",")
          .map((s) => s.trim());
        return { serviceName, category, price, duration };
      })
      .filter((item) => item.serviceName);

    if (parsedItems.length > 0) {
      setFieldValue("categories", parsedItems);
      setShowBulkUpload(false);
      setBulkItems("");
    }
  };

  const getCategoriesArray = () => {
    if (!values.categories) return [];
    try {
      return typeof values.categories === "string"
        ? JSON.parse(values.categories)
        : values.categories;
    } catch {
      return [];
    }
  };

  const addSingleItem = () => {
    const currentItems = getCategoriesArray();
    setFieldValue("categories", [
      ...currentItems,
      { serviceName: "", category: "", price: "", duration: "" },
    ]);
  };

  const updateItem = (index: number, field: string, value: string) => {
    const currentItems = getCategoriesArray();
    currentItems[index][field] = value;
    setFieldValue("categories", [...currentItems]);
  };

  const removeItem = (index: number) => {
    const currentItems = getCategoriesArray();
    currentItems.splice(index, 1);
    setFieldValue("categories", [...currentItems]);
  };

  const categoriesArray = getCategoriesArray();

  const serviceCategories = [
    { value: "massage", label: "Massage" },
    { value: "facial", label: "Facial" },
    { value: "body treatment", label: "Body Treatment" },
    { value: "hair removal", label: "Hair Removal" },
    { value: "nail care", label: "Nail Care" },
    { value: "wellness", label: "Wellness" },
    { value: "package", label: "Package" },
    { value: "other", label: "Other" },
  ];

  return (
    <>
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

      {/* Services Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold">Services / Treatments</label>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowBulkUpload(!showBulkUpload)}
            >
              <HugeiconsIcon
                icon={Upload01Icon}
                strokeWidth={2}
                className="size-3 mr-1"
              />
              {showBulkUpload ? "Manual Entry" : "Bulk Upload"}
            </Button>
            {!showBulkUpload && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addSingleItem}
              >
                + Add Service
              </Button>
            )}
          </div>
        </div>

        {/* Bulk Upload */}
        {showBulkUpload && (
          <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground">
              CSV Format: Service Name, Category, Price (number), Duration in
              minutes — one per line
            </p>
            <p className="text-xs text-muted-foreground">
              Categories: massage, facial, body treatment, hair removal,
              nail_care, wellness, package, other
            </p>
            <Textarea
              placeholder={`Swedish Massage, massage, 89, 60\nHydrating Facial, facial, 120, 45\nInfrared Sauna, wellness, 50, 30`}
              value={bulkItems}
              onChange={(e) => setBulkItems(e.target.value)}
              className="font-mono text-sm min-h-37.5"
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowBulkUpload(false);
                  setBulkItems("");
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleBulkUpload}
                className="bg-[#ff6900] hover:bg-[#e05e00] text-white"
              >
                Import Services
              </Button>
            </div>
          </div>
        )}

        {/* Manual Entry */}
        {!showBulkUpload && categoriesArray.length > 0 && (
          <div className="space-y-3">
            {categoriesArray.map((item: any, index: number) => (
              <div
                key={index}
                className="flex gap-3 items-start p-3 border rounded-lg"
              >
                <div className="flex-1 space-y-2">
                  <Input
                    placeholder="Service name (e.g. Swedish Massage)"
                    value={item.serviceName}
                    onChange={(e) =>
                      updateItem(index, "serviceName", e.target.value)
                    }
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <Select
                      value={item.category || ""}
                      onValueChange={(v) => updateItem(index, "category", v)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {serviceCategories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Price with $ prefix */}
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                        ₦
                      </span>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={item.price}
                        onChange={(e) =>
                          updateItem(index, "price", e.target.value)
                        }
                        className="pl-7"
                      />
                    </div>

                    {/* Duration with "min" suffix */}
                    <div className="relative">
                      <Input
                        type="number"
                        min="1"
                        step="1"
                        placeholder="60"
                        value={item.duration}
                        onChange={(e) =>
                          updateItem(index, "duration", e.target.value)
                        }
                        className="pr-10"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                        min
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(index)}
                  className="text-red-500 hover:text-red-600"
                >
                  <HugeiconsIcon
                    icon={Cancel01Icon}
                    strokeWidth={2}
                    className="size-4"
                  />
                </Button>
              </div>
            ))}
          </div>
        )}

        {!showBulkUpload && categoriesArray.length === 0 && (
          <div className="text-center py-8 border-2 border-dashed rounded-lg text-muted-foreground">
            <p className="text-sm">No services added yet</p>
            <p className="text-xs mt-1">
              Click "Add Service" or use "Bulk Upload"
            </p>
          </div>
        )}
        <ErrorMsg msg={touched.categories && errors.categories} />
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
