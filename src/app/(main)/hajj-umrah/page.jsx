"use client";

// ===================================================================
// Visalink Air — Hajj & Umrah (Gozayaan-style, mobile-first)
//   Hero → trust strip → Hajj/Umrah tab picker → package grid →
//   inquiry form → how it works → why us → FAQ → bottom CTA.
// Packages come from the CMS admin dashboard.
// ===================================================================

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PackageBookingModal from "@/components/shared/PackageBookingModal";
import PackageCard from "@/components/shared/PackageCard";
import {
    LuHotel, LuUsers, LuCalendar, LuMapPin, LuCheck, LuLoader,
    LuArrowRight, LuChevronRight, LuBadgeCheck, LuHeadphones, LuShieldCheck, LuStar,
} from "react-icons/lu";
import { FaKaaba, FaMosque } from "react-icons/fa6";
import { FaWhatsapp } from "react-icons/fa";
import { useLanguage } from "@/context/LanguageContext";
import { useSiteSettings, buildWhatsAppUrl } from "@/context/SiteSettingsContext";
import InquiryForm from "@/components/inquiry/InquiryForm";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ── Fallbacks — used only if the admin hasn't seeded any yet ────
const fallbackHajj = [
    { _id: "fh1", name: "Economy Hajj", nameBn: "ইকোনমি হজ্জ", subtitle: "Essential Spiritual Journey", subtitleBn: "অপরিহার্য আধ্যাত্মিক যাত্রা", price: 4500, oldPrice: 5200, duration: "21 Days", durationBn: "২১ দিন", groupSize: 40, hotel: "3-Star Hotel", hotelBn: "৩-স্টার হোটেল", distance: "800m from Haram", distanceBn: "হারাম থেকে ৮০০ মিটার", features: ["Shared Room (4 persons)", "Air-conditioned Bus", "Visa Processing", "Guided Rituals", "Makkah & Madinah Stay", "Basic Meals Included"], featuresBn: ["শেয়ার রুম (৪ জন)", "শীতাতপ নিয়ন্ত্রিত বাস", "ভিসা প্রসেসিং", "গাইডেড রিচুয়াল", "মক্কা ও মদিনা থাকা", "বেসিক খাবার অন্তর্ভুক্ত"], isPopular: false, type: "hajj" },
    { _id: "fh2", name: "Standard Hajj", nameBn: "স্ট্যান্ডার্ড হজ্জ", subtitle: "Comfortable Pilgrimage Experience", subtitleBn: "আরামদায়ক তীর্থযাত্রা অভিজ্ঞতা", price: 6500, oldPrice: 7500, duration: "25 Days", durationBn: "২৫ দিন", groupSize: 30, hotel: "4-Star Hotel", hotelBn: "৪-স্টার হোটেল", distance: "400m from Haram", distanceBn: "হারাম থেকে ৪০০ মিটার", features: ["Shared Room (2 persons)", "Private AC Transport", "Visa + Insurance", "Scholar Guidance", "Makkah & Madinah Stay", "Full Board Meals", "Ziyarah Tours", "Emergency Support"], featuresBn: ["শেয়ার রুম (২ জন)", "প্রাইভেট এসি ট্রান্সপোর্ট", "ভিসা + ইনসুরেন্স", "আলেমদের গাইডেন্স", "মক্কা ও মদিনা থাকা", "ফুল বোর্ড খাবার", "জিয়ারাহ ট্যুর", "জরুরি সাপোর্ট"], isPopular: true, type: "hajj" },
    { _id: "fh3", name: "Premium Hajj", nameBn: "প্রিমিয়াম হজ্জ", subtitle: "Luxury VIP Experience", subtitleBn: "বিলাসবহুল ভিআইপি অভিজ্ঞতা", price: 12000, oldPrice: 14000, duration: "30 Days", durationBn: "৩০ দিন", groupSize: 15, hotel: "5-Star Hotel", hotelBn: "৫-স্টার হোটেল", distance: "50m from Haram", distanceBn: "হারাম থেকে ৫০ মিটার", features: ["Private Room", "Luxury Transport", "VIP Visa Service", "Personal Scholar", "Haram View Room", "Gourmet Meals", "All Ziyarah Tours", "24/7 Concierge", "Laundry Service", "Medical Support"], featuresBn: ["প্রাইভেট রুম", "বিলাসবহুল ট্রান্সপোর্ট", "ভিআইপি ভিসা সার্ভিস", "ব্যক্তিগত আলেম", "হারাম ভিউ রুম", "গুর্মে খাবার", "সব জিয়ারাহ ট্যুর", "২৪/৭ কনসিয়ার্জ", "লন্ড্রি সার্ভিস", "মেডিকেল সাপোর্ট"], isPopular: false, type: "hajj" },
];
const fallbackUmrah = [
    { _id: "fu1", name: "7-Day Umrah",  nameBn: "৭-দিনের ওমরাহ",  price: 1200, duration: "7 Days",  durationBn: "৭ দিন",  hotel: "3-Star", hotelBn: "৩-স্টার", subtitle: "Short & spiritually fulfilling",  subtitleBn: "সংক্ষিপ্ত ও পূর্ণ ওমরাহ",       features: ["Visa Processing", "Return Flights", "Hotel", "Airport Transfers", "Guided Umrah"], featuresBn: ["ভিসা প্রসেসিং", "রিটার্ন ফ্লাইট", "হোটেল", "এয়ারপোর্ট ট্রান্সফার", "গাইডেড ওমরাহ"], type: "umrah" },
    { _id: "fu2", name: "10-Day Umrah", nameBn: "১০-দিনের ওমরাহ", price: 1800, duration: "10 Days", durationBn: "১০ দিন", hotel: "4-Star", hotelBn: "৪-স্টার", subtitle: "Extended stay near Haram",           subtitleBn: "হারামের কাছে দীর্ঘ থাকা",       features: ["Visa Processing", "Return Flights", "4-Star Hotel", "Full Board Meals", "Guided Umrah", "Ziyarah Tours"], featuresBn: ["ভিসা প্রসেসিং", "রিটার্ন ফ্লাইট", "৪-স্টার হোটেল", "ফুল বোর্ড খাবার", "গাইডেড ওমরাহ", "জিয়ারাহ ট্যুর"], type: "umrah", isPopular: true },
    { _id: "fu3", name: "14-Day Umrah", nameBn: "১৪-দিনের ওমরাহ", price: 2500, duration: "14 Days", durationBn: "১৪ দিন", hotel: "4-Star", hotelBn: "৪-স্টার", subtitle: "Comprehensive with both cities",     subtitleBn: "দুই শহরে ব্যাপক ওমরাহ",         features: ["Visa Processing", "Return Flights", "4-Star Hotel", "Full Board Meals", "Guided Umrah", "All Ziyarah", "Private Transport"], featuresBn: ["ভিসা প্রসেসিং", "রিটার্ন ফ্লাইট", "৪-স্টার হোটেল", "ফুল বোর্ড খাবার", "গাইডেড ওমরাহ", "সব জিয়ারাহ", "প্রাইভেট ট্রান্সপোর্ট"], type: "umrah" },
    { _id: "fu4", name: "Ramadan Umrah",nameBn: "রমজান ওমরাহ",    price: 3200, duration: "15 Days", durationBn: "১৫ দিন", hotel: "5-Star", hotelBn: "৫-স্টার", subtitle: "Ramadan in the holy cities",          subtitleBn: "পবিত্র শহরে রমজান",             features: ["Visa Processing", "Return Flights", "5-Star Hotel", "Iftar & Suhoor", "Premium Guided Umrah", "All Ziyarah", "Private Transport", "Laundry"], featuresBn: ["ভিসা প্রসেসিং", "রিটার্ন ফ্লাইট", "৫-স্টার হোটেল", "ইফতার ও সেহরি", "প্রিমিয়াম গাইডেড ওমরাহ", "সব জিয়ারাহ", "প্রাইভেট ট্রান্সপোর্ট", "লন্ড্রি"], type: "umrah" },
];

