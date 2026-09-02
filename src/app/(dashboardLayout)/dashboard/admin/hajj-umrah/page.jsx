"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
    FiSearch, FiLoader, FiEdit, FiTrash2, FiEye,
    FiRefreshCw, FiCalendar, FiPlus, FiX,
    FiUsers, FiDollarSign, FiClock, FiStar,
} from "react-icons/fi";
import { FaKaaba } from "react-icons/fa6";
import { useSelector } from "react-redux";
import { selectToken } from "@/redux/features/authSlice";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function HajjUmrahPage() {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");
    const [viewingPkg, setViewingPkg] = useState(null);
    const token = useSelector(selectToken);

    const fetchPackages = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/hajj-umrah`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            const data = await res.json();
            if (data.success && data.data) {
                setPackages(Array.isArray(data.data) ? data.data : data.data.data || []);
            }
        } catch { setPackages([]); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchPackages(); }, []);

    const handleDelete = async (id) => {
        if (!confirm("Delete this package?")) return;
        try {
            const res = await fetch(`${API_BASE}/api/hajj-umrah/${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
            });
            const data = await res.json();
            if (!res.ok) {
                toast.error(data?.message || `Failed to delete (${res.status})`);
                return;
            }
            toast.success("Package deleted successfully");
            setPackages(prev => prev.filter(p => p._id !== id));
        } catch (err) {
            toast.error("Network error — could not delete package");
        }
    };

    const filtered = packages.filter(p => {
        const matchSearch = p.name?.toLowerCase().includes(search.toLowerCase()) ||
            p.nameBn?.includes(search);
        const matchFilter = filter === "all" || p.type === filter || p.status === filter;
        return matchSearch && matchFilter;
    });

    // Total-bookings counter removed with the Bookings feature.

    return (
        <div className="p-4 lg:p-6 space-y-5">
            {/* View Modal */}
            <AnimatePresence>
                {viewingPkg && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setViewingPkg(null)}>
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
                            <div className="p-5 border-b border-gray-100 rounded-t-xl" style={{ backgroundColor: '#2D1B4E' }}>
                                <div className="flex items-center justify-between">
                                    <div className="text-white">
                                        <p className="text-[10px] uppercase tracking-wider opacity-60 font-bold">{viewingPkg.type === 'hajj' ? '🕋 Hajj' : '🕌 Umrah'} Package</p>
                                        <h3 className="text-lg font-bold mt-0.5">{viewingPkg.name}</h3>
                                        {viewingPkg.nameBn && <p className="text-sm opacity-60">{viewingPkg.nameBn}</p>}
                                    </div>
                                    <button onClick={() => setViewingPkg(null)} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"><FiX size={16} /></button>
                                </div>
                            </div>
                            <div className="p-5 space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { label: "Duration", value: viewingPkg.duration },
                                        { label: "Price", value: `৳${viewingPkg.price?.toLocaleString()}` },
                                        { label: "Hotel", value: viewingPkg.hotel || "N/A" },
                                        { label: "Group Size", value: viewingPkg.groupSize || "N/A" },
                                        { label: "Departure", value: viewingPkg.departureDate || "TBD" },
                                        { label: "Status", value: viewingPkg.status },
                                    ].map((item) => (
                                        <div key={item.label} className="bg-[#F8FAFC] dark:bg-gray-700/30 rounded-lg p-3">
                                            <p className="text-[10px] text-gray-400 uppercase font-bold">{item.label}</p>
                                            <p className="text-[12px] font-semibold text-gray-700 mt-0.5 capitalize">{item.value}</p>
                                        </div>
                                    ))}
                                </div>
                                {viewingPkg.features?.length > 0 && (
                                    <div className="bg-emerald-50/50 rounded-lg p-4">
                                        <p className="text-[10px] font-bold uppercase text-emerald-600 mb-2">Includes</p>
                                        <div className="space-y-1">
                                            {viewingPkg.features.map((f, i) => (
                                                <p key={i} className="text-[12px] text-gray-600">✓ {f}</p>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-tight" style={{ fontFamily: 'Teko, sans-serif', color: 'var(--color-brand-dark)' }}>
                        Hajj & Umrah Packages
                    </h1>
                    <p className="text-[12px] text-gray-400 mt-0.5">{packages.length} packages</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={fetchPackages} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-[11px] font-semibold text-gray-500 hover:bg-gray-50">
                        <FiRefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
                    </button>
                    <Link href="/dashboard/admin/hajj-umrah/create" className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[11px] font-semibold text-white" style={{ backgroundColor: 'var(--color-brand-dark)' }}>
                        <FiPlus size={13} /> New Package
                    </Link>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: "Total Packages", value: packages.length },
                    { label: "Hajj Packages", value: packages.filter(p => p.type === "hajj").length },
                    { label: "Umrah Packages", value: packages.filter(p => p.type === "umrah").length },
                    { label: "Active Packages", value: packages.filter(p => p.status === "active").length },
                ].map(s => (
                    <div key={s.label} className="bg-white dark:bg-gray-800 rounded-xl p-3.5 border border-gray-100 dark:border-gray-700/50">
                        <p className="text-xl font-semibold text-gray-800">{s.value}</p>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase mt-1">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-100 dark:border-gray-700/50 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                    <input placeholder="Search packages..." value={search} onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#F5F6FA] dark:bg-gray-700 border border-gray-100 text-[13px] focus:border-brand-dark outline-none" />
                </div>
                <div className="flex gap-1.5">
                    {["all", "hajj", "umrah"].map(s => (
                        <button key={s} onClick={() => setFilter(s)}
                            className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase ${filter === s ? "text-white" : "bg-gray-50 text-gray-500"}`}
                            style={filter === s ? { backgroundColor: 'var(--color-brand-dark)' } : {}}>
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Cards */}
            {loading ? (
                <div className="flex justify-center py-20"><FiLoader className="animate-spin" size={24} style={{ color: 'var(--color-brand-dark)' }} /></div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20">
                    <FaKaaba size={40} className="mx-auto mb-4 text-gray-200" />
                    <p className="text-gray-400 text-sm">No packages found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filtered.map((pkg, i) => (
                        <motion.div key={pkg._id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700/50 overflow-hidden hover:shadow-lg transition-all">
                            <div className="p-5">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase mb-2 ${pkg.type === 'hajj' ? 'bg-purple-50 text-purple-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                            {pkg.type === 'hajj' ? '🕋 Hajj' : '🕌 Umrah'}
                                        </span>
                                        <h3 className="text-[14px] font-bold text-gray-800 dark:text-white">{pkg.name}</h3>
                                        {pkg.nameBn && <p className="text-[12px] text-gray-400">{pkg.nameBn}</p>}
                                    </div>
                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${pkg.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                        {pkg.status}
                                    </span>
                                </div>

                                <div className="grid grid-cols-3 gap-3 mb-3">
                                    <div className="bg-[#F8FAFC] rounded-lg p-2.5 text-center">
                                        <p className="text-[10px] text-gray-400">Duration</p>
                                        <p className="text-[12px] font-semibold text-gray-700">{pkg.duration}</p>
                                    </div>
                                    <div className="bg-[#F8FAFC] rounded-lg p-2.5 text-center">
                                        <p className="text-[10px] text-gray-400">Price</p>
                                        <p className="text-[12px] font-semibold text-emerald-600">৳{(pkg.price / 1000).toFixed(0)}K</p>
                                    </div>
                                    <div className="bg-[#F8FAFC] rounded-lg p-2.5 text-center">
                                        <p className="text-[10px] text-gray-400">Group</p>
                                        <p className="text-[12px] font-semibold text-gray-700">{pkg.groupSize || "—"}</p>
                                    </div>
                                </div>

                                {pkg.hotel && <p className="text-[11px] text-gray-400 mb-3">📍 {pkg.hotel}</p>}

                                {/* Bookings capacity bar removed with the Bookings feature. */}

                                <div className="flex gap-2">
                                    <button onClick={() => setViewingPkg(pkg)} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-semibold text-white" style={{ backgroundColor: 'var(--color-brand-dark)' }}>
                                        <FiEye size={12} /> View
                                    </button>
                                    <Link href={`/dashboard/admin/hajj-umrah/create?id=${pkg._id}`} className="px-3 py-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 text-[11px] flex items-center gap-1">
                                        <FiEdit size={12} /> Edit
                                    </Link>
                                    <button onClick={() => handleDelete(pkg._id)} className="px-3 py-2 rounded-lg border border-red-200 text-red-400 hover:bg-red-50 text-[11px]">
                                        <FiTrash2 size={12} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
