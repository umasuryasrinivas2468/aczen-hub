import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, CheckCircle2, FileText } from "lucide-react";

export default function StatusCards() {
  const { user } = useUser();
  const [punchStatus, setPunchStatus] = useState<string>("—");
  const [lastPunchTime, setLastPunchTime] = useState<string>("—");
  const [updateStatus, setUpdateStatus] = useState<string>("—");

  useEffect(() => {
    if (user) fetchStatuses();
  }, [user]);

  async function fetchStatuses() {
    // Get last punch
    const { data: punchData } = await supabase
      .from("punches")
      .select("*")
      .eq("clerk_user_id", user!.id)
      .order("timestamp", { ascending: false })
      .limit(1);

    if (punchData && punchData.length > 0) {
      setPunchStatus(punchData[0].status === "IN" ? "Punched In" : "Punched Out");
      setLastPunchTime(new Date(punchData[0].timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    }

    // Get today's work update
    const today = new Date().toISOString().split("T")[0];
    const { data: updateData } = await supabase
      .from("work_updates")
      .select("*")
      .eq("clerk_user_id", user!.id)
      .eq("update_date", today)
      .limit(1);

    setUpdateStatus(updateData && updateData.length > 0 ? "Submitted" : "Pending");
  }

  const cards = [
    {
      label: "Today's Status",
      value: punchStatus,
      icon: CheckCircle2,
      color: punchStatus === "Punched In" ? "text-success" : "text-muted-foreground",
    },
    {
      label: "Last Punch",
      value: lastPunchTime,
      icon: Clock,
      color: "text-primary",
    },
    {
      label: "Work Update",
      value: updateStatus,
      icon: FileText,
      color: updateStatus === "Submitted" ? "text-success" : "text-warning",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((card) => (
        <Card key={card.label}>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{card.label}</p>
                <p className="text-lg font-semibold">{card.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