const FAQ = [
    { qEn: "When is the best time to book Hajj?", qBn: "হজ্জ কবে বুক করা ভালো?",
      aEn: "6–8 months before departure is ideal — quotas fill up fast, and early booking often saves 10-15%.",
      aBn: "যাত্রার ৬-৮ মাস আগে বুক করা ভালো — কোটা দ্রুত পূরণ হয় এবং আগে বুক করলে ১০-১৫% সাশ্রয় হয়।" },
    { qEn: "Does the package include Saudi visa & travel insurance?", qBn: "প্যাকেজে সৌদি ভিসা ও ট্রাভেল ইনসুরেন্স আছে?",
      aEn: "Yes — all our Hajj/Umrah packages include visa processing. Standard and Premium tiers include travel insurance too.",
      aBn: "হ্যাঁ — সব প্যাকেজে ভিসা প্রসেসিং অন্তর্ভুক্ত। Standard ও Premium-এ ইনসুরেন্সও আছে।" },
    { qEn: "How close will my hotel be to the Haram?", qBn: "আমার হোটেল হারাম থেকে কতদূর?",
      aEn: "It depends on the package: Premium is under 100m, Standard around 400m, Economy up to 800m. Distance is clearly listed on each package.",
      aBn: "প্যাকেজ অনুযায়ী: Premium ১০০ মিটারের কম, Standard ~৪০০ মিটার, Economy ৮০০ মিটার পর্যন্ত। প্রতিটি প্যাকেজে দূরত্ব উল্লেখ থাকে।" },
    { qEn: "Do you provide scholar (মুয়াল্লিম) guidance?", qBn: "আপনারা কি মুয়াল্লিম গাইডেন্স দেন?",
      aEn: "Yes — every group travels with a certified scholar for daily lessons, ritual guidance, and Q&A.",
      aBn: "হ্যাঁ — প্রতিটি গ্রুপের সাথে সার্টিফাইড আলেম যান — দৈনিক পাঠ, রিচুয়াল গাইডেন্স ও প্রশ্নোত্তর।" },
    { qEn: "Can I customize a package for my family?", qBn: "পরিবারের জন্য কাস্টম প্যাকেজ করা যাবে?",
      aEn: "Absolutely. Send us an inquiry with your family size, preferred dates, and hotel tier — we'll design a bespoke plan.",
      aBn: "অবশ্যই। পরিবারের সংখ্যা, তারিখ ও হোটেল টিয়ার জানিয়ে ইনকোয়ারি দিন — আমরা কাস্টম প্ল্যান তৈরি করে দেব।" },
];

