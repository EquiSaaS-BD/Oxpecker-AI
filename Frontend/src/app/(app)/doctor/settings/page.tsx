import { redirect } from 'next/navigation';

export default function DoctorSettingsRedirect() {
  redirect('/doctor/settings/profile');
}
