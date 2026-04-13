import { requestPasswordReset } from "@/app/(auth)/actions/auth-actions";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import Image from "next/image";

type ForgotPasswordPageProps = {
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
};

export default async function ForgotPasswordPage({
  searchParams,
}: ForgotPasswordPageProps) {
  const { error, success } = await searchParams;

  return (
    <div className="min-h-screen w-full flex">
      <div className="hidden lg:flex lg:w-[42%] flex-col justify-between bg-muted/40 border-r border-border/40 px-14 py-12">
        <Image
          src="/casalavoro-logo.png"
          alt="casalavoro"
          width={110}
          height={32}
          className="object-contain object-left"
          priority
        />

        <div className="space-y-4">
          <p className="text-3xl font-semibold tracking-tight text-foreground leading-snug">
            Enter your email.
            <br />
            <span className="text-muted-foreground font-normal">
              We'll get you back in.
            </span>
          </p>
        </div>

        <p className="text-xs text-muted-foreground/50 tracking-wide">
          © {new Date().getFullYear()} Casalavoro · Blog CMS
        </p>
      </div>

      <div className="flex bg-white flex-1 flex-col justify-center px-6 py-12 sm:px-12 lg:px-16">
        <div className="w-full max-w-md mx-auto space-y-8">
          <div className="lg:hidden">
            <Image
              src="/casalavoro-logo.png"
              alt="casalavoro"
              width={100}
              height={30}
              className="object-contain"
              priority
            />
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Reset your password
            </h1>
            <p className="text-sm text-muted-foreground">
              Remember it?{" "}
              <Link
                href="/login"
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                Back to sign in
              </Link>
            </p>
          </div>

          {/* Form */}
          <form action={requestPasswordReset} className="space-y-5">
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

            {error && (
              <p
                className="text-sm text-destructive bg-destructive/8 border border-destructive/20 rounded-lg px-3 py-2.5"
                role="alert"
              >
                {error}
              </p>
            )}

            {success && (
              <p
                className="text-sm text-foreground bg-muted/60 border border-border/60 rounded-lg px-3 py-2.5"
                role="status"
              >
                {success}
              </p>
            )}

            <FormSubmitButton
              className="w-full text-white h-11 font-semibold"
              idleText="Send Reset Link"
              pendingText="Sending link..."
            />
          </form>
        </div>
      </div>
    </div>
  );
}
