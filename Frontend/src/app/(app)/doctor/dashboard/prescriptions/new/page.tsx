import { redirect } from "next/navigation";

export default function NewPrescriptionRedirectPage() {
  redirect("/doctor/dashboard/prescription/new");
}
