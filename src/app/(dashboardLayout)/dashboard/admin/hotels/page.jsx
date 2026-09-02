"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
    FiSearch, FiLoader, FiEdit, FiTrash2, FiEye,
    FiRefreshCw, FiPlus, FiX, FiMapPin,
    FiDollarSign, FiStar, FiFilter,
} from "react-icons/fi";
import { LuBed } from "react-icons/lu";
import { useSelector } from "react-redux";
import { selectToken } from "@/redux/features/authSlice";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function HotelBookings() {
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");
    const [viewingHotel, setViewingHotel] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const token = useSelector(selectToken);
    const router = useRouter();

    const fetchHotels = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/hotels`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            const data = await res.json();
            if (data.success && data.data) {
                setHotels(Array.isArray(data.data) ? data.data : []);
            } else {
                setHotels([]);
            }
        } catch {
            toast.error("Failed to fetch hotels");
            setHotels([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchHotels(); }, []);

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this hotel?")) return;
        setDeleting(id);
        try {
            const res = await fetch(`${API_BASE}/api/hotels/${id}`, {
                method: "DELETE",
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Hotel deleted successfully");
                setHotels(prev => prev.filter(h => h._id !== id));
                if (viewingHotel?._id === id) setViewingHotel(null);
            } else {
                toast.error(data.message || "Failed to delete");
            }
        } catch {
            toast.error("Failed to delete hotel");
        } finally {
            setDeleting(null);
        }
    };

    const filtered = hotels.filter(h => {
        const matchSearch =
            h.name?.toLowerCase().includes(search.toLowerCase()) ||
            h.city?.toLowerCase().includes(search.toLowerCase()) ||
            h.location?.toLowerCase().includes(search.toLowerCase()) ||
            h.hotelCategory?.toLowerCase().includes(search.toLowerCase());
        const matchFilter = filter === "all" || h.status === filter || h.hotelCategory === filter;
        return matchSearch && matchFilter;
    });

    // Revenue and total-bookings counters were driven by the deleted
    // Bookings feature — removed along with the UI that displayed them.

    const getCategoryColor = (cat) => {
        const colors = {
            luxury: "#EF4444", "mid-range": "#3B82F6", budget: "#10B981",
            boutique: "#8B5CF6", resort: "#F59E0B", business: "#6366F1", hostel: "#14B8A6",
        };
        return colors[cat] || "#6B7280";
    };

    const getStatusColor = (status) => {
        const colors = {
            active: "#10B981", inactive: "#6B7280", maintenance: "#F59E0B",
        };
        return colors[status] || "#6B7280";
    };

    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, i) => (
            <span key={i} className={`text-[10px] ${i < rating ? 'text-brand-accent' : 'text-gray-200'}`}>★</span>
        ));
    };

    return (
        <div className="p-4 lg:p-6 space-y-5">
            {/* View Modal */}
            <AnimatePresence>
                {viewingHotel && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setViewingHotel(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.95 }}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-5 border-b border-gray-100" style={{ backgroundColor: 'var(--color-brand-dark)' }}>
                                <div className="flex items-center justify-between">
                                    <div className="text-white">
                                        <p className="text-[10px] uppercase tracking-wider opacity-60 font-bold">Hotel</p>
                                        <h3 className="text-lg font-bold mt-0.5">{viewingHotel.name}</h3>
                                        <div className="flex mt-1">{renderStars(viewingHotel.starRating)}</div>
                                    </div>
                                    <button onClick={() => setViewingHotel(null)} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white">
                                        <FiX size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="p-5 space-y-4">
                                {viewingHotel.image && (
                                    <img src={viewingHotel.image} alt={viewingHotel.name} className="w-full h-40 object-cover rounded-lg" />
                                )}
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { label: "City", value: viewingHotel.city, icon: FiMapPin },
                                        { label: "Location", value: viewingHotel.location, icon: FiMapPin },
                                        { label: "Price/Night", value: `৳${viewingHotel.pricePerNight?.toLocaleString()}`, icon: FiDollarSign },
                                        { label: "Star Rating", value: `${viewingHotel.starRating} Stars`, icon: FiStar },
                                        { label: "Category", value: viewingHotel.hotelCategory, icon: FiFilter },
                                        { label: "Status", value: viewingHotel.status, icon: FiFilter },
                                        { label: "Total Rooms", value: viewingHotel.totalRooms || "N/A", icon: LuBed },
                                    ].map((item) => (
                                        <div key={item.label} className="bg-[#F8FAFC] dark:bg-gray-700/30 rounded-lg p-3">
                                            <p className="text-[10px] text-gray-400 uppercase font-bold">{item.label}</p>
                                            <p className="text-[13px] font-semibold text-gray-700 mt-0.5 capitalize">{item.value}</p>
                                        </div>
                                    ))}
                                </div>
                                {viewingHotel.description && (
                                    <div className="bg-[#F8FAFC] dark:bg-gray-700/30 rounded-lg p-3">
                                        <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Description</p>
                                        <p className="text-[12px] text-gray-600">{viewingHotel.description}</p>
                                    </div>
                                )}
                                {viewingHotel.amenities?.length > 0 && (
                                    <div className="bg-[#F8FAFC] dark:bg-gray-700/30 rounded-lg p-3">
                                        <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Amenities</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {viewingHotel.amenities.map((am, i) => (
                                                <span key={i} className="px-2 py-0.5 bg-white border border-gray-200 rounded text-[11px] text-gray-600">{am}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <div className="flex gap-2 pt-2">
                                    <button
                                        onClick={() => { setViewingHotel(null); router.push(`/dashboard/admin/hotels/create?id=${viewingHotel._id}`); }}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-[12px] font-semibold text-white" style={{ backgroundColor: 'var(--color-brand-dark)' }}
                                    >
                                        <FiEdit size={13} /> Edit Hotel
                                    </button>
                                    <button
                                        onClick={() => { setViewingHotel(null); handleDelete(viewingHotel._id); }}
                                        className="px-4 py-2.5 rounded-lg text-[12px] font-semibold text-red-500 border border-red-200 hover:bg-red-50"
                                    >
                                        <FiTrash2 size={13} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-tight" style={{ fontFamily: 'Teko, sans-serif', color: 'var(--color-brand-dark)' }}>
                        Hotel Booking
                    </h1>
                    <p className="text-[12px] text-gray-400 mt-0.5">{hotels.length} hotels</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={fetchHotels} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-[11px] font-semibold text-gray-500 hover:bg-gray-50">
                        <FiRefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
                    </button>
                    <Link href="/dashboard/admin/hotels/create" className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[11px] font-semibold text-white" style={{ backgroundColor: 'var(--color-brand-dark)' }}>
                        <FiPlus size={13} /> New Hotel
                    </Link>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: "Total Hotels", value: hotels.length, color: "var(--color-brand-dark)" },
                    { label: "Active Hotels", value: hotels.filter(h => h.status === "active").length, color: "var(--color-brand-accent)" },
                    { label: "Featured", value: hotels.filter(h => h.isFeatured).length, color: "#8B5CF6" },
                    { label: "Cities", value: new Set(hotels.map(h => h.city).filter(Boolean)).size, color: "#3B82F6" },
                ].map((s) => (
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
                    <input
                        placeholder="Search hotels by name, city, category..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#F5F6FA] dark:bg-gray-700 border border-gray-100 dark:border-gray-600 text-[13px] focus:border-brand-dark outline-none"
                    />
                </div>
                <div className="flex gap-1.5 flex-wrap">
                    {["all", "active", "inactive", "maintenance"].map((s) => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wide transition-all ${filter === s
                                ? "text-white" : "bg-gray-50 text-gray-500 hover:bg-gray-100"}`}
                            style={filter === s ? { backgroundColor: 'var(--color-brand-dark)' } : {}}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Hotel Cards Grid */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <FiLoader className="animate-spin" size={24} style={{ color: 'var(--color-brand-dark)' }} />
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <LuBed size={24} className="text-gray-300" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-400 mb-1">No Hotels Found</h3>
                    <p className="text-[12px] text-gray-400 mb-4">Create your first hotel to get started</p>
                    <Link href="/dashboard/admin/hotels/create" className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[11px] font-semibold text-white" style={{ backgroundColor: 'var(--color-brand-dark)' }}>
                        <FiPlus size={13} /> Add Hotel
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map((hotel, i) => (
                        <motion.div
                            key={hotel._id}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700/50 overflow-hidden group hover:shadow-lg transition-all"
                        >
                            {/* Card Image */}
                            <div className="h-40 relative overflow-hidden" style={{ backgroundColor: 'var(--color-brand-dark)' }}>
                                {hotel.image ? (
                                    <img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <LuBed size={40} className="text-white/10" />
                                    </div>
                                )}
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-3">
                                    <div className="flex items-center gap-2">
                                        <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase text-white"
                                            style={{ backgroundColor: getCategoryColor(hotel.hotelCategory) }}>
                                            {hotel.hotelCategory}
                                        </span>
                                        <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase text-white"
                                            style={{ backgroundColor: getStatusColor(hotel.status) }}>
                                            {hotel.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="absolute top-3 right-3 flex gap-1.5 transition-opacity">
                                    <button onClick={() => setViewingHotel(hotel)} className="w-8 h-8 rounded-lg bg-white/90 backdrop-blur flex items-center justify-center text-gray-600 hover:bg-white shadow-sm">
                                        <FiEye size={14} />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDelete(hotel._id); }}
                                        disabled={deleting === hotel._id}
                                        className="w-8 h-8 rounded-lg bg-red-50 backdrop-blur flex items-center justify-center text-red-500 hover:bg-red-100 disabled:opacity-50 shadow-sm"
                                    >
                                        {deleting === hotel._id ? <FiLoader size={14} className="animate-spin" /> : <FiTrash2 size={14} />}
                                    </button>
                                </div>
                                {/* Star Rating Badge */}
                                <div className="absolute top-3 left-3">
                                    <span className="flex items-center gap-0.5 px-2 py-0.5 bg-black/40 backdrop-blur rounded-full text-[10px] text-white font-bold">
                                        {'★'.repeat(hotel.starRating || 1)}
                                    </span>
                                </div>
                            </div>

                            {/* Card Content */}
                            <div className="p-4">
                                <h3 className="text-[13px] font-bold text-gray-800 dark:text-white line-clamp-1">{hotel.name}</h3>
                                <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-1">
                                    <FiMapPin size={10} /> {hotel.city}{hotel.location ? `, ${hotel.location}` : ''}
                                </p>

                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-700/50">
                                    <div>
                                        <p className="text-lg font-bold" style={{ color: 'var(--color-brand-dark)' }}>৳{hotel.pricePerNight?.toLocaleString()}</p>
                                        <p className="text-[10px] text-gray-400">per night</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[11px] font-semibold text-gray-600">{hotel.totalRooms || "—"}</p>
                                        <p className="text-[10px] text-gray-400">Rooms</p>
                                    </div>
                                </div>

                                {/* Room-occupancy bar removed with the Bookings feature. */}

                                <div className="flex items-center gap-2 mt-3">
                                    <button
                                        onClick={() => router.push(`/dashboard/admin/hotels/create?id=${hotel._id}`)}
                                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-[11px] font-semibold text-gray-500 hover:bg-gray-50 transition-colors"
                                    >
                                        <FiEdit size={12} /> Edit
                                    </button>
                                    <button
                                        onClick={() => setViewingHotel(hotel)}
                                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-semibold text-white transition-colors"
                                        style={{ backgroundColor: 'var(--color-brand-dark)' }}
                                    >
                                        <FiEye size={12} /> View
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
