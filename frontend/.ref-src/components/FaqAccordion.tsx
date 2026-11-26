import { useState } from 'react';
import { Phone, MessageCircle } from 'lucide-react';
import { CONFERENCE_INFO, FAQ_ITEMS } from '../data/conferenceData';

interface FaqAccordionProps {
  showHeading?: boolean;
  onNavigate?: (path: string) => void;
}

export function FaqAccordion({ showHeading = true, onNavigate }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="section">
      <div className="container-site">
        {showHeading && (
          <div className="text-center">
            <h2 className="h-section mx-auto max-w-[600px]">Questions people ask</h2>
            <p className="mx-auto mt-3 max-w-[560px] text-base text-[#4b5563]">
              Confirmed answers regarding registration fees, group passes, accommodation, QR tickets,
              and arrival at Kwali Campground.
            </p>
          </div>
        )}

        <div className={showHeading ? 'mt-10 lg:mt-[60px]' : ''}>
          <ul className="mx-auto grid max-w-[760px] gap-[15px]">
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = openIndex === idx;
              return (
                <li
                  key={item.q}
                  className="rounded-2xl border border-[#e5e7eb] bg-white transition-colors hover:border-[#d1d5db]"
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    className="flex w-full items-center justify-between gap-4 py-2.5 pr-2.5 pl-5 text-left sm:pl-[26px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e7a6e] rounded-2xl"
                  >
                    <span className="text-[16px] leading-snug font-medium text-[#111827] sm:text-lg">
                      {item.q}
                    </span>
                    <span
                      aria-hidden="true"
                      className={`relative grid h-12 w-14 shrink-0 place-items-center rounded-lg transition-colors sm:w-[84px] ${
                        isOpen ? 'bg-[#0e7a6e]' : 'bg-[#f3f4f6]'
                      }`}
                    >
                      <span
                        className={`absolute h-0.5 w-4 rounded transition-colors ${
                          isOpen ? 'bg-white' : 'bg-[#111827]'
                        }`}
                      />
                      <span
                        className={`absolute h-4 w-0.5 rounded transition-transform duration-300 ${
                          isOpen ? 'rotate-90 scale-0 bg-white' : 'bg-[#111827]'
                        }`}
                      />
                    </span>
                  </button>

                  <div
                    className={`grid transition-[grid-template-rows] duration-300 ${
                      isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="px-5 pt-1 pb-6 text-[15px] leading-relaxed text-[#4b5563] sm:pr-[96px] sm:pl-[26px] sm:text-base">
                        {item.a}
                      </p>
                      {idx === 6 && onNavigate && (
                        <div className="px-5 pb-5 sm:pl-[26px]">
                          <a
                            href="/terms"
                            onClick={(e) => {
                              e.preventDefault();
                              onNavigate('/terms');
                            }}
                            className="text-sm font-medium text-[#0e7a6e] hover:underline"
                          >
                            Read Terms &amp; Refund Policy (Draft) →
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Conference Helpline Strip */}
          <div className="mx-auto mt-10 max-w-[760px] rounded-2xl border border-[#e5e7eb] bg-[#f4f5f7] p-6 sm:p-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-medium text-[#111827]">
                Still have a question not answered here?
              </h3>
              <p className="mt-1 text-sm text-[#4b5563]">
                Our conference registration helpline is available via phone and WhatsApp.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <a
                href={CONFERENCE_INFO.contact.phoneTel}
                className="btn btn-outline !min-h-[44px] !px-4 !py-2.5 !text-sm"
              >
                <Phone className="h-4 w-4" />
                <span>Call {CONFERENCE_INFO.contact.phone}</span>
              </a>
              <a
                href={CONFERENCE_INFO.contact.whatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary !min-h-[44px] !px-4 !py-2.5 !text-sm"
              >
                <MessageCircle className="h-4 w-4" />
                <span>WhatsApp Helpline</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
