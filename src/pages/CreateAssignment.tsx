import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, ArrowLeft } from "lucide-react";

interface UserOption {
  id: string;
  clerk_user_id: string;
}

export default function CreateAssignment() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserOption[]>([]);
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

  useEffect(() => {
    // Check if admin is logged in
    const adminSession = localStorage.getItem("adminSession");
    if (!adminSession) {
      navigate("/admin-login");
      return;
    }

    fetchUsers();
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch all unique clerk_user_ids from work_updates
      const { data: workUpdates, error: workError } = await supabase
        .from("work_updates")
        .select("clerk_user_id")
        .limit(100);

      // Fetch all unique clerk_user_ids from punches
      const { data: punchClerkUserIds, error: punchError } = await supabase
        .from("punches")
        .select("clerk_user_id")
        .limit(100);

      // Fetch all unique clerk_user_ids from lead_uploads
      const { data: leadUploads, error: leadError } = await supabase
        .from("lead_uploads")
        .select("clerk_user_id")
        .limit(100);

      if (workError) console.warn("Work updates fetch error:", workError);
      if (punchError) console.warn("Punches fetch error:", punchError);
      if (leadError) console.warn("Lead uploads fetch error:", leadError);

      // Combine unique clerk_user_ids
      const userIds = new Set<string>([
        ...(workUpdates || []).map((u) => u.clerk_user_id),
        ...(punchClerkUserIds || []).map((u) => u.clerk_user_id),
        ...(leadUploads || []).map((u) => u.clerk_user_id),
      ]);

      const userOptions: UserOption[] = Array.from(userIds).map((id) => ({
        id: id,
        clerk_user_id: id,
      }));

      setUsers(userOptions);

      if (userOptions.length === 0) {
        setError("No users found in the system. Users will appear once they log in or interact with the app.");
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to fetch users. Please try again.");
    } finally {
      setLoading(false);
    }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!formData.title.trim()) {
      setError("Task title is required");
      return;
    }

    if (!formData.assigned_to) {
      setError("Please select a user to assign to");
      return;
    }

    if (!formData.due_date) {
      setError("Due date is required");
      return;
    }

    try {
      setSubmitting(true);

      const { error: insertError } = await supabase.from("tasks").insert({
        title: formData.title,
        assigned_to: formData.assigned_to,
        assigned_by: "admin",
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
        due_date: "",
        priority: "Medium",
        remarks: "",
      });

      // Show success for 2 seconds then redirect
      setTimeout(() => {
        navigate("/cofaczen");
      }, 2000);
    } catch (err) {
      console.error("Error creating task:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border sticky top-0 z-50 bg-card/95 backdrop-blur">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">Create Task Assignment</h1>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/cofaczen")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Assign Task to Team Member</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-6 bg-green-50 border-green-200 text-green-900">
                <AlertDescription>
                  Task created successfully! Redirecting to dashboard...
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Task Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Task Title *</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="e.g., Complete lead follow-up"
                  value={formData.title}
                  onChange={handleInputChange}
                  disabled={submitting || loading}
                />
              </div>

              {/* Assign To User */}
              <div className="space-y-2">
                <Label htmlFor="assigned_to">
                  Assign To (Clerk User ID) *
                </Label>
                {loading ? (
                  <div className="text-sm text-muted-foreground">
                    Loading users...
                  </div>
                ) : (
                  <Select
                    value={formData.assigned_to}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        assigned_to: value,
                      }))
                    }
                    disabled={submitting || users.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a user..." />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.clerk_user_id}>
                          {user.clerk_user_id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <p className="text-xs text-muted-foreground">
                  {users.length} user{users.length !== 1 ? "s" : ""} available
                </p>
              </div>

              {/* Due Date */}
              <div className="space-y-2">
                <Label htmlFor="due_date">Due Date *</Label>
                <Input
                  id="due_date"
                  type="date"
                  name="due_date"
                  value={formData.due_date}
                  onChange={handleInputChange}
                  disabled={submitting}
                />
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      priority: value as
                        | "Low"
                        | "Medium"
                        | "High"
                        | "Critical",
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
                <Label htmlFor="remarks">Remarks (Optional)</Label>
                <Textarea
                  id="remarks"
                  name="remarks"
                  placeholder="Add any additional notes or instructions..."
                  value={formData.remarks}
                  onChange={handleInputChange}
                  disabled={submitting}
                  rows={4}
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={submitting || loading || users.length === 0}
                  className="flex-1"
                >
                  {submitting ? "Creating..." : "Create Task"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/cofaczen")}
                  disabled={submitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Info Box */}
        <Card className="mt-6 bg-muted/30">
          <CardContent className="pt-6">
            <h4 className="font-semibold text-sm mb-2">How it works:</h4>
            <ul className="text-sm text-muted-foreground space-y-2 ml-4 list-disc">
              <li>Select a team member by their Clerk User ID</li>
              <li>Set a due date and priority level</li>
              <li>Add remarks to provide context or instructions</li>
              <li>
                The task will appear in the user&apos;s overview and task list
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
