import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface TaskFiltersProps {
  users: string[];
  selectedUser: string;
  onUserChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  selectedPriority: string;
  onPriorityChange: (value: string) => void;
  userNames?: Record<string, string>; // Map of user_id to user_name
}

const STATUSES = ["Assigned", "In Progress", "Completed", "On Hold"];
const PRIORITIES = ["Low", "Medium", "High", "Critical"];

export default function TaskFilters({
  users,
  selectedUser,
  onUserChange,
  selectedStatus,
  onStatusChange,
  selectedPriority,
  onPriorityChange,
  userNames = {},
}: TaskFiltersProps) {
  const hasActiveFilters = selectedUser || selectedStatus || selectedPriority;

  const handleClearFilters = () => {
    onUserChange("");
    onStatusChange("");
    onPriorityChange("");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-medium text-foreground">Filter by:</span>

        {users.length > 0 && (
          <Select value={selectedUser} onValueChange={onUserChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select a user..." />
            </SelectTrigger>
            <SelectContent>
              {users.map((user) => (
                <SelectItem key={user} value={user}>
                  {userNames[user] || user.split("@")[0]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Select value={selectedStatus} onValueChange={onStatusChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select status..." />
          </SelectTrigger>
          <SelectContent>
            {STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedPriority} onValueChange={onPriorityChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select priority..." />
          </SelectTrigger>
          <SelectContent>
            {PRIORITIES.map((priority) => (
              <SelectItem key={priority} value={priority}>
                {priority}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearFilters}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Clear Filters
          </Button>
        )}
      </div>
    </div>
  );
}