export default function HajjUmrahPage() {
    const [activeTab, setActiveTab] = useState("hajj");
    const { language } = useLanguage();
    const { settings } = useSiteSettings();
    const isBn = language === "bn";
    const fontFamily = isBn ? "Hind Siliguri, sans-serif" : "Poppins, sans-serif";
    const headingFont = isBn ? "Hind Siliguri, sans-serif" : "Teko, sans-serif";

    const [hajjPackages, setHajjPackages] = useState([]);
    const [umrahPackages, setUmrahPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [bookingModal, setBookingModal] = useState({ open: false, pkg: null });

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const [hRes, uRes] = await Promise.all([
                    fetch(`${API_BASE}/api/hajj-umrah/type/hajj`),
                    fetch(`${API_BASE}/api/hajj-umrah/type/umrah`),
                ]);
                const hData = await hRes.json();
                const uData = await uRes.json();
                setHajjPackages(hData.success && hData.data?.length ? hData.data : fallbackHajj);
                setUmrahPackages(uData.success && uData.data?.length ? uData.data : fallbackUmrah);
            } catch {
                setHajjPackages(fallbackHajj);
                setUmrahPackages(fallbackUmrah);
            } finally { setLoading(false); }
        })();
    }, []);

    const packages = activeTab === "hajj" ? hajjPackages : umrahPackages;

    const wa = settings?.whatsappNumber;
    const waMessage = isBn ? "হজ্জ/ওমরাহ প্যাকেজ সম্পর্কে জানতে চাই" : "Hi, I'd like info on your Hajj/Umrah packages";

    // Hajj-specific inquiry fields — mirrors our unified inquiry model.
    const hajjFields = [
        { name: "packageType",  label: isBn ? "প্যাকেজ" : "Package",                placeholder: activeTab === "hajj" ? "Hajj" : "Umrah", required: true },
        { name: "people",       label: isBn ? "কতজন যাবেন?" : "How many people?",    placeholder: "1", type: "number",                     required: true },
        { name: "departMonth",  label: isBn ? "কোন মাসে যেতে চান?" : "Preferred month", placeholder: isBn ? "উদা: ডিসেম্বর ২০২৬" : "e.g. December 2026" },
        { name: "budget",       label: isBn ? "বাজেট (ঐচ্ছিক)" : "Budget (optional)", placeholder: "USD / BDT" },
    ];

    return (
        <div className="bg-white pb-16 pt-28 md:pt-32">
            {/* Breadcrumb */}
            <nav className="max-w-6xl mx-auto px-5 sm:px-8 flex items-center gap-2 text-gray-400 text-xs mb-3" style={{ fontFamily }}>
                <a href="/" className="hover:text-brand-blue">Home</a>
                <LuChevronRight size={12} />
                <span className="text-gray-600">Hajj &amp; Umrah</span>
            </nav>

            {/* ═══ TAB + PACKAGES ═══════════════════════════ */}
            <section id="packages" className="scroll-mt-24 max-w-6xl mx-auto px-5 sm:px-8 pt-4 pb-14">
                <SectionHead
                    kicker={isBn ? "প্যাকেজ" : "Packages"}
                    title={isBn ? "আপনার যাত্রা বাছুন" : "Choose Your Journey"}
                    bnFont={fontFamily}
                    headingFont={headingFont}
                />

                {/* Tab pill */}
                <div className="flex justify-center mb-10">
                    <div className="inline-flex bg-gray-100 rounded-full p-1.5 gap-1">
                        {[
                            { k: "hajj",  labelEn: "Hajj",  labelBn: "হজ্জ",   icon: <FaKaaba size={16} /> },
                            { k: "umrah", labelEn: "Umrah", labelBn: "উমরাহ", icon: <FaMosque size={16} /> },
                        ].map((t) => (
                            <button
                                key={t.k}
                                onClick={() => setActiveTab(t.k)}
                                className={`inline-flex items-center gap-2 px-6 md:px-8 py-3 rounded-full text-sm font-bold transition-all ${
                                    activeTab === t.k
                                        ? "bg-brand-dark text-white shadow-md"
                                        : "text-gray-600 hover:text-brand-dark"
                                }`}
                                style={{ fontFamily }}
                            >
                                {t.icon}
                                {isBn ? t.labelBn : t.labelEn}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Package cards */}
                {loading ? (
                    <div className="py-16 flex items-center justify-center">
                        <LuLoader className="w-8 h-8 text-emerald-600 animate-spin" />
                    </div>
                ) : packages.length === 0 ? (
                    <div className="py-16 text-center border border-dashed border-gray-200 rounded-2xl text-gray-500">
                        {isBn ? "কোনো প্যাকেজ পাওয়া যায়নি" : "No packages available yet"}
                    </div>
                ) : (
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.35 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6"
                        >
                            {packages.map((pkg, i) => (
                                <PackageCard
                                    key={pkg._id || i}
                                    pkg={pkg}
                                    isBn={isBn}
                                    fontFamily={fontFamily}
                                    headingFont={headingFont}
                                    onBook={() => setBookingModal({ open: true, pkg })}
                                    onWhatsApp={wa ? buildWhatsAppUrl(wa, `${isBn ? pkg.nameBn || pkg.name : pkg.name} — ${isBn ? "সম্পর্কে জানতে চাই" : "please share details"}`) : null}
                                />
                            ))}
                        </motion.div>
                    </AnimatePresence>
                )}
            </section>

            {/* Dedicated Hajj / Umrah booking modal — submits as inquiry */}
            <PackageBookingModal
                isOpen={bookingModal.open}
                onClose={() => setBookingModal({ open: false, pkg: null })}
                pkg={bookingModal.pkg}
                packageType={bookingModal.pkg?.type || "hajj"}
            />
        </div>
    );
}

// PackageCard + PkgMeta extracted to @/components/shared/PackageCard so
// the home page renders identical cards. Both surfaces stay in sync.

// ── Reusable heading with kicker ────────────────────────
function SectionHead({ kicker, title, bnFont, headingFont }) {
    return (
        <div className="text-center mb-10 md:mb-12">
            <div className="flex items-center justify-center gap-3 mb-3">
                <span className="h-[1px] w-8 bg-gradient-to-r from-transparent to-brand-accent" />
                <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.25em] text-brand-accent" style={{ fontFamily: bnFont }}>
                    {kicker}
                </span>
                <span className="h-[1px] w-8 bg-gradient-to-l from-transparent to-brand-accent" />
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-brand-dark tracking-tight uppercase" style={{ fontFamily: headingFont }}>
                {title}
            </h2>
        </div>
    );
}
