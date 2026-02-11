import { supabase } from "@/integrations/supabase/client";

export interface InAppUser {
  id: string;
  clerk_user_id: string;
  name: string;
  email: string | null;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isEmail(value: string | null | undefined): value is string {
  return !!value && EMAIL_REGEX.test(value.trim());
}

function nameFromIdentifier(identifier: string) {
  if (isEmail(identifier)) return identifier.split("@")[0];
  return identifier;
}

function upsertUser(map: Map<string, InAppUser>, user: Partial<InAppUser> & { clerk_user_id: string }) {
  const key = user.clerk_user_id;
  const existing = map.get(key);
  const email = isEmail(user.email || undefined)
    ? (user.email as string)
    : isEmail(key)
      ? key
      : existing?.email || null;
  const name = user.name?.trim() || existing?.name || nameFromIdentifier(key);

  map.set(key, {
    id: existing?.id || user.id || key,
    clerk_user_id: key,
    name,
    email,
  });
}

export async function loadInAppUsers(): Promise<InAppUser[]> {
  const users = new Map<string, InAppUser>();

  const [profilesResult, tasksResult, updatesResult, punchesResult, uploadsResult] = await Promise.all([
    (supabase as any).from("user_profiles").select("id, clerk_user_id, name, email"),
    supabase.from("tasks").select("assigned_to, assigned_by"),
    supabase.from("work_updates").select("clerk_user_id"),
    supabase.from("punches").select("clerk_user_id"),
    supabase.from("lead_uploads").select("clerk_user_id, uploaded_by"),
  ]);

  if (!profilesResult.error) {
    (profilesResult.data || []).forEach((profile: any) => {
      if (!profile?.clerk_user_id) return;
      upsertUser(users, {
        id: profile.id,
        clerk_user_id: profile.clerk_user_id,
        name: profile.name,
        email: profile.email,
      });
    });
  }

  if (!tasksResult.error) {
    (tasksResult.data || []).forEach((row: any) => {
      if (row.assigned_to) upsertUser(users, { clerk_user_id: row.assigned_to });
      if (row.assigned_by) upsertUser(users, { clerk_user_id: row.assigned_by });
    });
  }

  if (!updatesResult.error) {
    (updatesResult.data || []).forEach((row: any) => {
      if (row.clerk_user_id) upsertUser(users, { clerk_user_id: row.clerk_user_id });
    });
  }

  if (!punchesResult.error) {
    (punchesResult.data || []).forEach((row: any) => {
      if (row.clerk_user_id) upsertUser(users, { clerk_user_id: row.clerk_user_id });
    });
  }

  if (!uploadsResult.error) {
    (uploadsResult.data || []).forEach((row: any) => {
      if (row.clerk_user_id) {
        const uploadedBy = typeof row.uploaded_by === "string" ? row.uploaded_by.trim() : "";
        upsertUser(users, {
          clerk_user_id: row.clerk_user_id,
          email: isEmail(uploadedBy) ? uploadedBy : undefined,
          name: uploadedBy && !isEmail(uploadedBy) ? uploadedBy : undefined,
        });
      }
    });
  }

  return Array.from(users.values()).sort((a, b) => a.name.localeCompare(b.name));
}
