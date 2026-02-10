import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, FileText, Loader } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Punch {
  id: string;
  clerk_user_id: string;
  timestamp: string;
  status: "IN" | "OUT";
}

interface WorkUpdate {
  id: string;
  clerk_user_id: string;
  content: string;
  update_date: string;
}

interface ActivityItem {
  id: string;
  type: "punch" | "update";
  user_id: string;
  user_name: string;
  timestamp: string;
  description: string;
  icon: React.ReactNode;
}

interface ActivityFeedProps {
  punches: Punch[];
  workUpdates: WorkUpdate[];
  userNames: Record<string, string>;
  loading?: boolean;
}

export default function ActivityFeed({
  punches,
  workUpdates,
  userNames,
  loading,
}: ActivityFeedProps) {
  const getActivityItems = (): ActivityItem[] => {
    const items: ActivityItem[] = [];

    // Add punch activities
    punches.slice(0, 20).forEach((punch) => {
      const punchDate = new Date(punch.timestamp);
      items.push({
        id: punch.id,
        type: "punch",
        user_id: punch.clerk_user_id,
        user_name: userNames[punch.clerk_user_id] || punch.clerk_user_id,
        timestamp: punch.timestamp,
        description: `${punch.status === "IN" ? "Clocked in" : "Clocked out"}`,
        icon: (
          <Clock
            className={`h-4 w-4 ${
              punch.status === "IN" ? "text-green-500" : "text-red-500"
            }`}
          />
        ),
      });
    });

    // Add update activities
    workUpdates.slice(0, 20).forEach((update) => {
      items.push({
        id: update.id,
        type: "update",
        user_id: update.clerk_user_id,
        user_name: userNames[update.clerk_user_id] || update.clerk_user_id,
        timestamp: update.update_date,
        description: update.content || "Added an update",
        icon: <FileText className="h-4 w-4 text-blue-500" />,
      });
    });

    // Sort by timestamp (newest first)
    return items.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ).slice(0, 15); // Show top 15 recent activities
  };

  const formatTime = (isoString: string): string => {
    const date = new Date(isoString);
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSeconds < 60) return "just now";
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Activity Feed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const activities = getActivityItems();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Loader className="h-4 w-4" />
          Activity Feed (Real-Time)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No recent activity. Members will appear here when they clock in/out or add updates.
          </p>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex gap-3 pb-4 border-b border-border last:border-b-0"
                >
                  <div className="mt-1">{activity.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm truncate">
                        {activity.user_name}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {activity.type === "punch" ? "Punch" : "Update"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatTime(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
