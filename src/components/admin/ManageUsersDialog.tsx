import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { Trash2, Plus, CheckCircle } from "lucide-react";

interface UserProfile {
  id: string;
  clerk_user_id: string;
  name: string;
  email: string;
}

interface ManageUsersProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ManageUsersDialog({ isOpen, onClose }: ManageUsersProps) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [newUser, setNewUser] = useState({ clerk_user_id: "", name: "", email: "" });
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      
      console.log("User profiles loaded:", data);
      setUsers(data || []);
      setMessage(null);
    } catch (error) {
      console.error("Error fetching users:", error);
      setMessage({ type: "error", text: "Failed to load users" });
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!newUser.clerk_user_id || !newUser.name) {
      setMessage({ type: "error", text: "Please fill in User ID and Name" });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("user_profiles").insert([
        {
          clerk_user_id: newUser.clerk_user_id,
          name: newUser.name,
          email: newUser.email || newUser.clerk_user_id,
        },
      ]);

      if (error) {
        if (error.message.includes("duplicate")) {
          setMessage({ type: "error", text: "User already exists" });
        } else {
          throw error;
        }
      } else {
        setMessage({ type: "success", text: "User added successfully!" });
        setNewUser({ clerk_user_id: "", name: "", email: "" });
        fetchUsers();
      }
    } catch (error) {
      console.error("Error adding user:", error);
      setMessage({ type: "error", text: "Failed to add user" });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const { error } = await supabase
        .from("user_profiles")
        .delete()
        .eq("id", userId);

      if (error) throw error;
      setMessage({ type: "success", text: "User deleted successfully" });
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      setMessage({ type: "error", text: "Failed to delete user" });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Manage Users</CardTitle>
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {message && (
            <Alert variant={message.type === "error" ? "destructive" : "default"}>
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          {/* Add New User Form */}
          <div className="border-b pb-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add New User
            </h3>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <Label htmlFor="clerk_user_id">User ID / Email *</Label>
                <Input
                  id="clerk_user_id"
                  placeholder="user@example.com or user_id"
                  value={newUser.clerk_user_id}
                  onChange={(e) =>
                    setNewUser({ ...newUser, clerk_user_id: e.target.value })
                  }
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., John Doe"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="email">Email (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  disabled={loading}
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Adding..." : "Add User"}
              </Button>
            </form>
          </div>

          {/* Users List */}
          <div>
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Current Users ({users.length})
            </h3>
            {users.length > 0 ? (
              <div className="space-y-2">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 bg-muted rounded border border-border"
                  >
                    <div>
                      <p className="font-semibold text-foreground">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No users added yet
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
