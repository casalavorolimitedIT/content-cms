"use client";

import { useFormik } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Globe, Link2, FileText, Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { appToast } from "@/app/custom/toast-ui";
import { useState } from "react";

interface NewWebsiteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const validationSchema = Yup.object({
  name: Yup.string()
    .required("Website name is required")
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  url: Yup.string()
    .required("Website URL is required")
    .url("Please enter a valid URL")
    .matches(
      /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
      "Please enter a valid URL",
    ),
  status: Yup.string(),
});

export function NewWebsite({ open, onOpenChange, onSuccess }: NewWebsiteProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClient();

  const formik = useFormik({
    initialValues: {
      name: "",
      url: "",
      status: "connected",
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      setIsSubmitting(true);

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          appToast.error("Error", {
            description: "You must be logged in to add a website",
          });
          return;
        }

        const { data, error } = await supabase
          .from("websites")
          .insert([
            {
              name: values.name,
              url: values.url,
              status: "connected",
            },
          ])
          .select()
          .single();

        if (error) {
          console.error("Supabase error:", error);
          appToast.error("Failed to add website", {
            description: error.message || "Please try again",
          });
          return;
        }

        appToast.success("Website added successfully", {
          description: `${values.name} has been linked.`,
        });

        resetForm();
        onOpenChange(false);
        onSuccess?.();
      } catch (error) {
        console.error("Unexpected error:", error);
        appToast.error("Error", {
          description: "An unexpected error occurred",
        });
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Website
          </DialogTitle>
          <DialogDescription>
            Link a new website to your application. Fill in the details below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={formik.handleSubmit} className="space-y-5">
          {/* Website Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Website Name
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="e.g., My Personal Blog"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={cn(
                formik.touched.name &&
                  formik.errors.name &&
                  "border-destructive",
              )}
              disabled={isSubmitting}
            />
            {formik.touched.name && formik.errors.name && (
              <p className="text-sm text-destructive">{formik.errors.name}</p>
            )}
          </div>

          {/* Website URL */}
          <div className="space-y-2">
            <Label htmlFor="url" className="flex items-center gap-2">
              <Link2 className="h-4 w-4" />
              Website URL
            </Label>
            <Input
              id="url"
              name="url"
              type="url"
              placeholder="https://example.com"
              value={formik.values.url}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={cn(
                formik.touched.url && formik.errors.url && "border-destructive",
              )}
              disabled={isSubmitting}
            />
            {formik.touched.url && formik.errors.url && (
              <p className="text-sm text-destructive">{formik.errors.url}</p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="gap-2 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Add Website
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
