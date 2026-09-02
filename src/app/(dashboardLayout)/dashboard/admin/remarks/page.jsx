"use client";

// ===================================================================
// All Remarks — landing.
// Six category cards, each with the live "today / total / overdue"
// counts for that service. Click one to drill into per-service list.
// ===================================================================

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
    FiMessageSquare, FiCalendar, FiAlertCircle, FiChevronRight,
    FiRefreshCw, FiLoader,
} from "react-icons/fi";
import { LuPlane, LuMap, LuGraduationCap } from "react-icons/lu";
import { FaKaaba, FaMosque } from "react-icons/fa6";
import { remarkService } from "@/services/api";

const CATEGORIES = [
    { key: "flight-booking", href: "/dashboard/admin/remarks/flight",        title: "Flight",         Icon: LuPlane,        accent: "var(--color-brand-blue)" },
    { key: "tourism-visa",   href: "/dashboard/admin/remarks/tourism-visa",  title: "Tourism Visa",   Icon: LuMap,          accent: "var(--color-brand-accent)" },
    { key: "student-visa",   href: "/dashboard/admin/remarks/student-visa",  title: "Student Visa",   Icon: LuGraduationCap, accent: "#7C3AED" },
    { key: "hajj-package",   href: "/dashboard/admin/remarks/hajj-package",  title: "Hajj Package",   Icon: FaKaaba,        accent: "#059669" },
    { key: "umrah-package",  href: "/dashboard/admin/remarks/umrah-package", title: "Umrah Package",  Icon: FaMosque,       accent: "#0891B2" },
    { key: "course",         href: "/dashboard/admin/remarks/course",        title: "Course",         Icon: LuGraduationCap, accent: "#D97706" },
];

export default function AllRemarksLandingPage() {
    const [statsByService, setStatsByService] = useState({});
    const [loading, setLoading] = useState(true);

    const load = async () => {
        setLoading(true);
        try {
            const results = await Promise.all(
                CATEGORIES.map((c) =>
                    remarkService.stats({ service: c.key }).catch(() => ({ data: null }))
                )
            );
            const map = {};
            CATEGORIES.forEach((c, i) => {
                map[c.key] = results[i]?.data || { total: 0, today: 0, upcoming: 0, overdue: 0 };
            });
            setStatsByService(map);
        } catch (err) {
            toast.error(err.message || "Failed to load stats");
        } finally { setLoading(false); }
    };

    useEffect(() => {
        load();
        // Poll every 30 s while visible so the landing feels live.
        const id = setInterval(() => {
            if (document.visibilityState === "visible") load();
        }, 30000);
        const onFocus = () => load();
        window.addEventListener("focus", onFocus);
        return () => {
            clearInterval(id);
            window.removeEventListener("focus", onFocus);
        };
    }, []);

    // Overall totals for the top strip.
    const totals = Object.values(statsByService).reduce(
        (acc, s) => ({
            total:    acc.total    + (s.total    || 0),
            today:    acc.today    + (s.today    || 0),
            overdue:  acc.overdue  + (s.overdue  || 0),
        }),
        { total: 0, today: 0, overdue: 0 },
    );

    return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-brand-accent/10 text-brand-accent flex items-center justify-center">
                        <FiMessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black text-brand-dark uppercase" style={{ fontFamily: "Teko, sans-serif" }}>
                            ALL REMARKS
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                            Follow-up notes for every inquiry, grouped by service.
                        </p>
                    </div>
                </div>
                <button
                    onClick={load}
                    className="self-start sm:self-auto p-2.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 cursor-pointer"
                    aria-label="Refresh"
                >
                    <FiRefreshCw className="w-4 h-4" />
                </button>
            </div>

            {/* Overall totals */}
            <div className="grid grid-cols-3 gap-3 mb-6">
                <TopStat label="Total" value={totals.total} color="var(--color-brand-dark)" Icon={FiMessageSquare} />
                <TopStat label="Today" value={totals.today} color="var(--color-brand-accent)" Icon={FiCalendar} />
                <TopStat label="Overdue" value={totals.overdue} color="#DC2626" Icon={FiAlertCircle} />
            </div>

            {/* Per-service cards */}
            {loading && Object.keys(statsByService).length === 0 ? (
                <div className="py-24 flex items-center justify-center">
                    <FiLoader className="w-6 h-6 text-brand-blue animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {CATEGORIES.map((c) => {
                        const s = statsByService[c.key] || { total: 0, today: 0, upcoming: 0, overdue: 0 };
                        const Icon = c.Icon;
                        return (
                            <Link
                                key={c.key}
                                href={c.href}
                                className="group relative rounded-2xl bg-white border border-gray-100 p-5 hover:-translate-y-1 hover:shadow-lg transition-all"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div
                                        className="w-11 h-11 rounded-xl flex items-center justify-center"
                                        style={{ background: `${c.accent}1a`, color: c.accent }}
                                    >
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <FiChevronRight className="text-gray-300 group-hover:text-brand-dark group-hover:translate-x-1 transition-all" />
                                </div>
                                <h3 className="font-black text-lg text-brand-dark mb-1" style={{ fontFamily: "Teko, sans-serif" }}>
                                    {c.title.toUpperCase()} REMARKS
                                </h3>
                                <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-4">
                                    {s.total} in queue
                                </p>
                                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100">
                                    <Mini label="Today" value={s.today} color="var(--color-brand-accent)" />
                                    <Mini label="7 days" value={s.upcoming} color="var(--color-brand-blue)" />
                                    <Mini label="Overdue" value={s.overdue} color="#DC2626" />
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function TopStat({ label, value, color, Icon }) {
    return (
        <div className="rounded-2xl bg-white border border-gray-100 p-3 sm:p-4 flex items-center gap-3">
            <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: `${color}1a`, color }}
            >
                <Icon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 truncate">{label}</p>
                <p className="text-xl sm:text-2xl font-black mt-0.5" style={{ color, fontFamily: "Teko, sans-serif" }}>{value ?? 0}</p>
            </div>
        </div>
    );
}
function Mini({ label, value, color }) {
    return (
        <div className="text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">{label}</p>
            <p className="text-lg font-black mt-0.5" style={{ color, fontFamily: "Teko, sans-serif" }}>{value ?? 0}</p>
        </div>
    );
}
