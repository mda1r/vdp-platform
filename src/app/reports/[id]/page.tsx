import { requireAuth } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { decrypt } from "@/lib/encryption";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import {
  ArrowLeft,
  FileText,
  ListOrdered,
  Paperclip,
  MessageSquare,
  History,
  Lock,
  ShieldAlert,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ReportStatusActions } from "@/components/reports/status-actions";
import { CommentForm } from "@/components/reports/comment-form";
import { AttachmentUpload } from "@/components/reports/attachment-upload";
import { StatusBadge, PriorityBadge, Tag } from "@/components/reports/status-badge";
import { maskStatus } from "@/lib/report-status";

function Panel({
  icon: Icon,
  title,
  children,
  aside,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
  aside?: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-zinc-800 bg-zinc-900/50 transition-colors hover:border-zinc-700">
      <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-3">
        <div className="flex items-center gap-2 font-mono text-sm text-zinc-300">
          <span className="text-emerald-500">&gt;</span>
          <Icon className="h-3.5 w-3.5 text-zinc-500" />
          <span className="uppercase tracking-wider">{title}</span>
        </div>
        {aside}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

const ROLE_STYLES: Record<string, string> = {
  ADMIN: "border-red-500/30 bg-red-500/10 text-red-400",
  COMPANY: "border-blue-500/30 bg-blue-500/10 text-blue-400",
  RESEARCHER: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
};

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireAuth();

  const report = await db.report.findUnique({
    where: { id },
    include: {
      researcher: { select: { id: true, name: true, image: true } },
      program: {
        select: {
          id: true,
          title: true,
          company: { select: { userId: true, name: true } },
        },
      },
      attachments: true,
      comments: {
        include: {
          user: { select: { id: true, name: true, image: true, role: true } },
        },
        orderBy: { createdAt: "asc" },
      },
      timelines: {
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!report) notFound();

  const isResearcher = report.researcherId === session.user.id;
  const isCompanyOwner = report.program.company.userId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";

  if (!isResearcher && !isCompanyOwner && !isAdmin) {
    redirect("/reports");
  }

  // Company owners and admins see the real status (incl. RESOLVED) and
  // internal notes. Everyone else (the researcher) gets a masked view.
  const canSeeInternal = isCompanyOwner || isAdmin;

  let description = report.description;
  let stepsToReproduce = report.stepsToReproduce;
  if (report.isEncrypted) {
    try {
      description = decrypt(report.description);
      stepsToReproduce = decrypt(report.stepsToReproduce);
    } catch {
      description = "[Decryption failed]";
      stepsToReproduce = "[Decryption failed]";
    }
  }

  const visibleComments = canSeeInternal
    ? report.comments
    : report.comments.filter((c) => !c.isInternal);

  // Timeline: the stored `action` text embeds raw status names
  // ("Status changed from ACCEPTED to RESOLVED"), so for researchers we
  // rebuild the label from the structured old/new fields with masking, drop
  // transitions that collapse to a no-op after masking (ACCEPTED -> RESOLVED),
  // and hide internal-note events.
  const visibleTimeline = canSeeInternal
    ? report.timelines
    : report.timelines.flatMap((event) => {
        if (event.action === "Internal note added") return [];
        if (event.oldStatus && event.newStatus) {
          const from = maskStatus(event.oldStatus, false);
          const to = maskStatus(event.newStatus, false);
          if (from === to) return [];
          return [
            {
              ...event,
              action: `Status changed from ${from.replace(/_/g, " ")} to ${to.replace(/_/g, " ")}`,
            },
          ];
        }
        return [event];
      });

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Back link */}
      <Link
        href="/reports"
        className="inline-flex items-center gap-1.5 font-mono text-xs text-zinc-500 transition-colors hover:text-emerald-400"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back
      </Link>

      {/* Header card */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
        {/* Classification banner */}
        {report.isEncrypted && (
          <div className="mb-4 flex items-center gap-2 rounded-md border border-emerald-500/20 bg-emerald-500/5 px-4 py-2 font-mono text-xs uppercase tracking-widest text-emerald-400">
            <Lock className="h-3.5 w-3.5" />
            <span>Encrypted // AES-256</span>
          </div>
        )}

        <div className="mb-3 flex flex-wrap items-center gap-2">
          <StatusBadge
            status={report.status}
            canSeeInternal={canSeeInternal}
            size="md"
          />
          {report.priority && (
            <PriorityBadge priority={report.priority} size="md" />
          )}
          <Tag>{report.vulnType}</Tag>
          <Tag>{report.severity}</Tag>
          {report.cvssScore && (
            <Tag className="text-amber-400">
              CVSS {Number(report.cvssScore).toFixed(1)}
            </Tag>
          )}
          {report.isEncrypted && (
            <Tag className="text-emerald-400">
              <Lock className="mr-1 h-3 w-3" />
              Encrypted
            </Tag>
          )}
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
          {report.title}
        </h1>
        <p className="mt-2 font-mono text-xs text-zinc-500">
          <span className="text-zinc-400">{report.researcher.name}</span>
          {" -> "}
          <Link
            href={`/programs/${report.program.id}`}
            className="text-zinc-400 hover:text-emerald-400"
          >
            {report.program.title}
          </Link>
          <span className="text-zinc-600"> @ </span>
          {format(new Date(report.createdAt), "yyyy-MM-dd HH:mm")}
        </p>
        <p className="mt-1 font-mono text-[11px] text-zinc-600">
          id: {report.id}
        </p>
      </div>

      {canSeeInternal && (
        <ReportStatusActions
          reportId={report.id}
          currentStatus={report.status}
          currentPriority={report.priority}
        />
      )}

      {/* 2-column layout: main (2 cols) + sidebar (1 col) */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Description */}
          <Panel icon={FileText} title="Description">
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">
              {description}
            </div>
          </Panel>

          {/* Steps to Reproduce */}
          <Panel icon={ListOrdered} title="Steps to Reproduce">
            <div className="whitespace-pre-wrap rounded-md border border-zinc-800 bg-zinc-950 p-4 font-mono text-xs leading-relaxed text-zinc-300">
              {stepsToReproduce}
            </div>
          </Panel>

          {/* Attachments */}
          <Panel
            icon={Paperclip}
            title="Attachments"
            aside={
              <span className="font-mono text-xs text-zinc-500">
                [{report.attachments.length}/10]
              </span>
            }
          >
            <AttachmentUpload
              reportId={report.id}
              attachments={report.attachments.map((att) => ({
                id: att.id,
                filename: att.filename,
                mimeType: att.mimeType,
                size: att.size,
                url: att.url,
              }))}
              canDelete={isResearcher || isAdmin}
            />
          </Panel>

          {/* Discussion */}
          <Panel
            icon={MessageSquare}
            title="Discussion"
            aside={
              <span className="font-mono text-xs text-zinc-500">
                [{visibleComments.length}]
              </span>
            }
          >
            <div className="space-y-5">
              {visibleComments.length === 0 ? (
                <p className="py-4 text-center font-mono text-sm text-zinc-600">
                  No comments yet.
                </p>
              ) : (
                visibleComments.map((comment) => (
                  <div
                    key={comment.id}
                    className={`flex gap-3 rounded-md border p-3 ${
                      comment.isInternal
                        ? "border-amber-500/20 bg-amber-500/5"
                        : "border-zinc-800 bg-zinc-950/40"
                    }`}
                  >
                    <Avatar className="h-8 w-8 shrink-0 border border-zinc-800">
                      <AvatarImage src={comment.user.image ?? undefined} />
                      <AvatarFallback className="bg-zinc-800 font-mono text-xs text-emerald-400">
                        {comment.user.name?.[0]?.toUpperCase() ?? "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-zinc-100">
                          {comment.user.name}
                        </span>
                        <span
                          className={`inline-flex items-center rounded-md border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider ${
                            ROLE_STYLES[comment.user.role] ??
                            "border-zinc-700 text-zinc-400"
                          }`}
                        >
                          {comment.user.role}
                        </span>
                        {comment.isInternal && (
                          <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-amber-400">
                            <ShieldAlert className="h-3 w-3" />
                            Internal
                          </span>
                        )}
                        <span className="font-mono text-[11px] text-zinc-600">
                          {format(new Date(comment.createdAt), "yyyy-MM-dd HH:mm")}
                        </span>
                      </div>
                      <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                ))
              )}

              <div className="border-t border-zinc-800 pt-5">
                <CommentForm
                  reportId={report.id}
                  canPostInternal={canSeeInternal}
                />
              </div>
            </div>
          </Panel>
        </div>

        {/* Sidebar: Timeline */}
        <div>
          <Panel icon={History} title="Timeline">
            {visibleTimeline.length === 0 ? (
              <p className="py-2 text-center font-mono text-sm text-zinc-600">
                No events.
              </p>
            ) : (
              <ol className="relative space-y-5 border-l border-zinc-800 pl-5">
                {visibleTimeline.map((event) => (
                  <li key={event.id} className="relative">
                    <span className="absolute -left-[26px] top-1 h-2.5 w-2.5 rounded-full border-2 border-zinc-950 bg-emerald-500" />
                    <p className="text-sm font-medium text-zinc-200">
                      {event.action}
                    </p>
                    <p className="mt-0.5 font-mono text-[11px] text-zinc-500">
                      {event.user.name}
                      <span className="text-zinc-700"> &middot; </span>
                      {format(new Date(event.createdAt), "MMM d, HH:mm")}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}
