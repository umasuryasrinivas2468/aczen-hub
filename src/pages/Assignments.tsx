import DashboardLayout from "@/components/DashboardLayout";
import MyAssignments from "@/components/MyAssignments";

export default function Assignments() {
  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-xl font-bold text-foreground sm:text-2xl">My Assignments</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage and track your assigned tasks.</p>
        </div>

        <MyAssignments />
      </div>
    </DashboardLayout>
  );
}
