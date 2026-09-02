"use client";

// ===================================================================
// Visalink Air — About (Gozayaan-style, mobile-first)
//   Hero → stats bar → our story → mission/vision/values → services
//   grid → team → milestones → CTA + sticky mobile bar.
// ===================================================================

import { motion } from "framer-motion";
import Link from "next/link";
import {
    LuArrowRight, LuChevronRight, LuUsers, LuAward, LuGlobe, LuStar, LuBadgeCheck,
    LuHeadphones, LuHeart, LuTarget, LuCompass, LuHandshake, LuShieldCheck, LuTrendingUp,
} from "react-icons/lu";
import { FaWhatsapp } from "react-icons/fa";
import { useLanguage } from "@/context/LanguageContext";
import { useSiteSettings, buildWhatsAppUrl } from "@/context/SiteSettingsContext";

const STATS = [
    { en: "Years in business",  bn: "বছরের ব্যবসা",   value: "15+",  icon: <LuAward className="w-5 h-5" /> },
    { en: "Happy clients",      bn: "সন্তুষ্ট ক্লায়েন্ট", value: "15K+", icon: <LuUsers className="w-5 h-5" /> },
    { en: "Countries served",   bn: "দেশের সেবা",       value: "50+",  icon: <LuGlobe className="w-5 h-5" /> },
    { en: "Success rate",       bn: "সফলতার হার",       value: "98%",  icon: <LuTrendingUp className="w-5 h-5" /> },
];

const VALUES = [
    { icon: <LuShieldCheck className="w-6 h-6" />, tEn: "Trust",       tBn: "বিশ্বাস",     dEn: "Transparent pricing, honest advice, no hidden surprises.",   dBn: "স্বচ্ছ মূল্য, সৎ পরামর্শ, কোনো লুকানো চমক নেই।" },
    { icon: <LuHeart className="w-6 h-6" />,       tEn: "Care",        tBn: "যত্ন",        dEn: "Every client is treated like family, every trip like our own.", dBn: "প্রত্যেক ক্লায়েন্ট পরিবারের মতো, প্রতিটি ট্রিপ আমাদের নিজের মতো।" },
    { icon: <LuHandshake className="w-6 h-6" />,   tEn: "Partnership", tBn: "অংশীদারিত্ব", dEn: "Long-term relationships over one-off transactions.",         dBn: "দীর্ঘমেয়াদী সম্পর্ক, একবারের লেনদেন নয়।" },
    { icon: <LuTarget className="w-6 h-6" />,      tEn: "Excellence",  tBn: "শ্রেষ্ঠত্ব",   dEn: "Detail-obsessed process that keeps our success rate at 98%.", dBn: "খুঁটিনাটির প্রতি মনোযোগ — যা ৯৮% সফলতার হার ধরে রাখে।" },
];

const SERVICES = [
    { icon: "✈️", tEn: "Air Ticket",       tBn: "এয়ার টিকেট",       href: "/flight" },
    { icon: "🛂", tEn: "Tourist Visa",     tBn: "ট্যুরিস্ট ভিসা",    href: "/visa" },
    { icon: "🎓", tEn: "Study Abroad",     tBn: "বিদেশে পড়াশোনা",   href: "/services/study-abroad" },
    { icon: "🕋", tEn: "Hajj & Umrah",     tBn: "হজ্জ ও উমরাহ",      href: "/hajj-umrah" },
    { icon: "🎫", tEn: "Training Course",  tBn: "ট্রেনিং কোর্স",     href: "/services/course" },
    { icon: "📘", tEn: "Passport Service", tBn: "পাসপোর্ট সার্ভিস",   href: "/services/passport-service" },
    { icon: "🏦", tEn: "Banking Support",  tBn: "ব্যাংকিং সাপোর্ট",   href: "/services/banking-support" },
    { icon: "💼", tEn: "Careers",          tBn: "ক্যারিয়ার",         href: "/services/career-opportunity" },
];

