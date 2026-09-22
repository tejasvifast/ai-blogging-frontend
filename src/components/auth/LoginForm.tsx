"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleIcon } from "./GoogleIcon";
import { authApi } from "@/lib/api/auth";
import { ApiError, fieldErrors } from "@/lib/api/errors";
import {
  loginSchema,
  registerSchema,
  type LoginValues,
  type RegisterValues,
} from "@/lib/validations/auth";
import { resetTokenCache } from "@/lib/api/client";

type Mode = "signin" | "register";

const ERROR_MESSAGES: Record<string, string> = {
  CredentialsSignin: "Incorrect email or password.",
  OAuthAccountNotLinked: "This email is already registered with a different method.",
  AccessDenied: "Your Google account could not be verified.",
  Configuration: "Sign-in is misconfigured. Please try again later.",
};

export function LoginForm({
  callbackUrl,
  initialError,
}: {
  callbackUrl: string;
  initialError?: string;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [showEmail, setShowEmail] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const form = useForm<LoginValues & Partial<RegisterValues>>({
    resolver: zodResolver(mode === "signin" ? loginSchema : registerSchema),
    defaultValues: { email: "", password: "", name: "" },
  });

  if (initialError && !form.formState.isSubmitted) {
    // Surface an error passed via ?error= (from a failed OAuth redirect).
    const msg = ERROR_MESSAGES[initialError] ?? "Something went wrong signing in.";
    // Defer to avoid a render-phase toast.
    queueMicrotask(() => toast.error(msg));
  }

  async function onGoogle() {
    setGoogleLoading(true);
    await signIn("google", { callbackUrl });
  }

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      if (mode === "register") {
        await authApi.register({
          name: values.name!,
          email: values.email,
          password: values.password,
        });
      }
      resetTokenCache();
      const res = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });
      if (res?.error) {
        toast.error(ERROR_MESSAGES[res.error] ?? "Incorrect email or password.");
        return;
      }
      toast.success(mode === "register" ? "Account created — welcome!" : "Welcome back!");
      router.push(callbackUrl);
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError) {
        const fields = fieldErrors(err);
        (Object.keys(fields) as Array<keyof RegisterValues>).forEach((key) => {
          const message = fields[key as string]?.[0];
          if (message) form.setError(key, { message });
        });
        toast.error(err.message);
      } else {
        toast.error("Unexpected error. Please try again.");
      }
    }
  });

  const isBusy = form.formState.isSubmitting;

  return (
    <div className="w-full space-y-6">
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="w-full"
        onClick={onGoogle}
        disabled={googleLoading || isBusy}
      >
        {googleLoading ? (
          <Loader2 className="animate-spin" />
        ) : (
          <GoogleIcon className="h-[18px] w-[18px]" />
        )}
        Continue with Google
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-[var(--color-border)]" />
        </div>
        <div className="relative flex justify-center text-xs uppercase tracking-wider">
          <span className="bg-[var(--color-background)] px-2 text-[var(--color-muted-foreground)]">
            or
          </span>
        </div>
      </div>

      {!showEmail ? (
        <Button
          type="button"
          variant="ghost"
          className="w-full text-[var(--color-muted-foreground)]"
          onClick={() => setShowEmail(true)}
        >
          Continue with email
        </Button>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          {mode === "register" && (
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" autoComplete="name" {...form.register("name")} />
              {form.formState.errors.name && (
                <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>
              )}
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
            {form.formState.errors.email && (
              <p className="text-xs text-red-500">{form.formState.errors.email.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete={mode === "register" ? "new-password" : "current-password"}
              {...form.register("password")}
            />
            {form.formState.errors.password && (
              <p className="text-xs text-red-500">{form.formState.errors.password.message}</p>
            )}
          </div>
          <Button type="submit" size="lg" className="w-full" disabled={isBusy}>
            {isBusy && <Loader2 className="animate-spin" />}
            {mode === "signin" ? "Sign in" : "Create account"}
          </Button>
        </form>
      )}

      <p className="text-center text-sm text-[var(--color-muted-foreground)]">
        {mode === "signin" ? "Don't have an account?" : "Already have an account?"}{" "}
        <button
          type="button"
          className="font-medium text-[var(--color-primary)] hover:underline"
          onClick={() => {
            setMode((m) => (m === "signin" ? "register" : "signin"));
            setShowEmail(true);
            form.reset();
          }}
        >
          {mode === "signin" ? "Create one" : "Sign in"}
        </button>
      </p>
    </div>
  );
}
