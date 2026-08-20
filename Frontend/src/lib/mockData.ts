import rawDoctorsData from "./doctorsDb.json";

export interface DoctorProfile {
  id: string;
  name: string;
  title: string;
  qualifications: {
    degree: string;
    institute: string;
    year: string;
    verified: boolean;
  }[];
  specialty: string;
  experienceYears: number | string;
  hospital: string;
  location: string;
  rating: number;
  reviews: number;
  fee: number | string;
  availability: string;
  image: string;
  about: string;
  mapLocation: {
    lat: number;
    lng: number;
  };
  timeSlots: string[];
  chambers: {
    name: string;
    address: string;
    days: string;
    time: string;
  }[];
  verified?: boolean;
}

export const mockDoctors: DoctorProfile[] = rawDoctorsData.map((doc: any, index: number) => ({
  id: doc.id,
  name: doc.name,
  title: doc.specialty,
  qualifications: [],
  specialty: doc.specialty,
  experienceYears: doc.experience,
  hospital: doc.hospital,
  location: doc.hospital,
  rating: doc.rating,
  reviews: doc.reviews,
  fee: doc.price ? Number(doc.price.toString().replace(/[^0-9]/g, '')) : 0,
  availability: doc.availability,
  image: doc.image || "https://i.pravatar.cc/300",
  about: "Verified Medical Professional",
  mapLocation: { 
    lat: 23.7461 + ((index * 0.013) % 0.08), 
    lng: 90.3742 + ((index * 0.017) % 0.08) 
  },
  timeSlots: ["09:00 AM", "05:00 PM"],
  chambers: [
    {
      name: doc.hospital,
      address: doc.hospital,
      days: "Sat-Thu",
      time: "05:00 PM - 09:00 PM"
    }
  ],
  verified: doc.verified
}));
