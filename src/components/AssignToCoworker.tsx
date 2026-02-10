import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, Plus } from "lucide-react";

interface UserOption {
  id: string;
  clerk_user_id: string;
}

export default function AssignToCoworker() {
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const [coworkers, setCoworkers] = useState<UserOption[]>([]);
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
    if (open) {
      fetchCoworkers();
    }
  }, [open]);

  const fetchCoworkers = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch all unique clerk_user_ids from work_updates, punches, lead_uploads
      const { data: workUpdates } = await supabase
        .from("work_updates")
        .select("clerk_user_id")
        .limit(100);

      const { data: punchClerkUserIds } = await supabase
        .from("punches")
        .select("clerk_user_id")
        .limit(100);

      const { data: leadUploads } = await supabase
        .from("lead_uploads")
        .select("clerk_user_id")
        .limit(100);

      // Combine unique clerk_user_ids (excluding current user)
      const userIds = new Set<string>([
        ...(workUpdates || []).map((u) => u.clerk_user_id),
        ...(punchClerkUserIds || []).map((u) => u.clerk_user_id),
        ...(leadUploads || []).map((u) => u.clerk_user_id),
      ]);

      // Remove current user from the list
      userIds.delete(user!.id);

      const userOptions: UserOption[] = Array.from(userIds).map((id) => ({
        id: id,
        clerk_user_id: id,
      }));

      setCoworkers(userOptions);

      if (userOptions.length === 0) {
        setError("No coworkers found in the system.");
      }
    } catch (err) {
      console.error("Error fetching coworkers:", err);
      setError("Failed to fetch coworkers. Please try again.");
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
      setError("Please select a coworker");
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
        assigned_by: user!.id,
        due_date: formData.due_date,
        priority: formData.priority,
        status: "Assigned",
        remarks: formData.remarks || null,
        last_activity: new Date().toISOString(),
      });

      if (insertError) {
        setError(`Failed to assign task: ${insertError.message}`);
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

      // Close dialog after 2 seconds
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
      }, 2000);
    } catch (err) {
      console.error("Error assigning task:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full gap-2">
          <Plus className="h-4 w-4" />
          Assign Task to Coworker
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Assign Task to Coworker</DialogTitle>
          <DialogDescription>
            Create and assign a task to one of your coworkers
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
            <AlertDescription>
              Task assigned successfully!
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Task Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Task Title *</Label>
            <Input
              id="title"
              name="title"
              placeholder="e.g., Review client proposal"
              value={formData.title}
              onChange={handleInputChange}
              disabled={submitting || loading}
            />
          </div>

          {/* Assign To Coworker */}
          <div className="space-y-2">
            <Label htmlFor="assigned_to">
              Assign To *
            </Label>
            {loading ? (
              <div className="text-sm text-muted-foreground">
                Loading coworkers...
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
                disabled={submitting || coworkers.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a coworker..." />
                </SelectTrigger>
                <SelectContent>
                  {coworkers.map((coworker) => (
                    <SelectItem key={coworker.id} value={coworker.clerk_user_id}>
                      {coworker.clerk_user_id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <p className="text-xs text-muted-foreground">
              {coworkers.length} coworker{coworkers.length !== 1 ? "s" : ""} available
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
              disabled={submitting || loading || coworkers.length === 0}
              className="flex-1"
            >
              {submitting ? "Assigning..." : "Assign Task"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
