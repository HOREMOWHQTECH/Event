import type { Metadata } from "next";
import { Header } from "@/components/marketing/header";
import { Footer } from "@/components/marketing/footer";
import { CONFERENCE_INFO } from "@/data/conference";

export const metadata: Metadata = {
  title: "Terms & Refund Policy | IHGC 2026",
  description: "Terms and refund policy for IHGC 2026 registration.",
};

export default function TermsPage() {
  return (
    <div className="relative isolate min-h-screen bg-white pt-28 pb-20 sm:pt-36 sm:pb-28">
      <Header />
      <div aria-hidden="true" className="bg-ticks pointer-events-none absolute inset-x-0 top-0 h-[420px] -z-10" />
      <div className="container-site space-y-10">
        <div className="max-w-[780px] space-y-4">
          <p className="text-sm font-medium tracking-wide text-[#0e7a6e]">
            Draft — organizer and legal review required
          </p>
          <h1 className="h-hero text-[#111827]">Terms &amp; Refund Policy</h1>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950">
          This is an interim draft, not a finalized policy. Confirm the TBD items and obtain legal
          review before registration launch.
        </div>

        <div className="max-w-[800px] space-y-8 text-sm text-[#4b5563] leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#111827]">Registration and event facts</h2>
            <p>
              {CONFERENCE_INFO.title} is scheduled for {CONFERENCE_INFO.dates} at{" "}
              {CONFERENCE_INFO.venue}. Accommodation and meals are not included in the registration
              fee.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#111827]">Interim refund terms</h2>
            <p>
              Registration fees are non-refundable after payment confirmation, except for these
              cases in the current draft:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Duplicate payments for the same registration.</li>
              <li>Payment taken but no ticket issued because of a system error.</li>
              <li>Cancellation of the event by the organizers.</li>
            </ul>
            <p>
              Approved exceptions are intended to be refunded in full to the original payment
              method. Each refund requires organizer approval and an audit record. Processing
              timeline: <strong>[TBD by organizers]</strong>.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#111827]">Name substitution</h2>
            <p>
              The draft allows free name substitution until{" "}
              <strong>[DATE TBD by organizers; 5 December 2026 was suggested]</strong>. The
              supported process and contact instructions must be confirmed before this is presented
              as a final policy.
            </p>
          </section>

          <section className="rounded-xl border border-amber-200 bg-amber-50 p-5">
            <h2 className="font-bold text-amber-950">Items still requiring owner review</h2>
            <p className="mt-2 text-amber-950">
              Final policy wording, substitution date and process, refund processing timeline, and
              legal approval.
            </p>
            <p className="mt-3 text-amber-950">
              Conference helpline:{" "}
              <a
                className="underline"
                href={CONFERENCE_INFO.contact.phoneTel}
              >
                {CONFERENCE_INFO.contact.phone}
              </a>
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
