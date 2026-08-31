import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          email: string;
          role: "patient" | "doctor" | "hospital" | "assistant" | "admin";
          status: "active" | "pending" | "banned";
          image: string | null;
          phone: string | null;
          doctor_id: string | null;
          assistant_id: string | null;
          join_date: string;
          created_at: string;
          updated_at: string;
        };
      };
      doctors: {
        Row: {
          id: string;
          profile_id: string | null;
          name: string;
          specialty: string | null;
          consultation_fee: number;
          platform_fee: number;
          rating: number;
          created_at: string;
        };
      };
      bookings: {
        Row: {
          id: string;
          patient_id: string | null;
          doctor_id: string | null;
          patient_name: string;
          doctor_name: string | null;
          booking_date: string;
          booking_time: string;
          status: "pending" | "confirmed" | "completed" | "cancelled";
          total_fee: number;
          created_at: string;
        };
      };
    };
  };
};
