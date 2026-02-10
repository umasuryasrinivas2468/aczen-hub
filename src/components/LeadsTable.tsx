import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { TableIcon, ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 10;

interface LeadsTableProps {
  refreshKey: number;
}

interface Lead {
  id: string;
  file_name: string;
  uploaded_by: string;
  upload_date: string;
  total_leads: number;
  lead_source: string;
}

export default function LeadsTable({ refreshKey }: LeadsTableProps) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);

  const fetchLeads = useCallback(async () => {
    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, count } = await supabase
      .from("lead_uploads")
      .select("*", { count: "exact" })
      .order("upload_date", { ascending: false })
      .range(from, to);

    if (data) setLeads(data);
    if (count !== null) setTotal(count);
  }, [page]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads, refreshKey]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <TableIcon className="h-4 w-4 text-primary" />
          Uploaded Leads
        </CardTitle>
      </CardHeader>
      <CardContent>
        {leads.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No leads uploaded yet.</p>
        ) : (
          <>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary">
                    <TableHead>File Name</TableHead>
                    <TableHead>Uploaded By</TableHead>
                    <TableHead>Upload Date</TableHead>
                    <TableHead className="text-right">Total Leads</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">{lead.file_name}</TableCell>
                      <TableCell>{lead.uploaded_by}</TableCell>
                      <TableCell>{new Date(lead.upload_date).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right font-mono">{lead.total_leads}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-xs text-muted-foreground">
                  Page {page + 1} of {totalPages} · {total} total
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setPage(page - 1)} disabled={page === 0}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setPage(page + 1)} disabled={page >= totalPages - 1}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
