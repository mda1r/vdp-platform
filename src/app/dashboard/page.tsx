import { requireAuth } from "@/lib/auth-guard";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await requireAuth();

  switch (session.user.role) {
    case "ADMIN":
      redirect("/admin");
    default:
      redirect("/dashboard/researcher");
  }
}
