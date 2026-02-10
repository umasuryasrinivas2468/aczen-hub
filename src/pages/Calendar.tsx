import DashboardLayout from "@/components/DashboardLayout";
import TasksCalendar from "@/components/TasksCalendar";

export default function Calendar() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tasks Calendar</h1>
          <p className="text-sm text-muted-foreground mt-1">View your tasks and deadlines in a calendar view.</p>
        </div>

        <TasksCalendar />
      </div>
    </DashboardLayout>
  );
}
