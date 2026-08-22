/**
 * Supabase Free Tier Integration Helper
 * Provides seamless connection to Supabase DB & Auth with graceful local storage fallback
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export async function fetchSupabaseData(table: string, queryParams?: string) {
  if (!isSupabaseConfigured) {
    // Return local storage data fallback if Supabase env is not configured yet
    if (typeof window !== "undefined") {
      const localData = localStorage.getItem(`oxpecker_${table}`);
      return localData ? JSON.parse(localData) : [];
    }
    return [];
  }

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${queryParams || ""}`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) throw new Error(`Supabase query failed: ${res.statusText}`);
    return await res.json();
  } catch (err) {
    console.warn(`[Supabase Fallback] Query to ${table} failed, reading local storage:`, err);
    if (typeof window !== "undefined") {
      const localData = localStorage.getItem(`oxpecker_${table}`);
      return localData ? JSON.parse(localData) : [];
    }
    return [];
  }
}
