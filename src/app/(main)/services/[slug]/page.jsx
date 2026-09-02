"use client";

// ===================================================================
// Visalink Air — Dynamic Service Landing Page (Gozayaan-style)
// Renders any /services/<slug> from CMS with a mobile-first,
// premium travel-portal aesthetic.
// ===================================================================

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    LuArrowRight, LuChevronRight, LuLoader, LuCheck, LuStar, LuUsers, LuAward, LuClock,
} from "react-icons/lu";
import { FaWhatsapp } from "react-icons/fa";
import { useLanguage } from "@/context/LanguageContext";
import { useSiteSettings, buildWhatsAppUrl } from "@/context/SiteSettingsContext";
import InquiryForm from "@/components/inquiry/InquiryForm";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Trust markers shared across every service page.
const TRUST_STATS = [
    { key: "clients",  labelEn: "Happy Clients",  labelBn: "সন্তুষ্ট ক্লায়েন্ট", value: "15K+", icon: <LuUsers className="w-5 h-5" /> },
    { key: "success",  labelEn: "Success Rate",   labelBn: "সফলতার হার",        value: "98%",  icon: <LuAward className="w-5 h-5" /> },
    { key: "years",    labelEn: "Years of Trust", labelBn: "বছরের বিশ্বাস",     value: "10+",  icon: <LuStar  className="w-5 h-5" /> },
    { key: "reply",    labelEn: "Reply Time",     labelBn: "রিপ্লাই টাইম",       value: "24h",  icon: <LuClock className="w-5 h-5" /> },
];