const MILESTONES = [
    { year: "2015", en: "Founded in Dhaka",             bn: "ঢাকায় প্রতিষ্ঠা",                icon: "🚀" },
    { year: "2017", en: "IATA accreditation",           bn: "IATA অনুমোদন",                    icon: "🏅" },
    { year: "2019", en: "Crossed 5,000 clients",        bn: "৫,০০০ ক্লায়েন্ট অতিক্রম",         icon: "🎉" },
    { year: "2021", en: "Launched study-abroad wing",   bn: "স্টাডি অ্যাব্রড শাখা চালু",       icon: "🎓" },
    { year: "2023", en: "Full Hajj/Umrah operator",     bn: "সম্পূর্ণ হজ্জ/ওমরাহ অপারেটর",    icon: "🕋" },
    { year: "2025", en: "10,000+ pilgrims served",      bn: "১০,০০০+ হাজী সেবা",             icon: "⭐" },
];

const TEAM = [
    { name: "Md. Mashed Parveje", role: "Founder & CEO",           avatar: "M", color: "var(--color-brand-blue)" },
    { name: "Rifat Hasan",        role: "Head of Operations",       avatar: "R", color: "var(--color-brand-accent)" },
    { name: "Nusrat Jahan",       role: "Visa Counselor Lead",       avatar: "N", color: "#10B981" },
    { name: "Sabbir Ahmed",       role: "Hajj & Umrah Coordinator", avatar: "S", color: "#8B5CF6" },
];

