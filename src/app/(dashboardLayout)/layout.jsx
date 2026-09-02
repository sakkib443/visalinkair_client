"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Logo from "@/components/shared/Logo";
import { motion, AnimatePresence } from "framer-motion";
import {
    FiHome,
    FiUsers,
    FiBook,
    FiSettings,
    FiMenu,
    FiX,
    FiChevronDown,
    FiLogOut,
    FiBell,
    FiSearch,
    FiArrowLeft,
    FiPlus,
    FiPackage,
    FiGlobe,
    FiMapPin,
    FiFileText,
    FiMail,
    FiCalendar,
    FiDollarSign,
    FiBarChart2,
    FiTrendingUp,
    FiImage,
    FiStar,
    FiMessageSquare,
    FiClipboard,
    FiBookOpen,
    FiLayout,
    FiPhone,
    FiTarget,
    FiBriefcase,
    FiUserCheck,
    FiUpload,
    FiCheckCircle,
} from "react-icons/fi";
import { LuPlane, LuGraduationCap, LuHotel, LuShieldCheck, LuMap } from "react-icons/lu";
import { FaKaaba, FaMosque } from "react-icons/fa6";
import { FaWhatsapp } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { selectCurrentUser, selectIsAuthenticated, selectToken, logout, updateUser } from "@/redux/features/authSlice";

