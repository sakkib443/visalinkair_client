"use client";

// ===================================================================
// Visalink Air — Home
//
// Section order requested (2026-08-21):
//   1. Hero banner
//   2. About Us (right after the banner)
//   3. Services — sliding cards, each with a relevant image
//   4. Hajj / Umrah packages (same card as /hajj-umrah)
//   5. Testimonials
//   6. Contact CTA (sits just above the Footer)
//
// Everything below the hero is mobile-first. On small screens every
// grid collapses to a single column; nothing stacks on top of anything
// else. Animations are `framer-motion` fade-up on scroll — deliberately
// soft, no bouncy easing.
// ===================================================================

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import {
    LuArrowRight, LuBadgeCheck, LuUsers, LuAward, LuHeadphones,
    LuPlane, LuGraduationCap, LuBriefcase, LuBookOpen, LuBuilding,
    LuChevronRight, LuLoader,
} from "react-icons/lu";
import { FaKaaba, FaMosque, FaPassport, FaWhatsapp } from "react-icons/fa6";
import { FaWhatsapp as FaWA } from "react-icons/fa";
import Hero from "@/components/sections/Hero";
import Testimonials from "@/components/sections/Testimonials";
import PackageCard from "@/components/shared/PackageCard";
import PackageBookingModal from "@/components/shared/PackageBookingModal";
import { useLanguage } from "@/context/LanguageContext";
import { useSiteSettings, buildWhatsAppUrl } from "@/context/SiteSettingsContext";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const HEADING_FONT_EN = "Teko, sans-serif";
const HEADING_FONT_BN = "Hind Siliguri, sans-serif";

// ── Services (slider cards) — each carries a real image so no card
//    ever falls back to a plain-icon tile. Images intentionally match
//    the service subject.
const SERVICES = [
    {
        icon: LuPlane, href: "/flight",
        titleEn: "Air Ticket", titleBn: "এয়ার টিকেট",
        descEn: "Best fares on international & domestic flights, issued the same day.",
        descBn: "আন্তর্জাতিক ও অভ্যন্তরীণ ফ্লাইটে সেরা ভাড়া, একই দিনে ইস্যু।",
        image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&q=80&auto=format&fit=crop",
        accent: "#1D4ED8",
    },
    {
        icon: FaPassport, href: "/visa",
        titleEn: "Tourist Visa", titleBn: "ট্যুরিস্ট ভিসা",
        descEn: "End-to-end tourist visa assistance for 50+ countries from Bangladesh.",
        descBn: "বাংলাদেশ থেকে ৫০+ দেশের জন্য এন্ড-টু-এন্ড ট্যুরিস্ট ভিসা সহায়তা।",
        image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&q=80&auto=format&fit=crop",
        accent: "var(--color-brand-accent)",
    },
    {
        icon: LuGraduationCap, href: "/services/study-abroad",
        titleEn: "Study Abroad", titleBn: "বিদেশে পড়াশোনা",
        descEn: "University admission + student visa guidance for UK, Canada, Australia and more.",
        descBn: "যুক্তরাজ্য, কানাডা, অস্ট্রেলিয়াসহ বিদেশে ভর্তি ও স্টুডেন্ট ভিসা গাইডেন্স।",
        image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&q=80&auto=format&fit=crop",
        accent: "#7C3AED",
    },
    {
        icon: FaKaaba, href: "/hajj-umrah",
        titleEn: "Hajj & Umrah", titleBn: "হজ্জ ও উমরাহ",
        descEn: "Guided Hajj and Umrah packages with visa, hotel, transport & scholar support.",
        descBn: "ভিসা, হোটেল, পরিবহন ও আলেম সাপোর্টসহ গাইডেড হজ্জ ও উমরাহ প্যাকেজ।",
        image: "https://images.unsplash.com/photo-1519817650390-64a93db51149?w=1200&q=80&auto=format&fit=crop",
        accent: "#047857",
    },
    {
        icon: LuBookOpen, href: "/services/course",
        titleEn: "Training Course", titleBn: "ট্রেনিং কোর্স",
        descEn: "IELTS, spoken English, and travel-industry certifications by experts.",
        descBn: "বিশেষজ্ঞদের দ্বারা IELTS, স্পোকেন ইংরেজি ও ট্রাভেল-ইন্ডাস্ট্রি সার্টিফিকেশন।",
        image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200&q=80&auto=format&fit=crop",
        accent: "#DB2777",
    },
    {
        icon: FaPassport, href: "/services/passport-service",
        titleEn: "Passport", titleBn: "পাসপোর্ট",
        descEn: "New passport, renewal, re-issue — application filed on your behalf.",
        descBn: "নতুন পাসপোর্ট, রিনিউয়াল, রি-ইস্যু — আপনার হয়ে আবেদন পূরণ।",
        image: "https://images.unsplash.com/photo-1522199755839-a2bacb67c546?w=1200&q=80&auto=format&fit=crop",
        accent: "#4338CA",
    },
    {
        icon: LuBuilding, href: "/services/banking-support",
        titleEn: "Banking Support", titleBn: "ব্যাংকিং সাপোর্ট",
        descEn: "Bank statement, solvency certificate, endorsement & foreign exchange help.",
        descBn: "ব্যাংক স্টেটমেন্ট, সলভেন্সি সার্টিফিকেট, এন্ডোর্সমেন্ট ও বৈদেশিক মুদ্রা সহায়তা।",
        image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&q=80&auto=format&fit=crop",
        accent: "#0891B2",
    },
    {
        icon: LuBriefcase, href: "/services/career-opportunity",
        titleEn: "Career Opportunity", titleBn: "ক্যারিয়ার সুযোগ",
        descEn: "Overseas job placements with verified employers and full documentation support.",
        descBn: "যাচাইকৃত নিয়োগকর্তার সাথে বিদেশি চাকরি ও পূর্ণ ডকুমেন্টেশন সাপোর্ট।",
        image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&q=80&auto=format&fit=crop",
        accent: "#475569",
    },
];

