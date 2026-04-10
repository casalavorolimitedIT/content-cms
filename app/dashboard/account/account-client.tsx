"use client";

import { useRef, useState, useTransition } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ActionModal } from "@/app/custom/action-modal";
import { appToast } from "@/app/custom/toast-ui";
import { updateAccount, deleteAccount } from "@/hooks/account-actions";
import {
  UserCircle02Icon,
  Mail01Icon,
  ShieldKeyIcon,
  Calendar01Icon,
  Film01Icon,
  News01Icon,
  PencilEdit01Icon,
  Cancel01Icon,
  FloppyDiskIcon,
  Sparkle,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useUser } from "@/contexts/userContext";

const ROLE_META: Record<string, { label: string; icon: any; color: string }> = {
  cinema: {
    label: "Cinema",
    icon: Film01Icon,
    color: "bg-violet-100 text-violet-700 border-violet-200",
  },
  article: {
    label: "Article",
    icon: News01Icon,
    color: "bg-blue-100 text-blue-700 border-blue-200",
  },
  event: {
    label: "Event",
    icon: Calendar01Icon,
    color: "bg-orange-100 text-orange-700 border-orange-200",
  },
  spa: {
    label: "Spa",
    icon: Sparkle,
    color: "bg-pink-100 text-pink-700 border-pink-200",
  },
};

interface AccountClientProps {
  name: string;
  email: string;
  roles: string[];
  userId: string;
  createdAt: string;
  initials: string;
}

export function AccountClient({
  name: initialName,
  email,
  roles,
  userId,
  createdAt,
  initials,
}: AccountClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { updateUser, refreshUser } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isDeleting, setIsDeleting] = useState(false);
  const hasShownToast = useRef(false);

  useEffect(() => {
    if (hasShownToast.current) return;

    const success = searchParams.get("success");
    const error = searchParams.get("error");

    if (success === "profile-updated") {
      hasShownToast.current = true;
      appToast.success("Profile updated", {
        description: "Your profile has been successfully updated.",
      });
      refreshUser();

      const url = new URL(window.location.href);
      url.searchParams.delete("success");
      router.replace(url.pathname + url.search, { scroll: false });
    }

    if (error) {
      hasShownToast.current = true;
      appToast.error("Error", { description: decodeURIComponent(error) });

      const url = new URL(window.location.href);
      url.searchParams.delete("error");
      router.replace(url.pathname + url.search, { scroll: false });
    }
  }, [searchParams, router, refreshUser]);

  async function handleSave(formData: FormData) {
    startTransition(async () => {
      const result = await updateAccount(formData);

      if (result.success) {
        const newName = formData.get("name") as string;
        if (newName) {
          updateUser({
            user_metadata: {
              name: newName.trim(),
            },
          });
        }
        appToast.success("Profile updated", {
          description: "Your profile has been successfully updated.",
        });
        setIsEditing(false);
      } else if (result.error) {
        appToast.error("Update failed", {
          description: result.error,
        });
      }
    });
  }

  async function handleDeleteAccount() {
    setIsDeleting(true);
    const result = await deleteAccount();

    if (result && "error" in result && result.error) {
      appToast.error("Failed to delete account", {
        description: result.error,
      });
      setDeleteOpen(false);
      setIsDeleting(false);
    }
  }

  return (
    <div className="px-4 md:px-6 w-full space-y-4">
      <div className="rounded-xl border border-border/60 bg-white overflow-hidden">
        <div className="h-20 bg-primary/10 to-transparent" />
        <div className="px-6 pb-6">
          <div className="-mt-10 mb-4 flex items-end justify-between">
            <Avatar className="size-20 rounded-full border-4 border-white shadow-sm">
              <AvatarFallback className="rounded-full bg-primary text-white text-xl font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>

            {/* Edit button */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEditing((v) => !v)}
              className="gap-1.5 text-xs h-8"
            >
              <HugeiconsIcon
                icon={isEditing ? Cancel01Icon : PencilEdit01Icon}
                strokeWidth={2}
                className="size-3.5"
              />
              {isEditing ? "Cancel" : "Edit Profile"}
            </Button>
          </div>

          {isEditing ? (
            <form action={handleSave} className="space-y-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="name"
                  className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  Full Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  defaultValue={initialName}
                  required
                  className="h-10 bg-muted/30 border-border/60"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Email
                </Label>
                <Input
                  value={email}
                  disabled
                  className="h-10 bg-muted/20 border-border/40 text-muted-foreground cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground/60">
                  Email cannot be changed.
                </p>
              </div>
              <Button
                type="submit"
                size="sm"
                className="gap-1.5 h-9 text-white"
                disabled={isPending}
              >
                <HugeiconsIcon
                  icon={FloppyDiskIcon}
                  strokeWidth={2}
                  className="size-3.5"
                />
                {isPending ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          ) : (
            <div>
              <h2 className="text-lg font-semibold">{initialName}</h2>
              <p className="text-sm text-muted-foreground">{email}</p>

              {roles.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {roles.map((role) => {
                    const meta = ROLE_META[role];
                    if (!meta) return null;
                    return (
                      <span
                        key={role}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${meta.color}`}
                      >
                        <HugeiconsIcon
                          icon={meta.icon}
                          strokeWidth={2}
                          className="size-3"
                        />
                        {meta.label}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-border/60 bg-white px-6 divide-y divide-border/60">
        {[
          { icon: UserCircle02Icon, label: "Full name", value: initialName },
          { icon: Mail01Icon, label: "Email address", value: email },
          { icon: ShieldKeyIcon, label: "Account ID", value: userId },
          { icon: Calendar01Icon, label: "Member since", value: createdAt },
        ].map(({ icon, label, value }) => (
          <div key={label} className="flex items-start gap-4 py-4">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
              <HugeiconsIcon
                icon={icon}
                strokeWidth={1.8}
                className="size-4 text-muted-foreground"
              />
            </div>
            <div className="flex flex-col gap-0.5">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-sm font-medium break-all">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {process.env.NODE_ENV === "development" && (
        <div className="rounded-xl border border-destructive/20 bg-white px-6 py-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60 mb-1">
            Danger Zone
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Permanently delete your account and all associated data.
          </p>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="h-9 gap-1.5 text-xs font-semibold"
            onClick={() => setDeleteOpen(true)}
          >
            Delete Account
          </Button>
        </div>
      )}

      <ActionModal
        preset="deleteAccount"
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDeleteAccount}
        isLoading={isDeleting}
        warningItems={[
          "Your profile and account details",
          "Your role permissions",
        ]}
      />
    </div>
  );
}
