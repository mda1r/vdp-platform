import { auth } from "@/lib/auth";
import { DashboardNav } from "@/components/layout/dashboard-nav";

export default async function ProgramsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (session?.user) {
    return (
      <div className="flex min-h-screen">
        <DashboardNav />
        <div className="flex flex-1 flex-col">
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
