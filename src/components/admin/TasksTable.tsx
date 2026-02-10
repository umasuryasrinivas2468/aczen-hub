import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface Task {
  id: string;
  title: string;
  assigned_to: string;
  assigned_by: string;
  due_date: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  status: "Assigned" | "In Progress" | "Completed" | "On Hold";
  remarks: string | null;
  last_activity: string;
  created_at: string;
  updated_at: string;
}

interface TasksTableProps {
  tasks: Task[];
  loading: boolean;
  userNames?: Record<string, string>; // Map of user_id to user_name
}

const getPriorityColor = (
  priority: "Low" | "Medium" | "High" | "Critical"
) => {
  const colors: Record<string, string> = {
    Low: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    Medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    High: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    Critical: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };
  return colors[priority] || "";
};

const getStatusColor = (
  status: "Assigned" | "In Progress" | "Completed" | "On Hold"
) => {
  const colors: Record<string, string> = {
    Assigned: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    "In Progress": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    Completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    "On Hold": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  };
  return colors[status] || "";
};

export default function TasksTable({ tasks, loading, userNames = {} }: TasksTableProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>All Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Tasks ({tasks.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {tasks.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task Title</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Activity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow key={task.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <div>
                        <p className="text-foreground font-semibold">{task.title}</p>
                        {task.remarks && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {task.remarks}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {userNames[task.assigned_to] || task.assigned_to.split("@")[0]}
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(task.due_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(task.status)}>
                        {task.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(task.last_activity).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No tasks found. Start by creating a new assignment.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
