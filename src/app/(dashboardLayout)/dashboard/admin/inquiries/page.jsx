"use client";

// ===================================================================
// Admin — Inquiries queue
// Filter by status/service, search, quick-update status, view details.
// ===================================================================

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
    FiSearch, FiLoader, FiTrash2, FiRefreshCw, FiExternalLink, FiMail, FiPhone, FiUser, FiCalendar, FiFileText,
} from "react-icons/fi";
import { inquiriesApi } from "@/services/api";

const STATUS_META = {
    new:       { label: "New",       cls: "bg-blue-50 text-blue-700 border-blue-200" },
    contacted: { label: "Contacted", cls: "bg-yellow-50 text-yellow-700 border-yellow-200" },
    converted: { label: "Converted", cls: "bg-green-50 text-green-700 border-green-200" },
    closed:    { label: "Closed",    cls: "bg-gray-100 text-gray-600 border-gray-200" },
    spam:      { label: "Spam",      cls: "bg-red-50 text-red-700 border-red-200" },
};

const STATUS_OPTIONS = ["all", "new", "contacted", "converted", "closed", "spam"];

export default function InquiriesPage() {
    const [items, setItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [pages, setPages] = useState(1);
    const [page, setPage] = useState(1);
    const [status, setStatus] = useState("all");
    const [service, setService] = useState("");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState(null);
    const [openId, setOpenId] = useState(null);
    const [stats, setStats] = useState(null);

    const params = useMemo(() => {
        const p = { page, limit: 20 };
        if (status !== "all") p.status = status;
        if (service) p.service = service;
        if (search) p.search = search;
        return p;
    }, [page, status, service, search]);

    const load = async () => {
        setLoading(true);
        try {
            const [list, s] = await Promise.all([inquiriesApi.list(params), inquiriesApi.stats()]);
            setItems(list.data || []);
            setTotal(list.meta?.total || 0);
            setPages(list.meta?.pages || 1);
            setStats(s.data || null);
        } catch (err) {
            toast.error(err.message || "Failed to load");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [page, status, service]);

    const updateStatus = async (id, newStatus) => {
        setBusyId(id);
        try {
            await inquiriesApi.update(id, { status: newStatus });
            setItems((arr) => arr.map((x) => (x._id === id ? { ...x, status: newStatus } : x)));
            toast.success("Updated");
        } catch (err) {
            toast.error(err.message || "Failed");
        } finally { setBusyId(null); }
    };

    const remove = async (id) => {
        if (!confirm("Delete this inquiry?")) return;
        setBusyId(id);
        try {
            await inquiriesApi.remove(id);
            setItems((arr) => arr.filter((x) => x._id !== id));
            toast.success("Deleted");
        } catch (err) {
            toast.error(err.message || "Failed");
        } finally { setBusyId(null); }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header + Stats */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h1 className="text-2xl font-black text-brand-dark" style={{ fontFamily: "Teko, sans-serif" }}>
                        INQUIRIES
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Every submission from every service page lands here.
                    </p>
                </div>
                <button onClick={load} className="p-2.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50" aria-label="Refresh">
                    <FiRefreshCw className="w-4 h-4" />
                </button>
            </div>

            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                    <StatCard label="Total" value={stats.total} color="var(--color-brand-dark)" />
                    <StatCard label="New" value={stats.newCount} color="var(--color-brand-blue)" />
                    <StatCard label="Today" value={stats.todayCount} color="var(--color-brand-accent)" />
                    <StatCard label="Converted" value={stats.converted} color="#10B981" />
                </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
                <div className="flex flex-wrap items-center gap-3">
                    {/* Status pills */}
                    <div className="flex flex-wrap gap-1.5">
                        {STATUS_OPTIONS.map((s) => (
                            <button
                                key={s}
                                onClick={() => { setStatus(s); setPage(1); }}
                                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                                    status === s
                                        ? "bg-brand-dark text-white border-brand-dark"
                                        : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                                }`}
                            >
                                {s === "all" ? "All" : STATUS_META[s]?.label || s}
                            </button>
                        ))}
                    </div>

                    <select
                        value={service}
                        onChange={(e) => { setService(e.target.value); setPage(1); }}
                        className="ml-auto text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white"
                    >
                        <option value="">All services</option>
                        <option value="flight-booking">Flight Booking</option>
                        <option value="tourist-visa">Tourist Visa</option>
                        <option value="study-abroad">Study Abroad</option>
                        <option value="passport-service">Passport</option>
                        <option value="banking-support">Banking</option>
                        <option value="career-opportunity">Career</option>
                        <option value="course">Course</option>
                    </select>

                    <div className="relative flex-1 min-w-[200px]">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search name / phone / email / message"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && (setPage(1), load())}
                            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 focus:border-brand-blue outline-none text-sm"
                        />
                    </div>
                    <button
                        onClick={() => { setPage(1); load(); }}
                        className="px-4 py-2 rounded-lg bg-brand-blue hover:bg-brand-blue-hover text-white text-sm font-semibold"
                    >
                        Search
                    </button>
                </div>
            </div>

            {/* Table */}
            {loading ? (
                <div className="py-24 flex items-center justify-center">
                    <FiLoader className="w-6 h-6 text-brand-blue animate-spin" />
                </div>
            ) : items.length === 0 ? (
                <div className="py-24 text-center border border-dashed border-gray-200 rounded-2xl text-gray-500">
                    No inquiries match this filter.
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr className="text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">
                                <th className="px-4 py-3">Contact</th>
                                <th className="px-4 py-3">Service</th>
                                <th className="px-4 py-3">Message</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">When</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {items.map((it) => (
                                <>
                                    <tr key={it._id} className="hover:bg-gray-50/60">
                                        <td className="px-4 py-3">
                                            <p className="font-semibold text-brand-dark text-sm">{it.name}</p>
                                            <p className="text-xs text-gray-500 flex items-center gap-1"><FiPhone size={11} /> {it.phone}</p>
                                            {it.email && <p className="text-xs text-gray-500 flex items-center gap-1"><FiMail size={11} /> {it.email}</p>}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-md bg-brand-blue/10 text-brand-blue font-semibold">
                                                {it.serviceLabel || it.service}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600 max-w-[280px] truncate">
                                            {it.subject && <span className="font-semibold text-brand-dark">{it.subject} — </span>}
                                            {it.message || <span className="text-gray-400 italic">no message</span>}
                                        </td>
                                        <td className="px-4 py-3">
                                            <select
                                                value={it.status}
                                                onChange={(e) => updateStatus(it._id, e.target.value)}
                                                disabled={busyId === it._id}
                                                className={`text-xs font-bold border rounded-md px-2 py-1 ${STATUS_META[it.status]?.cls || ""}`}
                                            >
                                                {Object.keys(STATUS_META).map((s) => (
                                                    <option key={s} value={s}>{STATUS_META[s].label}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-500">
                                            {new Date(it.createdAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => setOpenId(openId === it._id ? null : it._id)}
                                                    className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
                                                    title="Details"
                                                >
                                                    <FiFileText size={15} />
                                                </button>
                                                {it.pageUrl && (
                                                    <a href={it.pageUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg text-gray-500 hover:bg-gray-100" title="Open source page">
                                                        <FiExternalLink size={15} />
                                                    </a>
                                                )}
                                                <button
                                                    onClick={() => remove(it._id)}
                                                    disabled={busyId === it._id}
                                                    className="p-2 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                                                    title="Delete"
                                                >
                                                    <FiTrash2 size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    {openId === it._id && (
                                        <tr className="bg-gray-50/60">
                                            <td colSpan={6} className="px-4 py-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                    <Detail label="Full message" value={it.message || "—"} pre />
                                                    <Detail label="Extra fields" value={JSON.stringify(it.extra || {}, null, 2)} pre />
                                                    <Detail label="Source" value={it.source || "website"} />
                                                    <Detail label="User agent" value={it.userAgent} />
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </>
                            ))}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    {pages > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-sm">
                            <span className="text-gray-500">
                                Page {page} of {pages} · {total} total
                            </span>
                            <div className="flex gap-1">
                                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="px-3 py-1.5 rounded-md border border-gray-200 disabled:opacity-40">Prev</button>
                                <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page >= pages} className="px-3 py-1.5 rounded-md border border-gray-200 disabled:opacity-40">Next</button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function StatCard({ label, value, color }) {
    return (
        <div className="rounded-2xl bg-white border border-gray-100 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">{label}</p>
            <p className="text-2xl font-black mt-1" style={{ color, fontFamily: "Teko, sans-serif" }}>
                {value ?? 0}
            </p>
        </div>
    );
}

function Detail({ label, value, pre }) {
    return (
        <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">{label}</p>
            {pre ? (
                <pre className="text-xs bg-white border border-gray-100 rounded-lg p-2 whitespace-pre-wrap break-words">{value}</pre>
            ) : (
                <p className="text-sm text-gray-700 break-words">{value || "—"}</p>
            )}
        </div>
    );
}