const menuItems = [
    {
        name: "Dashboard",
        href: "/dashboard/admin",
        icon: FiHome,
    },

    // ─────────── ALL QUERIES (WhatsApp inquiries → assign → convert) ───────────
    {
        name: "All Queries",
        icon: FiTarget,
        defaultOpen: true,
        children: [
            { name: "Inquiries", href: "/dashboard/admin/inquiries", icon: FiMail },
            { name: "Flight Inquiry", href: "/dashboard/admin/flight-inquiries", icon: LuPlane, badgeKey: "flight" },
            { name: "Tourism Visa Inquiry", href: "/dashboard/admin/tourism-visa-inquiries", icon: LuMap, badgeKey: "visa" },
            { name: "Student Visa Inquiry", href: "/dashboard/admin/student-visa-inquiries", icon: LuGraduationCap, badgeKey: "student" },
            { name: "Hajj Package Inquiry",  href: "/dashboard/admin/hajj-package-inquiries",  icon: FaKaaba, badgeKey: "hajj" },
            { name: "Umrah Package Inquiry", href: "/dashboard/admin/umrah-package-inquiries", icon: FaMosque, badgeKey: "umrah" },
            { name: "Course Inquiry", href: "/dashboard/admin/course-inquiries", icon: LuGraduationCap, badgeKey: "course" },
        ],
    },

    // ─────────── ALL REMARKS (Follow-up notes on inquiries) ───────────
    {
        name: "All Remarks",
        icon: FiMessageSquare,
        defaultOpen: true,
        children: [
            { name: "Overview",             href: "/dashboard/admin/remarks",                icon: FiMessageSquare },
            { name: "Flight Remarks",       href: "/dashboard/admin/remarks/flight",         icon: LuPlane },
            { name: "Tourism Visa Remarks", href: "/dashboard/admin/remarks/tourism-visa",   icon: LuMap },
            { name: "Student Visa Remarks", href: "/dashboard/admin/remarks/student-visa",   icon: LuGraduationCap },
            { name: "Hajj Package Remarks", href: "/dashboard/admin/remarks/hajj-package",   icon: FaKaaba },
            { name: "Umrah Package Remarks",href: "/dashboard/admin/remarks/umrah-package",  icon: FaMosque },
            { name: "Course Remarks",       href: "/dashboard/admin/remarks/course",         icon: LuGraduationCap },
        ],
    },

    // ─────────── SERVICE PAGES (CMS) ───────────
    {
        name: "Service Pages",
        icon: FiLayout,
        defaultOpen: true,
        children: [
            { name: "All Services", href: "/dashboard/admin/services", icon: FiLayout },
            { name: "Create Service", href: "/dashboard/admin/services/create", icon: FiPlus },
        ],
    },

    // ─────────── ADMIN ───────────
    {
        section: "OPERATIONS",
    },
    // Bookings menu removed with the Bookings feature (2026-08-20).
    // All incoming leads now live under All Queries → Inquiries.
    {
        name: "Super Admins",
        icon: LuShieldCheck,
        children: [
            // Single role — super_admin. Accounts can be created, viewed and
            // deleted; there is no edit screen.
            { name: "All Super Admins", href: "/dashboard/admin/users", icon: FiUsers },
            { name: "Add Super Admin", href: "/dashboard/admin/users/create", icon: FiPlus },
        ],
    },
    {
        section: "VISA SERVICES",
    },
    // Tourist / Student visa pages — each row is one admin-authored,
    // rich-text country page that drives the public search + details page.
    {
        name: "Tourist Visa",
        icon: LuMap,
        defaultOpen: true,
        children: [
            { name: "All Tourist Visas", href: "/dashboard/admin/tourist-visas", icon: LuMap },
            { name: "Add Tourist Visa", href: "/dashboard/admin/tourist-visas/create", icon: FiPlus },
        ],
    },
    {
        name: "Student Visa",
        icon: LuGraduationCap,
        defaultOpen: true,
        children: [
            { name: "All Student Visas", href: "/dashboard/admin/student-visas", icon: LuGraduationCap },
            { name: "Add Student Visa", href: "/dashboard/admin/student-visas/create", icon: FiPlus },
        ],
    },
    // Shared banner image for every visa details page
    {
        name: "Visa Page Banner",
        href: "/dashboard/admin/visa-banner",
        icon: FiImage,
    },
    // Visa Applications and Visa Categories sections removed with those
    // features (2026-08-20). Visa detail pages are now authored per-country
    // under Tourist Visa / Student Visa above.
    // Countries and Documents sections removed with those features
    // (2026-08-21). Per-country visa content is now authored under
    // Tourist Visa / Student Visa above.
    {
        section: "TRAVEL & PACKAGES",
    },
    // Tour Packages removed with the Tours feature (2026-09-02).
    {
        name: "Hotels",
        icon: LuHotel,
        children: [
            { name: "All Hotels", href: "/dashboard/admin/hotels", icon: LuHotel },
            { name: "Add Hotel", href: "/dashboard/admin/hotels/create", icon: FiPlus },
        ],
    },
    {
        name: "Hajj & Umrah",
        icon: FaKaaba,
        children: [
            { name: "All Packages", href: "/dashboard/admin/hajj-umrah", icon: FaKaaba },
            { name: "Create Package", href: "/dashboard/admin/hajj-umrah/create", icon: FiPlus },
        ],
    },
    // ─────────── COURSES (eLearning) ───────────
    // ক্যাটাগরি আলাদা মেনু পায়নি ইচ্ছে করেই — কোর্স ফর্মের একদম উপরেই
    // ডাইনামিকভাবে ক্যাটাগরি বানানো/এডিট/ডিলিট করা যায়।
    {
        section: "COURSES",
    },
    {
        name: "Courses",
        icon: LuGraduationCap,
        defaultOpen: true,
        children: [
            { name: "All Courses", href: "/dashboard/admin/courses", icon: FiBookOpen },
            { name: "Add New Course", href: "/dashboard/admin/courses/create", icon: FiPlus },
        ],
    },
    // Air tickets are parked for now — hidden from the nav, but the pages and the
    // ticket module behind them are untouched. Drop the `hidden` flags to bring
    // the section back.
    {
        section: "AIR TICKETS",
        hidden: true,
    },
    {
        name: "Ticket Generator",
        href: "/dashboard/admin/ticket-generator",
        icon: LuPlane,
        hidden: true,
    },
    {
        name: "Saved Tickets",
        href: "/dashboard/admin/all-tickets",
        icon: FiClipboard,
        hidden: true,
    },
    {
        section: "CONTENT & DESIGN",
    },
    {
        name: "Blog",
        icon: FiBook,
        children: [
            { name: "All Posts", href: "/dashboard/admin/blog", icon: FiBook },
            { name: "Write Post", href: "/dashboard/admin/blog/create", icon: FiPlus },
        ],
    },
    {
        name: "Testimonials",
        href: "/dashboard/admin/testimonials",
        icon: FiStar,
    },
    {
        name: "Website Content",
        icon: FiLayout,
        children: [
            { name: "Home Page", href: "/dashboard/admin/design-content/home", icon: FiHome },
            { name: "Contact Page", href: "/dashboard/admin/design-content/contact", icon: FiPhone },
            { name: "Social Links", href: "/dashboard/admin/design-content/social", icon: FiGlobe },
            { name: "Legal Pages", href: "/dashboard/admin/design-content/legal", icon: FiFileText },
        ],
    },
    {
        section: "SETTINGS",
    },
    {
        name: "Settings",
        href: "/dashboard/admin/settings",
        icon: FiSettings,
    },
    {
        name: "Profile",
        href: "/dashboard/admin/profile",
        icon: FiUsers,
    },

];

