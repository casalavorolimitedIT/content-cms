"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  Delete02Icon,
  InformationCircleIcon,
  Logout01Icon,
  QuestionIcon,
  UserRemove01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import React from "react";

type ActionPreset =
  | "delete"
  | "logout"
  | "deleteAccount"
  | "warning"
  | "confirm"
  | "info";

interface PresetConfig {
  title: string;
  description: string;
  confirmText: string;
  cancelText: string;
  icon: React.ReactNode;
  gradient: string;
  bgGlow: string;
  textColor: string;
  confirmVariant: "destructive" | "default" | "outline";
}

const presets: Record<ActionPreset, PresetConfig> = {
  delete: {
    title: "Delete Item",
    description: "Are you sure? This action cannot be undone.",
    confirmText: "Delete",
    cancelText: "Cancel",
    icon: (
      <HugeiconsIcon
        icon={Delete02Icon}
        className="h-6 w-6 text-white drop-shadow-lg"
      />
    ),
    gradient: "from-red-500 via-rose-500 to-pink-600",
    bgGlow: "bg-red-500/8",
    textColor: "text-red-500 dark:text-red-400",
    confirmVariant: "destructive",
  },
  logout: {
    title: "Sign Out",
    description: "Are you sure you want to sign out of your account?",
    confirmText: "Sign Out",
    cancelText: "Stay Signed In",
    icon: (
      <HugeiconsIcon
        icon={Logout01Icon}
        className="h-6 w-6 text-white drop-shadow-lg"
      />
    ),
    gradient: "from-slate-500 via-slate-600 to-slate-700",
    bgGlow: "bg-slate-500/8",
    textColor: "text-slate-600 dark:text-slate-400",
    confirmVariant: "default",
  },
  deleteAccount: {
    title: "Delete Account",
    description:
      "This will permanently delete your account and all associated data. This cannot be undone.",
    confirmText: "Delete Account",
    cancelText: "Keep Account",
    icon: (
      <HugeiconsIcon
        icon={UserRemove01Icon}
        className="h-6 w-6 text-white drop-shadow-lg"
      />
    ),
    gradient: "from-red-600 via-red-500 to-orange-500",
    bgGlow: "bg-red-500/8",
    textColor: "text-red-600 dark:text-red-400",
    confirmVariant: "destructive",
  },
  warning: {
    title: "Are you sure?",
    description:
      "This action may have unintended consequences. Please proceed carefully.",
    confirmText: "Proceed",
    cancelText: "Cancel",
    icon: (
      <HugeiconsIcon
        icon={AlertTriangle}
        className="h-6 w-6 text-white drop-shadow-lg"
      />
    ),
    gradient: "from-amber-500 via-orange-500 to-red-500",
    bgGlow: "bg-amber-500/8",
    textColor: "text-amber-600 dark:text-amber-400",
    confirmVariant: "default",
  },
  confirm: {
    title: "Confirm Action",
    description: "Are you sure you want to proceed with this action?",
    confirmText: "Confirm",
    cancelText: "Cancel",
    icon: (
      <HugeiconsIcon
        icon={QuestionIcon}
        className="h-6 w-6 text-white drop-shadow-lg"
      />
    ),
    gradient: "from-blue-500 via-indigo-500 to-violet-600",
    bgGlow: "bg-blue-500/8",
    textColor: "text-blue-600 dark:text-blue-400",
    confirmVariant: "default",
  },
  info: {
    title: "Notice",
    description: "Please review this information before proceeding.",
    confirmText: "Got It",
    cancelText: "Dismiss",
    icon: (
      <HugeiconsIcon
        icon={InformationCircleIcon}
        className="h-6 w-6 text-white drop-shadow-lg"
      />
    ),
    gradient: "from-cyan-500 via-blue-500 to-indigo-500",
    bgGlow: "bg-cyan-500/8",
    textColor: "text-cyan-600 dark:text-cyan-400",
    confirmVariant: "default",
  },
};

