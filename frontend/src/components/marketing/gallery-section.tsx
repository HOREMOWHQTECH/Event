"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, Expand } from "lucide-react";
import { GALLERY_PHOTOS } from "@/data/conference";

export function GallerySection() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const updateScrollButtons = () => {
    const el = trackRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 12);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 12);
  };

  useEffect(() => {
    updateScrollButtons();
    window.addEventListener("resize", updateScrollButtons);
    return () => window.removeEventListener("resize", updateScrollButtons);
  }, []);

  useEffect(() => {
    if (lightboxIdx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxIdx(null);
      if (e.key === "ArrowRight") {
        setLightboxIdx((i) => (i === null ? null : (i + 1) % GALLERY_PHOTOS.length));
      }
      if (e.key === "ArrowLeft") {
        setLightboxIdx((i) =>
          i === null ? null : (i - 1 + GALLERY_PHOTOS.length) % GALLERY_PHOTOS.length
        );
      }
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [lightboxIdx]);

  const scrollByStep = (dir: -1 | 1) => {
    const el = trackRef.current;
    if (!el) return;
    const step = Math.min(el.clientWidth * 0.8, 560);
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  return (
    <section
      id="gallery"
      aria-roledescription="carousel"
      aria-label="Moments from previous conferences"
      className="section overflow-hidden"
    >
      <div className="container-site flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 max-w-[580px]">
          <p className="text-sm font-medium tracking-wide text-[#0e7a6e]">
            Conference Gallery
          </p>
          <h2 className="h-section mt-2">Moments from previous conferences</h2>
          <p className="mt-3 text-base text-[#4b5563]">
            Worship, expository teachings, water baptism, altar calls, and fervent intercession
            captured at Holiness Campground, Kwali, Abuja.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => scrollByStep(-1)}
            disabled={!canPrev}
            aria-label="Previous photographs"
            className="grid size-12 place-items-center rounded-full border border-[#0e7a6e]/40 bg-white text-[#0e7a6e] transition-colors hover:bg-[#0e7a6e] hover:text-white disabled:border-[#e5e7eb] disabled:text-[#9ca3af] disabled:bg-[#f9fafb] cursor-pointer disabled:cursor-default"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => scrollByStep(1)}
            disabled={!canNext}
            aria-label="Next photographs"
            className="grid size-12 place-items-center rounded-full border border-[#0e7a6e]/40 bg-white text-[#0e7a6e] transition-colors hover:bg-[#0e7a6e] hover:text-white disabled:border-[#e5e7eb] disabled:text-[#9ca3af] disabled:bg-[#f9fafb] cursor-pointer disabled:cursor-default"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        onScroll={updateScrollButtons}
        tabIndex={0}
        className="mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mt-12 sm:gap-6"
        style={{
          paddingInline: "max(20px, calc((100vw - 1240px) / 2 + 20px))",
          scrollPaddingInline: "max(20px, calc((100vw - 1240px) / 2 + 20px))",
        }}
      >
        {GALLERY_PHOTOS.map((photo, idx) => (
          <div
            key={photo.src}
            className="w-[84vw] max-w-[520px] shrink-0 snap-start"
            role="group"
            aria-roledescription="slide"
            aria-label={`${idx + 1} of ${GALLERY_PHOTOS.length}: ${photo.caption}`}
          >
            <button
              type="button"
              onClick={() => setLightboxIdx(idx)}
              className="card group relative block w-full overflow-hidden text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e7a6e]"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#f3f4f6]">
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  width={520}
                  height={325}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                <div className="absolute top-3.5 right-3.5 grid size-9 place-items-center rounded-full border border-white/25 bg-black/55 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                  <Expand className="h-4 w-4" />
                </div>
                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                  <p className="text-xs font-medium text-[#8ee3d6]">{photo.tag}</p>
                  <p className="mt-1 text-base font-medium text-white sm:text-lg">
                    {photo.caption}
                  </p>
                </div>
              </div>
            </button>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {lightboxIdx !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={GALLERY_PHOTOS[lightboxIdx].caption}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md sm:p-8"
          onClick={() => setLightboxIdx(null)}
        >
          <div
            className="relative w-full max-w-5xl rounded-2xl border border-[#e5e7eb] bg-white overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#e5e7eb] px-5 py-3.5">
              <div className="min-w-0 pr-4">
                <p className="text-xs font-medium text-[#0e7a6e]">
                  {GALLERY_PHOTOS[lightboxIdx].tag} · {lightboxIdx + 1} / {GALLERY_PHOTOS.length}
                </p>
                <p className="truncate text-sm font-medium text-[#111827] sm:text-base">
                  {GALLERY_PHOTOS[lightboxIdx].caption}
                </p>
              </div>
              <button
                type="button"
                aria-label="Close gallery viewer"
                onClick={() => setLightboxIdx(null)}
                className="grid size-10 shrink-0 place-items-center rounded-lg border border-[#e5e7eb] bg-[#f9fafb] text-[#111827] hover:bg-[#f3f4f6] cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="relative bg-[#111827] flex items-center justify-center max-h-[72vh]">
              <Image
                src={GALLERY_PHOTOS[lightboxIdx].src}
                alt={GALLERY_PHOTOS[lightboxIdx].alt}
                width={1200}
                height={750}
                className="max-h-[72vh] w-full object-contain"
              />
            </div>

            <div className="flex items-center justify-between border-t border-[#e5e7eb] bg-white px-5 py-3">
              <button
                type="button"
                onClick={() =>
                  setLightboxIdx(
                    (lightboxIdx - 1 + GALLERY_PHOTOS.length) % GALLERY_PHOTOS.length
                  )
                }
                className="btn btn-outline !min-h-[40px] !px-4 !py-2 !text-sm"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </button>
              <button
                type="button"
                onClick={() => setLightboxIdx((lightboxIdx + 1) % GALLERY_PHOTOS.length)}
                className="btn btn-primary !min-h-[40px] !px-4 !py-2 !text-sm"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
