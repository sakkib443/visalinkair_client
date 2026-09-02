"use client";

// ===================================================================
// Visalink Air — Contact (Gozayaan-style, mobile-first)
//   Hero → contact cards → unified inquiry form → office info
//   → FAQ → bottom CTA + sticky mobile bar.
// The form submits to POST /api/inquiries → Admin → Inquiries queue.
// ===================================================================

import { motion } from "framer-motion";
import {
    LuMail, LuPhone, LuMapPin, LuClock, LuGlobe, LuArrowRight, LuChevronRight,
    LuHeadphones, LuMessageCircle, LuBadgeCheck, LuUsers, LuStar,
} from "react-icons/lu";
import { FaWhatsapp, FaFacebookF, FaInstagram, FaLinkedinIn, FaYoutube } from "react-icons/fa";
import { useLanguage } from "@/context/LanguageContext";
import { useSiteSettings, buildWhatsAppUrl, buildTelUrl, buildMailUrl } from "@/context/SiteSettingsContext";
import InquiryForm from "@/components/inquiry/InquiryForm";

const FAQ = [
    { qEn: "How fast do you reply?", qBn: "আপনারা কত দ্রুত রিপ্লাই দেন?",
      aEn: "Within 24 hours — usually much faster during business hours. WhatsApp replies land within a couple of hours.",
      aBn: "২৪ ঘণ্টার মধ্যে — অফিস টাইমে অনেক দ্রুত। WhatsApp-এ রিপ্লাই ২-৩ ঘণ্টার মধ্যে।" },
    { qEn: "Do you charge for consultation?", qBn: "কনসালটেশনের জন্য কি ফি লাগে?",
      aEn: "No — the first consultation is 100% free. You only pay once you decide to proceed with a service.",
      aBn: "না — প্রথম কনসালটেশন ১০০% ফ্রি। সার্ভিস নেওয়ার সিদ্ধান্ত নিলে তখনই পেমেন্ট।" },
    { qEn: "Can I visit your office?", qBn: "আপনাদের অফিসে যাওয়া যাবে?",
      aEn: "Yes — walk-in appointments are welcome during business hours. Booking ahead helps us keep an expert ready for you.",
      aBn: "হ্যাঁ — অফিস টাইমে ওয়াক-ইন সম্ভব। আগে থেকে বুকিং করলে আমরা এক্সপার্ট রেডি রাখতে পারি।" },
    { qEn: "What if I need help urgently?", qBn: "জরুরি সাহায্য দরকার হলে কী করব?",
      aEn: "Message us on WhatsApp — our team is on standby for urgent cases (visa emergencies, ticket changes, in-country support).",
      aBn: "WhatsApp-এ মেসেজ দিন — জরুরি কেসের জন্য (ভিসা ইমার্জেন্সি, টিকেট চেঞ্জ, বিদেশে সাপোর্ট) আমাদের টিম স্ট্যান্ডবাই আছে।" },
];