// ── Fallback Hajj packages (used until admin publishes real ones)
const FALLBACK_HAJJ = [
    { _id: "fh1", name: "Economy Hajj", nameBn: "ইকোনমি হজ্জ", subtitle: "Essential Spiritual Journey", subtitleBn: "অপরিহার্য আধ্যাত্মিক যাত্রা", price: 4500, oldPrice: 5200, duration: "21 Days", durationBn: "২১ দিন", groupSize: 40, hotel: "3-Star Hotel", hotelBn: "৩-স্টার হোটেল", distance: "800m from Haram", distanceBn: "হারাম থেকে ৮০০ মিটার", features: ["Shared Room (4 persons)", "AC Bus", "Visa Processing", "Guided Rituals", "Makkah & Madinah Stay", "Basic Meals"], featuresBn: ["শেয়ার রুম (৪ জন)", "শীতাতপ নিয়ন্ত্রিত বাস", "ভিসা প্রসেসিং", "গাইডেড রিচুয়াল", "মক্কা ও মদিনা", "বেসিক খাবার"], type: "hajj" },
    { _id: "fh2", name: "Standard Hajj", nameBn: "স্ট্যান্ডার্ড হজ্জ", subtitle: "Comfortable Pilgrimage Experience", subtitleBn: "আরামদায়ক তীর্থযাত্রা অভিজ্ঞতা", price: 6500, oldPrice: 7500, duration: "25 Days", durationBn: "২৫ দিন", groupSize: 30, hotel: "4-Star Hotel", hotelBn: "৪-স্টার হোটেল", distance: "400m from Haram", distanceBn: "হারাম থেকে ৪০০ মিটার", features: ["Shared Room (2 persons)", "Private AC Transport", "Visa + Insurance", "Scholar Guidance", "Makkah & Madinah Stay", "Full Board Meals", "Ziyarah Tours", "Emergency Support"], featuresBn: ["শেয়ার রুম (২ জন)", "প্রাইভেট এসি ট্রান্সপোর্ট", "ভিসা + ইনসুরেন্স", "আলেমদের গাইডেন্স", "মক্কা ও মদিনা", "ফুল বোর্ড খাবার", "জিয়ারাহ ট্যুর", "জরুরি সাপোর্ট"], isPopular: true, type: "hajj" },
    { _id: "fh3", name: "Premium Hajj", nameBn: "প্রিমিয়াম হজ্জ", subtitle: "Luxury VIP Experience", subtitleBn: "বিলাসবহুল ভিআইপি অভিজ্ঞতা", price: 12000, oldPrice: 14000, duration: "30 Days", durationBn: "৩০ দিন", groupSize: 15, hotel: "5-Star Hotel", hotelBn: "৫-স্টার হোটেল", distance: "50m from Haram", distanceBn: "হারাম থেকে ৫০ মিটার", features: ["Private Room", "Luxury Transport", "VIP Visa Service", "Personal Scholar", "Haram View Room", "Gourmet Meals", "All Ziyarah Tours", "24/7 Concierge"], featuresBn: ["প্রাইভেট রুম", "বিলাসবহুল ট্রান্সপোর্ট", "ভিআইপি ভিসা সার্ভিস", "ব্যক্তিগত আলেম", "হারাম ভিউ রুম", "গুর্মে খাবার", "সব জিয়ারাহ ট্যুর", "২৪/৭ কনসিয়ার্জ"], type: "hajj" },
];

