import type { Metadata } from "next";
import { Header } from "@/components/marketing/header";
import { Footer } from "@/components/marketing/footer";
import { CONFERENCE_INFO } from "@/data/conference";

export const metadata: Metadata = {
  title: "Privacy Notice (Draft) | IHGC 2026",
  description: "Privacy information for IHGC 2026, pending organizer and legal review.",
};

export default function PrivacyPage() {
  return (
    <div className="relative isolate min-h-screen bg-white pt-28 pb-20 sm:pt-36 sm:pb-28">
      <Header />
      <div aria-hidden="true" className="bg-ticks pointer-events-none absolute inset-x-0 top-0 h-[420px] -z-10" />
      <div className="container-site space-y-10">
        <div className="max-w-[780px] space-y-4">
          <p className="text-sm font-medium tracking-wide text-[#0e7a6e]">
            Draft — legal review required
          </p>
          <h1 className="h-hero text-[#111827]">Privacy Notice</h1>
        </div>

        <div className="max-w-[800px] space-y-8 text-sm text-[#4b5563] leading-relaxed">
          <section className="rounded-xl border border-amber-200 bg-amber-50 p-6">
            <h2 className="text-lg font-bold text-amber-950">
              Organizer and legal review required
            </h2>
            <p className="mt-2 text-amber-950">
              The final privacy text, data retention period, data-subject request process, and
              approved privacy contact have not been supplied. This draft must be reviewed before
              public registration.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#111827]">
              Information used for registration
            </h2>
            <p>
              The registration flow asks for participant names and phone numbers, country, state
              and email, and guardian contact details when a participant is marked as a minor.
              Payment is initiated with Paystack; this application does not ask for card security
              codes or bank login credentials.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#111827]">Ticket and check-in</h2>
            <p>
              Tickets use signed QR tokens. Staff check-in uses a limited offline roster and records
              arrival only. The organizers must confirm the retention period and deletion process
              for registration, payment, and check-in records.
            </p>
          </section>

          <section className="rounded-xl border border-[#e5e7eb] bg-[#f4f5f7] p-6">
            <h2 className="font-bold text-[#111827]">Privacy contact</h2>
            <p className="mt-2">
              The approved privacy contact has not been supplied. The conference helpline is{" "}
              {CONFERENCE_INFO.contact.phone}; organizers must confirm whether it should receive
              privacy requests.
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