export default function ServicePage({ params }) {
    const { slug } = use(params);
    const { language } = useLanguage();
    const { settings } = useSiteSettings();
    const isBn = language === "bn";
    const bnFont = isBn ? "Hind Siliguri, sans-serif" : undefined;
    const headingFont = isBn ? "Hind Siliguri, sans-serif" : "Teko, sans-serif";
    const bt = (obj, fallback = "") => (isBn ? obj?.bn || obj?.en || fallback : obj?.en || fallback);

    const [svc, setSvc] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch(`${API}/api/services/${slug}`);
                const json = await res.json();
                if (json.success) setSvc(json.data);
                else setNotFound(true);
            } catch { setNotFound(true); }
            finally { setLoading(false); }
        })();
    }, [slug]);

    useEffect(() => {
        if (svc) {
            const t = bt(svc.seoTitle) || bt(svc.title);
            if (t) document.title = t;
        }
    }, [svc, isBn]);

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <LuLoader className="w-8 h-8 text-brand-blue animate-spin" />
            </div>
        );
    }

    if (notFound || !svc) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-6 text-center">
                <div className="text-6xl">🔎</div>
                <h1 className="text-3xl font-bold text-brand-dark" style={{ fontFamily: bnFont }}>
                    {isBn ? "সার্ভিস পাওয়া যায়নি" : "Service not found"}
                </h1>
                <Link href="/" className="px-6 py-3 rounded-lg bg-brand-blue text-white font-semibold" style={{ fontFamily: bnFont }}>
                    {isBn ? "হোম-এ ফিরুন" : "Back to home"}
                </Link>
            </div>
        );
    }

    const heroBg = svc.heroImage || "/hero.jpg";
    const waMessage = `${bt(svc.title)} — ${isBn ? "আমি আরও জানতে চাই।" : "I'd like to learn more."}`;

    return (
        <main className="pb-16">
            {/* ── Hero ─────────────────────────────────────────── */}
            <section
                className="relative min-h-[62vh] md:min-h-[65vh] flex items-end bg-cover bg-center"
                style={{
                    backgroundImage:
                        `linear-gradient(180deg, rgba(10,10,50,0.35) 0%, rgba(10,10,50,0.85) 100%), url('${heroBg}')`,
                }}
            >
                {/* Subtle pattern overlay */}
                <div
                    aria-hidden
                    className="absolute inset-0 opacity-[0.06] pointer-events-none"
                    style={{
                        backgroundImage:
                            "radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)",
                        backgroundSize: "24px 24px",
                    }}
                />
                <div className="relative w-full max-w-6xl mx-auto px-5 sm:px-8 pt-24 pb-12 md:pt-32 md:pb-16">
                    <nav className="flex items-center gap-2 text-white/75 text-xs mb-5" style={{ fontFamily: bnFont }}>
                        <Link href="/" className="hover:text-white">{isBn ? "হোম" : "Home"}</Link>
                        <LuChevronRight size={12} />
                        <Link href="/#services" className="hover:text-white">{isBn ? "সার্ভিস" : "Services"}</Link>
                        <LuChevronRight size={12} />
                        <span className="text-white">{bt(svc.title)}</span>
                    </nav>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                        {svc.icon && (
                            <div className="inline-flex items-center gap-2 mb-3">
                                <span className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 text-3xl flex items-center justify-center">
                                    {svc.icon}
                                </span>
                            </div>
                        )}
                        <h1
                            className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-3 md:mb-4 tracking-tight leading-[1.05] uppercase"
                            style={{ fontFamily: headingFont, textShadow: "0 4px 20px rgba(0,0,0,0.35)" }}
                        >
                            {bt(svc.title)}
                        </h1>
                        {bt(svc.subtitle) && (
                            <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-2xl leading-relaxed" style={{ fontFamily: bnFont }}>
                                {bt(svc.subtitle)}
                            </p>
                        )}

                        <div className="mt-6 flex flex-wrap items-center gap-3">
                            <a href="#inquiry" className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-[#FDCB1B] hover:bg-[#F0BB00] text-brand-dark font-bold text-sm transition-all" style={{ fontFamily: bnFont }}>
                                {bt(svc.ctaText) || (isBn ? "শুরু করুন" : "Get started")}
                                <LuArrowRight size={15} />
                            </a>
                            {settings?.whatsappNumber && (
                                <a
                                    href={buildWhatsAppUrl(settings.whatsappNumber, waMessage)}
                                    target="_blank" rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-whatsapp/95 hover:bg-whatsapp-hover text-white font-bold text-sm transition-all"
                                    style={{ fontFamily: bnFont }}
                                >
                                    <FaWhatsapp size={16} /> WhatsApp
                                </a>
                            )}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ── Trust strip (overlaps hero) ─────────────────── */}
            <section className="relative -mt-8 z-10 max-w-6xl mx-auto px-5 sm:px-8">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 bg-white rounded-2xl p-4 md:p-5 shadow-[0_10px_40px_-12px_rgba(0,0,0,0.15)] border border-gray-100">
                    {TRUST_STATS.map((s) => (
                        <div key={s.key} className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center flex-shrink-0">
                                {s.icon}
                            </div>
                            <div>
                                <p className="text-xl font-black text-brand-dark leading-none" style={{ fontFamily: headingFont }}>{s.value}</p>
                                <p className="text-[11px] text-gray-500 mt-0.5" style={{ fontFamily: bnFont }}>
                                    {isBn ? s.labelBn : s.labelEn}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Intro paragraph ─────────────────────────────── */}
            {bt(svc.description) && (
                <section className="max-w-3xl mx-auto px-5 sm:px-8 py-12 md:py-16 text-center">
                    <p className="text-lg md:text-xl text-gray-700 leading-relaxed" style={{ fontFamily: bnFont }}>
                        {bt(svc.description)}
                    </p>
                </section>
            )}

            {/* ── CMS sections ────────────────────────────────── */}
            <div className="max-w-6xl mx-auto px-5 sm:px-8 space-y-16 md:space-y-24">
                {(svc.sections || [])
                    .filter((s) => s.isActive !== false)
                    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                    .map((sec, i) => (
                        <SectionRenderer key={i} section={sec} bnFont={bnFont} headingFont={headingFont} bt={bt} isBn={isBn} />
                    ))}
            </div>

            {/* ── Inquiry form (anchor for hero CTA) ──────────── */}
            {svc.formEnabled && (
                <section id="inquiry" className="mt-16 md:mt-24 py-14 md:py-20" style={{ background: "linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)" }}>
                    <div className="max-w-6xl mx-auto px-5 sm:px-8 grid grid-cols-1 lg:grid-cols-[1fr_1.15fr] gap-8 lg:gap-12 items-start">
                        <div>
                            <span className="inline-block px-3 py-1 rounded-full bg-brand-blue/10 text-brand-blue text-[11px] font-bold uppercase tracking-widest mb-3" style={{ fontFamily: bnFont }}>
                                {isBn ? "যোগাযোগ" : "Get in touch"}
                            </span>
                            <h2
                                className="text-3xl md:text-5xl font-black text-brand-dark mb-4 tracking-tight leading-tight uppercase"
                                style={{ fontFamily: headingFont }}
                            >
                                {isBn ? "শুরু করতে প্রস্তুত?" : "Ready to get started?"}
                            </h2>
                            <p className="text-gray-600 leading-relaxed mb-6" style={{ fontFamily: bnFont }}>
                                {isBn
                                    ? "ফর্মটি পূরণ করুন — আমাদের এক্সপার্ট টিম ২৪ ঘণ্টার মধ্যে আপনার WhatsApp-এ বিস্তারিত জানিয়ে দেবে।"
                                    : "Drop your details — our expert team will reach out on WhatsApp within 24 hours with a personalised plan."}
                            </p>
                            <ul className="space-y-3">
                                {[
                                    isBn ? "১০০% ফ্রি কনসালটেশন" : "100% free consultation",
                                    isBn ? "কোন হিডেন ফি নেই" : "No hidden fees",
                                    isBn ? "সম্পূর্ণ ডকুমেন্ট গাইডেন্স" : "End-to-end document guidance",
                                    isBn ? "IATA স্বীকৃত এজেন্সি" : "IATA accredited agency",
                                ].map((li, idx) => (
                                    <li key={idx} className="flex items-start gap-3 text-gray-700" style={{ fontFamily: bnFont }}>
                                        <span className="w-5 h-5 rounded-full bg-[#10B981]/15 text-[#10B981] flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <LuCheck size={12} strokeWidth={3} />
                                        </span>
                                        {li}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <InquiryForm
                                service={svc.slug}
                                serviceLabel={bt(svc.title)}
                                subjectPlaceholder={bt(svc.title)}
                            />
                        </div>
                    </div>
                </section>
            )}

            {/* ── Sticky mobile CTA ───────────────────────────── */}
            <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 p-3 bg-white border-t border-gray-200 shadow-[0_-10px_30px_-10px_rgba(0,0,0,0.1)] flex gap-2">
                <a
                    href="#inquiry"
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-3 rounded-lg bg-brand-blue text-white font-bold text-sm"
                    style={{ fontFamily: bnFont }}
                >
                    {bt(svc.ctaText) || (isBn ? "শুরু করুন" : "Get quote")}
                </a>
                {settings?.whatsappNumber && (
                    <a
                        href={buildWhatsAppUrl(settings.whatsappNumber, waMessage)}
                        target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 px-5 py-3 rounded-lg bg-whatsapp text-white font-bold text-sm"
                    >
                        <FaWhatsapp size={16} />
                    </a>
                )}
            </div>
            {/* Spacer so sticky bar doesn't cover footer content */}
            <div className="lg:hidden h-20" />
        </main>
    );
}

// ────────────────────────────────────────────────────────────
// Section renderers — Gozayaan-style card layouts
// ────────────────────────────────────────────────────────────
function SectionRenderer({ section, bnFont, headingFont, bt, isBn }) {
    const title = bt(section.title);
    const content = bt(section.content);

    if (section.type === "features") {
        return (
            <section>
                {title && <SectionHeading title={title} kicker={isBn ? "কেন আমরা" : "Why us"} bnFont={bnFont} headingFont={headingFont} />}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
                    {(section.items || []).map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-80px" }}
                            transition={{ duration: 0.4, delay: i * 0.06 }}
                            className="group p-6 rounded-2xl bg-white border border-gray-100 hover:border-brand-blue/40 hover:shadow-[0_15px_40px_-15px_rgba(29,126,221,0.35)] hover:-translate-y-1 transition-all"
                        >
                            {item.icon && (
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-blue/15 to-brand-blue/5 text-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    {item.icon}
                                </div>
                            )}
                            <h4 className="text-lg font-bold text-brand-dark mb-1.5" style={{ fontFamily: bnFont }}>
                                {bt(item.title)}
                            </h4>
                            <p className="text-sm text-gray-600 leading-relaxed" style={{ fontFamily: bnFont }}>
                                {bt(item.description)}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </section>
        );
    }

    if (section.type === "list") {
        return (
            <section>
                {title && <SectionHeading title={title} kicker={isBn ? "আমরা যা কভার করি" : "Explore"} bnFont={bnFont} headingFont={headingFont} />}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
                    {(section.items || []).map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true, margin: "-60px" }}
                            transition={{ duration: 0.35, delay: i * 0.04 }}
                            className="flex flex-col items-center gap-2 py-6 px-3 rounded-2xl bg-white border border-gray-100 hover:border-[#FDCB1B] hover:shadow-md transition-all text-center"
                        >
                            {item.icon && <div className="text-3xl md:text-4xl">{item.icon}</div>}
                            <span className="text-sm font-bold text-brand-dark" style={{ fontFamily: bnFont }}>
                                {bt(item.title)}
                            </span>
                            {bt(item.description) && (
                                <span className="text-[11px] text-gray-500" style={{ fontFamily: bnFont }}>
                                    {bt(item.description)}
                                </span>
                            )}
                        </motion.div>
                    ))}
                </div>
            </section>
        );
    }

    if (section.type === "stats") {
        return (
            <section>
                {title && <SectionHeading title={title} kicker={isBn ? "সংক্ষেপে" : "At a glance"} bnFont={bnFont} headingFont={headingFont} />}
                <div className="rounded-2xl p-6 md:p-10 grid grid-cols-2 md:grid-cols-4 gap-6" style={{ background: "linear-gradient(135deg, var(--color-brand-dark) 0%, var(--color-brand-blue) 100%)" }}>
                    {(section.items || []).map((item, i) => (
                        <div key={i} className="text-center text-white">
                            <p className="text-[11px] font-bold uppercase tracking-widest text-white/70 mb-1" style={{ fontFamily: bnFont }}>
                                {bt(item.title)}
                            </p>
                            <p className="text-2xl md:text-3xl font-black" style={{ fontFamily: headingFont }}>
                                {bt(item.description)}
                            </p>
                        </div>
                    ))}
                </div>
            </section>
        );
    }

    if (section.type === "faq") {
        return (
            <section>
                {title && <SectionHeading title={title} kicker={isBn ? "প্রশ্ন উত্তর" : "FAQ"} bnFont={bnFont} headingFont={headingFont} />}
                <div className="max-w-3xl mx-auto space-y-3">
                    {(section.items || []).map((item, i) => (
                        <details
                            key={i}
                            className="group p-5 rounded-2xl bg-white border border-gray-100 open:border-brand-blue/30 open:shadow-md transition-all"
                        >
                            <summary
                                className="cursor-pointer font-semibold text-brand-dark flex items-center justify-between list-none"
                                style={{ fontFamily: bnFont }}
                            >
                                <span>{bt(item.title)}</span>
                                <LuChevronRight size={18} className="text-gray-400 group-open:rotate-90 transition-transform" />
                            </summary>
                            <p className="mt-3 text-sm text-gray-600 leading-relaxed" style={{ fontFamily: bnFont }}>
                                {bt(item.description)}
                            </p>
                        </details>
                    ))}
                </div>
            </section>
        );
    }

    if (section.type === "image" && (content || title)) {
        return (
            <section className="text-center">
                {title && <SectionHeading title={title} bnFont={bnFont} headingFont={headingFont} />}
                {content && (
                    <img
                        src={content}
                        alt={title || "section image"}
                        className="mx-auto rounded-2xl max-w-full h-auto shadow-lg"
                    />
                )}
            </section>
        );
    }

    // Default: text (paragraph)
    return (
        <section>
            {title && <SectionHeading title={title} bnFont={bnFont} headingFont={headingFont} />}
            {content && (
                <div
                    className="prose prose-lg max-w-3xl mx-auto text-gray-600"
                    style={{ fontFamily: bnFont }}
                    dangerouslySetInnerHTML={{ __html: content }}
                />
            )}
        </section>
    );
}

function SectionHeading({ title, kicker, bnFont, headingFont }) {
    return (
        <div className="text-center mb-10 md:mb-12">
            {kicker && (
                <div className="flex items-center justify-center gap-3 mb-3">
                    <span className="h-[1px] w-8 bg-gradient-to-r from-transparent to-brand-accent" />
                    <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.25em] text-brand-accent" style={{ fontFamily: bnFont }}>
                        {kicker}
                    </span>
                    <span className="h-[1px] w-8 bg-gradient-to-l from-transparent to-brand-accent" />
                </div>
            )}
            <h2
                className="text-3xl md:text-5xl font-black text-brand-dark tracking-tight uppercase"
                style={{ fontFamily: headingFont }}
            >
                {title}
            </h2>
        </div>
    );
}
