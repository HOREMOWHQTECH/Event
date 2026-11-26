import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { CONFERENCE_INFO, ABOUT_PILLARS } from "@/data/conference";
import { Header } from "@/components/marketing/header";
import { Footer } from "@/components/marketing/footer";
import { SITE_CONFIG } from "@/config/site";

export const metadata: Metadata = {
  title: "About HOREMOW | IHGC 2026",
  description:
    "Learn about the Holiness Revival Movement Worldwide (HOREMOW), its origins, mission, ministries, and global reach.",
};

export default function AboutPage() {
  const about = SITE_CONFIG.about;

  return (
    <div className="relative isolate min-h-screen bg-white pt-28 pb-20 sm:pt-36 sm:pb-28">
      <Header />
      <div aria-hidden="true" className="bg-ticks pointer-events-none absolute inset-x-0 top-0 h-[420px] -z-10" />
      <div
        aria-hidden="true"
        className="glow absolute -top-[340px] left-1/2 -z-10 h-[720px] w-[1400px] -translate-x-1/2 [--glow-strength:0.22]"
      />

      <div className="container-site space-y-16">
        <div className="max-w-[780px] space-y-4">
          <p className="text-sm font-medium tracking-wide text-[#0e7a6e]">
            About the Ministry
          </p>
          <h1 className="h-hero text-[#111827]">{CONFERENCE_INFO.ministryName}</h1>
          <p className="text-base leading-relaxed text-[#4b5563] sm:text-lg">
            A non-denominational Christian movement dedicated to reviving biblical righteousness,
            inward and outward holiness, and preparing believers across all churches for the rapture.
          </p>
        </div>

        <div className="card bg-white overflow-hidden grid grid-cols-1 lg:grid-cols-12 shadow-xs">
          <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 space-y-5">
            <p className="text-xs font-medium tracking-wide text-[#0e7a6e]">
              Overview &amp; Origins
            </p>
            <h2 className="h-section">An End-Time Movement Across the Body of Christ</h2>
            <p className="text-base leading-relaxed text-[#4b5563]">{about.origins}</p>
            <p className="text-base leading-relaxed text-[#4b5563]">{about.nature}</p>

            <dl className="grid grid-cols-1 gap-4 pt-4 border-t border-[#e5e7eb] sm:grid-cols-2 text-sm">
              <div>
                <dt className="text-[#6b7280]">Founded</dt>
                <dd className="mt-1 font-medium text-[#111827]">
                  2009 · Pastor Paul Rika (International Director)
                </dd>
              </div>
              <div>
                <dt className="text-[#6b7280]">Inauguration</dt>
                <dd className="mt-1 font-medium text-[#111827]">
                  2010 · Kwali, Abuja (Holiness Campground)
                </dd>
              </div>
            </dl>
          </div>

          <div className="lg:col-span-5 relative min-h-[320px]">
            <Image
              src={CONFERENCE_INFO.assets.about}
              alt="Pastor Paul Rika, International Director & Founder"
              fill
              className="object-cover object-top"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-6">
              <p className="text-sm font-medium text-white">
                Pastor Paul Rika, International Director &amp; Founder
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="card bg-ticks p-6 sm:p-10 space-y-4">
            <p className="text-xs font-medium tracking-wide text-[#0e7a6e]">
              Absolute Biblical Authority
            </p>
            <h2 className="h-card text-[#111827]">66 Books · One Working Manual</h2>
            <p className="text-base leading-relaxed text-[#4b5563]">{about.authority}</p>
          </div>

          <div className="card bg-ticks p-6 sm:p-10 space-y-4">
            <p className="text-xs font-medium tracking-wide text-[#0e7a6e]">
              Core Calling &amp; Mandate
            </p>
            <h2 className="h-card text-[#111827]">Inward &amp; Outward Holiness</h2>
            <p className="text-base leading-relaxed text-[#4b5563]">{about.mission}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-sm font-medium tracking-wide text-[#0e7a6e]">
              Ministries &amp; Reach
            </p>
            <h2 className="h-section mt-2">Activities and Global Presence</h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {ABOUT_PILLARS.map((p) => (
              <div key={p.index} className="card bg-white p-6 sm:p-8 space-y-4">
                <span className="font-mono text-xs text-[#0e7a6e]">{p.index}.</span>
                <h3 className="text-lg font-medium text-[#111827]">{p.title}</h3>
                <p className="text-sm leading-relaxed text-[#4b5563]">{p.description}</p>
              </div>
            ))}
          </div>

          <div className="card bg-white p-6 sm:p-8 space-y-3">
            <h3 className="text-lg font-medium text-[#111827]">Literature &amp; Media Outreach</h3>
            <p className="text-sm leading-relaxed text-[#4b5563]">{about.activities}</p>
            <p className="text-sm leading-relaxed text-[#4b5563]">
              <span className="font-medium text-[#111827]">Global reach:</span>{" "}
              {about.globalReach}
            </p>
          </div>
        </div>

        <div className="card overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-center">
          <div className="lg:col-span-6 p-6 sm:p-10 space-y-4">
            <p className="text-xs font-medium tracking-wide text-[#0e7a6e]">
              Headquarters &amp; Campground
            </p>
            <h2 className="h-card text-[#111827]">{CONFERENCE_INFO.venueShort}</h2>
            <p className="text-base leading-relaxed text-[#4b5563]">
              The international headquarters and campground of the Holiness Revival Movement
              Worldwide, located {CONFERENCE_INFO.landmark}
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <Link
                href="/camp-info"
                className="link-arrow text-sm font-medium text-[#111827]"
              >
                <span>View Camp Info &amp; Travel Advisory</span>
                <ArrowRight className="h-4 w-4 text-[#0e7a6e]" />
              </Link>
              <Link href="/register" className="btn btn-primary !min-h-[44px]">
                Register for IHGC 2026
              </Link>
            </div>
          </div>
          <div className="lg:col-span-6 h-72 lg:h-full relative">
            <Image
              src={CONFERENCE_INFO.assets.campground}
              alt="Holiness Campground, Kwali, Abuja"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
