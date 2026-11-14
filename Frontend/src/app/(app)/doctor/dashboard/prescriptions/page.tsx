import { redirect } from "next/navigation";

export default function PrescriptionsRedirectPage() {
  redirect("/doctor/dashboard/prescription");
}
