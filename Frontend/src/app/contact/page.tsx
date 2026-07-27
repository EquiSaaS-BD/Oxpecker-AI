import { PageLayout } from "@/components/layout/PageLayout";
import { Mail, Phone, MapPin } from "lucide-react";

export default function ContactPage() {
  return (
    <PageLayout title="Contact Us" breadcrumb="Contact Us">
      <h2>We're Here to Help</h2>
      <p>
        Whether you have a question about our services, need technical support, or want to partner with us, our team is ready to assist you.
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
          <p className="text-slate-600 text-sm">support@shustota.com</p>
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
