// import MainDashboard from "@/components/MainDashboard";

import { redirect } from "next/navigation";

export default function DashboardPage() {
  // return <MainDashboard />;

  redirect("/dashboard/inbox");
}
