import { supabase } from "./supabase";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://oxpecker-backend.onrender.com/api/v1";

export interface ProfileUpdateInput {
  id?: string;
  email?: string;
  full_name?: string;
  name?: string;
  phone?: string | null;
  date_of_birth?: string;
  dob?: string;
  gender?: string | null;
  blood_group?: string;
  bloodGroup?: string;
  address?: string | null;
  image?: string;
  avatar_url?: string;
  specialty?: string;
  hospital_name?: string;
}

type ProfileUpdatePayload = Partial<{
  name: string;
  phone: string;
  date_of_birth: string;
  gender: string | null;
  blood_group: string;
  address: string;
  image: string;
  specialty: string;
  hospital_name: string;
  updated_at: string;
}>;

export async function fetchDoctors() {
  try {
    const { data } = await supabase.from("doctors").select("*");
    if (data && data.length > 0) return data;
  } catch {}

  return [
    {
      id: "1",
      name: "Dr. Sarah Rahman",
      specialty: "Cardiologist",
      degree: "MBBS, MD (Cardiology)",
      hospital: "National Heart Foundation",
      rating: 4.9,
      image: "https://i.pravatar.cc/150?u=sarah",
      fees: 1000
    },
    {
      id: "2",
      name: "Dr. Kamrul Hasan",
      specialty: "Medicine Specialist",
      degree: "MBBS, FCPS (Medicine)",
      hospital: "Dhaka Medical College",
      rating: 4.8,
      image: "https://i.pravatar.cc/150?u=kamrul",
      fees: 800
    }
  ];
}

export async function fetchMedicines() {
  try {
    const res = await fetch(`${API_BASE_URL}/medicines`);
    if (!res.ok) throw new Error("Failed to fetch medicines");
    return await res.json();
  } catch {
    return [
      {
        id: 1,
        name: "Napa Extra",
        generic: "Paracetamol + Caffeine",
        company: "Beximco Pharmaceuticals Ltd.",
        price: 2.50,
        type: "Tablet"
      },
      {
        id: 2,
        name: "Sergel 20",
        generic: "Esomeprazole",
        company: "Healthcare Pharmaceuticals Ltd.",
        price: 7.00,
        type: "Capsule"
      }
    ];
  }
}

export async function fetchDashboardStats() {
  try {
    const { count: profileCount } = await supabase.from("profiles").select("*", { count: "exact", head: true });
    const { count: bookingCount } = await supabase.from("bookings").select("*", { count: "exact", head: true });
    return {
      profiles: profileCount || 0,
      bookings: bookingCount || 0,
      activeStatus: "Operational"
    };
  } catch {
    return null;
  }
}

