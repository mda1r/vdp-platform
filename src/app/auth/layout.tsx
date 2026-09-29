import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ShieldCheck, ArrowLeft } from "lucide-react";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <div className="relative flex min-h-screen bg-background text-foreground">
      {/* Left panel */}
      <aside className="relative hidden w-[46%] overflow-hidden border-r border-zinc-800/80 bg-zinc-950 lg:flex lg:flex-col">
        <div className="relative flex flex-1 flex-col justify-between p-10 xl:p-14">
          <Link href="/" className="inline-flex w-fit items-center gap-3">
            <Image
              src="/jahez-logo.webp"
              alt="Jahez Group"
              width={110}
              height={34}
              className="h-7 w-auto invert"
              priority
            />
            <span className="h-5 w-px bg-zinc-700" />
            <span className="font-mono text-sm tracking-[0.25em] text-primary">SECURITY</span>
          </Link>

          <div className="my-10">
            <h2 className="text-4xl font-black uppercase leading-none tracking-tight text-zinc-100 xl:text-5xl">
              Access
              <br />
              <span className="text-primary">Control</span>
            </h2>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-zinc-400">
              Authorized researchers only. Every login is logged, rate-limited and audited.
            </p>
          </div>

          <div className="flex items-center font-mono text-[11px] text-zinc-500">
            <span className="flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              private vulnerability disclosure program
            </span>
          </div>
        </div>
      </aside>

      {/* Right: form area */}
      <main className="relative flex flex-1 items-center justify-center px-4 py-10 sm:py-14">
        <Link
          href="/"
          className="absolute left-4 top-4 flex items-center gap-2 font-mono text-[11px] text-zinc-500 transition-colors hover:text-emerald-400 lg:hidden"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </Link>

        <div className="relative w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
