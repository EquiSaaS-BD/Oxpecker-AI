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

export const mockDoctors: DoctorProfile[] = rawDoctorsData.map((doc: any) => ({
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
  fee: doc.price,
  availability: doc.availability,
  image: doc.image || "https://i.pravatar.cc/300",
  about: "Verified Medical Professional",
  mapLocation: { lat: 23.8052, lng: 90.3639 },
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