export async function analyzeChatSymptoms(text: string, language: string = "bn") {
  try {
    const res = await fetch(`${API_BASE_URL}/chat/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, language }),
    });
    if (!res.ok) throw new Error("Failed to analyze symptoms");
    return await res.json();
  } catch {
    return null;
  }
}

const isValidUuid = (val?: string): boolean => {
  if (!val) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
};

const getStoredUser = () => {
  if (typeof window !== "undefined") {
    try {
      const mock = localStorage.getItem("oxpecker_mock_user");
      if (mock) return JSON.parse(mock);
      const stored = localStorage.getItem("oxpecker_user");
      if (stored) return JSON.parse(stored);
    } catch {
      return null;
    }
  }
  return null;
};

// Supabase profile helpers
export const apiGetProfile = async (userId?: string) => {
  try {
    const storedUser = getStoredUser();
    let targetId = userId || storedUser?.id;
    let targetEmail: string | undefined = storedUser?.email;

    if (!targetId && !targetEmail) {
      const { data: { session } } = await supabase.auth.getSession();
      targetId = session?.user?.id;
      if (!targetEmail) targetEmail = session?.user?.email;
    }

    if (!targetId && !targetEmail) return { data: { profile: storedUser || {} } };

    let query = supabase.from("profiles").select("*");
    if (isValidUuid(targetId) && targetEmail) {
      query = query.or(`id.eq.${targetId},email.ilike.${targetEmail}`);
    } else if (isValidUuid(targetId)) {
      query = query.eq("id", targetId);
    } else if (targetEmail) {
      query = query.ilike("email", targetEmail);
    } else {
      return { data: { profile: storedUser || {} } };
    }

    const { data: profile, error } = await query.limit(1).maybeSingle();

    if (error || !profile) {
      return { data: { profile: storedUser || {} } };
    }

    return {
      data: {
        profile: {
          id: profile.id,
          full_name: profile.name,
          name: profile.name,
          email: profile.email,
          role: profile.role,
          status: profile.status,
          phone: profile.phone || "",
          date_of_birth: profile.date_of_birth || "",
          dob: profile.date_of_birth || "",
          gender: profile.gender || "",
          blood_group: profile.blood_group || "",
          bloodGroup: profile.blood_group || "",
          address: profile.address || "",
          image: profile.image || "",
          avatar_url: profile.image || "",
          specialty: profile.specialty || "",
          hospital_name: profile.hospital_name || "",
          join_date: profile.join_date
        }
      }
    };
  } catch (err) {
    console.error("apiGetProfile error:", err);
    return { data: { profile: getStoredUser() || {} } };
  }
};

export const apiUpdateProfile = async (data: ProfileUpdateInput) => {
  try {
    const storedUser = getStoredUser();
    let targetId = data.id || storedUser?.id;
    let targetEmail: string | undefined = data.email || storedUser?.email;

    if (!targetId && !targetEmail) {
      const { data: { session } } = await supabase.auth.getSession();
      targetId = session?.user?.id;
      if (!targetEmail) targetEmail = session?.user?.email;
    }

    if (!targetId && !targetEmail) throw new Error("User session or email missing.");

    const updatePayload: ProfileUpdatePayload = {
      updated_at: new Date().toISOString()
    };
    const profileName = data.full_name || data.name;
    if (profileName) updatePayload.name = profileName.trim();
    if (data.phone !== undefined) updatePayload.phone = (data.phone || "").trim();
    if (data.date_of_birth || data.dob) updatePayload.date_of_birth = data.date_of_birth || data.dob;
    if (data.gender !== undefined) updatePayload.gender = data.gender;
    if (data.blood_group || data.bloodGroup) updatePayload.blood_group = data.blood_group || data.bloodGroup;
    if (data.address !== undefined) updatePayload.address = (data.address || "").trim();
    if (data.image || data.avatar_url) updatePayload.image = data.image || data.avatar_url;
    if (data.specialty !== undefined) updatePayload.specialty = data.specialty;
    if (data.hospital_name !== undefined) updatePayload.hospital_name = data.hospital_name;

    // Check if profile exists in database
    let existingProfile: any = null;
    if (isValidUuid(targetId) && targetEmail) {
      const { data: ep } = await supabase.from("profiles").select("*").or(`id.eq.${targetId},email.ilike.${targetEmail}`).maybeSingle();
      existingProfile = ep;
    } else if (isValidUuid(targetId)) {
      const { data: ep } = await supabase.from("profiles").select("*").eq("id", targetId).maybeSingle();
      existingProfile = ep;
    } else if (targetEmail) {
      const { data: ep } = await supabase.from("profiles").select("*").ilike("email", targetEmail).maybeSingle();
      existingProfile = ep;
    }

    let updated: any = null;
    if (existingProfile) {
      const { data: u, error } = await supabase
        .from("profiles")
        .update(updatePayload)
        .eq("id", existingProfile.id)
        .select()
        .maybeSingle();

      if (error) {
        console.error("Supabase profile update error:", error.message);
        throw error;
      }
      updated = u;
    } else {
      // Insert new profile into Supabase
      const insertPayload = {
        name: updatePayload.name || targetEmail?.split("@")[0] || "User",
        email: targetEmail?.toLowerCase(),
        role: storedUser?.role || "patient",
        status: "active",
        ...updatePayload
      };
      const { data: created, error } = await supabase
        .from("profiles")
        .insert(insertPayload)
        .select()
        .maybeSingle();

      if (error) {
        console.error("Supabase profile insert error:", error.message);
        throw error;
      }
      updated = created;
    }

    // Sync localStorage session with Supabase updated profile
    if (typeof localStorage !== "undefined") {
      try {
        const currentMock = localStorage.getItem("oxpecker_mock_user");
        if (currentMock) {
          const u = JSON.parse(currentMock);
          const synced = { ...u, ...(updated || updatePayload) };
          if (updated?.id) synced.id = updated.id;
          localStorage.setItem("oxpecker_mock_user", JSON.stringify(synced));
        }
        const currentStored = localStorage.getItem("oxpecker_user");
        if (currentStored) {
          const u = JSON.parse(currentStored);
          const synced = { ...u, ...(updated || updatePayload) };
          if (updated?.id) synced.id = updated.id;
          localStorage.setItem("oxpecker_user", JSON.stringify(synced));
        }
      } catch {}
    }

    return { data: { profile: updated || updatePayload } };
  } catch (err: unknown) {
    console.error("apiUpdateProfile error:", err);
    throw err;
  }
};

// Image to Data URL Helper for zero-configuration persistent image storage
export async function convertFileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
}


/**
 * Ultra-Lightweight Client-Side Image Optimizer
 * Resizes large images (e.g. 10MB-20MB DSLR/Phone photos) down to 400x400 or 800x800,
 * converts to WebP/JPEG format at 75% quality, reducing file size by 98%-99% (~15KB-30KB).
 */
export async function compressAndResizeImage(
  file: File,
  maxWidth: number = 400,
  maxHeight: number = 400,
  quality: number = 0.75
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect ratio scaling
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        // Draw and compress onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Try WebP first for max compression, fall back to JPEG
        let dataUrl = canvas.toDataURL("image/webp", quality);
        if (!dataUrl.startsWith("data:image/webp")) {
          dataUrl = canvas.toDataURL("image/jpeg", quality);
        }

        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}
