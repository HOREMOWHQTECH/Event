import { SITE_CONFIG } from "@/config/site";

export interface SessionItem {
  time: string;
  category: string;
  title: string;
}

export interface ProgrammeDay {
  date: string;
  dayLabel: string;
  shortLabel: string;
  theme: string;
  sessions: SessionItem[];
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface GalleryPhoto {
  src: string;
  alt: string;
  caption: string;
  tag: string;
}

export interface MinisterProfile {
  name: string;
  role: string;
  bio: string;
  image: string;
  alt: string;
}

export const CONFERENCE_INFO = {
  shortCode: "IHC26",
  title: SITE_CONFIG.eventTitle,
  shortTitle: SITE_CONFIG.name,
  ministryName: SITE_CONFIG.about.fullName,
  ministryAcronym: SITE_CONFIG.about.acronym,
  dates: "December 8–11, 2026",
  datesNumeric: "8 – 11 Dec 2026",
  openingDate: "Tuesday, December 8, at 4:00 PM WAT",
  openingIso: SITE_CONFIG.startsAt,
  theme: SITE_CONFIG.theme.toUpperCase() + ".",
  themeTitleCase: SITE_CONFIG.theme,
  venue: `${SITE_CONFIG.venue.name}, Behind FGC, Kwali, Abuja, Nigeria`,
  venueShort: "Holiness Campground, Kwali, Abuja",
  landmark:
    "Behind Federal Government College (FGC), Kwali, along the Abuja–Lokoja Expressway.",
  feeSummary: "₦5,000 / $20 / €20 / £20 per participant",
  feeBreakdown:
    "Registration is a flat rate of ₦5,000 for Nigeria participants, or $20 USD / €20 EUR / £20 GBP for international participants.",
  lodgingNotice:
    "Accommodation and meals are not included. Participants must arrange their own accommodation and food.",
  contact: {
    phone: SITE_CONFIG.contact.phone,
    phoneTel: SITE_CONFIG.contact.phoneTel,
    whatsAppUrl: SITE_CONFIG.contact.whatsAppUrl,
    youtube: SITE_CONFIG.socials.youtube,
    facebook: SITE_CONFIG.socials.facebook,
    x: SITE_CONFIG.socials.x,
  },
  assets: {
    logo: SITE_CONFIG.logo.src,
    flyer: "/images/conference_flyer.png",
    timetable: "/images/conference_programme.jpeg",
    campground: "/images/campground.jpg",
    about: "/images/about_us_1.jpg",
  },
};

export const MINISTERS: MinisterProfile[] = SITE_CONFIG.ministersInitial.map((m) => ({
  name: m.name,
  role:
    m.id === "paul-rika"
      ? "International Director, Holiness Revival Movement Worldwide"
      : "Evangelist & Revival Minister, HOREMOW",
  bio: m.bio,
  image: m.image,
  alt:
    m.id === "paul-rika"
      ? "Pastor Paul Rika preaching at the pulpit"
      : "Evang. Linda Paul Rika ministering at the pulpit",
}));

export const PROGRAMME_DAYS: ProgrammeDay[] = [
  {
    date: "2026-12-08",
    dayLabel: "Tuesday, 8th Dec",
    shortLabel: "Tue 8 Dec",
    theme: "Welcome & Opening Revival",
    sessions: [
      {
        time: "4:00 PM – 4:30 PM",
        category: "Arrival & Registration",
        title: "Welcome To Int'l Holiness General Conference, 2026",
      },
      {
        time: "4:30 PM – 6:00 PM",
        category: "Book Review",
        title: "HOREMOW Ministry Celebrated At The Birthday Of The International Director",
      },
      {
        time: "6:15 PM – 7:00 PM",
        category: "Prayer Session",
        title: "Having the Best of The Conference",
      },
      {
        time: "7:30 PM – 9:00 PM",
        category: "Revival Message",
        title: "Jesus The Way, The Truth And The Life",
      },
    ],
  },
  {
    date: "2026-12-09",
    dayLabel: "Wednesday, 9th Dec",
    shortLabel: "Wed 9 Dec",
    theme: "Spiritual Warfare & Godly Righteousness",
    sessions: [
      {
        time: "6:45 AM – 7:45 AM",
        category: "Morning Warfare",
        title: "Understanding The Scriptures On Satanic Bondage",
      },
      {
        time: "8:00 AM – 9:30 AM",
        category: "Morning Message",
        title: "Turning From Idols, Demons, And Charms To Jesus And Righteousness",
      },
      {
        time: "10:45 AM – 12:15 PM",
        category: "Morning Teaching",
        title: "The Christian Religion",
      },
      {
        time: "12:30 PM – 2:00 PM",
        category: "Afternoon Varieties",
        title: "Group Prayers And Warfare",
      },
      {
        time: "4:30 PM – 6:00 PM",
        category: "Book Review",
        title: "Instructions To Women On Godly Living With Any Kind Of Husband",
      },
      {
        time: "6:15 PM – 7:00 PM",
        category: "Prayer Session",
        title: "God's Grace Upon Marriages",
      },
      {
        time: "7:30 PM – 9:00 PM",
        category: "Revival Message",
        title: "The Way The Lord Ministers To Me In Prophecies And Revelations",
      },
    ],
  },
  {
    date: "2026-12-10",
    dayLabel: "Thursday, 10th Dec",
    shortLabel: "Thu 10 Dec",
    theme: "Victory Through Christ Over Darkness",
    sessions: [
      {
        time: "6:45 AM – 7:45 AM",
        category: "Morning Warfare",
        title: "Let's Bind The Strong Man To Set People Free",
      },
      {
        time: "8:00 AM – 9:30 AM",
        category: "Morning Message",
        title: "At The Name Of Jesus, Every Power Must Bow",
      },
      {
        time: "10:45 AM – 12:15 PM",
        category: "Morning Teaching",
        title: "The Religion Of Darkness",
      },
      {
        time: "12:30 PM – 2:00 PM",
        category: "Afternoon Varieties",
        title: "Contending With The Spirit Of Oppression, Witchcraft And Backsliding",
      },
      {
        time: "4:30 PM – 6:00 PM",
        category: "Book Review",
        title: "Understanding Witchcrafts And Their Activities In The Church",
      },
      {
        time: "6:15 PM – 7:00 PM",
        category: "Prayer Session",
        title: "Cleansing The Church Of Witchcrafts And Satanism",
      },
      {
        time: "7:30 PM – 9:00 PM",
        category: "Revival Message",
        title: "The Victory Of Christ Kingdom Over Satan's Kingdom",
      },
    ],
  },
  {
    date: "2026-12-11",
    dayLabel: "Friday, 11th Dec",
    shortLabel: "Fri 11 Dec",
    theme: "Deliverance, Praise & The Lord's Supper",
    sessions: [
      {
        time: "6:45 AM – 7:45 AM",
        category: "Morning Warfare",
        title: "Whatever We Loose On Earth Shall Be Loose In Heaven",
      },
      {
        time: "8:00 AM – 9:30 AM",
        category: "Morning Message",
        title: "The Doctrine And Activities Of False Exorcist",
      },
      {
        time: "10:45 AM – 12:15 PM",
        category: "Morning Teaching",
        title: "The Religion of Ishmaelites",
      },
      {
        time: "12:30 PM – 2:00 PM",
        category: "Afternoon Varieties",
        title: "Testimonies Of God's Power, Goodness And Mercy",
      },
      {
        time: "4:30 PM – 6:00 PM",
        category: "Book Review",
        title: "Question And Answer",
      },
      {
        time: "6:15 PM – 7:00 PM",
        category: "Prayer Session",
        title: "Thanksgiving, Praise And Worship",
      },
      {
        time: "7:30 PM – 9:00 PM",
        category: "Revival Message",
        title: "Partaking In The Lord's Supper",
      },
    ],
  },
];

export const GALLERY_PHOTOS: GalleryPhoto[] = [
  {
    src: "/gallery/pastor-paul-rika-on-pulpit.jpg",
    alt: "Pastor Paul Rika preaching at the pulpit",
    caption: "Pastor Paul Rika ministering the Word of holiness at the pulpit",
    tag: "Ministration",
  },
  {
    src: "/gallery/crowed-sitted.jpg",
    alt: "Conference congregation seated together",
    caption: "Believers gathered in expectation at Holiness Campground, Kwali",
    tag: "Congregation",
  },
  {
    src: "/gallery/water-baptism.jpg",
    alt: "Water baptism during the conference",
    caption: "Water baptism service during the General Conference",
    tag: "Ordinance",
  },
  {
    src: "/gallery/altar-call-scene.jpg",
    alt: "Altar call scene at the conference",
    caption: "Souls responding at the altar call in repentance and consecration",
    tag: "Altar Call",
  },
  {
    src: "/gallery/mummy-linda-standing-on-pulpit.jpg",
    alt: "Evang. Linda Paul Rika standing at the pulpit",
    caption: "Evang. Linda Paul Rika exhorting the church to inward and outward holiness",
    tag: "Ministration",
  },
  {
    src: "/gallery/book-review-during-conference.jpg",
    alt: "Book review during the conference",
    caption: "Interactive holiness literature & book review session",
    tag: "Literature",
  },
  {
    src: "/gallery/pastor-paul-rika-praying.jpg",
    alt: "Pastor Paul Rika praying",
    caption: "Fervent intercession and warfare prayer for the nations",
    tag: "Intercession",
  },
  {
    src: "/gallery/pastor-paul-rika-sitting.jpg",
    alt: "Pastor Paul Rika seated at the conference",
    caption: "Pastor Paul Rika during a conference teaching session",
    tag: "Conference",
  },
];

export const FAQ_ITEMS: FaqItem[] = [
  {
    q: "How much is the conference registration fee?",
    a: "Registration is a flat rate of ₦5,000 for Nigeria participants, or $20 USD / €20 EUR / £20 GBP for international participants. There are no category differences; the same flat price applies to all participants.",
  },
  {
    q: "Are accommodation and meals included in the registration fee?",
    a: "No. Accommodation and meals are not included. Participants must arrange their own accommodation and food. The organizers have not provided lodging or meal details.",
  },
  {
    q: "Can I register a whole group, family, or chapter/zone together?",
    a: "Yes! You can choose 'Group Registration'. You can pay for all members in a single payment and either fill in their details immediately or share an invite link so members can claim their places themselves. The group order also receives an express group QR code for fast gate check-in.",
  },
  {
    q: "Do I need an email address to register?",
    a: "A valid email address is required so Paystack can send your payment receipt. Your phone number and unique reference code (HGC-XXXXXX) are also needed if you need to recover your ticket.",
  },
  {
    q: "How do I receive my ticket and QR code?",
    a: "After payment is confirmed, your ticket and QR code are available on screen. Keep that page or your reference code available. SMS delivery is also attempted; use the ticket recovery page if you need help.",
  },
  {
    q: "What if money was deducted from my account but I didn't see my ticket?",
    a: "Do not pay again immediately. Use the ticket recovery page with your reference code, phone number, or email. The system checks the payment provider and returns a generic response while any matching paid ticket is retried.",
  },
  {
    q: "What is the refund and cancellation policy?",
    a: "The interim refund and substitution policy is still a draft pending organizer review. Read the Terms & Refund Policy (Draft) page for the current draft.",
  },
  {
    q: "When does the conference start and when does registration close?",
    a: "The conference opens on Tuesday, 8 December 2026 at 4:00 PM WAT and runs through Friday, 11 December 2026. Online registration closes on 11 December 2026 at 23:59 WAT.",
  },
  {
    q: "Will the check-in scanner work if network is down at Kwali Campground?",
    a: "Yes. Our check-in scanner PWA is engineered offline-first with Ed25519 cryptographic signatures. Gate attendants can validate paid tickets and record attendance even without an active cellular network.",
  },
];

export const ABOUT_PILLARS = [
  {
    index: "01",
    title: "Revivals & Conferences",
    description:
      "HOREMOW organizes revival meetings, international crusades, leadership conferences, ministers' conferences, and Bible training colleges across the globe.",
  },
  {
    index: "02",
    title: "Literature & Multilingual Media",
    description:
      "Heavily promotes evangelism through the distribution of holiness books, sermons, tracts, and multilingual audio/video resources authored by Pastor Paul Rika.",
  },
  {
    index: "03",
    title: "International Chapters",
    description:
      "Beyond Nigeria, HOREMOW has established chapters across Africa (including Uganda, Kenya, Rwanda, Malawi, Zambia, Liberia), North America, Europe, and Asia.",
  },
];
