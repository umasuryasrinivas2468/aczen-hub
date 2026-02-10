import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, Plus, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Task {
  id: string;
  title: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  status: "Assigned" | "In Progress" | "Completed" | "On Hold";
  due_date: string;
  remarks: string | null;
  assigned_to: string;
}

export default function TasksCalendar() {
  const { user } = useUser();
  const [date, setDate] = useState<Date>(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedDateTasks, setSelectedDateTasks] = useState<Task[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    assigned_to: "",
    due_date: "",
    priority: "Medium" as "Low" | "Medium" | "High" | "Critical",
    remarks: "",
  });

  const [coworkers, setCoworkers] = useState<Array<{ id: string; clerk_user_id: string }>>([]);

  useEffect(() => {
    if (user) {
      fetchTasks();
      fetchCoworkers();
    }
  }, [user]);

  useEffect(() => {
    updateSelectedDateTasks();
  }, [date, tasks]);

  useEffect(() => {
    if (showAddDialog) {
      const dateStr = date.toISOString().split("T")[0];
      setFormData((prev) => ({
        ...prev,
        due_date: dateStr,
      }));
    }
  }, [showAddDialog, date]);

  const fetchTasks = async () => {
    try {
      setLoading(true);

      // Fetch tasks assigned to user and tasks assigned by user
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .or(`assigned_to.eq.${user!.id},assigned_by.eq.${user!.id}`)
        .order("due_date", { ascending: true });

      if (error) {
        console.warn("Error fetching tasks:", error);
      } else {
        setTasks(data || []);
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCoworkers = async () => {
    try {
      const { data: workUpdates } = await supabase
        .from("work_updates")
        .select("clerk_user_id")
        .limit(100);

      const { data: punchData } = await supabase
        .from("punches")
        .select("clerk_user_id")
        .limit(100);

      const { data: leadData } = await supabase
        .from("lead_uploads")
        .select("clerk_user_id")
        .limit(100);

      const userIds = new Set<string>([
        ...(workUpdates || []).map((u) => u.clerk_user_id),
        ...(punchData || []).map((u) => u.clerk_user_id),
        ...(leadData || []).map((u) => u.clerk_user_id),
      ]);

      userIds.delete(user!.id);

      const coworkerOptions = Array.from(userIds).map((id) => ({
        id,
        clerk_user_id: id,
      }));

      setCoworkers(coworkerOptions);
    } catch (err) {
      console.error("Error fetching coworkers:", err);
    }
  };

  const updateSelectedDateTasks = () => {
    const dateStr = date.toISOString().split("T")[0];
    const tasksForDate = tasks.filter((task) => task.due_date === dateStr);
    setSelectedDateTasks(tasksForDate);
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!formData.title.trim()) {
      setError("Task title is required");
      return;
    }

    if (!formData.assigned_to) {
      setError("Please select who to assign the task to");
      return;
    }

    try {
      setSubmitting(true);

      const { error: insertError } = await supabase.from("tasks").insert({
        title: formData.title,
        assigned_to: formData.assigned_to,
        assigned_by: user!.id,
        due_date: formData.due_date,
        priority: formData.priority,
        status: "Assigned",
        remarks: formData.remarks || null,
        last_activity: new Date().toISOString(),
      });

      if (insertError) {
        setError(`Failed to create task: ${insertError.message}`);
        return;
      }

      setSuccess(true);
      setFormData({
        title: "",
        assigned_to: "",
        due_date: formData.due_date,
        priority: "Medium",
        remarks: "",
      });

      // Refresh tasks
      await fetchTasks();

      setTimeout(() => {
        setShowAddDialog(false);
        setSuccess(false);
      }, 1500);
    } catch (err) {
      console.error("Error creating task:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const getTasksForDate = (checkDate: Date): number => {
    const dateStr = checkDate.toISOString().split("T")[0];
    return tasks.filter((task) => task.due_date === dateStr).length;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical":
        return "bg-red-100 text-red-800";
      case "High":
        return "bg-orange-100 text-orange-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "Low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800";
      case "In Progress":
        return "bg-blue-100 text-blue-800";
      case "On Hold":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tasks Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar */}
            <div className="flex flex-col items-center">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(newDate) => newDate && setDate(newDate)}
                className="rounded-md border"
              />
              <p className="text-sm text-muted-foreground mt-4 text-center">
                {date.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            {/* Tasks List and Add Button */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Tasks for Selected Date</h3>
                <Button
                  size="sm"
                  className="gap-2"
                  onClick={() => setShowAddDialog(true)}
                >
                  <Plus className="h-4 w-4" />
                  Add Task
                </Button>
              </div>

              {selectedDateTasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                  <p>No tasks scheduled for this date</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {selectedDateTasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-foreground">
                            {task.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {task.assigned_to === user!.id
                              ? "Assigned to me"
                              : "I assigned this"}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-xs flex-shrink-0 ${getPriorityColor(
                            task.priority
                          )}`}
                        >
                          {task.priority}
                        </Badge>
                      </div>
                      <div className="flex gap-2 items-center flex-wrap">
                        <Badge
                          variant="secondary"
                          className={`text-xs ${getStatusBadgeVariant(
                            task.status
                          )}`}
                        >
                          {task.status}
                        </Badge>
                      </div>
                      {task.remarks && (
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                          {task.remarks}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Task Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Task</DialogTitle>
            <DialogDescription>
              Create a task for {date.toLocaleDateString("en-US", { month: "long", day: "numeric" })}
            </DialogDescription>
          </DialogHeader>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50 border-green-200 text-green-900">
              <AlertDescription>Task created successfully!</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleAddTask} className="space-y-4">
            {/* Task Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Task Title *</Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g., Review client proposal"
                value={formData.title}
                onChange={handleInputChange}
                disabled={submitting}
              />
            </div>

            {/* Assign To */}
            <div className="space-y-2">
              <Label htmlFor="assigned_to">Assign To *</Label>
              <Select
                value={formData.assigned_to}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    assigned_to: value,
                  }))
                }
                disabled={submitting || coworkers.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a person..." />
                </SelectTrigger>
                <SelectContent>
                  {coworkers.map((coworker) => (
                    <SelectItem
                      key={coworker.id}
                      value={coworker.clerk_user_id}
                    >
                      {coworker.clerk_user_id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    priority: value as "Low" | "Medium" | "High" | "Critical",
                  }))
                }
                disabled={submitting}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Remarks */}
            <div className="space-y-2">
              <Label htmlFor="remarks">Notes (Optional)</Label>
              <Textarea
                id="remarks"
                name="remarks"
                placeholder="Add any notes or instructions..."
                value={formData.remarks}
                onChange={handleInputChange}
                disabled={submitting}
                rows={3}
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={submitting}
                className="flex-1"
              >
                {submitting ? "Creating..." : "Create Task"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddDialog(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