// ═══════════════════════════════════════════════════════════════
export default function HomePage() {
    const { language } = useLanguage();
    const { settings } = useSiteSettings();
    const isBn = language === "bn";
    const bnFont = isBn ? HEADING_FONT_BN : undefined;
    const headingFont = isBn ? HEADING_FONT_BN : HEADING_FONT_EN;
    const fontFamily = isBn ? HEADING_FONT_BN : "Poppins, sans-serif";

    const [homeData, setHomeData] = useState(null);
    const [hajjPackages, setHajjPackages] = useState([]);
    const [loadingHajj, setLoadingHajj] = useState(true);
    const [bookingModal, setBookingModal] = useState({ open: false, pkg: null });

    // Admin-controlled hero data (kept for the hero widget)
    useEffect(() => {
        fetch(`${API_BASE}/api/home-content`)
            .then((r) => r.json())
            .then((json) => {
                if (json.success && json.data) {
                    const map = {};
                    json.data.forEach((doc) => { map[doc.section] = doc.data; });
                    setHomeData(map);
                }
            })
            .catch(() => {});
    }, []);

    // Hajj packages — fetched once for the preview section
    useEffect(() => {
        fetch(`${API_BASE}/api/hajj-umrah/type/hajj`)
            .then((r) => r.json())
            .then((json) => {
                setHajjPackages(json.success && json.data?.length ? json.data : FALLBACK_HAJJ);
            })
            .catch(() => setHajjPackages(FALLBACK_HAJJ))
            .finally(() => setLoadingHajj(false));
    }, []);

    const wa = settings?.whatsappNumber;
    const waMessage = isBn ? "আমার ট্রাভেল/ভিসা সাহায্য দরকার" : "Hi, I need help with travel / visa";

    return (
        <div className="overflow-x-hidden bg-white">
            {/* ═══ 1. Hero banner ═══════════════════════════════ */}
            <Hero heroData={homeData?.hero} />

            {/* ═══ 2. About Us ══════════════════════════════════ */}
            <AboutSection isBn={isBn} bnFont={bnFont} headingFont={headingFont} fontFamily={fontFamily} />

            {/* ═══ 3. Services carousel ═════════════════════════ */}
            <ServicesCarousel isBn={isBn} bnFont={bnFont} headingFont={headingFont} fontFamily={fontFamily} />

            {/* ═══ 4. Hajj & Umrah packages ═════════════════════ */}
            <HajjPreview
                isBn={isBn}
                bnFont={bnFont}
                headingFont={headingFont}
                fontFamily={fontFamily}
                packages={hajjPackages.slice(0, 3)}
                loading={loadingHajj}
                onBook={(pkg) => setBookingModal({ open: true, pkg })}
                waNumber={wa}
            />

            {/* ═══ 5. Testimonials ══════════════════════════════ */}
            <Testimonials />

            {/* ═══ 6. Contact CTA (sits above the Footer) ══════ */}
            <ContactCTA
                isBn={isBn}
                bnFont={bnFont}
                headingFont={headingFont}
                fontFamily={fontFamily}
                whatsapp={wa}
                waMessage={waMessage}
            />

            {/* Package booking modal — shared with /hajj-umrah */}
            <PackageBookingModal
                isOpen={bookingModal.open}
                onClose={() => setBookingModal({ open: false, pkg: null })}
                pkg={bookingModal.pkg}
                packageType={bookingModal.pkg?.type || "hajj"}
            />
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   Reusable heading atoms
   ═══════════════════════════════════════════════════════════════ */
function Kicker({ text, bnFont, align = "center" }) {
    return (
        <div className={`flex items-center gap-3 mb-3 ${align === "center" ? "justify-center" : "justify-start"}`}>
            {align === "center" && <span className="h-[1px] w-8 bg-gradient-to-r from-transparent to-brand-accent" />}
            <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.25em] text-brand-accent" style={{ fontFamily: bnFont }}>
                {text}
            </span>
            {align === "center" && <span className="h-[1px] w-8 bg-gradient-to-l from-transparent to-brand-accent" />}
        </div>
    );
}

function SectionHeading({ title, subtitle, bnFont, headingFont }) {
    return (
        <div className="text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-brand-dark tracking-tight uppercase leading-tight" style={{ fontFamily: headingFont }}>
                {title}
            </h2>
            {subtitle && (
                <p className="mt-3 text-gray-500 max-w-2xl mx-auto text-sm sm:text-base" style={{ fontFamily: bnFont }}>
                    {subtitle}
                </p>
            )}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   2. About section
   Two-column on lg+, single stacked column below (image on top,
   text underneath) — the natural mobile reading order.
   ═══════════════════════════════════════════════════════════════ */
function AboutSection({ isBn, bnFont, headingFont, fontFamily }) {
    const stats = [
        { icon: LuUsers,       valEn: "15K+", valBn: "১৫হা+", labelEn: "Happy Clients",     labelBn: "সন্তুষ্ট ক্লায়েন্ট" },
        { icon: LuAward,       valEn: "98%",  valBn: "৯৮%",   labelEn: "Success Rate",       labelBn: "সফলতার হার" },
        { icon: LuBadgeCheck,  valEn: "50+",  valBn: "৫০+",   labelEn: "Countries Served",   labelBn: "সেবাদানকৃত দেশ" },
        { icon: LuHeadphones,  valEn: "24/7", valBn: "২৪/৭",  labelEn: "Live Support",       labelBn: "লাইভ সাপোর্ট" },
    ];

    return (
        <section className="max-w-6xl mx-auto px-5 sm:px-8 py-14 md:py-20 lg:py-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
                {/* Image column */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="relative order-1 lg:order-1"
                >
                    <div className="relative aspect-[4/5] sm:aspect-[16/11] lg:aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
                        <img
                            src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&q=80&auto=format&fit=crop"
                            alt=""
                            className="w-full h-full object-cover"
                            loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-tr from-brand-dark/40 via-transparent to-transparent" />
                    </div>
                    {/* Floating badge — hidden on smallest screens to avoid crowding */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="hidden sm:flex absolute -bottom-6 -right-4 lg:-right-8 bg-white rounded-2xl shadow-xl border border-gray-100 px-5 py-4 items-center gap-3 max-w-[240px]"
                    >
                        <div className="w-11 h-11 rounded-xl bg-[#FDCB1B] text-brand-dark flex items-center justify-center flex-shrink-0">
                            <LuBadgeCheck className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500" style={{ fontFamily: bnFont }}>
                                {isBn ? "যাচাইকৃত এজেন্সি" : "Certified Agency"}
                            </p>
                            <p className="text-[13px] font-bold text-brand-dark leading-tight mt-0.5" style={{ fontFamily: bnFont }}>
                                {isBn ? "IATA স্বীকৃত পার্টনার" : "IATA Accredited"}
                            </p>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Text column */}
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
                    className="order-2 lg:order-2"
                >
                    <Kicker text={isBn ? "আমাদের সম্পর্কে" : "About Visalink Air"} bnFont={bnFont} align="left" />
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-brand-dark tracking-tight uppercase leading-tight mb-5" style={{ fontFamily: headingFont }}>
                        {isBn
                            ? "আপনার বিশ্বস্ত ভ্রমণ ও ভিসা সঙ্গী"
                            : "Your trusted travel & visa partner"}
                    </h2>
                    <p className="text-gray-600 text-[15px] leading-relaxed mb-5" style={{ fontFamily }}>
                        {isBn
                            ? "Visalink Air বাংলাদেশের একটি IATA স্বীকৃত ট্রাভেল ও ভিসা প্রসেসিং এজেন্সি। এয়ার টিকেট, ট্যুরিস্ট ও স্টুডেন্ট ভিসা, হজ্জ ও উমরাহ, স্টাডি অ্যাব্রড এবং প্যাসপোর্ট সেবা — সব কিছু এক ছাদের নিচে।"
                            : "Visalink Air is an IATA-accredited travel and visa processing agency based in Dhaka. Air tickets, tourist and student visas, Hajj & Umrah, study abroad and passport support — every service you need to travel, under one roof."}
                    </p>
                    <p className="text-gray-600 text-[15px] leading-relaxed mb-7" style={{ fontFamily }}>
                        {isBn
                            ? "গত ১০ বছরে ১৫,০০০-এর বেশি গ্রাহক আমাদের সাথে ভ্রমণ করেছেন — ৯৮% ভিসা অনুমোদন হার এবং ২৪/৭ WhatsApp সাপোর্টে।"
                            : "For a decade we have helped 15,000+ travellers move across borders with a 98% visa approval rate and round-the-clock WhatsApp support."}
                    </p>

                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        {stats.map((s, i) => (
                            <motion.div
                                key={s.labelEn}
                                initial={{ opacity: 0, y: 12 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-80px" }}
                                transition={{ duration: 0.4, delay: 0.2 + i * 0.06 }}
                                className="rounded-xl border border-gray-100 bg-white p-4 flex items-center gap-3"
                            >
                                <div className="w-10 h-10 rounded-lg bg-brand-accent/10 text-brand-accent flex items-center justify-center flex-shrink-0">
                                    <s.icon className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xl font-black text-brand-dark leading-none" style={{ fontFamily: headingFont }}>
                                        {isBn ? s.valBn : s.valEn}
                                    </p>
                                    <p className="text-[11px] text-gray-500 mt-1 leading-tight" style={{ fontFamily: bnFont }}>
                                        {isBn ? s.labelBn : s.labelEn}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="mt-8 flex flex-wrap gap-3">
                        <Link
                            href="/about"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-brand-dark hover:bg-[#12123a] text-white text-sm font-bold transition-colors"
                            style={{ fontFamily: bnFont }}
                        >
                            {isBn ? "আরও জানুন" : "Learn more"} <LuArrowRight size={14} />
                        </Link>
                        <Link
                            href="/contact"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-gray-200 hover:border-brand-dark text-brand-dark text-sm font-bold transition-colors"
                            style={{ fontFamily: bnFont }}
                        >
                            {isBn ? "যোগাযোগ" : "Contact us"}
                        </Link>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

/* ═══════════════════════════════════════════════════════════════
   3. Services carousel
   Swiper with responsive slidesPerView so at every breakpoint one
   card doesn't cover another. Autoplay pauses on hover / focus.
   ═══════════════════════════════════════════════════════════════ */
function ServicesCarousel({ isBn, bnFont, headingFont, fontFamily }) {
    return (
        <section className="relative py-14 md:py-20 lg:py-24 bg-gradient-to-b from-[#F8FAFC] via-white to-[#F8FAFC]">
            <div className="max-w-6xl mx-auto px-5 sm:px-8">
                <Kicker text={isBn ? "যা আমরা করি" : "What we do"} bnFont={bnFont} />
                <SectionHeading
                    title={isBn ? "আমাদের সেবাসমূহ" : "Our Services"}
                    subtitle={isBn ? "একটি ছাদের নিচে সব ভ্রমণ ও ভিসা সেবা" : "Every travel and visa service under one roof"}
                    bnFont={bnFont}
                    headingFont={headingFont}
                />
            </div>

            <div className="mt-10 md:mt-12 relative">
                <Swiper
                    modules={[Autoplay, Pagination, Navigation]}
                    spaceBetween={20}
                    slidesPerView={1.15}
                    centeredSlides={false}
                    loop
                    autoplay={{ delay: 3800, disableOnInteraction: false, pauseOnMouseEnter: true }}
                    pagination={{ clickable: true, el: ".services-pagination" }}
                    navigation={{ nextEl: ".services-next", prevEl: ".services-prev" }}
                    breakpoints={{
                        480: { slidesPerView: 1.4, spaceBetween: 20 },
                        640: { slidesPerView: 2.2, spaceBetween: 22 },
                        900: { slidesPerView: 3, spaceBetween: 24 },
                        1200: { slidesPerView: 3.5, spaceBetween: 26 },
                    }}
                    className="!px-5 sm:!px-8 lg:!px-16 !pb-14"
                >
                    {SERVICES.map((s) => (
                        <SwiperSlide key={s.href} className="!h-auto">
                            <ServiceCard s={s} isBn={isBn} bnFont={bnFont} headingFont={headingFont} fontFamily={fontFamily} />
                        </SwiperSlide>
                    ))}
                </Swiper>

                {/* Controls */}
                <div className="max-w-6xl mx-auto px-5 sm:px-8 flex items-center justify-center gap-4">
                    <button
                        type="button"
                        className="services-prev group w-10 h-10 rounded-full bg-white border border-gray-200 hover:border-brand-dark hover:bg-brand-dark flex items-center justify-center transition-all"
                        aria-label="Previous"
                    >
                        <LuChevronRight className="w-4 h-4 text-gray-600 group-hover:text-white rotate-180" />
                    </button>
                    <div className="services-pagination flex items-center gap-1.5 [&_.swiper-pagination-bullet]:!bg-gray-300 [&_.swiper-pagination-bullet-active]:!bg-brand-dark" />
                    <button
                        type="button"
                        className="services-next group w-10 h-10 rounded-full bg-white border border-gray-200 hover:border-brand-dark hover:bg-brand-dark flex items-center justify-center transition-all"
                        aria-label="Next"
                    >
                        <LuChevronRight className="w-4 h-4 text-gray-600 group-hover:text-white" />
                    </button>
                </div>
            </div>
        </section>
    );
}

function ServiceCard({ s, isBn, bnFont, headingFont, fontFamily }) {
    const Icon = s.icon;
    return (
        <Link
            href={s.href}
            className="group block h-full rounded-2xl overflow-hidden bg-white border border-gray-100 hover:border-transparent hover:shadow-2xl hover:-translate-y-1 transition-all"
        >
            <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                <img
                    src={s.image}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div
                    className="absolute top-4 left-4 w-11 h-11 rounded-xl flex items-center justify-center shadow-lg"
                    style={{ backgroundColor: s.accent }}
                >
                    <Icon className="w-5 h-5 text-white" />
                </div>
                <h3
                    className="absolute inset-x-4 bottom-3 text-white text-xl md:text-2xl font-black tracking-tight leading-tight"
                    style={{ fontFamily: headingFont }}
                >
                    {isBn ? s.titleBn : s.titleEn}
                </h3>
            </div>
            <div className="p-5 md:p-6">
                <p className="text-[13.5px] text-gray-600 leading-relaxed min-h-[4rem]" style={{ fontFamily }}>
                    {isBn ? s.descBn : s.descEn}
                </p>
                <span
                    className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider"
                    style={{ color: s.accent, fontFamily: bnFont }}
                >
                    {isBn ? "বিস্তারিত" : "Learn more"} <LuArrowRight size={12} />
                </span>
            </div>
        </Link>
    );
}

/* ═══════════════════════════════════════════════════════════════
   4. Hajj / Umrah preview — same card design as /hajj-umrah
   ═══════════════════════════════════════════════════════════════ */
function HajjPreview({ isBn, bnFont, headingFont, fontFamily, packages, loading, onBook, waNumber }) {
    return (
        <section className="max-w-6xl mx-auto px-5 sm:px-8 py-14 md:py-20 lg:py-24">
            <Kicker text={isBn ? "হজ্জ ও ওমরাহ" : "Hajj & Umrah"} bnFont={bnFont} />
            <SectionHeading
                title={isBn ? "আপনার পবিত্র যাত্রা বেছে নিন" : "Choose your sacred journey"}
                subtitle={isBn ? "গাইডেড হজ্জ ও ওমরাহ প্যাকেজ — ভিসা, হোটেল ও আলেম সাপোর্টসহ" : "Guided Hajj and Umrah packages — visa, hotel and scholar support included"}
                bnFont={bnFont}
                headingFont={headingFont}
            />

            {loading ? (
                <div className="py-20 flex items-center justify-center">
                    <LuLoader className="w-7 h-7 text-emerald-600 animate-spin" />
                </div>
            ) : packages.length === 0 ? (
                <div className="py-16 text-center text-gray-500" style={{ fontFamily }}>
                    {isBn ? "কোনো প্যাকেজ পাওয়া যায়নি" : "No packages available yet"}
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.5 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 mt-10 md:mt-12"
                >
                    {packages.map((pkg, i) => (
                        <PackageCard
                            key={pkg._id || i}
                            pkg={pkg}
                            isBn={isBn}
                            fontFamily={fontFamily}
                            headingFont={headingFont}
                            onBook={() => onBook(pkg)}
                            onWhatsApp={waNumber
                                ? buildWhatsAppUrl(waNumber, `${isBn ? pkg.nameBn || pkg.name : pkg.name} — ${isBn ? "সম্পর্কে জানতে চাই" : "please share details"}`)
                                : null}
                        />
                    ))}
                </motion.div>
            )}

            <div className="mt-10 text-center">
                <Link
                    href="/hajj-umrah"
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-bold transition-colors"
                    style={{ fontFamily: bnFont }}
                >
                    {isBn ? "সব প্যাকেজ দেখুন" : "View all packages"} <LuArrowRight size={14} />
                </Link>
            </div>
        </section>
    );
}

/* ═══════════════════════════════════════════════════════════════
   6. Contact CTA — sits above the Footer
   ═══════════════════════════════════════════════════════════════ */
function ContactCTA({ isBn, bnFont, headingFont, fontFamily, whatsapp, waMessage }) {
    return (
        <section className="max-w-6xl mx-auto px-5 sm:px-8 py-14 md:py-20">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative rounded-3xl p-8 sm:p-10 md:p-14 overflow-hidden text-white"
                style={{ background: "linear-gradient(135deg, var(--color-brand-dark) 0%, #2d2e78 55%, var(--color-brand-accent) 140%)" }}
            >
                <div
                    aria-hidden
                    className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: "radial-gradient(circle at 25% 30%, #fff 2px, transparent 2px)",
                        backgroundSize: "40px 40px",
                    }}
                />
                <div className="relative grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-8 items-center">
                    <div>
                        <span className="inline-block px-3 py-1 rounded-full bg-[#FDCB1B]/25 text-[#FDCB1B] text-[11px] font-bold uppercase tracking-widest mb-3" style={{ fontFamily: bnFont }}>
                            {isBn ? "প্রস্তুত?" : "Ready?"}
                        </span>
                        <h3 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight uppercase mb-3 leading-tight" style={{ fontFamily: headingFont }}>
                            {isBn ? "চলুন আপনার পরবর্তী গন্তব্য প্ল্যান করি" : "Let's plan your next journey"}
                        </h3>
                        <p className="text-white/85 max-w-xl leading-relaxed text-sm sm:text-base" style={{ fontFamily }}>
                            {isBn
                                ? "আজই যোগাযোগ করুন — আমাদের এক্সপার্ট ২৪ ঘণ্টার মধ্যে আপনার জন্য একটি কাস্টম প্ল্যান তৈরি করে দেবে।"
                                : "Reach out today — our specialist will reply within 24 hours with a plan tailored to you."}
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:items-end">
                        <Link
                            href="/contact"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-lg bg-[#FDCB1B] hover:bg-[#F0BB00] text-brand-dark font-bold transition-all"
                            style={{ fontFamily: bnFont }}
                        >
                            {isBn ? "যোগাযোগ করুন" : "Contact us"} <LuArrowRight size={16} />
                        </Link>
                        {whatsapp && (
                            <a
                                href={buildWhatsAppUrl(whatsapp, waMessage)}
                                target="_blank" rel="noopener noreferrer"
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-lg bg-whatsapp hover:bg-whatsapp-hover text-white font-bold transition-all"
                                style={{ fontFamily: bnFont }}
                            >
                                <FaWA size={18} /> WhatsApp
                            </a>
                        )}
                    </div>
                </div>
            </motion.div>
        </section>
    );
}
