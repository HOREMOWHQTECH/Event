import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Menu, X, ArrowRight } from 'lucide-react';
import { CONFERENCE_INFO } from '../data/conferenceData';

interface HeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

const PRIMARY_LINKS = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  { label: 'IHC26', path: '/conference' },
  { label: 'Programme', path: '/programme' },
  { label: 'Ministers', path: '/ministers' },
  { label: 'Find My Tickets', path: '/find-my-tickets' },
];

const MORE_LINKS = [
  { label: 'Camp Information', path: '/camp-info' },
  { label: 'FAQ', path: '/faq' },
  { label: 'Contact', path: '/contact' },
];

const ALL_LINKS = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  { label: 'IHC26', path: '/conference' },
  { label: 'Programme', path: '/programme' },
  { label: 'Ministers', path: '/ministers' },
  { label: 'Camp Information', path: '/camp-info' },
  { label: 'Find My Tickets', path: '/find-my-tickets' },
  { label: 'FAQ', path: '/faq' },
  { label: 'Contact', path: '/contact' },
];

export function Header({ currentPath, onNavigate }: HeaderProps) {
  const [moreOpen, setMoreOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMoreOpen(false);
        setMobileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const handleLinkClick = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    setMoreOpen(false);
    setMobileOpen(false);
    onNavigate(path);
  };

  const isMoreActive = MORE_LINKS.some((item) => item.path === currentPath);

  return (
    <header className="fixed inset-x-0 top-3 z-50 px-3 sm:top-5 sm:px-5">
      <div
        className={`relative mx-auto flex h-[60px] max-w-[1240px] items-center justify-between gap-4 rounded-2xl border pr-2 pl-4 backdrop-blur-xl transition-all duration-300 lg:h-[66px] lg:pl-5 ${
          scrolled
            ? 'border-[#e5e7eb] bg-white/92 shadow-[0_14px_38px_-12px_rgba(17,24,39,0.12)]'
            : 'border-[#e5e7eb]/90 bg-white/80 shadow-[0_6px_24px_-10px_rgba(17,24,39,0.06)]'
        }`}
      >
        {/* Zone 1: Brand Logo + Single-line Wordmark */}
        <a
          href="/"
          onClick={(e) => handleLinkClick(e, '/')}
          aria-label="HOREMOW International Holiness General Conference 2026 Home"
          className="inline-flex items-center gap-2.5 shrink-0 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e7a6e] rounded-lg"
        >
          <img
            src={CONFERENCE_INFO.assets.logo}
            alt="HOREMOW Official Logo"
            className="h-9 w-9 rounded-full border border-[#e5e7eb] bg-white p-0.5 object-contain shrink-0"
          />
          <span className="text-[15px] font-semibold tracking-tight text-[#111827] whitespace-nowrap">
            HOREMOW · IHC26
          </span>
        </a>

        {/* Zone 2: Desktop Navigation Links */}
        <nav aria-label="Primary navigation" className="hidden items-center gap-0.5 xl:flex">
          {PRIMARY_LINKS.map((link) => {
            const active = currentPath === link.path;
            return (
              <a
                key={link.path}
                href={link.path}
                onClick={(e) => handleLinkClick(e, link.path)}
                className={`rounded-lg px-2.5 py-2 text-[14px] whitespace-nowrap shrink-0 transition-colors ${
                  active
                    ? 'bg-[#eaf5f3] text-[#0e7a6e] font-medium'
                    : 'text-[#4b5563] hover:bg-[#f3f4f6] hover:text-[#111827]'
                }`}
              >
                {link.label}
              </a>
            );
          })}

          <div ref={moreRef} className="relative">
            <button
              type="button"
              aria-expanded={moreOpen}
              aria-controls="header-more-menu"
              onClick={() => setMoreOpen((v) => !v)}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-2 text-[14px] whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                isMoreActive || moreOpen
                  ? 'bg-[#eaf5f3] text-[#0e7a6e] font-medium'
                  : 'text-[#4b5563] hover:bg-[#f3f4f6] hover:text-[#111827]'
              }`}
            >
              <span>More</span>
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform duration-200 ${moreOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {moreOpen && (
              <div
                id="header-more-menu"
                className="absolute top-[calc(100%+12px)] right-0 w-56 rounded-2xl border border-[#e5e7eb] bg-white p-2 shadow-[0_20px_50px_-15px_rgba(17,24,39,0.15)]"
              >
                {MORE_LINKS.map((item) => {
                  const active = currentPath === item.path;
                  return (
                    <a
                      key={item.path}
                      href={item.path}
                      onClick={(e) => handleLinkClick(e, item.path)}
                      className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-[14px] whitespace-nowrap transition-colors ${
                        active
                          ? 'bg-[#eaf5f3] text-[#0e7a6e] font-medium'
                          : 'text-[#374151] hover:bg-[#f3f4f6] hover:text-[#111827]'
                      }`}
                    >
                      <span>{item.label}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-[#9ca3af]" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </nav>

        {/* Zone 3: Green Primary Action + Mobile Trigger */}
        <div className="flex items-center gap-2 shrink-0">
          <a
            href="/register"
            onClick={(e) => handleLinkClick(e, '/register')}
            className="inline-flex h-10 items-center justify-center rounded-xl bg-[#0e7a6e] px-4 text-[14px] font-semibold text-white whitespace-nowrap shrink-0 transition-colors hover:bg-[#0a5e54]"
          >
            Register Now
          </a>

          <button
            type="button"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e5e7eb] bg-[#f9fafb] text-[#111827] transition-colors hover:bg-[#f3f4f6] xl:hidden cursor-pointer"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile & Tablet Drawer */}
      {mobileOpen && (
        <div className="fixed inset-x-3 top-[78px] bottom-3 z-40 overflow-y-auto rounded-2xl border border-[#e5e7eb] bg-white/98 p-4 shadow-2xl backdrop-blur-2xl sm:inset-x-5 sm:top-[92px] xl:hidden">
          <nav aria-label="Mobile navigation" className="flex flex-col gap-1">
            {ALL_LINKS.map((link) => {
              const active = currentPath === link.path;
              return (
                <a
                  key={link.path}
                  href={link.path}
                  onClick={(e) => handleLinkClick(e, link.path)}
                  className={`flex items-center justify-between rounded-xl px-4 py-3.5 text-[16px] transition-colors ${
                    active
                      ? 'bg-[#eaf5f3] text-[#0e7a6e] font-medium'
                      : 'text-[#1f2937] hover:bg-[#f3f4f6]'
                  }`}
                >
                  <span>{link.label}</span>
                  <ArrowRight className="h-4 w-4 text-[#9ca3af]" />
                </a>
              );
            })}

            <div className="mt-4 border-t border-[#e5e7eb] pt-4 grid gap-2.5">
              <a
                href="/register"
                onClick={(e) => handleLinkClick(e, '/register')}
                className="btn btn-primary w-full"
              >
                Register Now
              </a>
              <a
                href="/find-my-tickets"
                onClick={(e) => handleLinkClick(e, '/find-my-tickets')}
                className="btn btn-outline w-full"
              >
                Find My Tickets
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
