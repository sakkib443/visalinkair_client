"use client";

import { useState } from "react";
import Link from "next/link";
import {
    FiPhone, FiMail, FiMapPin,
} from "react-icons/fi";
import {
    FaFacebookF, FaWhatsapp, FaInstagram, FaTwitter, FaYoutube, FaLinkedin, FaTiktok,
} from "react-icons/fa";
import { useSiteSettings, buildWhatsAppUrl, buildTelUrl, buildMailUrl } from "@/context/SiteSettingsContext";
import Logo from "@/components/shared/Logo";

const NAVY = "var(--color-brand-dark)";
const BLUE = "var(--color-brand-blue)";

// Auto-fallback: if a PNG exists at /public/images/payment/<key>.png it shows;
// otherwise a brand-coloured badge stands in.
const PAYMENT_METHODS = [
    { key: "bkash", alt: "bKash", color: "#E2136E", short: "bKash", number: "01710397719" },
    { key: "nagad", alt: "Nagad", color: "#EB8F1D", short: "Nagad", number: "01710397719" },
    {
        key: "bank",
        alt: "Bank Transfer",
        color: "var(--color-brand-dark)",
        short: "Bank",
        bank: {
            name: "Bank Asia plc — Agent Banking Division",
            accountName: "Md. Mashud Parveje Chowdhury",
            accountNumber: "1083426006972",
            routing: "070270602",
            swift: "BALBBDDH",
        },
    },
];

const SOCIAL_LINKS = [
    { key: "facebook",  icon: <FaFacebookF />,  bg: "#1877F2" },
    { key: "whatsapp",  icon: <FaWhatsapp />,   bg: "var(--color-whatsapp)" },
    { key: "instagram", icon: <FaInstagram />,  bg: "#E4405F" },
    { key: "twitter",   icon: <FaTwitter />,    bg: "#1DA1F2" },
    { key: "youtube",   icon: <FaYoutube />,    bg: "#FF0000" },
    { key: "linkedin",  icon: <FaLinkedin />,   bg: "#0A66C2" },
    { key: "tiktok",    icon: <FaTiktok />,     bg: "#000000" },
];

