"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
    FiUsers,
    FiDollarSign,
    FiTrendingUp,
    FiTrendingDown,
    FiArrowRight,
    FiRefreshCw,
    FiCheckCircle,
    FiClock,
    FiFileText,
    FiMapPin,
    FiCalendar,
    FiGlobe,
    FiPlus,
} from "react-icons/fi";
import { LuPlane, LuGraduationCap } from "react-icons/lu";
import { FaKaaba } from "react-icons/fa6";
import { FaWhatsapp } from "react-icons/fa";
import { analyticsService, inquiriesApi, servicesApi } from "@/services/api";
import { FiMail, FiLayout } from "react-icons/fi";

// ==================== ANIMATED COUNTER ====================
const AnimatedCounter = ({ value, duration = 2000, prefix = "", suffix = "" }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        const numValue = typeof value === "number" ? value : parseInt(String(value).replace(/[^0-9]/g, "")) || 0;
        const increment = numValue / (duration / 16);
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= numValue) {
                setCount(numValue);
                clearInterval(timer);
            } else {
                setCount(Math.floor(current));
            }
        }, 16);

        return () => clearInterval(timer);
    }, [value, duration]);

    return <span>{prefix}{count.toLocaleString()}{suffix}</span>;
};

// ==================== MINI CHART ====================
const MiniChart = ({ data, color = "var(--color-brand-accent)" }) => {
    const max = Math.max(...data, 1);
    const points = data.map((v, i) => ({
        x: (i / (data.length - 1)) * 100,
        y: 100 - (v / max) * 80,
    }));

    let path = `M ${points[0]?.x || 0} ${points[0]?.y || 50}`;
    for (let i = 0; i < points.length - 1; i++) {
        const cp1x = points[i].x + (points[i + 1].x - points[i].x) * 0.4;
        const cp2x = points[i + 1].x - (points[i + 1].x - points[i].x) * 0.4;
        path += ` C ${cp1x} ${points[i].y}, ${cp2x} ${points[i + 1].y}, ${points[i + 1].x} ${points[i + 1].y}`;
    }

    return (
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
            <defs>
                <linearGradient id={`chartFill-${color.replace('#', '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={color} stopOpacity="0.15" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            <path d={`${path} L 100 100 L 0 100 Z`} fill={`url(#chartFill-${color.replace('#', '')})`} />
            <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
        </svg>
    );
};

// ==================== MAIN DASHBOARD ====================
export default function AdminDashboard() {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [stats, setStats] = useState({
        totalClients: 0,
        totalApplications: 0,
        totalRevenue: 0,
        pendingApplications: 0,
        approvedVisas: 0,
        rejectedVisas: 0,
        // tourBookings dropped with the Tour Packages feature.
        hajjBookings: 0,
        monthlyRevenue: 0,
        totalDue: 0,
        todayRevenue: 0,
        changes: {},
        sparklines: {},
        leads: {},
    });

    const [recentApplications, setRecentApplications] = useState([]);
    // upcomingTours state removed with the Tour Packages feature.
    const [error, setError] = useState(false);

    // Inquiries + services quick summary
    const [inquiryStats, setInquiryStats] = useState({ total: 0, newCount: 0, todayCount: 0, converted: 0, byService: [] });
    const [servicesCount, setServicesCount] = useState({ total: 0, active: 0 });

    const fetchDashboardData = async () => {
        setRefreshing(true);
        setError(false);
        try {
            const response = await analyticsService.getDashboard();
            if (response.success && response.data) {
                const { recentApplications: apps, upcomingTours: _unusedTours, ...statValues } = response.data;
                void _unusedTours; // analytics still emits this — ignored since Tours were removed.
                setStats(prev => ({ ...prev, ...statValues }));
                setRecentApplications(Array.isArray(apps) ? apps : []);
            } else {
                setError(true);
            }
        } catch (error) {
            setError(true);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
        (async () => {
            try {
                const [inq, svc] = await Promise.all([
                    inquiriesApi.stats().catch(() => null),
                    servicesApi.listAll().catch(() => null),
                ]);
                if (inq?.data) setInquiryStats(inq.data);
                if (svc?.data) {
                    setServicesCount({
                        total: svc.data.length,
                        active: svc.data.filter((s) => s.isActive).length,
                    });
                }
            } catch { /* non-fatal */ }
        })();
    }, []);

    // Real change badge + sparkline series come from the analytics API (keyed by stat name).
    const EMPTY_SPARK = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const cardChange = (key) => stats.changes?.[key] || { change: "—", trend: "up" };
    const cardSpark = (key) => (stats.sparklines?.[key]?.length ? stats.sparklines[key] : EMPTY_SPARK);

    const mainCards = [
        {
            title: "Total Clients",
            value: stats.totalClients,
            ...cardChange("totalClients"),
            icon: FiUsers,
            color: "var(--color-brand-dark)",
            chartData: cardSpark("totalClients"),
        },
        {
            title: "Visa Applications",
            value: stats.totalApplications,
            ...cardChange("totalApplications"),
            icon: FiFileText,
            color: "var(--color-brand-accent)",
            chartData: cardSpark("totalApplications"),
        },
        {
            title: "Total Revenue",
            value: stats.totalRevenue,
            ...cardChange("totalRevenue"),
            icon: FiDollarSign,
            color: "#10B981",
            prefix: "৳",
            chartData: cardSpark("totalRevenue"),
        },
        {
            title: "Pending Cases",
            value: stats.pendingApplications,
            ...cardChange("pendingApplications"),
            icon: FiClock,
            color: "#F59E0B",
            chartData: cardSpark("pendingApplications"),
        },
    ];

    const serviceCards = [
        { name: "Hajj & Umrah", value: stats.hajjBookings, icon: FaKaaba, color: "#8B5CF6", href: "/dashboard/admin/hajj-umrah" },
        // "Tour Packages" removed with the Tour Packages feature (2026-09-02).
        // "Approved Visas" removed with the Visa Applications feature.
    ];

    const getStatusStyle = (status) => {
        switch (status) {
            case "approved": return "bg-emerald-50 text-emerald-600 border border-emerald-100";
            case "processing": return "bg-blue-50 text-blue-600 border border-blue-100";
            case "pending": return "bg-amber-50 text-amber-600 border border-amber-100";
            case "rejected": return "bg-red-50 text-red-500 border border-red-100";
            default: return "bg-gray-50 text-gray-600";
        }
    };

    const quickActions = [
        { name: "Add Tourist Visa", href: "/dashboard/admin/tourist-visas/create", icon: FiPlus, color: "var(--color-brand-dark)" },
        { name: "Add Student Visa", href: "/dashboard/admin/student-visas/create", icon: FiPlus, color: "#3B82F6" },
        { name: "Add Hajj Package", href: "/dashboard/admin/hajj-umrah/create", icon: FaKaaba, color: "#8B5CF6" },
        { name: "New Admin", href: "/dashboard/admin/users/create", icon: FiUsers, color: "var(--color-brand-accent)" },
    ];

    return (
        <div className="p-4 lg:p-6 space-y-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-tight" style={{ fontFamily: 'Teko, sans-serif', color: 'var(--color-brand-dark)' }}>
                        Dashboard Overview
                    </h1>
                    <p className="text-[12px] text-gray-400 mt-0.5">
                        {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={fetchDashboardData}
                        disabled={refreshing}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-[11px] font-semibold text-gray-500 hover:bg-gray-50 transition-all"
                    >
                        <FiRefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
                        {refreshing ? "Syncing..." : "Refresh"}
                    </button>
                </div>
            </div>

            {/* Main Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {mainCards.map((card, index) => (
                    <motion.div
                        key={card.title}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.08 }}
                        className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700/50 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{card.title}</p>
                                <p className="text-2xl font-semibold text-gray-800 dark:text-white mt-1">
                                    {loading ? (
                                        <span className="inline-block w-20 h-7 bg-gray-100 rounded animate-pulse" />
                                    ) : (
                                        <AnimatedCounter value={card.value} prefix={card.prefix || ""} />
                                    )}
                                </p>
                            </div>
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${card.color}10` }}>
                                <card.icon size={18} style={{ color: card.color }} />
                            </div>
                        </div>
                        <div className="flex items-center justify-between min-h-[16px]">
                            {loading ? (
                                <span className="inline-block w-24 h-3.5 bg-gray-100 rounded animate-pulse" />
                            ) : (
                                <div className={`flex items-center gap-1 text-[11px] font-semibold ${card.trend === "up" ? "text-emerald-500" : "text-amber-500"}`}>
                                    {card.trend === "up" ? <FiTrendingUp size={12} /> : <FiTrendingDown size={12} />}
                                    {card.change}
                                    <span className="text-gray-400 font-normal ml-1">vs last month</span>
                                </div>
                            )}
                        </div>
                        <div className="h-10 mt-2">
                            <MiniChart data={card.chartData} color={card.color} />
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Inquiries + Services quick summary — Phase 4 additions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Link href="/dashboard/admin/inquiries" className="lg:col-span-2 group bg-white rounded-xl p-5 border border-gray-100 hover:border-brand-blue/40 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "color-mix(in srgb, var(--color-brand-blue) 8%, transparent)" }}>
                                <FiMail size={18} style={{ color: "var(--color-brand-blue)" }} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-brand-dark">Service Inquiries</p>
                                <p className="text-[11px] text-gray-500">Public form submissions across every service page</p>
                            </div>
                        </div>
                        <FiArrowRight className="text-gray-400 group-hover:text-brand-blue group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                        <MiniStat label="Total" value={inquiryStats.total} color="var(--color-brand-dark)" />
                        <MiniStat label="New" value={inquiryStats.newCount} color="var(--color-brand-blue)" />
                        <MiniStat label="Today" value={inquiryStats.todayCount} color="var(--color-brand-accent)" />
                        <MiniStat label="Converted" value={inquiryStats.converted} color="#10B981" />
                    </div>
                </Link>

                <Link href="/dashboard/admin/services" className="group bg-white rounded-xl p-5 border border-gray-100 hover:border-brand-accent/40 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "color-mix(in srgb, var(--color-brand-accent) 8%, transparent)" }}>
                                <FiLayout size={18} style={{ color: "var(--color-brand-accent)" }} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-brand-dark">Service Pages (CMS)</p>
                                <p className="text-[11px] text-gray-500">Study Abroad, Passport, Banking, Course, Career</p>
                            </div>
                        </div>
                        <FiArrowRight className="text-gray-400 group-hover:text-brand-accent group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <MiniStat label="Total" value={servicesCount.total} color="var(--color-brand-dark)" />
                        <MiniStat label="Live" value={servicesCount.active} color="#10B981" />
                    </div>
                </Link>
            </div>


            {/* Finance Row (real payment data) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { title: "This Month", value: stats.monthlyRevenue, icon: FiCalendar, color: "#3B82F6" },
                    { title: "Outstanding Dues", value: stats.totalDue, icon: FiTrendingDown, color: "#EF4444" },
                    { title: "Today's Revenue", value: stats.todayRevenue, icon: FiDollarSign, color: "#10B981" },
                ].map((c) => (
                    <div key={c.title} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700/50 flex items-center gap-4">
                        <div className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${c.color}12` }}>
                            <c.icon size={18} style={{ color: c.color }} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{c.title}</p>
                            <p className="text-xl font-bold text-gray-800 dark:text-white">
                                {loading ? (
                                    <span className="inline-block w-16 h-6 bg-gray-100 rounded animate-pulse" />
                                ) : (
                                    <><span className="text-gray-400">৳</span><AnimatedCounter value={c.value} /></>
                                )}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Service Stats */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3"
            >
                {serviceCards.map((card) => (
                    <Link
                        key={card.name}
                        href={card.href}
                        className="group bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700/50 hover:shadow-md transition-all text-center"
                    >
                        <div
                            className="w-10 h-10 mx-auto rounded-lg flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform"
                            style={{ backgroundColor: `${card.color}10` }}
                        >
                            <card.icon size={18} style={{ color: card.color }} />
                        </div>
                        <p className="text-xl font-semibold text-gray-800 dark:text-white">
                            {loading ? "..." : card.value}
                        </p>
                        <p className="text-[10px] font-medium text-gray-400 mt-0.5">{card.name}</p>
                    </Link>
                ))}
            </motion.div>

            {/* Quick Actions */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-2 lg:grid-cols-4 gap-3"
            >
                {quickActions.map((action) => (
                    <Link
                        key={action.name}
                        href={action.href}
                        className="group flex items-center gap-3 bg-white dark:bg-gray-800 rounded-xl p-3.5 border border-gray-100 dark:border-gray-700/50 hover:shadow-md transition-all"
                    >
                        <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform"
                            style={{ backgroundColor: `${action.color}10` }}
                        >
                            <action.icon size={15} style={{ color: action.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-semibold text-gray-700 dark:text-gray-200 truncate">{action.name}</p>
                            <p className="text-[10px] text-gray-400">Quick action</p>
                        </div>
                        <FiArrowRight size={13} className="text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all" />
                    </Link>
                ))}
            </motion.div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Recent Applications */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700/50"
                >
                    <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700/50">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-800 dark:text-white">Recent Inquiries</h3>
                            <p className="text-[10px] text-gray-400 mt-0.5">Latest inbound leads</p>
                        </div>
                        <Link href="/dashboard/admin/inquiries" className="text-[11px] font-semibold flex items-center gap-1 hover:underline" style={{ color: 'var(--color-brand-accent)' }}>
                            View All <FiArrowRight size={12} />
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        {error ? (
                            <div className="text-center py-12 text-gray-400">
                                <FiFileText size={36} className="mx-auto mb-3 opacity-30" />
                                <p className="text-[13px] font-medium">Couldn't load applications</p>
                                <p className="text-[11px] mt-1">Please try refreshing</p>
                            </div>
                        ) : (!loading && recentApplications.length === 0) ? (
                            <div className="text-center py-12 text-gray-400">
                                <FiFileText size={36} className="mx-auto mb-3 opacity-30" />
                                <p className="text-[13px] font-medium">No recent applications</p>
                                <p className="text-[11px] mt-1">New applications will appear here</p>
                            </div>
                        ) : (
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-50 dark:border-gray-700/50">
                                        <th className="text-left px-4 py-3 text-[9px] font-bold uppercase tracking-wider text-gray-400">ID</th>
                                        <th className="text-left px-4 py-3 text-[9px] font-bold uppercase tracking-wider text-gray-400">Applicant</th>
                                        <th className="text-left px-4 py-3 text-[9px] font-bold uppercase tracking-wider text-gray-400">Type</th>
                                        <th className="text-left px-4 py-3 text-[9px] font-bold uppercase tracking-wider text-gray-400">Country</th>
                                        <th className="text-left px-4 py-3 text-[9px] font-bold uppercase tracking-wider text-gray-400">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentApplications.map((app) => (
                                        <tr key={app.id} className="border-b border-gray-50 dark:border-gray-700/30 hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors">
                                            <td className="px-4 py-3 text-[11px] font-mono font-semibold text-gray-500">{app.id}</td>
                                            <td className="px-4 py-3">
                                                <p className="text-[12px] font-semibold text-gray-700 dark:text-gray-200">{app.name}</p>
                                                <p className="text-[10px] text-gray-400">{app.date}</p>
                                            </td>
                                            <td className="px-4 py-3 text-[11px] text-gray-500">{app.type}</td>
                                            <td className="px-4 py-3 text-[12px]">{app.country}</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${getStatusStyle(app.status)}`}>
                                                    {app.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </motion.div>

                {/* "Upcoming Tours" panel removed with the Tour Packages feature (2026-09-02). */}
            </div>
        </div>
    );
}

function MiniStat({ label, value, color }) {
    return (
        <div className="rounded-lg bg-gray-50 border border-gray-100 px-3 py-2">
            <p className="text-[9px] font-bold uppercase tracking-wider text-gray-500">{label}</p>
            <p className="text-lg font-black leading-tight" style={{ color, fontFamily: "Teko, sans-serif" }}>
                {value ?? 0}
            </p>
        </div>
    );
}
