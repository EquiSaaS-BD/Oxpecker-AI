import { PageLayout } from "@/components/layout/PageLayout";
import { Mail, Phone, MapPin } from "lucide-react";

export default function ContactPage() {
  return (
    <PageLayout title="Contact Us" breadcrumb="Contact Us">
      <h2>National Healthcare Command Center</h2>
      <p>
        Our response teams are available 24/7 to support hospitals, doctors, and patients connected to the centralized grid. Whether you need assistance with Health ID integration, emergency telemetry access, or general support, we are here to help.
      </p>

      <div className="grid sm:grid-cols-3 gap-6 mt-10 not-prose">
        <div className="p-6 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center text-center">
          <Phone className="text-primary mb-4" size={32} />
          <h3 className="font-bold text-slate-800 mb-2">Call Us</h3>
          <p className="text-slate-600 text-sm">16263 (24/7 Support)</p>
        </div>
        <div className="p-6 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center text-center">
          <Mail className="text-primary mb-4" size={32} />
          <h3 className="font-bold text-slate-800 mb-2">Email Us</h3>
          <p className="text-slate-600 text-sm">support@oxpecker.equisaas-bd.com</p>
        </div>
        <div className="p-6 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center text-center">
          <MapPin className="text-primary mb-4" size={32} />
          <h3 className="font-bold text-slate-800 mb-2">Visit Us</h3>
          <p className="text-slate-600 text-sm">Dhaka, Bangladesh</p>
        </div>
      </div>
    </PageLayout>
  );
}
