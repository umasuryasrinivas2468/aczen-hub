import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import LeadUpload from "@/components/LeadUpload";
import LeadsTable from "@/components/LeadsTable";

export default function Uploads() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-xl font-bold text-foreground sm:text-2xl">Uploads</h1>
          <p className="text-sm text-muted-foreground mt-1">Upload and manage your lead data.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
          <div className="lg:col-span-1">
            <LeadUpload onUploadSuccess={() => setRefreshKey((k) => k + 1)} />
          </div>
          <div className="lg:col-span-2">
            <LeadsTable refreshKey={refreshKey} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
