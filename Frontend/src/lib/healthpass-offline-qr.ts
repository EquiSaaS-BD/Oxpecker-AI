/**
 * HealthPass Offline QR Code Protocol
 * Enables zero-internet emergency triage reading by ER physicians, paramedics & citizens.
 */

export interface OfflineEmergencyProfile {
  version: number;
  healthId: string;
  fullName: string;
  bloodGroup: string;
  dateOfBirth?: string;
  emergencyContact: string;
  emergencyContactName?: string;
  knownAllergies: string[];
  chronicDiseases: string[];
  currentMedications: string[];
  organDonor?: boolean;
}

/**
 * Generate a compact, URL-safe Base64 encoded payload for QR embedding.
 */
export function encodeOfflineQRPayload(profile: OfflineEmergencyProfile, originUrl = "https://oxpecker.ai"): string {
  const compact = {
    v: profile.version || 1,
    id: profile.healthId,
    n: profile.fullName,
    bg: profile.bloodGroup,
    dob: profile.dateOfBirth || "",
    ec: profile.emergencyContact,
    ecn: profile.emergencyContactName || "",
    al: profile.knownAllergies || [],
    cd: profile.chronicDiseases || [],
    med: profile.currentMedications || [],
    od: profile.organDonor ? 1 : 0
  };

  const jsonStr = JSON.stringify(compact);
  // Base64 encode for UTF-8 compatibility
  const encoded = typeof btoa === "function" 
    ? btoa(encodeURIComponent(jsonStr).replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode(parseInt(p1, 16))))
    : Buffer.from(jsonStr, "utf-8").toString("base64");

  // Fallback URL with fragment hash containing the offline data payload
  return `${originUrl}/emergency-reader#data=${encodeURIComponent(encoded)}`;
}

/**
 * Decode an offline QR payload back into an Emergency Profile.
 */
export function decodeOfflineQRPayload(rawString: string): OfflineEmergencyProfile | null {
  try {
    let payload = rawString.trim();

    // If it's a full URL containing #data=
    if (payload.includes("#data=")) {
      const hashPart = payload.split("#data=")[1];
      payload = decodeURIComponent(hashPart.split("&")[0]);
    }

    // Decode Base64 UTF-8
    const rawJson = typeof atob === "function"
      ? decodeURIComponent(Array.prototype.map.call(atob(payload), (c: string) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''))
      : Buffer.from(payload, "base64").toString("utf-8");

    const parsed = JSON.parse(rawJson);

    return {
      version: parsed.v || 1,
      healthId: parsed.id || "HP-UNKNOWN",
      fullName: parsed.n || "Anonymous Citizen",
      bloodGroup: parsed.bg || "Unknown",
      dateOfBirth: parsed.dob || "",
      emergencyContact: parsed.ec || "",
      emergencyContactName: parsed.ecn || "Emergency Guardian",
      knownAllergies: Array.isArray(parsed.al) ? parsed.al : [],
      chronicDiseases: Array.isArray(parsed.cd) ? parsed.cd : [],
      currentMedications: Array.isArray(parsed.med) ? parsed.med : [],
      organDonor: parsed.od === 1
    };
  } catch (err) {
    console.error("Failed to decode offline QR payload:", err);
    return null;
  }
}
