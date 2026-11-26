import { useEffect, useMemo, useRef, useState } from 'react';
import {
  User,
  Users,
  Check,
  AlertCircle,
  Lock,
  ExternalLink,
  ArrowLeft,
  ArrowRight,
  MapPin,
  Globe,
  HelpCircle,
} from 'lucide-react';
import {
  CONFERENCE_INFO,
  COUNTRIES,
  NIGERIAN_STATES,
} from '../data/conferenceData';

interface RegisterPageProps {
  onNavigate: (path: string) => void;
}

type CurrencyCode = 'NGN' | 'USD' | 'EUR' | 'GBP';
type AttendanceMode = 'physically' | 'online' | 'not_sure';

interface RegisterConfig {
  pricesMinor: Record<CurrencyCode, number>;
  registrationOpen: boolean;
}

const CURRENCY_META: Record<CurrencyCode, { symbol: string; label: string; flag: string }> = {
  NGN: { symbol: '₦', label: 'Nigerian Naira', flag: '🇳🇬' },
  USD: { symbol: '$', label: 'US Dollar', flag: '🇺🇸' },
  EUR: { symbol: '€', label: 'Euro', flag: '🇪🇺' },
  GBP: { symbol: '£', label: 'British Pound', flag: '🇬🇧' },
};

