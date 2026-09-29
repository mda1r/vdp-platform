"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Terminal,
  GitBranch,
  Loader2,
  Lock,
  Fingerprint,
  ShieldAlert,
  CircleCheck,
  KeyRound,
  AtSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";

const inputClass =
  "h-10 border-zinc-800 bg-zinc-950/70 pl-9 font-mono text-sm text-zinc-100 placeholder:text-zinc-600 transition-colors focus-visible:border-emerald-500/60 focus-visible:ring-emerald-500/20";

function RegisteredNotice() {
  const params = useSearchParams();
  if (params.get("registered") !== "true") return null;
  return (
    <div className="reveal flex items-start gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3 font-mono text-xs text-emerald-300">
      <CircleCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
      <span>
        <span className="font-bold">[OK]</span> account provisioned. authenticate to enter.
      </span>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginInput) {
    setIsLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    setIsLoading(false);

    if (result?.error) {
      setError("Invalid email or password");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
      <Card className="gap-0 rounded-xl border-zinc-800 bg-zinc-900/60 py-0 ring-0">
        {/* Title bar */}
        <div className="terminal-bar">
          <span className="terminal-dot bg-red-500/70" />
          <span className="terminal-dot bg-yellow-500/70" />
          <span className="terminal-dot bg-emerald-500/70" />
          <span className="ml-2 flex items-center gap-1.5 font-mono text-[11px] text-zinc-400">
            <Terminal className="h-3 w-3 text-emerald-500" />
            auth.sh — ssh operator@jahez-sec
          </span>
          <span
            className={`ml-auto flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest ${
              error ? "text-red-400" : "text-emerald-500/80"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                error ? "bg-red-500" : "bg-emerald-400"
              }`}
            />
            {error ? "denied" : "secure"}
          </span>
        </div>

        <CardHeader className="items-center pt-7 text-center">
          <Image
            src="/jahez-logo.webp"
            alt="Jahez Group"
            width={120}
            height={38}
            className="mx-auto h-8 w-auto invert"
            priority
          />
          <div className="mx-auto mt-4 flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
            <Fingerprint className="h-6 w-6" />
          </div>
          <CardTitle className="mt-3 text-2xl font-bold tracking-tight text-zinc-50">
            Sign In
          </CardTitle>
          <CardDescription className="text-xs text-zinc-500">
            Enter your credentials to access the platform
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pb-6 pt-5">
          <Suspense fallback={null}>
            <RegisteredNotice />
          </Suspense>

          {error && (
            <div className="flex items-start gap-2 rounded-md border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-400">
              <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="font-mono text-[11px] uppercase tracking-widest text-zinc-500"
              >
                <span className="text-emerald-500">--</span>email
              </Label>
              <div className="relative">
                <AtSign className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />
                <Input
                  id="email"
                  type="email"
                  placeholder="operator@domain.tld"
                  autoComplete="email"
                  aria-invalid={!!errors.email}
                  className={inputClass}
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="font-mono text-xs text-red-400">
                  <span className="text-red-500">[!]</span> {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="font-mono text-[11px] uppercase tracking-widest text-zinc-500"
              >
                <span className="text-emerald-500">--</span>password
              </Label>
              <div className="relative">
                <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  aria-invalid={!!errors.password}
                  className={inputClass}
                  {...register("password")}
                />
              </div>
              {errors.password && (
                <p className="font-mono text-xs text-red-400">
                  <span className="text-red-500">[!]</span> {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="h-11 w-full gap-2 bg-primary font-mono text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="relative py-1">
            <div className="absolute inset-0 flex items-center">
              <Separator className="bg-zinc-800" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[oklch(0.085_0.006_160)] px-3 font-mono text-[10px] uppercase tracking-widest text-zinc-600">
                or federate via
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="h-10 border-zinc-800 bg-zinc-950/60 font-mono text-xs text-zinc-300 transition-all hover:border-emerald-500/40 hover:bg-emerald-500/5 hover:text-emerald-300"
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              disabled={isLoading}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden>
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              google
            </Button>
            <Button
              variant="outline"
              className="h-10 border-zinc-800 bg-zinc-950/60 font-mono text-xs text-zinc-300 transition-all hover:border-emerald-500/40 hover:bg-emerald-500/5 hover:text-emerald-300"
              onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
              disabled={isLoading}
            >
              <GitBranch className="mr-2 h-4 w-4" />
              github
            </Button>
          </div>
        </CardContent>

        <CardFooter className="justify-center border-zinc-800 bg-zinc-900/40 py-4">
          <p className="text-xs text-zinc-500">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/register"
              className="font-semibold text-emerald-400 underline-offset-4 transition-colors hover:text-emerald-300 hover:underline"
            >
              Register
            </Link>
          </p>
        </CardFooter>
      </Card>
  );
}
