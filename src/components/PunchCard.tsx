import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, LogIn, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PunchCard() {
  const { user } = useUser();
  const { toast } = useToast();
  const [currentStatus, setCurrentStatus] = useState<"IN" | "OUT" | null>(null);
  const [lastPunchTime, setLastPunchTime] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) fetchLastPunch();
  }, [user]);

  async function fetchLastPunch() {
    const { data } = await supabase
      .from("punches")
      .select("*")
      .eq("clerk_user_id", user!.id)
      .order("timestamp", { ascending: false })
      .limit(1);

    if (data && data.length > 0) {
      setCurrentStatus(data[0].status as "IN" | "OUT");
      setLastPunchTime(data[0].timestamp);
    }
  }

  async function handlePunch() {
    if (!user) return;
    setLoading(true);
    const newStatus = currentStatus === "IN" ? "OUT" : "IN";

    const { error } = await supabase.from("punches").insert({
      clerk_user_id: user.id,
      status: newStatus,
    });

    if (error) {
      toast({ title: "Error", description: "Failed to punch. Try again.", variant: "destructive" });
    } else {
      setCurrentStatus(newStatus);
      setLastPunchTime(new Date().toISOString());
      toast({ title: `Punched ${newStatus}`, description: `You have successfully punched ${newStatus.toLowerCase()}.` });
    }
    setLoading(false);
  }

  const isIn = currentStatus === "IN";

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          Punch In / Out
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <div className={`h-3 w-3 rounded-full ${isIn ? "bg-success animate-pulse-gentle" : "bg-muted-foreground/30"}`} />
          <span className="text-sm font-medium">
            {currentStatus === null ? "No punches today" : isIn ? "Currently Punched In" : "Currently Punched Out"}
          </span>
        </div>

        {lastPunchTime && (
          <p className="text-xs text-muted-foreground">
            Last punch: {new Date(lastPunchTime).toLocaleString()}
          </p>
        )}

        <Button
          onClick={handlePunch}
          disabled={loading}
          className="w-full"
          variant={isIn ? "destructive" : "default"}
        >
          {isIn ? <LogOut className="h-4 w-4 mr-2" /> : <LogIn className="h-4 w-4 mr-2" />}
          {loading ? "Processing..." : isIn ? "Punch Out" : "Punch In"}
        </Button>
      </CardContent>
    </Card>
  );
}
