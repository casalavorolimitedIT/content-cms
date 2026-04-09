"use client";

import { register } from "@/app/(auth)/actions/auth-actions";
import {
  Calendar01Icon,
  Film01Icon,
  News01Icon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

const ROLES = [
  { id: "cinema", label: "Cinema", icon: Film01Icon },
  { id: "article", label: "Article", icon: News01Icon },
  { id: "event", label: "Event", icon: Calendar01Icon },
];

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  function toggleRole(roleId: string) {
    setSelectedRoles((prev) =>
      prev.includes(roleId)
        ? prev.filter((r) => r !== roleId)
        : [...prev, roleId],
    );
  }

  return (
    <div className="min-h-screen w-full flex">
      <div className="hidden lg:flex lg:w-[42%] flex-col justify-between bg-muted/40 border-r border-border/40 px-14 py-12">
        <Image
          src="/casalavoro-logo.png"
          alt="Upstream"
          width={110}
          height={32}
          className="object-contain object-left"
          priority
        />

        <div className="space-y-4">
          <p className="text-3xl font-semibold tracking-tight text-foreground leading-snug">
            Publish smarter.
            <br />
            <span className="text-muted-foreground font-normal">
              Manage all websites from one place.
            </span>
          </p>
        </div>

        <p className="text-xs text-muted-foreground/50 tracking-wide">
          © {new Date().getFullYear()} Upstream · Blog CMS
        </p>
      </div>

      <div className="flex bg-white flex-1 flex-col justify-center px-6 py-12 sm:px-12 lg:px-16">
        <div className="w-full max-w-md mx-auto space-y-8">
          <div className="lg:hidden">
            <Image
              src="/casalavoro-logo.png"
              alt="Upstream"
              width={100}
              height={30}
              className="object-contain"
              priority
            />
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Create your account
            </h1>
            <p className="text-sm text-muted-foreground">
              Already have one?{" "}
              <Link
                href="/login"
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>

          {/* Form */}
          <form action={register} className="space-y-5">
            {/* Name + Email row */}
            <div className="grid grid-cols-2 gap-4">
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
                  placeholder="Jane Doe"
                  required
                  className="h-10 bg-muted/30 border-border/60 placeholder:text-muted-foreground/40"
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="email"
                  className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  className="h-10 bg-muted/30 border-border/60 placeholder:text-muted-foreground/40"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label
                htmlFor="password"
                className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
              >
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Min. 6 characters"
                required
                className="h-10 bg-muted/30 border-border/60 placeholder:text-muted-foreground/40"
              />
            </div>

            {/* Post Permissions */}
            <div className="space-y-2.5">
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Post Permissions
                </Label>
                <p className="text-xs text-muted-foreground/60 mt-0.5">
                  Select the content types you want to post.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {ROLES.map((role) => {
                  const selected = selectedRoles.includes(role.id);
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => toggleRole(role.id)}
                      className={cn(
                        "relative flex flex-col items-center gap-2 rounded-xl border px-3 py-3.5 transition-all duration-150 cursor-pointer select-none outline-none",
                        selected
                          ? "border-primary bg-primary/8 text-primary"
                          : "border-border/60 bg-muted/30 text-muted-foreground hover:border-border hover:bg-muted/60 hover:text-foreground",
                      )}
                    >
                      {selected && (
                        <span className="absolute top-1.5 right-1.5">
                          <HugeiconsIcon
                            icon={CheckmarkCircle02Icon}
                            size={13}
                            strokeWidth={2.2}
                            className="text-primary"
                          />
                        </span>
                      )}
                      <HugeiconsIcon
                        icon={role.icon}
                        size={20}
                        strokeWidth={1.8}
                      />
                      <span className="text-xs font-semibold">
                        {role.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {selectedRoles.map((role) => (
                <input key={role} type="hidden" name="roles" value={role} />
              ))}
            </div>

            {/* Error */}
            {error && (
              <p
                className="text-sm text-destructive bg-destructive/8 border border-destructive/20 rounded-lg px-3 py-2.5"
                role="alert"
              >
                {error}
              </p>
            )}

            <FormSubmitButton
              className="w-full text-white h-11 font-semibold"
              idleText="Create Account"
              pendingText="Creating account..."
            />
          </form>
        </div>
      </div>
    </div>
  );
}
