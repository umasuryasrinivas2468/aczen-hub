import DashboardLayout from "@/components/DashboardLayout";
import PunchCard from "@/components/PunchCard";
import WorkUpdateCard from "@/components/WorkUpdateCard";
import StatusCards from "@/components/StatusCards";

export default function Index() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Welcome back. Here's your daily overview.</p>
        </div>

        <StatusCards />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PunchCard />
          <WorkUpdateCard />
        </div>
      </div>
    </DashboardLayout>
  );
}