const getButtonStyles = (preset: ActionPreset) => {
  switch (preset) {
    case "delete":
    case "deleteAccount":
      return "bg-red-600 hover:bg-red-700 focus:ring-red-600";
    case "warning":
      return "bg-amber-600 hover:bg-amber-700 focus:ring-amber-600";
    case "logout":
      return "bg-slate-600 hover:bg-slate-700 focus:ring-slate-600";
    case "confirm":
      return "bg-blue-600 hover:bg-blue-700 focus:ring-blue-600";
    case "info":
      return "bg-cyan-600 hover:bg-cyan-700 focus:ring-cyan-600";
    default:
      return "";
  }
};

interface ActionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: any;
  preset?: ActionPreset;
  title?: string;
  description?: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  icon?: React.ReactNode;
  warningItems?: string[];
  isLoading?: boolean;
}

export function ActionModal({
  open,
  onOpenChange,
  onConfirm,
  preset = "confirm",
  title,
  description,
  confirmText,
  cancelText,
  icon,
  warningItems = [],
  isLoading = false,
}: ActionModalProps) {
  const [isPending, setIsPending] = React.useState(false);
  const cfg = presets[preset];

  const resolvedTitle = title ?? cfg.title;
  const resolvedDescription = description ?? cfg.description;
  const resolvedConfirmText = confirmText ?? cfg.confirmText;
  const resolvedCancelText = cancelText ?? cfg.cancelText;
  const resolvedIcon = icon ?? cfg.icon;

  const loading = isLoading || isPending;

  const handleConfirm = async () => {
    setIsPending(true);
    try {
      await onConfirm();
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md overflow-hidden p-0 gap-0">
        {/* Subtle background tint */}
        <div
          className={cn(
            "absolute inset-0 opacity-[0.04] bg-linear-to-br pointer-events-none",
            cfg.gradient,
          )}
        />

        <div className="relative">
          <DialogHeader className="p-6 pb-4 space-y-4">
            <div className="flex items-center gap-4">
              {/* Icon */}
              <div className="relative shrink-0 group">
                <div
                  className={cn(
                    "absolute inset-0 rounded-2xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-500 bg-linear-to-br",
                    cfg.gradient,
                  )}
                />
                <div
                  className={cn(
                    "relative flex h-13 w-13 items-center justify-center rounded-2xl bg-linear-to-br shadow-lg ring-2 ring-white/10 transition-transform duration-300 group-hover:scale-105",
                    cfg.gradient,
                  )}
                >
                  {resolvedIcon}
                </div>
              </div>

              <DialogTitle className="text-xl font-bold tracking-tight leading-tight">
                {resolvedTitle}
              </DialogTitle>
            </div>

            <DialogDescription className="text-sm leading-relaxed text-muted-foreground text-left">
              {resolvedDescription}
            </DialogDescription>

            {/* Warning items */}
            {warningItems.length > 0 && (
              <div
                className={cn(
                  "rounded-xl border border-border/50 p-4 space-y-2",
                  cfg.bgGlow,
                )}
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  The following will be permanently removed:
                </p>
                <ul className="space-y-1.5 ml-1">
                  {warningItems.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <div
                        className={cn(
                          "h-1.5 w-1.5 rounded-full shrink-0 bg-linear-to-r",
                          cfg.gradient,
                        )}
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </DialogHeader>

          <DialogFooter className="p-6 pt-2 gap-2 sm:gap-2 flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="flex-1 py-5 rounded-full"
            >
              {resolvedCancelText}
            </Button>
            <Button
              type="button"
              variant={cfg.confirmVariant}
              onClick={handleConfirm}
              disabled={loading}
              className={cn(
                "flex-1 py-5 font-semibold gap-2 text-white rounded-full shadow-md transition-all duration-200",
                !loading && "hover:scale-[1.02]",
                getButtonStyles(preset),
              )}
            >
              {loading ? "Please wait…" : resolvedConfirmText}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
