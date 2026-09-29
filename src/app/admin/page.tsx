import { requireRole } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { format } from "date-fns";
import {
  Users,
  Building2,
  Bug,
  FolderOpen,
  ShieldAlert,
  Terminal,
  Activity,
  Mail,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { AdminActions } from "@/components/admin/admin-actions";
import { CreateUserForm } from "@/components/admin/create-user-form";

/* ------------------------------------------------------------------ */
/*  Style maps                                                        */
/* ------------------------------------------------------------------ */

const ROLE_STYLES: Record<string, string> = {
  ADMIN: "border-emerald-500/40 bg-emerald-500/15 text-emerald-400",
  COMPANY: "border-sky-500/40 bg-sky-500/15 text-sky-400",
  RESEARCHER: "border-violet-500/40 bg-violet-500/15 text-violet-400",
};

const STATUS_STYLES: Record<string, string> = {
  NEW: "border-sky-500/40 bg-sky-500/15 text-sky-400",
  TRIAGED: "border-amber-500/40 bg-amber-500/15 text-amber-400",
  ACCEPTED: "border-emerald-500/40 bg-emerald-500/15 text-emerald-400",
  RESOLVED: "border-teal-500/40 bg-teal-500/15 text-teal-400",
  DUPLICATE: "border-orange-500/40 bg-orange-500/15 text-orange-400",
  OUT_OF_SCOPE: "border-red-500/40 bg-red-500/15 text-red-400",
  NOT_APPLICABLE: "border-red-500/40 bg-red-500/15 text-red-400",
  INFORMATIVE: "border-violet-500/40 bg-violet-500/15 text-violet-400",
  SPAM: "border-red-600/40 bg-red-600/15 text-red-500",
};

const PRIORITY_STYLES: Record<string, string> = {
  P1_CRITICAL: "border-red-500/40 bg-red-500/15 text-red-400",
  P2_HIGH: "border-orange-500/40 bg-orange-500/15 text-orange-400",
  P3_MEDIUM: "border-yellow-500/40 bg-yellow-500/15 text-yellow-400",
  P4_LOW: "border-sky-500/40 bg-sky-500/15 text-sky-400",
  P5_INFO: "border-zinc-500/40 bg-zinc-500/15 text-zinc-400",
};

/* ------------------------------------------------------------------ */
/*  Inline helper components                                          */
/* ------------------------------------------------------------------ */

function Tag({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider ${className ?? "border-zinc-700 bg-zinc-800/60 text-zinc-400"}`}
    >
      {children}
    </span>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
  count,
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  count?: number;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
        <Icon className="h-4 w-4 text-emerald-500" />
      </div>
      <div className="flex items-center gap-2.5">
        <h2 className="font-mono text-sm font-semibold uppercase tracking-wider text-zinc-300">
          {title}
        </h2>
        {count !== undefined && (
          <span className="rounded-full bg-zinc-800 px-2 py-0.5 font-mono text-[10px] font-bold text-zinc-400">
            {count}
          </span>
        )}
      </div>
      {subtitle && (
        <span className="font-mono text-xs text-zinc-600">{subtitle}</span>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */

export default async function AdminPage() {
  await requireRole("ADMIN");

  /* ---------- parallel data queries ---------- */
  const [
    totalUsers,
    totalResearchers,
    totalCompanies,
    totalPrograms,
    totalReports,
    pendingCompanies,
    recentReports,
    users,
  ] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { role: "RESEARCHER" } }),
    db.company.count(),
    db.program.count(),
    db.report.count(),
    db.company.findMany({
      where: { isVerified: false },
      include: { user: true },
    }),
    db.report.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        researcher: { select: { name: true } },
        program: { select: { title: true } },
      },
    }),
    db.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        company: { select: { name: true, isVerified: true } },
      },
    }),
  ]);

  /* ---------- stat cards data ---------- */
  const stats = [
    {
      label: "TOTAL USERS",
      sublabel: `${totalResearchers} researchers`,
      value: totalUsers,
      icon: Users,
    },
    {
      label: "COMPANIES",
      sublabel: `${pendingCompanies.length} pending`,
      value: totalCompanies,
      icon: Building2,
    },
    {
      label: "PROGRAMS",
      sublabel: "> active scopes",
      value: totalPrograms,
      icon: FolderOpen,
    },
    {
      label: "REPORTS",
      sublabel: "> total submissions",
      value: totalReports,
      icon: Bug,
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
              Admin Control Panel
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              Full platform oversight &mdash; users, companies, programs, reports
            </p>
          </div>
          <CreateUserForm />
        </div>

        {/* ============================================================ */}
        {/*  Stat cards                                                  */}
        {/* ============================================================ */}
        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="group rounded-lg border border-zinc-800 bg-zinc-900/50 transition-colors hover:border-zinc-700"
              >

                <div className="p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                      {stat.label}
                    </span>
                    <Icon className="h-4 w-4 text-zinc-600 transition-colors duration-300 group-hover:text-emerald-500" />
                  </div>
                  <div className="font-mono text-3xl font-bold tracking-tight text-zinc-100">
                    {stat.value.toLocaleString()}
                  </div>
                  <p className="mt-1 font-mono text-[10px] text-zinc-600">
                    {stat.sublabel}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* ============================================================ */}
        {/*  Pending company verifications                               */}
        {/* ============================================================ */}
        {pendingCompanies.length > 0 && (
          <Card className="mb-10 overflow-hidden rounded-lg border-amber-500/30 bg-zinc-900/30">
            <CardHeader className="border-b border-amber-500/20 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-500/10">
                  <ShieldAlert className="h-4 w-4 text-amber-400" />
                </div>
                <div className="flex items-center gap-2.5">
                  <h2 className="font-mono text-sm font-semibold uppercase tracking-wider text-amber-300">
                    Pending Verifications
                  </h2>
                  <span className="rounded-full bg-amber-500/15 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-400">
                    {pendingCompanies.length}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="divide-y divide-zinc-800/40 p-0">
              {pendingCompanies.map((company) => (
                <div
                  key={company.id}
                  className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-amber-500/5"
                >
                  <Building2 className="h-4 w-4 flex-shrink-0 text-amber-500/60" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-mono text-sm font-medium text-zinc-200">
                      {company.name}
                    </p>
                    <div className="mt-0.5 flex items-center gap-2">
                      <Mail className="h-3 w-3 text-zinc-600" />
                      <span className="font-mono text-xs text-zinc-500">
                        {company.user.email}
                      </span>
                    </div>
                  </div>
                  <AdminActions
                    userId={company.userId}
                    action="verify_company"
                    label="Verify"
                    variant="default"
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* ============================================================ */}
        {/*  Users table                                                 */}
        {/* ============================================================ */}
        <div className="mb-10 rounded-xl border border-zinc-800/60 bg-zinc-900/30">
          <div className="border-b border-zinc-800/60 px-5 py-4">
            <SectionHeader
              icon={Users}
              title="Users"
              subtitle="last 20 registered"
              count={totalUsers}
            />
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800/60 hover:bg-transparent">
                  <TableHead className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                    Status
                  </TableHead>
                  <TableHead className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                    Name
                  </TableHead>
                  <TableHead className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                    Email
                  </TableHead>
                  <TableHead className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                    Role
                  </TableHead>
                  <TableHead className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                    Account
                  </TableHead>
                  <TableHead className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                    Joined
                  </TableHead>
                  <TableHead className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => {
                  const isBanned = user.banned;
                  return (
                    <TableRow
                      key={user.id}
                      className="border-zinc-800/40 transition-colors hover:bg-emerald-500/5"
                    >
                      {/* Status dot */}
                      <TableCell>
                        <div className="flex items-center justify-center">
                          <span
                            className={`h-2 w-2 rounded-full ${
                              isBanned
                                ? "bg-red-500"
                                : "bg-emerald-500"
                            }`}
                          />
                        </div>
                      </TableCell>

                      {/* Name */}
                      <TableCell className="font-mono text-sm text-zinc-200">
                        {user.name ?? "Unnamed"}
                      </TableCell>

                      {/* Email */}
                      <TableCell className="font-mono text-xs text-zinc-500">
                        {user.email}
                      </TableCell>

                      {/* Role tag */}
                      <TableCell>
                        <Tag
                          className={
                            ROLE_STYLES[user.role] ??
                            "border-zinc-700 bg-zinc-800/60 text-zinc-400"
                          }
                        >
                          {user.role}
                        </Tag>
                      </TableCell>

                      {/* Account status */}
                      <TableCell>
                        <Tag
                          className={
                            isBanned
                              ? "border-red-500/40 bg-red-500/15 text-red-400"
                              : "border-emerald-500/40 bg-emerald-500/15 text-emerald-400"
                          }
                        >
                          {isBanned ? "Banned" : "Active"}
                        </Tag>
                      </TableCell>

                      {/* Joined date */}
                      <TableCell className="font-mono text-xs text-zinc-600">
                        {format(user.createdAt, "MMM d, yyyy")}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {user.role !== "ADMIN" && (
                            <AdminActions
                              userId={user.id}
                              action="make_admin"
                              label="Make Admin"
                              variant="outline"
                            />
                          )}
                          {isBanned ? (
                            <AdminActions
                              userId={user.id}
                              action="unban"
                              label="Unban"
                              variant="default"
                            />
                          ) : (
                            <AdminActions
                              userId={user.id}
                              action="ban"
                              label="Ban"
                              variant="destructive"
                            />
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* ============================================================ */}
        {/*  Recent reports table                                        */}
        {/* ============================================================ */}
        <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/30">
          <div className="border-b border-zinc-800/60 px-5 py-4">
            <SectionHeader
              icon={Activity}
              title="Recent Reports"
              subtitle="last 10 submissions"
              count={totalReports}
            />
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800/60 hover:bg-transparent">
                  <TableHead className="w-10 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                    Pri
                  </TableHead>
                  <TableHead className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                    Title
                  </TableHead>
                  <TableHead className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                    Researcher
                  </TableHead>
                  <TableHead className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                    Program
                  </TableHead>
                  <TableHead className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                    Status
                  </TableHead>
                  <TableHead className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                    Date
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentReports.map((report) => (
                  <TableRow
                    key={report.id}
                    className="border-zinc-800/40 transition-colors hover:bg-emerald-500/5"
                  >
                    {/* Priority indicator */}
                    <TableCell>
                      <Tag
                        className={
                          PRIORITY_STYLES[report.priority] ??
                          "border-zinc-700 bg-zinc-800/60 text-zinc-400"
                        }
                      >
                        {report.priority?.replace(/_.*/, "") ?? "---"}
                      </Tag>
                    </TableCell>

                    {/* Linked title */}
                    <TableCell>
                      <Link
                        href={`/reports/${report.id}`}
                        className="font-mono text-sm text-zinc-200 transition-colors hover:text-emerald-400"
                      >
                        {report.title}
                      </Link>
                    </TableCell>

                    {/* Researcher */}
                    <TableCell className="font-mono text-xs text-zinc-500">
                      {report.researcher?.name ?? "Unknown"}
                    </TableCell>

                    {/* Program */}
                    <TableCell className="font-mono text-xs text-zinc-500">
                      {report.program.title}
                    </TableCell>

                    {/* Status tag */}
                    <TableCell>
                      <Tag
                        className={
                          STATUS_STYLES[report.status] ??
                          "border-zinc-700 bg-zinc-800/60 text-zinc-400"
                        }
                      >
                        {report.status}
                      </Tag>
                    </TableCell>

                    {/* Date */}
                    <TableCell className="font-mono text-xs text-zinc-600">
                      {format(report.createdAt, "MMM d, yyyy")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