export default function AboutPage() {
    const { language } = useLanguage();
    const { settings } = useSiteSettings();
    const isBn = language === "bn";
    const fontFamily = isBn ? "Hind Siliguri, sans-serif" : "Poppins, sans-serif";
    const headingFont = isBn ? "Hind Siliguri, sans-serif" : "Teko, sans-serif";

    const wa = settings?.whatsappNumber;
    const waMessage = isBn ? "আপনাদের সম্পর্কে জানতে চাই" : "Hi, I'd like to know more about your services";

    return (
        <div className="bg-white pb-16">
            {/* ═══ HERO ══════════════════════════════════════ */}
            <section
                className="relative min-h-[55vh] md:min-h-[62vh] flex items-end bg-cover bg-center"
                style={{
                    backgroundImage:
                        "linear-gradient(180deg, rgba(10,10,50,0.55) 0%, rgba(10,10,50,0.92) 100%), url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2000&auto=format&fit=crop')",
                }}
            >
                <div
                    aria-hidden
                    className="absolute inset-0 opacity-[0.06]"
                    style={{
                        backgroundImage: "radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)",
                        backgroundSize: "24px 24px",
                    }}
                />
                <div className="relative max-w-6xl mx-auto px-5 sm:px-8 pt-28 pb-14 md:pt-36 md:pb-20 w-full">
                    <nav className="flex items-center gap-2 text-white/75 text-xs mb-5" style={{ fontFamily }}>
                        <Link href="/" className="hover:text-white">{isBn ? "হোম" : "Home"}</Link>
                        <LuChevronRight size={12} />
                        <span className="text-white">{isBn ? "আমাদের সম্পর্কে" : "About us"}</span>
                    </nav>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 mb-4">
                            <LuCompass className="text-white w-4 h-4" />
                            <span className="text-white text-[11px] font-bold uppercase tracking-widest" style={{ fontFamily }}>
                                {isBn ? "আমাদের গল্প" : "Our story"}
                            </span>
                        </div>
                        <h1
                            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-3 tracking-tight leading-[1.05] uppercase"
                            style={{ fontFamily: headingFont, textShadow: "0 6px 30px rgba(0,0,0,0.4)" }}
                        >
                            {isBn ? "১৫ বছর ধরে ভ্রমণকে সহজ করছি" : "Making Travel Simpler Since 2015"}
                        </h1>
                        <p className="text-lg md:text-xl text-white/90 max-w-2xl leading-relaxed" style={{ fontFamily }}>
                            {isBn
                                ? "একটি ছোট কনসালটেন্সি থেকে বাংলাদেশের সবচেয়ে বিশ্বস্ত ট্রাভেল ও ভিসা পার্টনার-এ পরিণত হয়েছি — গল্পটা শুনুন।"
                                : "From a small consultancy to Bangladesh's most trusted travel & visa partner — here's how we got here."}
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* ═══ STATS ═════════════════════════════════════ */}
            <section className="relative -mt-10 z-10 max-w-6xl mx-auto px-5 sm:px-8">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 bg-white rounded-2xl p-4 md:p-5 shadow-[0_10px_40px_-12px_rgba(0,0,0,0.15)] border border-gray-100">
                    {STATS.map((s, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center flex-shrink-0">
                                {s.icon}
                            </div>
                            <div>
                                <p className="text-xl font-black text-brand-dark leading-none" style={{ fontFamily: headingFont }}>
                                    {s.value}
                                </p>
                                <p className="text-[11px] text-gray-500 mt-0.5" style={{ fontFamily }}>
                                    {isBn ? s.bn : s.en}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ═══ OUR STORY ═════════════════════════════════ */}
            <section className="max-w-6xl mx-auto px-5 sm:px-8 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-8 lg:gap-12 items-center">
                <div>
                    <span className="inline-block px-3 py-1 rounded-full bg-brand-accent/10 text-brand-accent text-[11px] font-bold uppercase tracking-widest mb-3" style={{ fontFamily }}>
                        {isBn ? "আমাদের গল্প" : "Our story"}
                    </span>
                    <h2 className="text-3xl md:text-5xl font-black text-brand-dark mb-5 tracking-tight leading-tight uppercase" style={{ fontFamily: headingFont }}>
                        {isBn ? "একটি স্বপ্ন থেকে দেশজুড়ে বিশ্বাস" : "From a Small Dream to Nationwide Trust"}
                    </h2>
                    <div className="space-y-4 text-gray-700 leading-relaxed" style={{ fontFamily }}>
                        <p>
                            {isBn
                                ? "২০১৫ সালে ঢাকার একটি ছোট অফিস থেকে যাত্রা শুরু। উদ্দেশ্য ছিল একটাই — ভ্রমণ ও ভিসা প্রসেসিংকে বাংলাদেশি পরিবারের জন্য সহজ, নিরাপদ ও সাশ্রয়ী করা।"
                                : "We opened our doors in a small Dhaka office in 2015 with one simple goal — to make travel and visa processing easy, safe, and affordable for Bangladeshi families."}
                        </p>
                        <p>
                            {isBn
                                ? "১৫ বছরে আমরা ১৫,০০০+ ক্লায়েন্টকে ৫০+ দেশে পাঠিয়েছি — ট্যুরিস্ট, স্টুডেন্ট, হাজী, কর্মজীবী। আজ আমাদের সাফল্যের হার ৯৮% — কিন্তু আসল সাফল্য হলো প্রতিটি ক্লায়েন্টের ফিরে আসা।"
                                : "In 15 years we've helped 15,000+ clients travel to 50+ countries — tourists, students, pilgrims, professionals. Today our success rate is 98% — but the real win is every client coming back."}
                        </p>
                        <p>
                            {isBn
                                ? "আমরা IATA-অনুমোদিত, সরকার-লাইসেন্সপ্রাপ্ত এবং ২৪/৭ WhatsApp সাপোর্ট দিই। প্রতিটি ট্রিপে আমরা এমনভাবে জড়িত থাকি যেন এটা আমাদের নিজের ট্রিপ।"
                                : "We are IATA-accredited, government-licensed, and available 24/7 on WhatsApp. We treat every trip as if it were our own."}
                        </p>
                    </div>
                    <div className="mt-7 flex flex-wrap gap-3">
                        <Link href="/contact" className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-brand-blue hover:bg-brand-blue-hover text-white text-sm font-bold" style={{ fontFamily }}>
                            {isBn ? "যোগাযোগ করুন" : "Get in touch"} <LuArrowRight size={14} />
                        </Link>
                        {wa && (
                            <a href={buildWhatsAppUrl(wa, waMessage)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-whatsapp hover:bg-whatsapp-hover text-white text-sm font-bold" style={{ fontFamily }}>
                                <FaWhatsapp size={15} /> WhatsApp
                            </a>
                        )}
                    </div>
                </div>

                {/* Image collage */}
                <div className="relative min-h-[380px] md:min-h-[440px]">
                    <div className="absolute top-0 right-0 w-[70%] aspect-[4/5] rounded-2xl overflow-hidden shadow-xl">
                        <img
                            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop"
                            alt="Travel"
                            className="w-full h-full object-cover"
                            loading="lazy"
                        />
                    </div>
                    <div className="absolute bottom-0 left-0 w-[62%] aspect-[4/3] rounded-2xl overflow-hidden shadow-xl border-4 border-white">
                        <img
                            src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=800&auto=format&fit=crop"
                            alt="Airport"
                            className="w-full h-full object-cover"
                            loading="lazy"
                        />
                    </div>
                    <motion.div
                        className="absolute top-1/2 left-2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl p-4 w-40 border border-gray-100"
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <div className="flex items-center gap-2 mb-1">
                            <LuStar className="text-[#FDCB1B] fill-current w-4 h-4" />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500" style={{ fontFamily }}>
                                {isBn ? "রেটিং" : "Rating"}
                            </span>
                        </div>
                        <p className="text-2xl font-black text-brand-dark leading-none" style={{ fontFamily: headingFont }}>4.8/5</p>
                        <p className="text-[10px] text-gray-500 mt-1" style={{ fontFamily }}>
                            {isBn ? "১,২০০+ রিভিউ" : "1,200+ reviews"}
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* ═══ MISSION / VISION ═════════════════════════ */}
            <section className="max-w-6xl mx-auto px-5 sm:px-8 py-14 md:py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                    {[
                        {
                            tag: isBn ? "মিশন" : "Mission",
                            title: isBn ? "প্রতিটি বাংলাদেশিকে স্বপ্নের গন্তব্যে পৌঁছানো" : "Get Every Bangladeshi to Their Dream Destination",
                            desc: isBn
                                ? "সাশ্রয়ী মূল্যে সৎ পরামর্শ, স্বচ্ছ প্রক্রিয়া ও প্রকৃত সাপোর্ট দিয়ে ভ্রমণকে সবার নাগালে আনা।"
                                : "Bring travel within everyone's reach through honest advice, transparent process, and genuine support at fair prices.",
                            bg: "linear-gradient(135deg, var(--color-brand-blue) 0%, var(--color-brand-dark) 100%)",
                        },
                        {
                            tag: isBn ? "ভিশন" : "Vision",
                            title: isBn ? "দক্ষিণ এশিয়ার সবচেয়ে বিশ্বস্ত ট্রাভেল পার্টনার" : "South Asia's Most Trusted Travel Partner",
                            desc: isBn
                                ? "টেকনোলজি, মানবিক সেবা ও গভীর দেশজ্ঞান একত্রিত করে অঞ্চলজুড়ে ট্রাভেলের মানদণ্ড তৈরি করা।"
                                : "Set the regional standard by combining technology, human service, and deep destination knowledge.",
                            bg: "linear-gradient(135deg, var(--color-brand-accent) 0%, #B85E15 100%)",
                        },
                    ].map((card, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-80px" }}
                            transition={{ duration: 0.4, delay: i * 0.08 }}
                            className="relative rounded-2xl p-7 md:p-9 text-white overflow-hidden"
                            style={{ background: card.bg }}
                        >
                            <div
                                aria-hidden
                                className="absolute inset-0 opacity-[0.06]"
                                style={{
                                    backgroundImage: "radial-gradient(circle at 25% 30%, #fff 2px, transparent 2px)",
                                    backgroundSize: "40px 40px",
                                }}
                            />
                            <div className="relative">
                                <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-white text-[10px] font-bold uppercase tracking-widest mb-3" style={{ fontFamily }}>
                                    {card.tag}
                                </span>
                                <h3 className="text-2xl md:text-3xl font-black leading-tight mb-3 tracking-tight uppercase" style={{ fontFamily: headingFont }}>
                                    {card.title}
                                </h3>
                                <p className="text-white/90 leading-relaxed text-sm md:text-base" style={{ fontFamily }}>
                                    {card.desc}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ═══ VALUES ════════════════════════════════════ */}
            <section className="max-w-6xl mx-auto px-5 sm:px-8 py-14 md:py-20">
                <SectionHead
                    kicker={isBn ? "আমাদের মূল্যবোধ" : "Our values"}
                    title={isBn ? "যেই ৪ টি নীতিতে চলি" : "The 4 Principles We Live By"}
                    bnFont={fontFamily}
                    headingFont={headingFont}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
                    {VALUES.map((v, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-80px" }}
                            transition={{ duration: 0.4, delay: i * 0.06 }}
                            className="p-6 rounded-2xl bg-white border border-gray-100 hover:border-brand-blue/40 hover:shadow-lg hover:-translate-y-1 transition-all"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-blue/15 to-brand-blue/5 text-brand-blue flex items-center justify-center mb-4">
                                {v.icon}
                            </div>
                            <h4 className="text-lg font-bold text-brand-dark mb-1.5" style={{ fontFamily }}>
                                {isBn ? v.tBn : v.tEn}
                            </h4>
                            <p className="text-sm text-gray-600 leading-relaxed" style={{ fontFamily }}>
                                {isBn ? v.dBn : v.dEn}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ═══ SERVICES TILES ══════════════════════════ */}
            <section className="max-w-6xl mx-auto px-5 sm:px-8 py-14 md:py-20">
                <SectionHead
                    kicker={isBn ? "আমরা কী দিই" : "What we do"}
                    title={isBn ? "৮ টি ছাদের নিচে" : "8 Services Under One Roof"}
                    bnFont={fontFamily}
                    headingFont={headingFont}
                />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
                    {SERVICES.map((s, i) => (
                        <motion.div
                            key={s.href}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-60px" }}
                            transition={{ duration: 0.35, delay: (i % 4) * 0.05 }}
                        >
                            <Link href={s.href} className="group flex flex-col items-center gap-3 p-5 rounded-2xl bg-white border border-gray-100 hover:border-brand-blue/40 hover:shadow-lg hover:-translate-y-1 transition-all">
                                <div className="text-4xl group-hover:scale-110 transition-transform">{s.icon}</div>
                                <span className="text-sm font-bold text-brand-dark text-center leading-tight" style={{ fontFamily }}>
                                    {isBn ? s.tBn : s.tEn}
                                </span>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ═══ MILESTONES / TIMELINE ═══════════════════ */}
            <section className="py-14 md:py-20 bg-gradient-to-b from-blue-50/30 via-white to-white">
                <div className="max-w-6xl mx-auto px-5 sm:px-8">
                    <SectionHead
                        kicker={isBn ? "টাইমলাইন" : "Timeline"}
                        title={isBn ? "আমাদের যাত্রা" : "Our Journey"}
                        bnFont={fontFamily}
                        headingFont={headingFont}
                    />
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                        {MILESTONES.map((m, i) => (
                            <motion.div
                                key={m.year}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-60px" }}
                                transition={{ duration: 0.35, delay: (i % 6) * 0.06 }}
                                className="text-center p-5 rounded-2xl bg-white border border-gray-100 hover:border-[#FDCB1B] hover:shadow-md transition-all"
                            >
                                <div className="text-3xl mb-2">{m.icon}</div>
                                <p className="text-xl font-black text-brand-blue mb-1" style={{ fontFamily: headingFont }}>
                                    {m.year}
                                </p>
                                <p className="text-xs text-gray-600 leading-tight" style={{ fontFamily }}>
                                    {isBn ? m.bn : m.en}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ TEAM ═════════════════════════════════════ */}
            <section className="max-w-6xl mx-auto px-5 sm:px-8 py-14 md:py-20">
                <SectionHead
                    kicker={isBn ? "টিম" : "Our team"}
                    title={isBn ? "যারা আপনাকে সেবা দেবেন" : "The People Behind the Journey"}
                    bnFont={fontFamily}
                    headingFont={headingFont}
                />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-5">
                    {TEAM.map((m, i) => (
                        <motion.div
                            key={m.name}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-80px" }}
                            transition={{ duration: 0.35, delay: i * 0.05 }}
                            className="p-5 rounded-2xl bg-white border border-gray-100 text-center hover:shadow-lg hover:-translate-y-1 transition-all"
                        >
                            <div
                                className="w-20 h-20 mx-auto rounded-full flex items-center justify-center text-white text-2xl font-black mb-3"
                                style={{ background: `linear-gradient(135deg, ${m.color} 0%, ${m.color}dd 100%)`, fontFamily: headingFont }}
                            >
                                {m.avatar}
                            </div>
                            <p className="text-base font-bold text-brand-dark leading-tight" style={{ fontFamily }}>
                                {m.name}
                            </p>
                            <p className="text-xs text-gray-500 mt-1" style={{ fontFamily }}>
                                {m.role}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ═══ BOTTOM CTA ═══════════════════════════════ */}
            <section className="max-w-6xl mx-auto px-5 sm:px-8 py-12">
                <div className="relative rounded-3xl p-8 md:p-14 overflow-hidden text-white" style={{ background: "linear-gradient(135deg, var(--color-brand-dark) 0%, var(--color-brand-blue) 100%)" }}>
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
                            <span className="inline-block px-3 py-1 rounded-full bg-[#FDCB1B]/25 text-[#FDCB1B] text-[11px] font-bold uppercase tracking-widest mb-3" style={{ fontFamily }}>
                                {isBn ? "আসুন কথা বলি" : "Let's connect"}
                            </span>
                            <h3 className="text-3xl md:text-5xl font-black tracking-tight uppercase mb-3" style={{ fontFamily: headingFont }}>
                                {isBn ? "১৫,০০০+ পরিবারের বিশ্বাস" : "Join 15,000+ Trusting Families"}
                            </h3>
                            <p className="text-white/85 max-w-xl leading-relaxed" style={{ fontFamily }}>
                                {isBn
                                    ? "আপনার পরবর্তী ট্রিপ, ভিসা বা ক্যারিয়ার সিদ্ধান্তে আমরা পাশে আছি — আজই যোগাযোগ করুন।"
                                    : "Whatever your next trip, visa, or career step — we're here to help. Reach out today."}
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:items-end">
                            <Link href="/contact" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-lg bg-[#FDCB1B] hover:bg-[#F0BB00] text-brand-dark font-bold transition-all" style={{ fontFamily }}>
                                {isBn ? "যোগাযোগ" : "Contact us"} <LuArrowRight size={16} />
                            </Link>
                            {wa && (
                                <a href={buildWhatsAppUrl(wa, waMessage)} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-lg bg-whatsapp hover:bg-whatsapp-hover text-white font-bold transition-all" style={{ fontFamily }}>
                                    <FaWhatsapp size={18} /> WhatsApp
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ MOBILE STICKY CTA ═══════════════════════ */}
            <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 p-3 bg-white border-t border-gray-200 shadow-[0_-10px_30px_-10px_rgba(0,0,0,0.1)] flex gap-2">
                <Link href="/contact" className="flex-1 inline-flex items-center justify-center gap-1.5 py-3 rounded-lg bg-brand-blue text-white font-bold text-sm" style={{ fontFamily }}>
                    {isBn ? "যোগাযোগ" : "Contact us"}
                </Link>
                {wa && (
                    <a href={buildWhatsAppUrl(wa, waMessage)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-1.5 px-5 py-3 rounded-lg bg-whatsapp text-white font-bold text-sm">
                        <FaWhatsapp size={16} />
                    </a>
                )}
            </div>
            <div className="lg:hidden h-20" />
        </div>
    );
}

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
