import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { MINISTERS, CONFERENCE_INFO } from "@/data/conference";
import { Header } from "@/components/marketing/header";
import { Footer } from "@/components/marketing/footer";

export const metadata: Metadata = {
  title: "Featured Ministers | IHGC 2026",
  description:
    "Meet Pastor Paul Rika and Evang. Linda Paul Rika, the featured ministers of International Holiness General Conference 2026.",
};

export default function MinistersPage() {
  return (
    <div className="relative isolate min-h-screen bg-white pt-28 pb-20 sm:pt-36 sm:pb-28">
      <Header />
      <div aria-hidden="true" className="bg-ticks pointer-events-none absolute inset-x-0 top-0 h-[420px] -z-10" />
      <div
        aria-hidden="true"
        className="glow absolute -top-[340px] left-1/2 -z-10 h-[720px] w-[1400px] -translate-x-1/2 [--glow-strength:0.22]"
      />

      <div className="container-site space-y-12">
        <div className="max-w-[740px] space-y-4">
          <p className="text-sm font-medium tracking-wide text-[#0e7a6e]">Servants of God</p>
          <h1 className="h-hero text-[#111827]">Featured Ministers</h1>
          <p className="text-base leading-relaxed text-[#4b5563] sm:text-lg">
            Pastor Paul Rika and Evang. Linda Paul Rika are the featured ministers named for
            International Holiness General Conference 2026.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {MINISTERS.map((m) => (
            <article key={m.name} className="card bg-white overflow-hidden flex flex-col shadow-xs">
              <div className="relative aspect-[4/3] overflow-hidden bg-[#f3f4f6]">
                <Image
                  src={m.image}
                  alt={m.alt}
                  fill
                  className="object-cover object-top"
                />
              </div>
              <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-5">
                <div>
                  <p className="text-xs font-medium text-[#0e7a6e]">{m.role}</p>
                  <h2 className="mt-1.5 h-card text-[#111827]">{m.name}</h2>
                  <p className="mt-3 text-base leading-relaxed text-[#4b5563]">{m.bio}</p>
                </div>

                <div className="flex flex-wrap items-center gap-4 border-t border-[#e5e7eb] pt-5 text-sm">
                  <a
                    href={CONFERENCE_INFO.contact.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-[#0e7a6e] hover:underline"
                  >
                    YouTube
                  </a>
                  <a
                    href={CONFERENCE_INFO.contact.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-[#0e7a6e] hover:underline"
                  >
                    Facebook
                  </a>
                  <a
                    href={CONFERENCE_INFO.contact.x}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-[#0e7a6e] hover:underline"
                  >
                    X
                  </a>
                  <span className="text-xs text-[#6b7280]">· Official HOREMOW channels</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="card p-6 sm:p-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="h-card text-[#111827]">Join us at Holiness Campground, Kwali</h2>
            <p className="mt-1 text-sm text-[#4b5563]">
              {CONFERENCE_INFO.dates} · {CONFERENCE_INFO.openingDate}
            </p>
          </div>
          <Link href="/register" className="btn btn-primary shrink-0">
            Register Now
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
