"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { FiMenu, FiX, FiLogOut } from "react-icons/fi";
import { BsChatDotsFill, BsMoonStars } from "react-icons/bs";
import { LuPlane, LuBed, LuMapPin, LuTicket, LuGift, LuAward, LuFileText, LuMap, LuGraduationCap, LuBookOpen, LuLandmark, LuBookMarked } from "react-icons/lu";
import {
    selectCurrentUser,
    selectIsAuthenticated,
    logout,
} from "@/redux/features/authSlice";
import { useLanguage } from "@/context/LanguageContext";
import Logo from "@/components/shared/Logo";

const NAVY = "var(--color-brand-dark)";
const NAVY_DARK = "var(--color-brand-dark-hover)";

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const { language, setLanguage, t } = useLanguage();

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 1024);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    const dispatch = useDispatch();
    const user = useSelector(selectCurrentUser);
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const pathname = usePathname();

    const isBn = language === "bn";
    const bnFont = isBn ? "Hind Siliguri, sans-serif" : "Poppins, sans-serif";
    const isHome = pathname === "/";
    const transparent = isHome && !isScrolled;

    useEffect(() => setMounted(true), []);

    useEffect(() => {
        const onScroll = () => setIsScrolled(window.scrollY > 40);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => setIsMenuOpen(false), [pathname]);

    // Lock body scroll while drawer is open
    useEffect(() => {
        document.body.style.overflow = isMenuOpen ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [isMenuOpen]);

    const navLinks = [
        { name: t("home"), href: "/" },
        { name: t("visa"), href: "/visa" },
        { name: t("tour"), href: "/tour" },
        { name: isBn ? "হোটেল" : "Hotel", href: "/hotel" },
        { name: t("hajjUmrah"), href: "/hajj-umrah" },
        { name: "Courses", href: "/courses" },
        { name: t("blog"), href: "/blog" },
        { name: t("aboutUs"), href: "/about" },
        { name: t("contact"), href: "/contact" },
    ];

    const centerLinks = [
        { name: "Flight",        href: "/flight",                icon: <LuPlane className="w-[22px] h-[22px] -rotate-45" /> },
        { name: "Tourism Visa",  href: "/visa",                  icon: <LuMap className="w-[22px] h-[22px]" /> },
        { name: "Student Visa",  href: "/services/study-abroad", icon: <LuGraduationCap className="w-[22px] h-[22px]" /> },
        { name: "Hotel",         href: "/hotel",                 icon: <LuBed className="w-[22px] h-[22px]" /> },
        { name: "Hajj & Umrah",  href: "/hajj-umrah",            icon: <BsMoonStars className="w-[22px] h-[22px]" /> },
        // কোর্স ফিচারটা ইংরেজিতেই (কোর্স ডাটাতেও বাংলা ফিল্ড নেই), তাই
        // লেবেল দুই ভাষাতেই "Courses"।
        { name: "Courses",       href: "/courses",               icon: <LuBookMarked className="w-[22px] h-[22px]" /> },
        { name: "Blogs",         href: "/blog",                  icon: <LuBookOpen className="w-[22px] h-[22px]" /> },
    ];

    // Only super_admin / admin exist; both go to the same admin dashboard.
    const dashboardHref = "/dashboard/admin";

    return (
        <>
            <nav
                className={`${isHome ? "fixed" : "sticky"} top-0 inset-x-0 z-50 transition-all duration-300 ${
                    transparent
                        ? "bg-transparent"
                        : "bg-white/95 backdrop-blur-md shadow-sm"
                }`}
            >
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
                    <div className="flex items-center justify-between h-[72px] lg:h-20 gap-4">
                        {/* Logo */}
                        <Link href="/" className="flex items-center flex-shrink-0">
                            <Logo className="h-16 lg:h-20 w-auto" />
                        </Link>

                        {/* Center nav — appears when navbar is solid (scrolled / non-home) */}
                        <div
                            className={`hidden lg:flex flex-1 items-center justify-center gap-8 xl:gap-12 transition-all duration-300 ${
                                transparent
                                    ? "opacity-0 -translate-y-1 pointer-events-none"
                                    : "opacity-100 translate-y-0"
                            }`}
                        >
                            {centerLinks.map((l) => {
                                const active = pathname.startsWith(l.href);
                                return (
                                    <Link
                                        key={l.href}
                                        href={l.href}
                                        className={`group flex flex-col items-center gap-1 transition-colors ${
                                            active ? "text-brand-blue" : "text-brand-dark hover:text-brand-blue"
                                        }`}
                                    >
                                        <span className="text-brand-blue group-hover:-translate-y-0.5 transition-transform">
                                            {l.icon}
                                        </span>
                                        <span
                                            className="text-[13px] font-semibold leading-none"
                                            style={{ fontFamily: bnFont }}
                                        >
                                            {l.name}
                                        </span>
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Right cluster */}
                        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                            {/* Auth avatar — only when logged in.
                                super_admin → "S", admin → "A". No Sign In button. */}
                            {mounted && isAuthenticated && user && (
                                <Link
                                    href={dashboardHref}
                                    aria-label="Dashboard"
                                    className="w-11 h-11 rounded-full text-white font-black text-base flex items-center justify-center transition-all hover:-translate-y-0.5 shadow-sm"
                                    style={{ backgroundColor: NAVY, fontFamily: bnFont }}
                                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = NAVY_DARK)}
                                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = NAVY)}
                                >
                                    S
                                </Link>
                            )}

                            {/* Menu button */}
                            <button
                                onClick={() => setIsMenuOpen(true)}
                                aria-label="Open menu"
                                className="w-11 h-11 rounded-lg text-white flex items-center justify-center transition-all hover:-translate-y-0.5"
                                style={{ backgroundColor: NAVY }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = NAVY_DARK)}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = NAVY)}
                            >
                                <FiMenu className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Top slide-down mega panel */}
            <AnimatePresence>
                {isMenuOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            onClick={() => setIsMenuOpen(false)}
                            className="fixed inset-0 bg-black/30 z-[60]"
                        />
                        {/* Panel — top slide-down on desktop, right slide-in on mobile */}
                        <motion.div
                            initial={isMobile ? { x: "100%" } : { y: "-100%" }}
                            animate={isMobile ? { x: 0 } : { y: 0 }}
                            exit={isMobile ? { x: "100%" } : { y: "-100%" }}
                            transition={{ type: "tween", duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                            className={
                                isMobile
                                    ? "fixed top-0 right-0 h-full w-[88%] max-w-sm z-[70] bg-white shadow-2xl overflow-y-auto"
                                    : "fixed top-0 inset-x-0 z-[70] bg-white shadow-2xl"
                            }
                        >
                            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
                                {/* Top row: logo + close */}
                                <div className="flex items-center justify-between h-[72px] lg:h-20">
                                    <Link href="/" onClick={() => setIsMenuOpen(false)} className="flex items-center">
                                        <Logo className="h-16 lg:h-20 w-auto" />
                                    </Link>
                                    <button
                                        onClick={() => setIsMenuOpen(false)}
                                        aria-label="Close menu"
                                        className="w-10 h-10 rounded-full flex items-center justify-center text-brand-dark hover:bg-gray-100 transition-colors"
                                    >
                                        <FiX className="w-6 h-6" />
                                    </button>
                                </div>

                                {/* Divider */}
                                <div className="border-t border-gray-200" />

                                {/* Grid content */}
                                <div className="py-8 lg:py-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_auto] gap-8 lg:gap-12">
                                    {/* Travel */}
                                    <MenuColumn title="Travel" bnFont={bnFont}>
                                        <MenuItem href="/flight" icon={<LuPlane className="w-5 h-5 -rotate-45" />} label="Flight" bnFont={bnFont} onClick={() => setIsMenuOpen(false)} />
                                        <MenuItem href="/visa" icon={<LuMap className="w-5 h-5" />} label="Tourism Visa" bnFont={bnFont} onClick={() => setIsMenuOpen(false)} />
                                        <MenuItem href="/services/study-abroad" icon={<LuGraduationCap className="w-5 h-5" />} label="Student Visa" bnFont={bnFont} onClick={() => setIsMenuOpen(false)} />
                                        <MenuItem href="/hotel" icon={<LuBed className="w-5 h-5" />} label="Hotel" bnFont={bnFont} onClick={() => setIsMenuOpen(false)} />
                                        <MenuItem href="/hajj-umrah" icon={<BsMoonStars className="w-5 h-5" />} label="Hajj & Umrah" bnFont={bnFont} onClick={() => setIsMenuOpen(false)} />
                                    </MenuColumn>

                                    {/* Services */}
                                    <MenuColumn title={isBn ? "সার্ভিস" : "Services"} bnFont={bnFont}>
                                        {/* ডাটাবেজ-চালিত কোর্স লিস্টিং। নিচের "Training" আইটেমটা আলাদা —
                                            সেটা /services/course CMS ল্যান্ডিং পেজ, এই কোর্স ফিচার নয়। */}
                                        <MenuItem href="/courses" icon={<LuGraduationCap className="w-5 h-5" />} label="Courses" bnFont={bnFont} onClick={() => setIsMenuOpen(false)} />
                                        <MenuItem href="/services/course" icon={<LuBookOpen className="w-5 h-5" />} label={isBn ? "ট্রেনিং" : "Training"} bnFont={bnFont} onClick={() => setIsMenuOpen(false)} />
                                        <MenuItem href="/services/banking-support" icon={<LuLandmark className="w-5 h-5" />} label={isBn ? "ব্যাংকিং সার্ভিস" : "Banking Service"} bnFont={bnFont} onClick={() => setIsMenuOpen(false)} />
                                        <MenuItem href="/services/passport-service" icon={<LuBookMarked className="w-5 h-5" />} label={isBn ? "পাসপোর্ট" : "Passport"} bnFont={bnFont} onClick={() => setIsMenuOpen(false)} />
                                    </MenuColumn>

                                    {/* Company */}
                                    <MenuColumn title="Company" bnFont={bnFont}>
                                        <MenuItem href="/blog" label="Blog" bnFont={bnFont} onClick={() => setIsMenuOpen(false)} />
                                        <MenuItem href="/contact" label="Contact Us" bnFont={bnFont} onClick={() => setIsMenuOpen(false)} />
                                    </MenuColumn>

                                    {/* Right greeting card */}
                                    <div
                                        className="rounded-xl p-5 lg:p-6 w-full lg:w-[300px] text-white flex flex-col justify-between"
                                        style={{ backgroundColor: NAVY }}
                                    >
                                        <div>
                                            <p className="text-lg font-bold" style={{ fontFamily: bnFont }}>
                                                {mounted && isAuthenticated && user
                                                    ? (isBn ? `হ্যালো, ${user.firstName}` : `Hello, ${user.firstName}`)
                                                    : (isBn ? "হ্যালো, ট্রাভেলার" : "Hello, Traveler")}
                                            </p>
                                            <p className="text-white/80 text-[13px] mt-1.5 leading-relaxed" style={{ fontFamily: bnFont }}>
                                                {isBn ? "একচেটিয়া অফার পান ও আপনার ট্রিপ প্ল্যান করুন!" : "Get exclusive deals & plan your trips!"}
                                            </p>
                                        </div>
                                        {mounted && isAuthenticated && user ? (
                                            <div className="flex gap-2 mt-4">
                                                <Link
                                                    href={dashboardHref}
                                                    onClick={() => setIsMenuOpen(false)}
                                                    className="flex-1 py-2.5 rounded-md text-center bg-[#FDCB1B] hover:bg-[#F0BB00] text-brand-dark font-bold text-sm transition-colors"
                                                    style={{ fontFamily: bnFont }}
                                                >
                                                    {isBn ? "ড্যাশবোর্ড" : "Dashboard"}
                                                </Link>
                                                <button
                                                    onClick={() => { dispatch(logout()); setIsMenuOpen(false); }}
                                                    className="px-3 rounded-md bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                                                    aria-label="Sign out"
                                                >
                                                    <FiLogOut className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <Link
                                                href="/login"
                                                onClick={() => setIsMenuOpen(false)}
                                                className="mt-4 inline-flex items-center justify-center px-5 py-2.5 rounded-md bg-[#FDCB1B] hover:bg-[#F0BB00] text-brand-dark font-bold text-sm transition-colors w-fit"
                                                style={{ fontFamily: bnFont }}
                                            >
                                                {isBn ? "সাইন ইন" : "Sign In"}
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}

function MenuColumn({ title, bnFont, children }) {
    return (
        <div>
            <h3
                className="text-[15px] font-bold text-brand-dark mb-4"
                style={{ fontFamily: bnFont }}
            >
                {title}
            </h3>
            <ul className="space-y-2.5 list-none p-0 m-0">{children}</ul>
        </div>
    );
}

function MenuItem({ href, icon, label, bnFont, onClick }) {
    return (
        <li className="m-0 p-0">
            <Link
                href={href}
                onClick={onClick}
                className="group flex items-center gap-3 py-1.5 text-[15px] font-medium text-gray-700 hover:text-brand-blue transition-colors"
                style={{ fontFamily: bnFont }}
            >
                {icon && (
                    <span className="text-brand-blue group-hover:scale-110 transition-transform flex-shrink-0">
                        {icon}
                    </span>
                )}
                {label}
            </Link>
        </li>
    );
}
