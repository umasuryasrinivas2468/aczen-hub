import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, FileText, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Punch {
  id: string;
  clerk_user_id: string;
  timestamp: string;
  status: "IN" | "OUT";
}

interface WorkUpdate {
  id: string;
  clerk_user_id: string;
  update_date: string;
}

interface UserStats {
  id: string;
  name: string;
  total_hours_week: number;
  updates_week: number;
  avg_daily_hours: number;
}

interface WeeklySummaryProps {
  punches: Punch[];
  workUpdates: WorkUpdate[];
  userNames: Record<string, string>;
  loading?: boolean;
}

export default function WeeklySummary({
  punches,
  workUpdates,
  userNames,
  loading,
}: WeeklySummaryProps) {
  const calculateWeeklyStats = (): UserStats[] => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay()); // Start of current week (Sunday)
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    // Group punches by user for current week
    const userPunches = new Map<string, Punch[]>();
    punches
      .filter((p) => {
        const punchDate = new Date(p.timestamp);
        return punchDate >= weekStart && punchDate < weekEnd;
      })
      .forEach((p) => {
        if (!userPunches.has(p.clerk_user_id)) {
          userPunches.set(p.clerk_user_id, []);
        }
        userPunches.get(p.clerk_user_id)!.push(p);
      });

    // Group work updates by user for current week
    const userUpdates = new Map<string, number>();
    workUpdates
      .filter((u) => {
        const updateDate = new Date(u.update_date);
        return updateDate >= weekStart && updateDate < weekEnd;
      })
      .forEach((u) => {
        userUpdates.set(
          u.clerk_user_id,
          (userUpdates.get(u.clerk_user_id) || 0) + 1
        );
      });

    // Calculate hours worked per user
    const stats: UserStats[] = [];
    const allUserIds = new Set([
      ...userPunches.keys(),
      ...userUpdates.keys(),
    ]);

    allUserIds.forEach((userId) => {
      const userPunchList = userPunches.get(userId) || [];
      let totalHours = 0;

      // Pair IN/OUT punches to calculate hours
      for (let i = 0; i < userPunchList.length - 1; i++) {
        if (
          userPunchList[i].status === "IN" &&
          userPunchList[i + 1].status === "OUT"
        ) {
          const inTime = new Date(userPunchList[i].timestamp).getTime();
          const outTime = new Date(userPunchList[i + 1].timestamp).getTime();
          const hours = (outTime - inTime) / (1000 * 60 * 60);
          totalHours += hours;
        }
      }

      const updatesCount = userUpdates.get(userId) || 0;
      const workDays = Math.max(1, Math.ceil(totalHours / 8)); // Estimate work days

      stats.push({
        id: userId,
        name: userNames[userId] || userId,
        total_hours_week: Math.round(totalHours * 10) / 10,
        updates_week: updatesCount,
        avg_daily_hours: workDays > 0 ? Math.round((totalHours / workDays) * 10) / 10 : 0,
      });
    });

    return stats.sort((a, b) => b.total_hours_week - a.total_hours_week);
  };

  const weeklyStats = loading ? [] : calculateWeeklyStats();

  if (loading) {
    return (
      <div className="grid gap-4 mb-6">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-3">
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="mb-6 space-y-4">
      <h3 className="font-semibold text-lg">Weekly Summary (Current Week)</h3>

      {weeklyStats.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              No punch or update data available for this week yet
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {weeklyStats.map((stat) => (
            <Card key={stat.id}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-foreground">
                  {stat.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <span className="text-xs text-muted-foreground">
                      Hours Worked
                    </span>
                  </div>
                  <span className="font-semibold text-foreground">
                    {stat.total_hours_week}h
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-green-500" />
                    <span className="text-xs text-muted-foreground">
                      Updates
                    </span>
                  </div>
                  <span className="font-semibold text-foreground">
                    {stat.updates_week}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-purple-500" />
                    <span className="text-xs text-muted-foreground">
                      Daily Avg
                    </span>
                  </div>
                  <span className="font-semibold text-foreground">
                    {stat.avg_daily_hours}h
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
