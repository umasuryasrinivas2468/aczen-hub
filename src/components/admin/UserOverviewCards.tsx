import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, CheckCircle, Clock, AlertCircle, Mail, MessageSquare } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface UserStats {
  id: string;
  email: string;
  name: string;
  total_tasks: number;
  pending_tasks: number;
  in_progress_tasks: number;
  completed_tasks: number;
}

interface UserOverviewCardsProps {
  userStats: UserStats[];
  onUserClick: (userId: string) => void;
  loading: boolean;
}

export default function UserOverviewCards({
  userStats,
  onUserClick,
  loading,
}: UserOverviewCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-3">
              <Skeleton className="h-6 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-12 mb-4" />
              <Skeleton className="h-4 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-foreground mb-4">User Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-blue-900 dark:text-blue-100">
              <Users className="h-4 w-4" />
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {userStats.length}
            </div>
            <p className="text-xs text-blue-800 dark:text-blue-200 mt-1">
              Active team members
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-green-900 dark:text-green-100">
              <CheckCircle className="h-4 w-4" />
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">
              {userStats.reduce((sum, u) => sum + u.completed_tasks, 0)}
            </div>
            <p className="text-xs text-green-800 dark:text-green-200 mt-1">
              Total completed tasks
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-purple-900 dark:text-purple-100">
              <Clock className="h-4 w-4" />
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              {userStats.reduce((sum, u) => sum + u.in_progress_tasks, 0)}
            </div>
            <p className="text-xs text-purple-800 dark:text-purple-200 mt-1">
              Tasks in progress
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {userStats.map((user) => {
          const completionRate = user.total_tasks > 0 
            ? Math.round((user.completed_tasks / user.total_tasks) * 100)
            : 0;

          return (
            <Card
              key={user.id}
              className="cursor-pointer hover:shadow-lg transition-shadow hover:bg-muted"
              onClick={() => onUserClick(user.id)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span>{user.name}</span>
                      <span className="text-[10px] font-normal text-muted-foreground bg-muted rounded px-1.5 py-0.5">
                        {user.total_tasks} tasks
                      </span>
                    </div>
                    <span className="text-xs font-normal text-muted-foreground truncate max-w-[150px]">
                      {user.email}
                    </span>
                  </div>
                  <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            onClick={() => window.location.href = `mailto:${user.email}`}
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Email Employee</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => console.log(`Chat with ${user.name}`)}
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Chat with Employee</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Progress Bar */}
                {user.total_tasks > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-foreground">Overall Progress</span>
                      <span className="text-xs font-bold text-green-600 dark:text-green-400">
                        {completionRate}%
                      </span>
                    </div>
                    <Progress value={completionRate} className="h-2" />
                  </div>
                )}

                {/* Task Breakdown */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                      <span className="text-muted-foreground">Assigned:</span>
                    </div>
                    <span className="font-semibold text-orange-600 dark:text-orange-400">
                      {user.pending_tasks}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-muted-foreground">In Progress:</span>
                    </div>
                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                      {user.in_progress_tasks}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <span className="text-muted-foreground">Completed:</span>
                    </div>
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      {user.completed_tasks}
                    </span>
                  </div>
                </div>

                {/* Status Message */}
                {user.total_tasks === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-2">
                    No tasks assigned
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {userStats.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            No users with tasks yet
          </CardContent>
        </Card>
      )}
    </div>
  );
}
