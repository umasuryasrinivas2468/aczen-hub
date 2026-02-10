import DashboardLayout from "@/components/DashboardLayout";
import MyAssignments from "@/components/MyAssignments";

export default function Assignments() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Assignments</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage and track your assigned tasks.</p>
        </div>

        <MyAssignments />
      </div>
    </DashboardLayout>
  );
}
