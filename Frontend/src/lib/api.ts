const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://shustota-backend.onrender.com/api/v1";

export async function fetchDoctors() {
  try {
    const res = await fetch(`${API_BASE_URL}/doctors`);
    if (!res.ok) throw new Error("Failed to fetch doctors");
    return await res.json();
  } catch (error) {
    // Return mock data for UI demonstration if backend is down
    return [
      {
        id: 1,
        name: "Dr. Anisur Rahman",
        specialty: "Cardiologist",
        degree: "MBBS, MD (Cardiology)",
        hospital: "National Heart Foundation",
        rating: 4.8,
        image: "https://i.pravatar.cc/150?u=anis",
        fees: 1000
      },
      {
        id: 2,
        name: "Dr. Salma Begum",
        specialty: "Neurologist",
        degree: "MBBS, FCPS (Neurology)",
        hospital: "Square Hospital",
        rating: 4.9,
        image: "https://i.pravatar.cc/150?u=salma",
        fees: 1200
      },
      {
        id: 3,
        name: "Dr. Kamrul Hasan",
        specialty: "Medicine Specialist",
        degree: "MBBS, FCPS (Medicine)",
        hospital: "Dhaka Medical College",
        rating: 4.7,
        image: "https://i.pravatar.cc/150?u=kamrul",
        fees: 800
      }
    ];
  }
}

export async function fetchMedicines() {
  try {
    const res = await fetch(`${API_BASE_URL}/medicines`);
    if (!res.ok) throw new Error("Failed to fetch medicines");
    return await res.json();
  } catch (error) {
    // Return mock data for UI demonstration if backend is down
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
      },
      {
        id: 3,
        name: "Fexo 120",
        generic: "Fexofenadine Hydrochloride",
        company: "Square Pharmaceuticals Ltd.",
        price: 8.00,
        type: "Tablet"
      }
    ];
  }
}

export async function fetchDashboardStats() {
  try {
    const res = await fetch(`${API_BASE_URL}/dashboard/stats`);
    if (!res.ok) throw new Error("Failed to fetch dashboard stats");
    return await res.json();
  } catch (error) {
    console.error(error);
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
  } catch (error) {
    console.error(error);
    return null;
  }
}
