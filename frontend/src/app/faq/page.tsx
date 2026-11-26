import type { Metadata } from "next";
import { FaqAccordion } from "@/components/marketing/faq-accordion";
import { Header } from "@/components/marketing/header";
import { Footer } from "@/components/marketing/footer";

export const metadata: Metadata = {
  title: "FAQ | IHGC 2026",
  description:
    "Frequently asked questions about IHGC 2026 registration, fees, tickets, and Kwali Campground arrival.",
};

export default function FaqPage() {
  return (
    <div className="relative isolate min-h-screen bg-white pt-28 pb-20 sm:pt-36 sm:pb-28">
      <Header />
      <div aria-hidden="true" className="bg-ticks pointer-events-none absolute inset-x-0 top-0 h-[420px] -z-10" />
      <div className="container-site mb-4 text-center">
        <p className="text-sm font-medium tracking-wide text-[#0e7a6e]">
          Frequently Asked Questions
        </p>
        <h1 className="h-hero mt-2 text-[#111827]">Questions &amp; Answers</h1>
        <p className="mx-auto mt-3 max-w-xl text-base text-[#4b5563]">
          Find confirmed information about registration, event dates, group passes, and tickets.
        </p>
      </div>
      <FaqAccordion showHeading={false} />
      <Footer />
    </div>
  );
}