export default function Footer() {
    const { settings } = useSiteSettings();
    const year = new Date().getFullYear();

    return (
        <footer className="bg-[#f5f7fa] border-t border-gray-200">
            {/* ─── Main footer grid ─────────────────────────── */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pt-14 pb-10">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-10">
                    {/* Logo + Social Media */}
                    <div className="col-span-2 md:col-span-3 lg:col-span-1">
                        <Link href="/" className="inline-block">
                            <Logo className="h-24 w-auto" />
                        </Link>

                        <div className="mt-6">
                            <h4 className="text-[14px] font-black uppercase tracking-widest text-brand-dark mb-3" style={{ fontFamily: "Teko, sans-serif", letterSpacing: "0.2em" }}>
                                Social Media
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {SOCIAL_LINKS.filter((s) => settings?.social?.[s.key]).map((s) => (
                                    <a
                                        key={s.key}
                                        href={s.key === "whatsapp" && settings.whatsappNumber ? buildWhatsAppUrl(settings.whatsappNumber, "") : settings.social[s.key]}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={s.key}
                                        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm transition-transform hover:-translate-y-0.5"
                                        style={{ backgroundColor: s.bg }}
                                    >
                                        {s.icon}
                                    </a>
                                ))}
                                {/* Default visible icons if none configured */}
                                {!SOCIAL_LINKS.some((s) => settings?.social?.[s.key]) && (
                                    <>
                                        <span className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm" style={{ backgroundColor: "#1877F2" }}><FaFacebookF /></span>
                                        <span className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm" style={{ backgroundColor: "var(--color-whatsapp)" }}><FaWhatsapp /></span>
                                        <span className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm" style={{ backgroundColor: "#E4405F" }}><FaInstagram /></span>
                                        <span className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm" style={{ backgroundColor: "#0A66C2" }}><FaLinkedin /></span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Travel column — matches Navbar Travel sequence */}
                    <FooterCol title="Travel">
                        <FooterLink href="/flight">Flight</FooterLink>
                        <FooterLink href="/visa">Tourism Visa</FooterLink>
                        <FooterLink href="/services/study-abroad">Student Visa</FooterLink>
                        <FooterLink href="/hotel">Hotel</FooterLink>
                        <FooterLink href="/hajj-umrah">Hajj &amp; Umrah</FooterLink>
                    </FooterCol>

                    {/* Services column — matches Navbar Services */}
                    <FooterCol title="Services">
                        <FooterLink href="/services/course">Training</FooterLink>
                        <FooterLink href="/services/banking-support">Banking Service</FooterLink>
                        <FooterLink href="/services/passport-service">Passport</FooterLink>
                    </FooterCol>

                    {/* Quick Links */}
                    <FooterCol title="Quick Links">
                        <FooterLink href="/blog">Blog</FooterLink>
                        <FooterLink href="/contact">Contact Us</FooterLink>
                    </FooterCol>

                    {/* Contact Us */}
                    <div>
                        <h4 className="text-[14px] font-black uppercase tracking-widest text-brand-dark mb-4" style={{ fontFamily: "Teko, sans-serif", letterSpacing: "0.2em" }}>
                            Contact Us
                        </h4>
                        <ul className="space-y-3 text-sm">
                            {settings?.contactPhone && (
                                <li>
                                    <a href={buildTelUrl(settings.contactPhone)} className="flex items-start gap-2.5 text-gray-700 hover:text-brand-blue transition-colors">
                                        <FiPhone className="w-4 h-4 text-brand-blue mt-0.5 flex-shrink-0" />
                                        <span className="leading-tight">{settings.contactPhone}</span>
                                    </a>
                                </li>
                            )}
                            {settings?.contactEmail && (
                                <li>
                                    <a href={buildMailUrl(settings.contactEmail)} className="flex items-start gap-2.5 text-gray-700 hover:text-brand-blue transition-colors break-all">
                                        <FiMail className="w-4 h-4 text-brand-blue mt-0.5 flex-shrink-0" />
                                        <span className="leading-tight">{settings.contactEmail}</span>
                                    </a>
                                </li>
                            )}
                            {settings?.address && (
                                <li className="flex items-start gap-2.5 text-gray-700">
                                    <FiMapPin className="w-4 h-4 text-brand-blue mt-0.5 flex-shrink-0" />
                                    <span className="leading-tight">{settings.address}</span>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
            </div>

            {/* ─── Payment methods ─────────────────────────── */}
            <div className="border-t border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-5 flex flex-col sm:flex-row items-start sm:items-start justify-between gap-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-gray-500 sm:pt-1">
                        Accepted Payment Methods
                    </p>
                    <div className="flex flex-wrap items-start gap-x-6 gap-y-3">
                        {PAYMENT_METHODS.map((p) => (
                            <PayItem key={p.key} p={p} />
                        ))}
                    </div>
                </div>
            </div>

            {/* ─── Copyright bar ───────────────────────────── */}
            <div className="border-t border-gray-200 bg-white/40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
                    <p>© {year} Visalink Air. All rights reserved.</p>
                    <div className="flex items-center gap-4">
                        <Link href="/privacy-policy" className="hover:text-brand-blue transition-colors">Privacy Policy</Link>
                        <Link href="/refund-policy" className="hover:text-brand-blue transition-colors">Refund Policy</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

// ── Reusable ────────────────────────────────────────────
function FooterCol({ title, children }) {
    return (
        <div>
            <h4 className="text-[14px] font-black uppercase tracking-widest text-brand-dark mb-4" style={{ fontFamily: "Teko, sans-serif", letterSpacing: "0.2em" }}>
                {title}
            </h4>
            <ul className="space-y-2.5 text-sm list-none p-0 m-0">
                {children}
            </ul>
        </div>
    );
}

function FooterLink({ href, children }) {
    return (
        <li>
            <Link href={href} className="text-gray-700 hover:text-brand-blue transition-colors">
                {children}
            </Link>
        </li>
    );
}

// Brand-styled inline SVG mark as fallback until real PNG is dropped.
// Uses the actual brand colors + wordmark shape.
function BrandMark({ p }) {
    const [imgOk, setImgOk] = useState(true);
    if (imgOk) {
        return (
            <img
                src={`/images/payment/${p.key}.png`}
                alt={p.alt}
                className="h-7 w-auto object-contain flex-shrink-0"
                onError={() => setImgOk(false)}
            />
        );
    }
    if (p.key === "bkash") {
        return (
            <svg viewBox="0 0 90 30" className="h-7 w-auto flex-shrink-0" aria-label="bKash">
                <rect x="0" y="0" width="90" height="30" rx="15" fill="#E2136E" />
                <text x="45" y="20" textAnchor="middle" fill="#fff" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="15" fontStyle="italic">bKash</text>
            </svg>
        );
    }
    if (p.key === "nagad") {
        return (
            <svg viewBox="0 0 90 30" className="h-7 w-auto flex-shrink-0" aria-label="Nagad">
                <rect x="0" y="0" width="90" height="30" rx="6" fill="#EB8F1D" />
                <text x="45" y="20" textAnchor="middle" fill="#fff" fontFamily="Georgia, serif" fontWeight="700" fontSize="15" fontStyle="italic">Nagad</text>
            </svg>
        );
    }
    return (
        <div className="h-7 px-2 rounded flex items-center justify-center flex-shrink-0" style={{ backgroundColor: p.color }}>
            <span className="text-white text-[10px] font-black uppercase tracking-wider">{p.short}</span>
        </div>
    );
}

// Bank card — expanded with all details underneath the icon.
function BankCard({ p }) {
    return (
        <div className="flex items-start gap-2.5 min-w-0">
            <BrandMark p={p} />
            <div className="text-[11px] text-gray-700 leading-tight min-w-0">
                <p className="font-bold text-brand-dark text-xs">A/C: {p.bank.accountNumber}</p>
                <p className="text-gray-600 truncate">{p.bank.accountName}</p>
                <p className="text-gray-500 truncate">{p.bank.name}</p>
                <p className="text-[10px] text-gray-500">
                    Routing: <span className="font-semibold text-gray-700">{p.bank.routing}</span>
                    &nbsp;·&nbsp;
                    SWIFT: <span className="font-semibold text-gray-700">{p.bank.swift}</span>
                </p>
            </div>
        </div>
    );
}

// Compact card for mobile-banking (bKash / Nagad): logo + number inline.
function MobileWalletCard({ p }) {
    return (
        <div className="flex items-center gap-2">
            <BrandMark p={p} />
            <span className="text-xs font-semibold text-brand-dark">{p.number}</span>
        </div>
    );
}

function PayItem({ p }) {
    if (p.bank) return <BankCard p={p} />;
    return <MobileWalletCard p={p} />;
}