function SidebarItem({ item, isCollapsed, badges = {} }) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isOpen, setIsOpen] = useState(item.defaultOpen || false);

    // Match a link that may carry query params (e.g. bookings ?type=, users
    // ?group=). Every param in the link's query must match the current URL.
    const linkActive = (href) => {
        if (!href) return false;
        const [p, q] = href.split("?");
        if (p !== pathname) return false;
        if (!q) return true;
        const want = new URLSearchParams(q);
        for (const [k, v] of want.entries()) {
            if ((searchParams.get(k) || "") !== v) return false;
        }
        return true;
    };

    const isActive = item.href
        ? linkActive(item.href)
        : item.children?.some((child) => linkActive(child.href));

    useEffect(() => {
        if (item.children && item.children.some((child) => linkActive(child.href))) {
            setIsOpen(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname, searchParams, item.children]);

    if (item.children) {
        return (
            <div>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`group w-full flex items-center justify-between px-3 py-2 mx-2.5 my-0.5 rounded-md transition-all text-[13px] ${isActive
                        ? "bg-white text-brand-accent font-bold shadow-[0_2px_10px_-2px_rgba(0,0,0,0.08),0_0_0_1px_rgba(239,140,44,0.15)] dark:bg-gray-900/60 dark:text-brand-accent"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800/50 dark:hover:text-gray-200"
                        }`}
                    style={{ width: "calc(100% - 20px)" }}
                >
                    <div className="flex items-center gap-3">
                        <item.icon className={`w-[17px] h-[17px] ${isActive ? "text-brand-accent" : "text-gray-400 group-hover:text-gray-600"}`} />
                        {!isCollapsed && <span className="font-medium">{item.name}</span>}
                    </div>
                    {!isCollapsed && (
                        <FiChevronDown
                            className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""} ${isActive ? "text-brand-accent" : "text-gray-300"}`}
                        />
                    )}
                </button>
                <AnimatePresence>
                    {isOpen && !isCollapsed && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mt-0.5 space-y-0 overflow-hidden"
                        >
                            {item.children.map((child) => {
                                const count = child.badgeKey ? (badges[child.badgeKey] || 0) : 0;
                                const active = linkActive(child.href);
                                return (
                                    <Link
                                        key={child.name}
                                        href={child.href}
                                        className={`flex items-center gap-2.5 pl-11 pr-4 py-[7px] text-[12px] border-l-[3px] transition-colors ${active
                                            ? "border-brand-accent bg-brand-accent-soft text-brand-accent-ink font-semibold dark:bg-brand-accent/10 dark:text-brand-accent"
                                            : "border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-800/50"
                                            }`}
                                    >
                                        {child.icon && <child.icon className={`w-3.5 h-3.5 ${active ? "text-brand-accent" : ""}`} />}
                                        <span className="flex-1">{child.name}</span>
                                        {count > 0 && (
                                            <span className="ml-auto min-w-[20px] h-[20px] px-1.5 rounded-full bg-[#EF4444] text-white text-[10px] font-bold flex items-center justify-center leading-none tabular-nums">
                                                {count > 99 ? "99+" : count}
                                            </span>
                                        )}
                                    </Link>
                                );
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    return (
        <Link
            href={item.href}
            className={`group flex items-center gap-3 px-3 py-2 mx-2.5 my-0.5 rounded-md transition-all text-[13px] ${isActive
                ? "bg-white text-brand-accent font-bold shadow-[0_2px_10px_-2px_rgba(0,0,0,0.08),0_0_0_1px_rgba(239,140,44,0.15)] dark:bg-gray-900/60 dark:text-brand-accent"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800/50 dark:hover:text-gray-200"
                }`}
            style={{ width: "calc(100% - 20px)" }}
        >
            <item.icon className={`w-[17px] h-[17px] ${isActive ? "text-brand-accent" : "text-gray-400 group-hover:text-gray-600"}`} />
            {!isCollapsed && <span className={isActive ? "" : "font-medium"}>{item.name}</span>}
        </Link>
    );
}

export default function DashboardLayout({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const user = useSelector(selectCurrentUser);
    const token = useSelector(selectToken);
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const dispatch = useDispatch();
    const router = useRouter();
    const pathname = usePathname();

    // Helper: check if JWT token is expired
    const isTokenExpired = (tkn) => {
        if (!tkn) return true;
        try {
            const payload = JSON.parse(atob(tkn.split('.')[1]));
            // exp is in seconds, Date.now() is in ms
            return payload.exp * 1000 < Date.now();
        } catch {
            return true;
        }
    };

    useEffect(() => {
        // Initial check
        if (!token || !isAuthenticated || isTokenExpired(token)) {
            dispatch(logout());
            router.replace("/login");
            return;
        }
        setIsLoading(false);

        // Periodic check every 60 seconds — auto-logout if token expired
        const interval = setInterval(() => {
            if (isTokenExpired(token)) {
                dispatch(logout());
                router.replace("/login");
            }
        }, 60000);

        return () => clearInterval(interval);
    }, [token, isAuthenticated, router, dispatch]);

    // Hydrate the live role from the server so the sidebar reflects account
    // changes without requiring a fresh login.
    const BACKEND = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    useEffect(() => {
        if (!token) return;
        let cancelled = false;
        fetch(`${BACKEND}/api/users/me`, { headers: { Authorization: `Bearer ${token}` } })
            .then((r) => (r.ok ? r.json() : null))
            .then((d) => {
                if (cancelled || !d?.data) return;
                const me = d.data;
                if (user && me.role !== user.role) {
                    dispatch(updateUser({ role: me.role }));
                }
            })
            .catch(() => {});
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    // Live sidebar badges — count of new inquiries per service, polled every 30s.
    const [badges, setBadges] = useState({ flight: 0, visa: 0, student: 0, hajj: 0, umrah: 0, course: 0 });
    useEffect(() => {
        if (!token) return;
        let alive = true;
        const auth = { Authorization: `Bearer ${token}` };
        const load = async () => {
            try {
                const services = [
                    ["flight",  "flight-booking"],
                    ["visa",    "tourism-visa"],
                    ["student", "student-visa"],
                    ["hajj",    "hajj-package"],
                    ["umrah",   "umrah-package"],
                    ["course",  "course"],
                ];
                const responses = await Promise.all(
                    services.map(([, s]) =>
                        fetch(`${BACKEND}/api/inquiries?service=${s}&status=new&limit=1`, { headers: auth })
                            .then((r) => r.json())
                            .catch(() => null)
                    )
                );
                if (!alive) return;
                const next = {};
                services.forEach(([key], i) => {
                    next[key] = responses[i]?.success ? (responses[i].meta?.total || 0) : 0;
                });
                setBadges(next);
            } catch { /* silent */ }
        };
        load();
        const id = setInterval(load, 30000);
        return () => { alive = false; clearInterval(id); };
    }, [token, BACKEND]);

    // Only super_admin / admin have dashboard access. Anyone else is bounced to login.
    useEffect(() => {
        const role = user?.role;
        if (!role) return;
        if (role !== "super_admin") {
            router.replace("/login");
        }
    }, [user, router]);

    const handleLogout = () => {
        dispatch(logout());
        router.push("/login");
    };

    // Close mobile sidebar on route change
    useEffect(() => {
        setIsMobileOpen(false);
    }, [pathname]);

    if (isLoading && (!token || !isAuthenticated)) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] dark:bg-gray-900 flex items-center justify-center" style={{ fontFamily: "Poppins, sans-serif" }}>
                <div className="text-center">
                    <div className="w-14 h-14 border-3 border-brand-dark border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500 text-sm">Authenticating...</p>
                </div>
            </div>
        );
    }

    const renderSidebarContent = (isCollapsedMode = false) => (
        <>
            {menuItems.filter(item => !item.hidden && (item.roles ? item.roles.includes(user?.role) : (user?.role === 'super_admin'))).map((item, index) => {
                if (item.section) {
                    if (isCollapsedMode) return <div key={index} className="my-3 border-t border-gray-100 dark:border-gray-700/50" />;
                    return (
                        <p key={index} className="px-4 pt-3.5 pb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-400">
                            {item.section}
                        </p>
                    );
                }
                return <SidebarItem key={item.name} item={item} isCollapsed={isCollapsedMode} badges={badges} />;
            })}
        </>
    );

    return (
        <div className="min-h-screen bg-[#F5F6FA] dark:bg-gray-900" style={{ fontFamily: "Poppins, sans-serif" }}>
            {/* Desktop Sidebar */}
            <aside
                className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 ${isSidebarOpen ? "w-[260px]" : "w-[70px]"
                    } bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700/50 hidden lg:flex flex-col`}
            >
                {/* Logo */}
                <div className="h-[72px] flex items-center justify-between px-4 border-b border-gray-100 dark:border-gray-700/50 flex-shrink-0">
                    <Link href="/" className="flex items-center gap-2.5">
                        <Logo className={`transition-all duration-300 ${isSidebarOpen ? "h-24" : "h-12"} w-auto`} />
                    </Link>
                </div>

                {/* Back to Website */}
                <div className="px-3 py-2 border-b border-gray-50 dark:border-gray-700/30 flex-shrink-0">
                    <Link
                        href="/"
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all group text-[12px]"
                    >
                        <FiArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                        {isSidebarOpen && <span className="font-medium">Back to Website</span>}
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-2 space-y-0 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
                    {renderSidebarContent(!isSidebarOpen)}
                </nav>

                {/* User & Logout */}
                <div className="p-3 border-t border-gray-100 dark:border-gray-700/50 flex-shrink-0">
                    {isSidebarOpen && (
                        <div className="flex items-center gap-3 px-3 py-2.5 mb-2 rounded-lg bg-[#F8FAFC] dark:bg-gray-700/30">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-bold text-white" style={{ backgroundColor: 'var(--color-brand-dark)' }}>
                                {user?.firstName?.[0] || "A"}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[12px] font-semibold text-gray-800 dark:text-white truncate">
                                    {user?.firstName || "Admin"} {user?.lastName || ""}
                                </p>
                                <p className="text-[10px] text-gray-400 capitalize">{user?.role || "super_admin"}</p>
                            </div>
                        </div>
                    )}
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-[12px] font-medium"
                    >
                        <FiLogOut size={14} />
                        {isSidebarOpen && <span>Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isMobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                            onClick={() => setIsMobileOpen(false)}
                        />
                        <motion.aside
                            initial={{ x: -280 }}
                            animate={{ x: 0 }}
                            exit={{ x: -280 }}
                            transition={{ type: "spring", damping: 25 }}
                            className="fixed top-0 left-0 z-50 w-[260px] h-screen bg-white dark:bg-gray-800 lg:hidden flex flex-col"
                        >
                            <div className="h-[72px] flex items-center justify-between px-4 border-b border-gray-100 dark:border-gray-700/50">
                                <Link href="/" className="flex items-center gap-2.5">
                                    <Logo className="h-24 w-auto" />
                                </Link>
                                <button onClick={() => setIsMobileOpen(false)} className="p-1.5 rounded-md hover:bg-gray-100">
                                    <FiX className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>
                            <nav className="flex-1 py-3 space-y-0 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
                                {renderSidebarContent(false)}
                            </nav>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <div className={`${isSidebarOpen ? "lg:ml-[260px]" : "lg:ml-[70px]"} transition-all duration-300`}>
                {/* Top Header */}
                <header className="sticky top-0 z-30 h-[72px] bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border-b border-gray-100 dark:border-gray-700/50 px-4 lg:px-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsMobileOpen(true)}
                            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            <FiMenu className="w-5 h-5 text-gray-500" />
                        </button>
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="hidden lg:block p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            <FiMenu className="w-4.5 h-4.5 text-gray-400" />
                        </button>
                        <div className="relative hidden md:block">
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                            <input
                                type="text"
                                placeholder="Search anything..."
                                className="w-64 pl-10 pr-4 py-2 rounded-lg bg-[#F5F6FA] dark:bg-gray-700 border border-gray-100 dark:border-gray-600 focus:border-brand-dark focus:ring-1 focus:ring-brand-dark/10 text-[13px] text-gray-600 placeholder-gray-400 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Notifications */}
                        <button className="relative p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <FiBell className="w-[18px] h-[18px] text-gray-400" />
                            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-brand-accent rounded-full" />
                        </button>

                        {/* Visit Site */}
                        <Link
                            href="/"
                            target="_blank"
                            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-100 text-[11px] font-semibold text-gray-500 hover:bg-gray-50 transition-all"
                        >
                            <FiGlobe size={12} />
                            Visit Site
                        </Link>

                        {/* User */}
                        <div className="flex items-center gap-2.5 pl-2 ml-1 border-l border-gray-100 dark:border-gray-700">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white" style={{ backgroundColor: 'var(--color-brand-dark)' }}>
                                {user?.firstName?.[0] || "A"}
                            </div>
                            <div className="hidden sm:block">
                                <p className="text-[12px] font-semibold text-gray-700 dark:text-white">
                                    {user?.firstName || "Admin"}
                                </p>
                                <p className="text-[10px] text-gray-400 capitalize">{user?.role || "super_admin"}</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="min-h-[calc(100vh-60px)]">{children}</main>
            </div>
        </div>
    );
}