function formatMoney(minor: number, currency: CurrencyCode): string {
  const major = minor / 100;
  const symbol = CURRENCY_META[currency].symbol;
  if (currency === 'NGN') {
    return `${symbol}${major.toLocaleString('en-NG')}`;
  }
  return `${symbol}${major.toLocaleString('en-US', {
    minimumFractionDigits: major % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

function normalizePhoneE164(raw: string): string | null {
  let digits = raw.replace(/\D/g, '');
  if (!digits) return null;
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (/^2340\d{10}$/.test(digits)) digits = `234${digits.slice(4)}`;
  if (/^234\d{10}$/.test(digits)) return `+${digits}`;
  if (/^0\d{10}$/.test(digits)) return `+234${digits.slice(1)}`;
  if (/^\d{10}$/.test(digits)) return `+234${digits}`;
  if (digits.length >= 10 && digits.length <= 15) return `+${digits}`;
  return null;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function RegisterPage({ onNavigate }: RegisterPageProps) {
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState<RegisterConfig>({
    pricesMinor: { NGN: 500000, USD: 2000, EUR: 2000, GBP: 2000 },
    registrationOpen: true,
  });
  const [configLoaded, setConfigLoaded] = useState(false);

  // Step 1
  const [isGroup, setIsGroup] = useState(false);

  // Step 2 (Individual)
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [firstTime, setFirstTime] = useState<'yes' | 'no'>('no');

  // Step 2 (Group)
  const [groupName, setGroupName] = useState('');
  const [seatsStr, setSeatsStr] = useState('2');
  const [hasInvitees, setHasInvitees] = useState(false);
  const [inviteeCountStr, setInviteeCountStr] = useState('1');
  const [hasChildren, setHasChildren] = useState(false);
  const [childCount, setChildCount] = useState(1);
  const [genderCounts, setGenderCounts] = useState({ male: 1, female: 1 });

  // Step 3 (Contact & Location)
  const [country, setCountry] = useState('Nigeria');
  const [stateVal, setStateVal] = useState('');
  const [stateOptions, setStateOptions] = useState<string[]>(NIGERIAN_STATES);
  const [loadingStates, setLoadingStates] = useState(false);
  const [payerName, setPayerName] = useState('');
  const [payerPhone, setPayerPhone] = useState('+234 ');
  const [payerEmail, setPayerEmail] = useState('');
  const [isMinor, setIsMinor] = useState(false);
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');

  // Step 4 (Attendance)
  const [attendanceMode, setAttendanceMode] = useState<AttendanceMode>('physically');
  const [groupAttendance, setGroupAttendance] = useState({
    physically: 2,
    online: 0,
    not_sure: 0,
  });

  // Step 5 (Payment)
  const [currency, setCurrency] = useState<CurrencyCode>('NGN');
  const [customNaira, setCustomNaira] = useState('5000');

  // Step 6 (Consent & Submit)
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [turnstileNotice, setTurnstileNotice] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const statesCacheRef = useRef<Record<string, string[]>>({ Nigeria: NIGERIAN_STATES });

  useEffect(() => {
    let cancelled = false;
    fetch('/api/register', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && data?.pricesMinor) {
          setConfig({
            pricesMinor: data.pricesMinor,
            registrationOpen: data.registrationOpen !== false,
          });
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setConfigLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (country === 'Nigeria') {
      setStateOptions(NIGERIAN_STATES);
      return;
    }
    if (statesCacheRef.current[country]) {
      setStateOptions(statesCacheRef.current[country]);
      return;
    }
    let cancelled = false;
    setLoadingStates(true);
    fetch('https://countriesnow.space/api/v0.1/countries/states', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ country }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const list = Array.isArray(data?.data?.states)
          ? data.data.states
              .map((s: { name?: string }) => String(s?.name || '').trim())
              .filter(Boolean)
              .sort((a: string, b: string) => a.localeCompare(b))
          : [];
        statesCacheRef.current[country] = list;
        setStateOptions(list);
      })
      .catch(() => {
        if (!cancelled) setStateOptions([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingStates(false);
      });
    return () => {
      cancelled = true;
    };
  }, [country]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const seats = Math.max(0, Number.parseInt(seatsStr, 10) || 0);
  const participantCount = isGroup ? seats : 1;
  const standardUnitMinor = config.pricesMinor[currency] ?? 500000;
  const minIndividualNairaMinor = 200000;
  const customNairaVal = Number(customNaira);
  const customNairaMinor =
    currency === 'NGN' && Number.isFinite(customNairaVal)
      ? Math.round(customNairaVal * 100)
      : null;

  const totalMinor = useMemo(() => {
    if (currency === 'NGN') {
      if (isGroup) return standardUnitMinor * seats;
      return customNairaMinor;
    }
    return standardUnitMinor * participantCount;
  }, [currency, isGroup, standardUnitMinor, seats, customNairaMinor, participantCount]);

  const clearError = (key: string) => {
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleCountryChange = (newCountry: string) => {
    setCountry(newCountry);
    setStateVal('');
    clearError('country');
    clearError('state');
    const match = COUNTRIES.find((c) => c.name === newCountry);
    if (match) {
      setCurrency(match.currency);
      setPayerPhone(`${match.dial} `);
    }
  };

  const validateAll = (): Record<string, string> => {
    const e: Record<string, string> = {};
    if (isGroup) {
      if (!groupName.trim()) e.groupName = 'Enter your chapter or zone name.';
      if (!Number.isInteger(seats) || seats < 2 || seats > 500) {
        e.seats = 'Enter a number between 2 and 500.';
      }
      if (hasInvitees) {
        const inv = Number(inviteeCountStr);
        if (!Number.isInteger(inv) || inv < 1 || inv > seats) {
          e.inviteeCount = `Enter a number between 1 and ${seats}.`;
        }
      }
      if (genderCounts.male + genderCounts.female !== seats) {
        e.genderCounts = `Brothers and Sisters must add up to ${seats} participants (children included).`;
      }
      if (hasChildren && (childCount < 1 || childCount > seats)) {
        e.childCount = `Enter a child count between 1 and ${seats}.`;
      }
      const attTotal =
        groupAttendance.physically + groupAttendance.online + groupAttendance.not_sure;
      if (attTotal !== seats) {
        e.groupAttendance = `The three attendance counts must add up to ${seats} participants (currently ${attTotal}).`;
      }
    }

    if (!country.trim()) e.country = 'Select a country.';
    if (country === 'Nigeria' && !NIGERIAN_STATES.includes(stateVal)) {
      e.state = 'Select your state from the list.';
    } else if (stateOptions.length > 0 && !stateVal.trim()) {
      e.state = 'Select or enter your state or region.';
    }

    if (!payerName.trim()) e.payerName = 'Enter your full name.';
    if (!normalizePhoneE164(payerPhone)) {
      e.payerPhone = 'Enter a valid phone number with country code (e.g. +234 801 234 5678).';
    }
    if (!EMAIL_RE.test(payerEmail.trim())) {
      e.payerEmail = 'Enter a valid email address (e.g. name@example.com).';
    }

    if (!isGroup && isMinor) {
      if (!guardianName.trim()) e.guardianName = 'Enter a parent or guardian name.';
      if (!guardianPhone.trim()) e.guardianPhone = 'Enter a parent or guardian phone number.';
    }

    if (!isGroup && currency === 'NGN') {
      if (!Number.isInteger(customNairaVal) || customNairaMinor === null || customNairaMinor < minIndividualNairaMinor) {
        e.customNairaAmount = 'Enter a valid whole-naira amount (minimum ₦2,000).';
      }
    }

    if (!consent) {
      e.consent = 'Please accept the terms and privacy notice to continue.';
    }
    return e;
  };

  const stepFields: Record<number, string[]> = {
    1: [],
    2: isGroup
      ? ['groupName', 'seats', 'country', 'state', 'inviteeCount', 'childCount', 'genderCounts']
      : [],
    3: [
      ...(isGroup ? [] : ['country', 'state']),
      'payerName',
      'payerPhone',
      'payerEmail',
      ...(!isGroup && isMinor ? ['guardianName', 'guardianPhone'] : []),
    ],
    4: isGroup ? ['groupAttendance'] : [],
    5: ['customNairaAmount'],
    6: ['consent'],
  };

  const handleNext = () => {
    setSubmitError(null);
    const all = validateAll();
    const fields = stepFields[step] || [];
    const stepErrs: Record<string, string> = {};
    fields.forEach((f) => {
      if (all[f]) stepErrs[f] = all[f];
    });
    setErrors((prev) => {
      const next = { ...prev };
      fields.forEach((f) => {
        if (stepErrs[f]) next[f] = stepErrs[f];
        else delete next[f];
      });
      return next;
    });
    if (fields.some((f) => stepErrs[f])) return;
    setStep((s) => Math.min(6, s + 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitError(null);
    setTurnstileNotice(false);

    const all = validateAll();
    setErrors(all);
    if (Object.keys(all).length > 0) return;

    const phoneE164 = normalizePhoneE164(payerPhone);
    if (!phoneE164) return;

    setSubmitting(true);
    try {
      const payload = {
        currency,
        isGroup,
        payer: {
          name: payerName.trim(),
          phoneE164,
          phone: payerPhone.trim(),
          email: payerEmail.trim().toLowerCase(),
        },
        country,
        state: stateVal.trim() || undefined,
        attendanceMode,
        gender: isGroup ? undefined : gender,
        firstTime: isGroup ? undefined : firstTime === 'yes',
        isMinor: !isGroup && isMinor,
        guardianName: !isGroup && isMinor ? guardianName.trim() : undefined,
        guardianPhone: !isGroup && isMinor ? guardianPhone.trim() : undefined,
        group: isGroup ? { name: groupName.trim(), totalSeats: seats } : undefined,
        inviteeCount: isGroup ? (hasInvitees ? Number(inviteeCountStr) : 0) : undefined,
        genderCounts: isGroup ? genderCounts : undefined,
        hasChildren: isGroup ? hasChildren : undefined,
        childCount: isGroup && hasChildren ? childCount : undefined,
        consent,
        customAmountMinor: !isGroup && currency === 'NGN' ? customNairaMinor ?? undefined : undefined,
        groupAttendance: isGroup ? groupAttendance : undefined,
      };

      const idemKey =
        globalThis.crypto?.randomUUID?.() ||
        `${Date.now()}-${Math.random().toString(16).slice(2)}`;

      const res = await fetch('/api/checkout/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': idemKey,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg = String(data?.error || 'Could not initialize payment session.');
        if (
          msg.toLowerCase().includes('turnstile') ||
          msg.toLowerCase().includes('verification') ||
          res.status === 400 ||
          res.status === 403
        ) {
          setTurnstileNotice(true);
        }
        throw new Error(msg);
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }

      if (data.reference) {
        onNavigate(`/find-my-tickets?ref=${encodeURIComponent(data.reference)}`);
      }
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Unable to initialize checkout right now.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCountryMeta = COUNTRIES.find((c) => c.name === country) || COUNTRIES[0];

  return (
    <div className="relative isolate min-h-screen bg-[#f8f9fa] pt-28 pb-20 sm:pt-36 sm:pb-28">
      <div aria-hidden="true" className="bg-ticks pointer-events-none absolute inset-0 -z-10" />
      <div
        aria-hidden="true"
        className="glow absolute -top-[340px] left-1/2 -z-10 h-[720px] w-[1400px] -translate-x-1/2 [--glow-strength:0.2]"
      />

      <div className="container-site max-w-[820px]">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium tracking-wide text-[#0e7a6e]">
              Step {step} of 6 · IHGC 2026 Registration
            </p>
            <h1 className="mt-1.5 text-2xl font-medium tracking-tight text-[#111827] sm:text-3xl">
              {CONFERENCE_INFO.title}
            </h1>
          </div>
          <a
            href="/programme"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('/programme');
            }}
            className="text-sm font-medium text-[#0e7a6e] hover:underline underline-offset-4 shrink-0"
          >
            View Schedule
          </a>
        </div>

        {/* 6-step Progress Indicator */}
        <div className="mb-8 grid grid-cols-6 gap-2" aria-label={`Step ${step} of 6`}>
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className={`h-1.5 rounded-full transition-colors ${
                n <= step ? 'bg-[#0e7a6e]' : 'bg-[#e5e7eb]'
              }`}
            />
          ))}
        </div>

        {/* Registration Card */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="card bg-white p-6 sm:p-10 space-y-6 shadow-sm"
        >
          {step === 1 && (
            <>
              <div>
                <h2 className="h-card text-[#111827]">Registration category</h2>
                <p className="mt-1.5 text-sm text-[#4b5563] sm:text-base">
                  Select how you will be attending IHGC 2026.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setIsGroup(false)}
                  className={`rounded-2xl border p-5 text-left transition-all cursor-pointer ${
                    !isGroup
                      ? 'border-[#0e7a6e] bg-[#eaf5f3]'
                      : 'border-[#e5e7eb] bg-white hover:border-[#0e7a6e]/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <User className="h-5 w-5 text-[#0e7a6e]" />
                    <span className="text-base font-medium text-[#111827]">
                      Individual participant
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-[#4b5563]">
                    Register yourself as an individual participant.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setIsGroup(true)}
                  className={`rounded-2xl border p-5 text-left transition-all cursor-pointer ${
                    isGroup
                      ? 'border-[#0e7a6e] bg-[#eaf5f3]'
                      : 'border-[#e5e7eb] bg-white hover:border-[#0e7a6e]/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Users className="h-5 w-5 text-[#0e7a6e]" />
                    <span className="text-base font-medium text-[#111827]">
                      Group participants
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-[#4b5563]">
                    Register your chapter, unit, zone and others as a group.
                  </p>
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <h2 className="h-card text-[#111827]">
                  {isGroup ? 'Group details' : 'About you'}
                </h2>
                <p className="mt-1.5 text-sm text-[#4b5563]">
                  {isGroup
                    ? 'Tell us about your chapter or zone and the people attending.'
                    : 'Tell us your gender and whether you are attending as an invitee or a first-timer.'}
                </p>
              </div>

              {!isGroup ? (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-[#111827] mb-2.5">
                      Gender
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { val: 'male' as const, label: 'Brother' },
                        { val: 'female' as const, label: 'Sister' },
                      ].map((opt) => (
                        <button
                          key={opt.val}
                          type="button"
                          onClick={() => setGender(opt.val)}
                          className={`h-13 rounded-xl border text-sm font-medium transition-colors cursor-pointer ${
                            gender === opt.val
                              ? 'border-[#0e7a6e] bg-[#0e7a6e] text-white'
                              : 'border-[#d1d5db] bg-white text-[#374151] hover:border-[#0e7a6e]'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#111827] mb-2.5">
                      Are you attending as an invitee / first-timer?
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { val: 'yes' as const, label: 'Yes, first-time attendee' },
                        { val: 'no' as const, label: 'No, returning member' },
                      ].map((opt) => (
                        <button
                          key={opt.val}
                          type="button"
                          onClick={() => setFirstTime(opt.val)}
                          className={`h-13 rounded-xl border px-3 text-sm font-medium transition-colors cursor-pointer ${
                            firstTime === opt.val
                              ? 'border-[#0e7a6e] bg-[#0e7a6e] text-white'
                              : 'border-[#d1d5db] bg-white text-[#374151] hover:border-[#0e7a6e]'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="field-groupName" className="block text-sm font-medium text-[#111827] mb-1.5">
                        Chapter / zone name
                      </label>
                      <input
                        id="field-groupName"
                        type="text"
                        placeholder="e.g. HOREMOW Lagos Central"
                        value={groupName}
                        onChange={(e) => {
                          setGroupName(e.target.value);
                          clearError('groupName');
                        }}
                        className="h-13 w-full rounded-xl border border-[#d1d5db] bg-white px-4 text-sm text-[#111827] placeholder:text-[#9ca3af] focus:border-[#0e7a6e] focus:outline-none"
                      />
                      {errors.groupName && (
                        <p className="mt-1.5 text-xs text-rose-600">{errors.groupName}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="field-seats" className="block text-sm font-medium text-[#111827] mb-1.5">
                        Number of participants (2–500)
                      </label>
                      <input
                        id="field-seats"
                        type="number"
                        min={2}
                        max={500}
                        value={seatsStr}
                        onChange={(e) => {
                          setSeatsStr(e.target.value);
                          const n = Math.max(0, Number.parseInt(e.target.value, 10) || 0);
                          setGroupAttendance({ physically: n, online: 0, not_sure: 0 });
                          clearError('seats');
                          clearError('genderCounts');
                        }}
                        className="h-13 w-full rounded-xl border border-[#d1d5db] bg-white px-4 text-sm text-[#111827] tabular-nums focus:border-[#0e7a6e] focus:outline-none"
                      />
                      {errors.seats && (
                        <p className="mt-1.5 text-xs text-rose-600">{errors.seats}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="group-country" className="block text-sm font-medium text-[#111827] mb-1.5">
                        Group country
                      </label>
                      <select
                        id="group-country"
                        value={country}
                        onChange={(e) => handleCountryChange(e.target.value)}
                        className="h-13 w-full rounded-xl border border-[#d1d5db] bg-white px-4 text-sm text-[#111827] focus:border-[#0e7a6e] focus:outline-none"
                      >
                        {COUNTRIES.map((c) => (
                          <option key={c.name} value={c.name}>
                            {c.flag} {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="group-state" className="block text-sm font-medium text-[#111827] mb-1.5">
                        State / region {loadingStates ? '(Loading…)' : ''}
                      </label>
                      {stateOptions.length > 0 ? (
                        <select
                          id="group-state"
                          value={stateVal}
                          onChange={(e) => {
                            setStateVal(e.target.value);
                            clearError('state');
                          }}
                          className="h-13 w-full rounded-xl border border-[#d1d5db] bg-white px-4 text-sm text-[#111827] focus:border-[#0e7a6e] focus:outline-none"
                        >
                          <option value="">Select state / region</option>
                          {stateOptions.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          id="group-state"
                          type="text"
                          placeholder="Enter state or region"
                          value={stateVal}
                          onChange={(e) => {
                            setStateVal(e.target.value);
                            clearError('state');
                          }}
                          className="h-13 w-full rounded-xl border border-[#d1d5db] bg-white px-4 text-sm text-[#111827] focus:border-[#0e7a6e] focus:outline-none"
                        />
                      )}
                      {errors.state && (
                        <p className="mt-1.5 text-xs text-rose-600">{errors.state}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="field-males" className="block text-sm font-medium text-[#111827] mb-1.5">
                        Number of males (including boys)
                      </label>
                      <input
                        id="field-males"
                        type="number"
                        min={0}
                        max={seats}
                        value={genderCounts.male}
                        onChange={(e) => {
                          setGenderCounts((g) => ({
                            ...g,
                            male: Math.max(0, Number.parseInt(e.target.value, 10) || 0),
                          }));
                          clearError('genderCounts');
                        }}
                        className="h-13 w-full rounded-xl border border-[#d1d5db] bg-white px-4 text-sm text-[#111827] tabular-nums focus:border-[#0e7a6e] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label htmlFor="field-females" className="block text-sm font-medium text-[#111827] mb-1.5">
                        Number of females (including girls)
                      </label>
                      <input
                        id="field-females"
                        type="number"
                        min={0}
                        max={seats}
                        value={genderCounts.female}
                        onChange={(e) => {
                          setGenderCounts((g) => ({
                            ...g,
                            female: Math.max(0, Number.parseInt(e.target.value, 10) || 0),
                          }));
                          clearError('genderCounts');
                        }}
                        className="h-13 w-full rounded-xl border border-[#d1d5db] bg-white px-4 text-sm text-[#111827] tabular-nums focus:border-[#0e7a6e] focus:outline-none"
                      />
                    </div>
                  </div>
                  {errors.genderCounts && (
                    <p className="text-xs text-rose-600">{errors.genderCounts}</p>
                  )}

                  <div className="space-y-3 border-t border-[#e5e7eb] pt-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasInvitees}
                        onChange={(e) => setHasInvitees(e.target.checked)}
                        className="mt-1 h-4 w-4 accent-[#0e7a6e]"
                      />
                      <span className="text-sm text-[#374151]">
                        Do you have new comers / invitees registering with you?
                      </span>
                    </label>
                    {hasInvitees && (
                      <div className="pl-7">
                        <input
                          type="number"
                          min={1}
                          max={seats}
                          value={inviteeCountStr}
                          onChange={(e) => {
                            setInviteeCountStr(e.target.value);
                            clearError('inviteeCount');
                          }}
                          className="h-11 w-40 rounded-lg border border-[#d1d5db] bg-white px-3 text-sm text-[#111827] tabular-nums"
                          aria-label="Number of invitees"
                        />
                        {errors.inviteeCount && (
                          <p className="mt-1 text-xs text-rose-600">{errors.inviteeCount}</p>
                        )}
                      </div>
                    )}

                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasChildren}
                        onChange={(e) => setHasChildren(e.target.checked)}
                        className="mt-1 h-4 w-4 accent-[#0e7a6e]"
                      />
                      <span className="text-sm text-[#374151]">
                        Are you registering any children? (Included in participant count)
                      </span>
                    </label>
                    {hasChildren && (
                      <div className="pl-7">
                        <input
                          type="number"
                          min={1}
                          max={seats}
                          value={childCount}
                          onChange={(e) => {
                            setChildCount(Math.max(1, Number.parseInt(e.target.value, 10) || 1));
                            clearError('childCount');
                          }}
                          className="h-11 w-40 rounded-lg border border-[#d1d5db] bg-white px-3 text-sm text-[#111827] tabular-nums"
                          aria-label="Number of children"
                        />
                        {errors.childCount && (
                          <p className="mt-1 text-xs text-rose-600">{errors.childCount}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {step === 3 && (
            <>
              <div>
                <h2 className="h-card text-[#111827]">
                  {isGroup ? 'Group leader details' : 'Your contact details'}
                </h2>
                <p className="mt-1.5 text-sm text-[#4b5563]">
                  {isGroup
                    ? 'The person registering and paying for the group.'
                    : 'Your digital pass and check-in barcode will be linked to these details.'}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {!isGroup && (
                  <>
                    <div>
                      <label htmlFor="field-country" className="block text-sm font-medium text-[#111827] mb-1.5">
                        Country of residence
                      </label>
                      <select
                        id="field-country"
                        value={country}
                        onChange={(e) => handleCountryChange(e.target.value)}
                        className="h-13 w-full rounded-xl border border-[#d1d5db] bg-white px-4 text-sm text-[#111827] focus:border-[#0e7a6e] focus:outline-none"
                      >
                        {COUNTRIES.map((c) => (
                          <option key={c.name} value={c.name}>
                            {c.flag} {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="field-state" className="block text-sm font-medium text-[#111827] mb-1.5">
                        State / region {loadingStates ? '(Loading…)' : ''}
                      </label>
                      {stateOptions.length > 0 ? (
                        <select
                          id="field-state"
                          value={stateVal}
                          onChange={(e) => {
                            setStateVal(e.target.value);
                            clearError('state');
                          }}
                          className="h-13 w-full rounded-xl border border-[#d1d5db] bg-white px-4 text-sm text-[#111827] focus:border-[#0e7a6e] focus:outline-none"
                        >
                          <option value="">Select state / region</option>
                          {stateOptions.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          id="field-state"
                          type="text"
                          placeholder="Enter state or region"
                          value={stateVal}
                          onChange={(e) => {
                            setStateVal(e.target.value);
                            clearError('state');
                          }}
                          className="h-13 w-full rounded-xl border border-[#d1d5db] bg-white px-4 text-sm text-[#111827] focus:border-[#0e7a6e] focus:outline-none"
                        />
                      )}
                      {errors.state && (
                        <p className="mt-1.5 text-xs text-rose-600">{errors.state}</p>
                      )}
                    </div>
                  </>
                )}

                <div className="sm:col-span-2">
                  <label htmlFor="field-payerName" className="block text-sm font-medium text-[#111827] mb-1.5">
                    Full name
                  </label>
                  <input
                    id="field-payerName"
                    type="text"
                    autoComplete="name"
                    placeholder="Brother / Sister Full Name"
                    value={payerName}
                    onChange={(e) => {
                      setPayerName(e.target.value);
                      clearError('payerName');
                    }}
                    className="h-13 w-full rounded-xl border border-[#d1d5db] bg-white px-4 text-sm text-[#111827] placeholder:text-[#9ca3af] focus:border-[#0e7a6e] focus:outline-none"
                  />
                  {errors.payerName && (
                    <p className="mt-1.5 text-xs text-rose-600">{errors.payerName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="field-payerPhone" className="block text-sm font-medium text-[#111827] mb-1.5">
                    Phone number ({selectedCountryMeta.flag} {selectedCountryMeta.dial})
                  </label>
                  <input
                    id="field-payerPhone"
                    type="tel"
                    autoComplete="tel"
                    placeholder={`${selectedCountryMeta.dial} 801 234 5678`}
                    value={payerPhone}
                    onChange={(e) => {
                      setPayerPhone(e.target.value);
                      clearError('payerPhone');
                    }}
                    className="h-13 w-full rounded-xl border border-[#d1d5db] bg-white px-4 text-sm text-[#111827] placeholder:text-[#9ca3af] focus:border-[#0e7a6e] focus:outline-none"
                  />
                  {errors.payerPhone && (
                    <p className="mt-1.5 text-xs text-rose-600">{errors.payerPhone}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="field-payerEmail" className="block text-sm font-medium text-[#111827] mb-1.5">
                    Email address (for receipt)
                  </label>
                  <input
                    id="field-payerEmail"
                    type="email"
                    autoComplete="email"
                    placeholder="name@example.com"
                    value={payerEmail}
                    onChange={(e) => {
                      setPayerEmail(e.target.value);
                      clearError('payerEmail');
                    }}
                    className="h-13 w-full rounded-xl border border-[#d1d5db] bg-white px-4 text-sm text-[#111827] placeholder:text-[#9ca3af] focus:border-[#0e7a6e] focus:outline-none"
                  />
                  {errors.payerEmail && (
                    <p className="mt-1.5 text-xs text-rose-600">{errors.payerEmail}</p>
                  )}
                </div>
              </div>

              {!isGroup && (
                <div className="space-y-4 border-t border-[#e5e7eb] pt-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isMinor}
                      onChange={(e) => setIsMinor(e.target.checked)}
                      className="mt-1 h-4 w-4 accent-[#0e7a6e]"
                    />
                    <div>
                      <span className="text-sm font-medium text-[#111827]">
                        Participant is under 18 years of age
                      </span>
                      <p className="text-xs text-[#4b5563]">
                        A parent or guardian&apos;s details are needed.
                      </p>
                    </div>
                  </label>

                  {isMinor && (
                    <div className="grid gap-4 rounded-xl border border-[#d1d5db] bg-[#f9fafb] p-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="field-guardianName" className="block text-xs font-medium text-[#111827] mb-1.5">
                          Parent / guardian name
                        </label>
                        <input
                          id="field-guardianName"
                          type="text"
                          value={guardianName}
                          onChange={(e) => {
                            setGuardianName(e.target.value);
                            clearError('guardianName');
                          }}
                          className="h-12 w-full rounded-lg border border-[#d1d5db] bg-white px-3.5 text-sm text-[#111827] focus:border-[#0e7a6e] focus:outline-none"
                        />
                        {errors.guardianName && (
                          <p className="mt-1 text-xs text-rose-600">{errors.guardianName}</p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="field-guardianPhone" className="block text-xs font-medium text-[#111827] mb-1.5">
                          Parent / guardian phone
                        </label>
                        <input
                          id="field-guardianPhone"
                          type="tel"
                          value={guardianPhone}
                          onChange={(e) => {
                            setGuardianPhone(e.target.value);
                            clearError('guardianPhone');
                          }}
                          className="h-12 w-full rounded-lg border border-[#d1d5db] bg-white px-3.5 text-sm text-[#111827] focus:border-[#0e7a6e] focus:outline-none"
                        />
                        {errors.guardianPhone && (
                          <p className="mt-1 text-xs text-rose-600">{errors.guardianPhone}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {step === 4 && (
            <>
              <div>
                <h2 className="h-card text-[#111827]">
                  {isGroup ? 'How will the group attend?' : 'How will you attend?'}
                </h2>
                <p className="mt-1.5 text-sm text-[#4b5563]">
                  {isGroup
                    ? `Enter counts for each mode totaling ${seats} participants.`
                    : 'Select your attendance mode for IHGC 2026.'}
                </p>
              </div>

              {!isGroup ? (
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { val: 'physically' as const, label: 'Physically', icon: MapPin, sub: 'Kwali Campground' },
                    { val: 'online' as const, label: 'Online', icon: Globe, sub: 'Livestream' },
                    { val: 'not_sure' as const, label: 'Not sure yet', icon: HelpCircle, sub: 'Decide later' },
                  ].map((opt) => {
                    const Icon = opt.icon;
                    const active = attendanceMode === opt.val;
                    return (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() => setAttendanceMode(opt.val)}
                        className={`rounded-xl border p-4 text-left transition-colors cursor-pointer ${
                          active
                            ? 'border-[#0e7a6e] bg-[#eaf5f3]'
                            : 'border-[#e5e7eb] bg-white hover:border-[#0e7a6e]/40'
                        }`}
                      >
                        <Icon className="h-5 w-5 text-[#0e7a6e]" />
                        <p className="mt-2.5 text-sm font-medium text-[#111827]">{opt.label}</p>
                        <p className="text-xs text-[#4b5563]">{opt.sub}</p>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-3">
                    {(
                      [
                        ['physically', 'Physically'],
                        ['online', 'Online'],
                        ['not_sure', 'Not sure'],
                      ] as const
                    ).map(([key, label]) => (
                      <div key={key}>
                        <label className="block text-sm font-medium text-[#111827] mb-1.5">
                          {label}
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={seats}
                          value={groupAttendance[key]}
                          onChange={(e) => {
                            setGroupAttendance((prev) => ({
                              ...prev,
                              [key]: Math.max(0, Number.parseInt(e.target.value, 10) || 0),
                            }));
                            clearError('groupAttendance');
                          }}
                          className="h-13 w-full rounded-xl border border-[#d1d5db] bg-white px-4 text-sm text-[#111827] tabular-nums focus:border-[#0e7a6e] focus:outline-none"
                        />
                      </div>
                    ))}
                  </div>
                  {errors.groupAttendance && (
                    <p className="text-xs text-rose-600">{errors.groupAttendance}</p>
                  )}
                </div>
              )}
            </>
          )}

          {step === 5 && (
            <>
              <div>
                <h2 className="h-card text-[#111827]">Payment currency</h2>
                <p className="mt-1.5 text-sm text-[#4b5563]">
                  Choose the currency you want to pay in. Standard prices are per participant.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {(['NGN', 'USD', 'EUR', 'GBP'] as CurrencyCode[]).map((code) => {
                  const active = currency === code;
                  const unitMinor = config.pricesMinor[code];
                  return (
                    <button
                      key={code}
                      type="button"
                      disabled={!configLoaded}
                      onClick={() => {
                        setCurrency(code);
                        clearError('customNairaAmount');
                      }}
                      className={`rounded-xl border p-4 text-center transition-colors cursor-pointer ${
                        active
                          ? 'border-[#0e7a6e] bg-[#0e7a6e] text-white'
                          : 'border-[#d1d5db] bg-white text-[#111827] hover:border-[#0e7a6e]'
                      }`}
                    >
                      <p className="text-sm font-semibold">
                        {CURRENCY_META[code].flag} {code}
                      </p>
                      <p className={`mt-1 text-xs tabular-nums ${active ? 'text-white/85' : 'text-[#4b5563]'}`}>
                        {formatMoney(unitMinor, code)}
                      </p>
                    </button>
                  );
                })}
              </div>

              {currency === 'NGN' && (
                <div>
                  <label htmlFor="field-customNaira" className="block text-sm font-medium text-[#111827] mb-1.5">
                    Registration amount (NGN)
                  </label>
                  <div className="flex h-13 overflow-hidden rounded-xl border border-[#d1d5db] bg-white focus-within:border-[#0e7a6e]">
                    <span className="flex items-center border-r border-[#d1d5db] bg-[#f9fafb] px-4 text-sm font-semibold text-[#0e7a6e]">
                      ₦
                    </span>
                    {isGroup ? (
                      <div className="flex flex-1 items-center px-4 text-sm font-medium text-[#111827] tabular-nums">
                        {((standardUnitMinor * seats) / 100).toLocaleString('en-NG')} ({seats} × ₦5,000)
                      </div>
                    ) : (
                      <input
                        id="field-customNaira"
                        type="number"
                        min={2000}
                        step={100}
                        value={customNaira}
                        onChange={(e) => {
                          setCustomNaira(e.target.value);
                          clearError('customNairaAmount');
                        }}
                        className="flex-1 bg-transparent px-4 text-sm text-[#111827] tabular-nums focus:outline-none"
                      />
                    )}
                  </div>
                  <p className="mt-1.5 text-xs text-[#4b5563]">
                    {isGroup
                      ? 'Calculated automatically from the standard ₦5,000 rate per participant.'
                      : 'Standard registration is ₦5,000 (minimum accepted is ₦2,000).'}
                  </p>
                  {errors.customNairaAmount && (
                    <p className="mt-1 text-xs text-rose-600">{errors.customNairaAmount}</p>
                  )}
                </div>
              )}

              <div className="rounded-xl border border-[#e5e7eb] bg-[#f9fafb] p-4 flex items-center justify-between">
                <span className="text-sm text-[#4b5563]">
                  Total for {participantCount} participant{participantCount === 1 ? '' : 's'}
                </span>
                <span className="text-xl font-semibold text-[#0e7a6e] tabular-nums">
                  {totalMinor !== null ? formatMoney(totalMinor, currency) : '—'}
                </span>
              </div>
            </>
          )}

          {step === 6 && (
            <>
              <div>
                <h2 className="h-card text-[#111827]">Review &amp; proceed to payment</h2>
                <p className="mt-1.5 text-sm text-[#4b5563]">
                  Verify your details before proceeding to secure checkout.
                </p>
              </div>

              <dl className="divide-y divide-[#e5e7eb] rounded-xl border border-[#e5e7eb] bg-[#f9fafb] px-5 text-sm">
                <div className="flex justify-between gap-4 py-3.5">
                  <dt className="text-[#4b5563]">Category</dt>
                  <dd className="text-right font-medium text-[#111827]">
                    {isGroup ? `Group (${groupName} · ${seats} participants)` : `Individual (${gender === 'male' ? 'Brother' : 'Sister'})`}
                  </dd>
                </div>
                <div className="flex justify-between gap-4 py-3.5">
                  <dt className="text-[#4b5563]">Name</dt>
                  <dd className="text-right font-medium text-[#111827]">{payerName}</dd>
                </div>
                <div className="flex justify-between gap-4 py-3.5">
                  <dt className="text-[#4b5563]">Phone &amp; Email</dt>
                  <dd className="text-right font-medium text-[#111827]">
                    {payerPhone} · {payerEmail}
                  </dd>
                </div>
                <div className="flex justify-between gap-4 py-3.5">
                  <dt className="text-[#4b5563]">Location</dt>
                  <dd className="text-right font-medium text-[#111827]">
                    {stateVal ? `${stateVal}, ` : ''}{country}
                  </dd>
                </div>
                <div className="flex justify-between gap-4 py-3.5">
                  <dt className="text-[#4b5563]">Total Payable</dt>
                  <dd className="text-right text-base font-semibold text-[#0e7a6e] tabular-nums">
                    {totalMinor !== null ? formatMoney(totalMinor, currency) : '—'}
                  </dd>
                </div>
              </dl>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => {
                    setConsent(e.target.checked);
                    clearError('consent');
                  }}
                  className="mt-1 h-4 w-4 accent-[#0e7a6e]"
                />
                <span className="text-xs leading-relaxed text-[#4b5563]">
                  I confirm the registration details above are accurate and agree to the{' '}
                  <button
                    type="button"
                    onClick={() => onNavigate('/terms')}
                    className="font-medium text-[#0e7a6e] underline cursor-pointer"
                  >
                    Terms &amp; Refund Policy
                  </button>{' '}
                  and{' '}
                  <button
                    type="button"
                    onClick={() => onNavigate('/privacy')}
                    className="font-medium text-[#0e7a6e] underline cursor-pointer"
                  >
                    Privacy Notice
                  </button>
                  . Accommodation and meals are arranged independently.
                </span>
              </label>
              {errors.consent && <p className="text-xs text-rose-600">{errors.consent}</p>}

              {submitError && (
                <div
                  role="alert"
                  className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 space-y-3"
                >
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-700" />
                    <p>{submitError}</p>
                  </div>
                  {turnstileNotice && (
                    <div className="pt-1">
                      <p className="text-xs text-amber-800 mb-3">
                        Because Turnstile security verification is domain-bound to the official
                        checkout host, you can complete your payment directly on the official
                        HOREMOW checkout portal:
                      </p>
                      <a
                        href="https://register.horemow.com/register"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary !min-h-[42px] !text-sm"
                      >
                        <span>Complete Payment on register.horemow.com</span>
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          <div className="flex items-center justify-between border-t border-[#e5e7eb] pt-5">
            {step === 1 ? (
              <button
                type="button"
                onClick={() => onNavigate('/')}
                className="inline-flex items-center gap-2 text-sm font-medium text-[#4b5563] hover:text-[#111827] cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Home</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setStep((s) => Math.max(1, s - 1))}
                className="inline-flex items-center gap-2 text-sm font-medium text-[#4b5563] hover:text-[#111827] cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </button>
            )}

            {step < 6 ? (
              <button type="button" onClick={handleNext} className="btn btn-primary !min-h-[46px]">
                <span>Continue</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={submitting || !config.registrationOpen}
                className="btn btn-primary !min-h-[46px] disabled:opacity-50"
              >
                <Check className="h-4 w-4" />
                <span>{submitting ? 'Initializing Checkout…' : 'Proceed to Payment'}</span>
              </button>
            )}
          </div>
        </form>

        <div className="mt-5 flex items-center justify-center gap-2 text-xs text-[#6b7280]">
          <Lock className="h-3.5 w-3.5" />
          <span>Secure registration · Paystack (NGN) &amp; Flutterwave (USD/EUR/GBP)</span>
        </div>
      </div>
    </div>
  );
}