export default function ContactPage() {
    const { language } = useLanguage();
    const { settings } = useSiteSettings();
    const isBn = language === "bn";
    const fontFamily = isBn ? "Hind Siliguri, sans-serif" : "Poppins, sans-serif";
    const headingFont = isBn ? "Hind Siliguri, sans-serif" : "Teko, sans-serif";

    const wa = settings?.whatsappNumber;
    const phone = settings?.contactPhone;
    const email = settings?.contactEmail;
    const address = isBn && settings?.addressBn ? settings.addressBn : settings?.address;

    return (
        <div className="bg-white pb-16">
            {/* ═══ HERO ══════════════════════════════════════ */}
            <section
                className="relative min-h-[50vh] md:min-h-[55vh] flex items-end bg-cover bg-center"
                style={{
                    backgroundImage:
                        "linear-gradient(180deg, rgba(10,10,50,0.6) 0%, rgba(10,10,50,0.9) 100%), url('https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=2000&auto=format&fit=crop')",
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
                <div className="relative max-w-6xl mx-auto px-5 sm:px-8 pt-28 pb-12 md:pt-36 md:pb-16 w-full">
                    <nav className="flex items-center gap-2 text-white/75 text-xs mb-5" style={{ fontFamily }}>
                        <a href="/" className="hover:text-white">{isBn ? "হোম" : "Home"}</a>
                        <LuChevronRight size={12} />
                        <span className="text-white">{isBn ? "যোগাযোগ" : "Contact"}</span>
                    </nav>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 mb-4">
                            <LuMessageCircle className="text-white w-4 h-4" />
                            <span className="text-white text-[11px] font-bold uppercase tracking-widest" style={{ fontFamily }}>
                                {isBn ? "যোগাযোগ" : "Get in touch"}
                            </span>
                        </div>
                        <h1
                            className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-3 tracking-tight leading-[1.05] uppercase"
                            style={{ fontFamily: headingFont, textShadow: "0 6px 30px rgba(0,0,0,0.4)" }}
                        >
                            {isBn ? "আসুন কথা বলি" : "Let's Talk"}
                        </h1>
                        <p className="text-lg md:text-xl text-white/90 max-w-2xl leading-relaxed" style={{ fontFamily }}>
                            {isBn
                                ? "প্রশ্ন, কোটেশন বা কাস্টম প্ল্যান — আপনার পছন্দের মাধ্যমে আমাদের কাছে পৌঁছান।"
                                : "Questions, quotes, or a custom plan — reach us the way you like best."}
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* ═══ QUICK CONTACT CARDS (overlap hero) ═══════ */}
            <section className="relative -mt-10 z-10 max-w-6xl mx-auto px-5 sm:px-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                    <ContactCard
                        icon={<FaWhatsapp className="w-6 h-6" />}
                        color="var(--color-whatsapp)"
                        label={isBn ? "হোয়াটসঅ্যাপ" : "WhatsApp"}
                        value={wa || (isBn ? "শীঘ্রই" : "Coming soon")}
                        href={wa ? buildWhatsAppUrl(wa, isBn ? "যোগাযোগ করতে চাই" : "Hi, I'd like to talk") : undefined}
                        tag={isBn ? "সবচেয়ে দ্রুত" : "Fastest"}
                        fontFamily={fontFamily}
                    />
                    <ContactCard
                        icon={<LuPhone className="w-6 h-6" />}
                        color="var(--color-brand-accent)"
                        label={isBn ? "হটলাইন" : "Hotline"}
                        value={phone || (isBn ? "শীঘ্রই" : "Coming soon")}
                        href={phone ? buildTelUrl(phone) : undefined}
                        tag={isBn ? "৯টা - ৯টা" : "9AM - 9PM"}
                        fontFamily={fontFamily}
                    />
                    <ContactCard
                        icon={<LuMail className="w-6 h-6" />}
                        color="var(--color-brand-blue)"
                        label={isBn ? "ইমেইল" : "Email"}
                        value={email || (isBn ? "শীঘ্রই" : "Coming soon")}
                        href={email ? buildMailUrl(email) : undefined}
                        tag={isBn ? "সবসময়" : "Always open"}
                        fontFamily={fontFamily}
                    />
                    <ContactCard
                        icon={<LuMapPin className="w-6 h-6" />}
                        color="#8B5CF6"
                        label={isBn ? "অফিস" : "Office"}
                        value={address || (isBn ? "ঢাকা, বাংলাদেশ" : "Dhaka, Bangladesh")}
                        tag={isBn ? "ওয়াক-ইন সম্ভব" : "Walk-ins ok"}
                        fontFamily={fontFamily}
                    />
                </div>
            </section>

            {/* ═══ INQUIRY FORM ═════════════════════════════ */}
            <section id="inquiry" className="scroll-mt-24 max-w-6xl mx-auto px-5 sm:px-8 py-16 md:py-24">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.15fr] gap-8 lg:gap-12 items-start">
                    {/* Left copy */}
                    <div>
                        <span className="inline-block px-3 py-1 rounded-full bg-brand-blue/10 text-brand-blue text-[11px] font-bold uppercase tracking-widest mb-3" style={{ fontFamily }}>
                            {isBn ? "ইনকোয়ারি ফর্ম" : "Send us a message"}
                        </span>
                        <h2 className="text-3xl md:text-5xl font-black text-brand-dark mb-4 tracking-tight leading-tight uppercase" style={{ fontFamily: headingFont }}>
                            {isBn ? "আমরা শুনতে ভালোবাসি" : "We'd Love to Hear You"}
                        </h2>
                        <p className="text-gray-600 leading-relaxed mb-6" style={{ fontFamily }}>
                            {isBn
                                ? "ফর্মটি পূরণ করুন — আপনার প্রশ্ন বা প্রয়োজনের ধরন বলুন, আমাদের এক্সপার্ট ২৪ ঘণ্টার মধ্যে যোগাযোগ করবে।"
                                : "Drop us a line — tell us your question or what you need, and our expert will reach out within 24 hours."}
                        </p>
                        <ul className="space-y-3">
                            {[
                                { icon: <LuHeadphones className="w-4 h-4" />, en: "100% free consultation", bn: "১০০% ফ্রি কনসালটেশন" },
                                { icon: <LuBadgeCheck className="w-4 h-4" />, en: "IATA accredited & govt licensed", bn: "IATA স্বীকৃত ও সরকার লাইসেন্সপ্রাপ্ত" },
                                { icon: <LuStar className="w-4 h-4" />,       en: "4.8/5 across 1,200+ reviews",  bn: "১,২০০+ রিভিউতে ৪.৮/৫ রেটিং" },
                                { icon: <LuUsers className="w-4 h-4" />,      en: "15,000+ clients served since 2015", bn: "২০১৫ থেকে ১৫,০০০+ ক্লায়েন্ট" },
                            ].map((li, i) => (
                                <li key={i} className="flex items-start gap-3 text-gray-700" style={{ fontFamily }}>
                                    <span className="w-7 h-7 rounded-lg bg-brand-blue/10 text-brand-blue flex items-center justify-center flex-shrink-0">
                                        {li.icon}
                                    </span>
                                    <span className="pt-1">{isBn ? li.bn : li.en}</span>
                                </li>
                            ))}
                        </ul>

                        {/* Social row */}
                        {settings?.social && (
                            <div className="mt-8">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3" style={{ fontFamily }}>
                                    {isBn ? "সোশ্যাল-এ ফলো করুন" : "Follow us"}
                                </p>
                                <div className="flex items-center gap-2">
                                    {[
                                        { url: settings.social.facebook,  icon: <FaFacebookF />,   bg: "#1877F2" },
                                        { url: settings.social.instagram, icon: <FaInstagram />,   bg: "#E4405F" },
                                        { url: settings.social.linkedin,  icon: <FaLinkedinIn />,  bg: "#0A66C2" },
                                        { url: settings.social.youtube,   icon: <FaYoutube />,     bg: "#FF0000" },
                                    ].filter((s) => s.url).map((s, i) => (
                                        <a
                                            key={i}
                                            href={s.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm transition-transform hover:-translate-y-0.5"
                                            style={{ backgroundColor: s.bg }}
                                            aria-label="social link"
                                        >
                                            {s.icon}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right form */}
                    <div>
                        <InquiryForm
                            service="general-contact"
                            serviceLabel={isBn ? "সাধারণ যোগাযোগ" : "General Contact"}
                            subjectPlaceholder={isBn ? "কী নিয়ে সাহায্য দরকার?" : "What can we help with?"}
                        />
                    </div>
                </div>
            </section>

            {/* ═══ OFFICE / MAP block ══════════════════════ */}
            {(address || settings?.mapEmbedUrl) && (
                <section className="max-w-6xl mx-auto px-5 sm:px-8 py-10">
                    <div className="rounded-2xl overflow-hidden border border-gray-100 bg-white grid grid-cols-1 lg:grid-cols-[1fr_1.1fr]">
                        {/* Info */}
                        <div className="p-6 md:p-10">
                            <span className="inline-block px-3 py-1 rounded-full bg-brand-accent/10 text-brand-accent text-[11px] font-bold uppercase tracking-widest mb-3" style={{ fontFamily }}>
                                {isBn ? "আমাদের অফিস" : "Visit us"}
                            </span>
                            <h3 className="text-2xl md:text-3xl font-black text-brand-dark mb-4 tracking-tight uppercase" style={{ fontFamily: headingFont }}>
                                {isBn ? "সরাসরি দেখা করুন" : "Come Meet Our Team"}
                            </h3>
                            <div className="space-y-4 text-sm text-gray-700" style={{ fontFamily }}>
                                <InfoRow icon={<LuMapPin size={16} />} label={isBn ? "ঠিকানা" : "Address"} value={address} />
                                <InfoRow icon={<LuClock  size={16} />} label={isBn ? "অফিস টাইম" : "Office hours"} value={isBn ? "রবি – বৃহঃ: সকাল ৯টা – রাত ৯টা · শুক্র: বন্ধ" : "Sun – Thu: 9 AM – 9 PM · Fri: Closed"} />
                                {phone && <InfoRow icon={<LuPhone size={16} />} label={isBn ? "ফোন" : "Phone"} value={phone} link={buildTelUrl(phone)} />}
                                {email && <InfoRow icon={<LuMail  size={16} />} label={isBn ? "ইমেইল" : "Email"} value={email} link={buildMailUrl(email)} />}
                            </div>
                            <div className="mt-6 flex flex-wrap gap-2">
                                {wa && (
                                    <a href={buildWhatsAppUrl(wa, isBn ? "অফিসে যেতে চাই" : "I'd like to visit your office")} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-whatsapp hover:bg-whatsapp-hover text-white text-sm font-bold" style={{ fontFamily }}>
                                        <FaWhatsapp size={14} /> {isBn ? "ভিজিট বুক করুন" : "Book a visit"}
                                    </a>
                                )}
                                {address && (
                                    <a href={`https://maps.google.com/?q=${encodeURIComponent(address)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand-dark hover:bg-brand-dark-hover text-white text-sm font-bold" style={{ fontFamily }}>
                                        <LuMapPin size={14} /> {isBn ? "ম্যাপে দেখুন" : "Open in Maps"}
                                    </a>
                                )}
                            </div>
                        </div>
                        {/* Map */}
                        <div className="min-h-[280px] md:min-h-full bg-gray-100 relative">
                            {settings?.mapEmbedUrl ? (
                                <iframe
                                    src={settings.mapEmbedUrl}
                                    title="Office Map"
                                    className="w-full h-full min-h-[280px] border-0"
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    allowFullScreen
                                />
                            ) : (
                                <div className="w-full h-full min-h-[280px] flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400">
                                    <div className="text-center px-6">
                                        <LuMapPin size={40} className="mx-auto mb-2" />
                                        <p className="text-sm" style={{ fontFamily }}>
                                            {isBn ? "ম্যাপ শীঘ্রই যোগ হবে" : "Map coming soon"}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            )}

            {/* ═══ FAQ ═══════════════════════════════════════ */}
            <section className="max-w-4xl mx-auto px-5 sm:px-8 py-14 md:py-20">
                <SectionHead
                    kicker={isBn ? "প্রশ্ন উত্তর" : "FAQ"}
                    title={isBn ? "সাধারণ জিজ্ঞাসা" : "Common Questions"}
                    bnFont={fontFamily}
                    headingFont={headingFont}
                />
                <div className="space-y-3">
                    {FAQ.map((f, i) => (
                        <details key={i} className="group p-5 rounded-2xl bg-white border border-gray-100 open:border-brand-blue/30 open:shadow-md transition-all">
                            <summary className="cursor-pointer font-semibold text-brand-dark flex items-center justify-between list-none" style={{ fontFamily }}>
                                <span>{isBn ? f.qBn : f.qEn}</span>
                                <LuChevronRight size={18} className="text-gray-400 group-open:rotate-90 transition-transform flex-shrink-0 ml-3" />
                            </summary>
                            <p className="mt-3 text-sm text-gray-600 leading-relaxed" style={{ fontFamily }}>
                                {isBn ? f.aBn : f.aEn}
                            </p>
                        </details>
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
                                {isBn ? "রেসপন্স গ্যারান্টি" : "Response guarantee"}
                            </span>
                            <h3 className="text-3xl md:text-5xl font-black tracking-tight uppercase mb-3" style={{ fontFamily: headingFont }}>
                                {isBn ? "২৪ ঘণ্টার মধ্যে জবাব" : "We Reply Within 24 Hours"}
                            </h3>
                            <p className="text-white/85 max-w-xl leading-relaxed" style={{ fontFamily }}>
                                {isBn
                                    ? "WhatsApp বা ফর্ম — যেভাবেই যোগাযোগ করুন, আমাদের এক্সপার্ট দ্রুত জানাবে।"
                                    : "Reach us via WhatsApp or the form — our expert will get back fast."}
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:items-end">
                            <a href="#inquiry" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-lg bg-[#FDCB1B] hover:bg-[#F0BB00] text-brand-dark font-bold transition-all" style={{ fontFamily }}>
                                {isBn ? "ফর্ম পাঠান" : "Send message"} <LuArrowRight size={16} />
                            </a>
                            {wa && (
                                <a href={buildWhatsAppUrl(wa, isBn ? "যোগাযোগ করতে চাই" : "Hi, I'd like to talk")} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-lg bg-whatsapp hover:bg-whatsapp-hover text-white font-bold transition-all" style={{ fontFamily }}>
                                    <FaWhatsapp size={18} /> WhatsApp
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ MOBILE STICKY CTA ═══════════════════════ */}
            <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 p-3 bg-white border-t border-gray-200 shadow-[0_-10px_30px_-10px_rgba(0,0,0,0.1)] flex gap-2">
                <a href="#inquiry" className="flex-1 inline-flex items-center justify-center gap-1.5 py-3 rounded-lg bg-brand-blue text-white font-bold text-sm" style={{ fontFamily }}>
                    {isBn ? "মেসেজ পাঠান" : "Send message"}
                </a>
                {wa && (
                    <a href={buildWhatsAppUrl(wa, isBn ? "যোগাযোগ" : "Hi")} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-1.5 px-5 py-3 rounded-lg bg-whatsapp text-white font-bold text-sm">
                        <FaWhatsapp size={16} />
                    </a>
                )}
            </div>
            <div className="lg:hidden h-20" />
        </div>
    );
}

// ── Reusable bits ────────────────────────────────────────
function ContactCard({ icon, color, label, value, href, tag, fontFamily }) {
    const inner = (
        <div className="group p-5 rounded-2xl bg-white border border-gray-100 hover:border-transparent hover:shadow-xl hover:-translate-y-1 transition-all h-full">
            <div className="flex items-start justify-between mb-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white flex-shrink-0" style={{ backgroundColor: color }}>
                    {icon}
                </div>
                {tag && (
                    <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400" style={{ fontFamily }}>
                        {tag}
                    </span>
                )}
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1" style={{ fontFamily }}>
                {label}
            </p>
            <p className="text-sm font-bold text-brand-dark leading-snug break-all" style={{ fontFamily }}>
                {value}
            </p>
        </div>
    );
    return href ? (
        <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noopener noreferrer" : undefined}>
            {inner}
        </a>
    ) : inner;
}

function InfoRow({ icon, label, value, link }) {
    if (!value) return null;
    const body = (
        <div className="flex items-start gap-3">
            <span className="w-8 h-8 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                {icon}
            </span>
            <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{label}</p>
                <p className="text-sm font-semibold text-brand-dark leading-snug">{value}</p>
            </div>
        </div>
    );
    return link ? <a href={link} className="block hover:opacity-80 transition-opacity">{body}</a> : body;
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
