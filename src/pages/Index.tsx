import DashboardLayout from "@/components/DashboardLayout";
import PunchCard from "@/components/PunchCard";
import WorkUpdateCard from "@/components/WorkUpdateCard";
import StatusCards from "@/components/StatusCards";
import MyWeeklySummary from "@/components/MyWeeklySummary";
import MyAssignments from "@/components/MyAssignments";
import TasksCalendar from "@/components/TasksCalendar";

export default function Index() {
  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-xl font-bold text-foreground sm:text-2xl">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Welcome back. Here's your daily overview.</p>
        </div>

        <StatusCards />

        <MyWeeklySummary />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
          <PunchCard />
          <WorkUpdateCard />
        </div>

        <MyAssignments />

        <TasksCalendar />
      </div>
    </DashboardLayout>
  );
}
