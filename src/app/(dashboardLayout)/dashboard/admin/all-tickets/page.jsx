"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import toast from "react-hot-toast";
import {
    FiEdit3, FiTrash2, FiPlus, FiLoader, FiEye, FiSearch, FiRefreshCw,
} from "react-icons/fi";
import { LuPlane, LuUser, LuCalendar } from "react-icons/lu";
import { useSelector } from "react-redux";
import { selectToken } from "@/redux/features/authSlice";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function AllTicketsPage() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [deleting, setDeleting] = useState(null);
    const token = useSelector(selectToken);

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API}/api/tickets`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
            const json = await res.json();
            if (json.success) setTickets(json.data || []);
        } catch {
            toast.error("Tickets লোড ব্যর্থ");
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchTickets(); }, []);

    const handleDelete = async (id) => {
        if (!confirm("এই Ticket মুছে ফেলতে চান?")) return;
        setDeleting(id);
        try {
            const res = await fetch(`${API}/api/tickets/${id}`, { method: "DELETE", headers: token ? { Authorization: `Bearer ${token}` } : {} });
            const json = await res.json();
            if (json.success) {
                setTickets(prev => prev.filter(t => t._id !== id));
                toast.success("🗑️ Ticket মুছে ফেলা হয়েছে");
            }
        } catch {
            toast.error("Delete ব্যর্থ");
        } finally { setDeleting(null); }
    };

    const filtered = tickets.filter(t => {
        const q = search.toLowerCase();
        return !q ||
            (t.bookingRef || "").toLowerCase().includes(q) ||
            (t.airlinePnr || "").toLowerCase().includes(q) ||
            (t.passengers?.[0]?.name || "").toLowerCase().includes(q) ||
            (t.flights?.[0]?.from || "").toLowerCase().includes(q) ||
            (t.flights?.[0]?.to || "").toLowerCase().includes(q);
    });

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="p-4 lg:p-6 max-w-6xl mx-auto space-y-5">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-black text-gray-800 flex items-center gap-2">
                            <LuPlane className="text-blue-600" /> All Tickets
                        </h1>
                        <p className="text-xs text-gray-500 mt-0.5">সব সংরক্ষিত e-Ticket দেখুন, Edit করুন, Download করুন</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={fetchTickets} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-100">
                            <FiRefreshCw size={13} /> Refresh
                        </button>
                        <Link href="/dashboard/admin/ticket-generator"
                            className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-200">
                            <FiPlus size={14} /> New Ticket
                        </Link>
                    </div>
                </div>

                {/* Search */}
                <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search by name, booking ref, PNR, route..."
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 transition-all" />
                </div>

                {/* Loading */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <FiLoader size={32} className="animate-spin text-blue-500" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20">
                        <LuPlane size={48} className="mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500 font-semibold">
                            {search ? "কোনো Ticket পাওয়া যায়নি" : "কোনো Ticket নেই"}
                        </p>
                        <Link href="/dashboard/admin/ticket-generator"
                            className="inline-flex items-center gap-2 mt-4 px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700">
                            <FiPlus size={14} /> নতুন Ticket তৈরি করুন
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <p className="text-xs text-gray-400 font-medium">{filtered.length} টি Ticket পাওয়া গেছে</p>

                        {filtered.map((t, idx) => {
                            const passenger = t.passengers?.[0];
                            const flight = t.flights?.[0];
                            return (
                                <motion.div key={t._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.04 }}
                                    className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden">

                                    <div className="flex flex-col sm:flex-row">
                                        {/* Left: Route visual */}
                                        <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white p-4 sm:w-48 flex flex-col items-center justify-center gap-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-2xl font-black">{flight?.from || "—"}</span>
                                                <span className="text-lg">→</span>
                                                <span className="text-2xl font-black">{flight?.to || "—"}</span>
                                            </div>
                                            <div className="text-[10px] text-blue-200 font-semibold">{flight?.airline} {flight?.flightNo}</div>
                                            <div className="text-[10px] text-blue-300 mt-1">{flight?.departDate}</div>
                                        </div>

                                        {/* Middle: Details */}
                                        <div className="flex-1 p-4">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <LuUser size={12} className="text-blue-500" />
                                                        <span className="text-sm font-bold text-gray-800">{passenger?.name || "No Name"}</span>
                                                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-bold">{passenger?.type || "ADT"}</span>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-[11px] text-gray-500">
                                                        <span>📋 Ref: <b className="text-gray-700">{t.bookingRef || "—"}</b></span>
                                                        <span>🔖 PNR: <b className="text-gray-700">{t.airlinePnr || "—"}</b></span>
                                                        {t.grandTotal && <span>💰 <b className="text-orange-600">{t.grandTotal} BDT</b></span>}
                                                    </div>
                                                </div>
                                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${t.status === "Confirmed" ? "bg-green-50 text-green-600" : t.status === "Cancelled" ? "bg-red-50 text-red-600" : "bg-yellow-50 text-yellow-600"}`}>
                                                    {t.status || "Confirmed"}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-3 mt-3 text-[10px] text-gray-400">
                                                <span className="flex items-center gap-1"><LuCalendar size={10} /> {t.dateOfIssue || new Date(t.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span>
                                                <span>{t.passengers?.length || 1} PAX &middot; {t.flights?.length || 1} Flight(s)</span>
                                                {passenger?.passportNo && <span>🛂 {passenger.passportNo}</span>}
                                            </div>
                                        </div>

                                        {/* Right: Actions */}
                                        <div className="flex sm:flex-col items-center gap-2 p-3 sm:justify-center border-t sm:border-t-0 sm:border-l border-gray-100">
                                            <Link href={`/dashboard/admin/ticket-generator?id=${t._id}`}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-[11px] font-bold hover:bg-blue-100 transition-all">
                                                <FiEdit3 size={12} /> Edit
                                            </Link>
                                            <Link href={`/dashboard/admin/ticket-generator?id=${t._id}`}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-[11px] font-bold hover:bg-green-100 transition-all">
                                                <FiEye size={12} /> View
                                            </Link>
                                            <button onClick={() => handleDelete(t._id)} disabled={deleting === t._id}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-500 rounded-lg text-[11px] font-bold hover:bg-red-100 transition-all disabled:opacity-50">
                                                {deleting === t._id ? <FiLoader size={12} className="animate-spin" /> : <FiTrash2 size={12} />} Delete
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
