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
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface Punch {
  id: string;
  clerk_user_id: string;
  timestamp: string;
  status: "IN" | "OUT";
  created_at: string;
}

interface PunchesTableProps {
  punches: Punch[];
  loading: boolean;
  userNames?: Record<string, string>;
}

const getStatusColor = (status: "IN" | "OUT") => {
  const colors: Record<string, string> = {
    IN: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    OUT: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };
  return colors[status] || "";
};

const getStatusLabel = (status: "IN" | "OUT") => {
  return status === "IN" ? "Clock In" : "Clock Out";
};

export default function PunchesTable({ punches, loading, userNames = {} }: PunchesTableProps) {
  const [searchTerm, setSearchTerm] = useState("");

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Punch Records</CardTitle>
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

  const filteredPunches = punches.filter((punch) => {
    const userName = userNames[punch.clerk_user_id] || punch.clerk_user_id;
    return userName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <Card>
      <CardHeader className="space-y-4">
        <CardTitle>Punch Records ({punches.length})</CardTitle>
        <Input
          placeholder="Search by user name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-xs"
        />
      </CardHeader>
      <CardContent>
        {filteredPunches.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Date & Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPunches.slice(0, 100).map((punch) => (
                  <TableRow key={punch.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      {userNames[punch.clerk_user_id] || punch.clerk_user_id.split("@")[0]}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(punch.status)}>
                        {getStatusLabel(punch.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {punch.status === "IN" ? "✓" : "✗"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(punch.timestamp).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No punch records found.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
