"use client";

// ===================================================================
// VisaGuideList — admin table of every Tourist / Student visa page.
// One component, two mounts (tourist-visas & student-visas) so the two
// screens can never drift apart.
// ===================================================================

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
    FiRefreshCw, FiLoader, FiEdit2, FiTrash2, FiSearch, FiPlus,
    FiExternalLink, FiAlertTriangle, FiX,
} from "react-icons/fi";
import { visaGuideService } from "@/services/api";

export default function VisaGuideList({ category, title, Icon, accent = "var(--color-brand-accent)" }) {
    const [items, setItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState(null);
    const [status, setStatus] = useState("all");   // all | active | inactive
    const [search, setSearch] = useState("");
    const [query, setQuery] = useState("");        // committed search term
    const [confirmDelete, setConfirmDelete] = useState(null);

    const basePath = category === "student" ? "/dashboard/admin/student-visas" : "/dashboard/admin/tourist-visas";

    const params = useMemo(() => {
        const p = { category, limit: 200 };
        if (status === "active") p.isActive = "true";
        if (status === "inactive") p.isActive = "false";
        if (query) p.searchTerm = query;
        return p;
    }, [category, status, query]);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await visaGuideService.getAll(params);
            setItems(res.data || []);
            setTotal(res.meta?.total || 0);
        } catch (err) {
            toast.error(err.message || "Failed to load visas");
        } finally {
            setLoading(false);
        }
    }, [params]);

    useEffect(() => { load(); }, [load]);

    // Optimistic toggle: flip the row immediately so the switch feels
    // instant, then roll it back if the server rejects the change.
    const toggleStatus = async (row) => {
        setBusyId(row._id);
        const previous = row.isActive;
        setItems((arr) => arr.map((x) => (x._id === row._id ? { ...x, isActive: !previous } : x)));
        try {
            const res = await visaGuideService.toggle(row._id);
            const next = res.data?.isActive;
            setItems((arr) => arr.map((x) => (x._id === row._id ? { ...x, isActive: next } : x)));
            toast.success(next ? `${row.country} is now live` : `${row.country} is hidden from the website`);
        } catch (err) {
            setItems((arr) => arr.map((x) => (x._id === row._id ? { ...x, isActive: previous } : x)));
            toast.error(err.message || "Could not change status");
        } finally {
            setBusyId(null);
        }
    };

    const remove = async () => {
        const row = confirmDelete;
        if (!row) return;
        setBusyId(row._id);
        try {
            await visaGuideService.remove(row._id);
            setItems((arr) => arr.filter((x) => x._id !== row._id));
            setTotal((t) => Math.max(0, t - 1));
            toast.success(`${row.country} deleted`);
            setConfirmDelete(null);
        } catch (err) {
            toast.error(err.message || "Delete failed");
        } finally {
            setBusyId(null);
        }
    };

    const activeCount = items.filter((i) => i.isActive).length;

    return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto">
            {/* ---------- Header ---------- */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                <div className="flex items-center gap-3">
                    <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${accent}1a`, color: accent }}
                    >
                        <Icon className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-brand-dark" style={{ fontFamily: "Teko, sans-serif" }}>
                            {title.toUpperCase()}
                        </h1>
                        <p className="text-sm text-gray-500 mt-0.5">
                            {total} total · {activeCount} live on the website
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={load}
                        className="p-2.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                        aria-label="Refresh"
                    >
                        <FiRefreshCw className="w-4 h-4" />
                    </button>
                    <Link
                        href={`${basePath}/create`}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-white text-sm font-bold transition-all hover:brightness-110"
                        style={{ backgroundColor: accent }}
                    >
                        <FiPlus className="w-4 h-4" />
                        Add {category === "student" ? "Student" : "Tourist"} Visa
                    </Link>
                </div>
            </div>

            {/* ---------- Filters ---------- */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex flex-wrap gap-1.5">
                        {[
                            { key: "all", label: "All" },
                            { key: "active", label: "Active" },
                            { key: "inactive", label: "Inactive" },
                        ].map((s) => (
                            <button
                                key={s.key}
                                onClick={() => setStatus(s.key)}
                                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                                    status === s.key
                                        ? "bg-brand-dark text-white border-brand-dark"
                                        : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                                }`}
                            >
                                {s.label}
                            </button>
                        ))}
                    </div>
                    <div className="relative flex-1 min-w-[200px] ml-auto">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
                        <input
                            type="text"
                            placeholder="Search country or visa type"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && setQuery(search)}
                            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm"
                        />
                    </div>
                    <button
                        onClick={() => setQuery(search)}
                        className="px-4 py-2 rounded-lg bg-[#1D4ED8] hover:bg-[#1741b0] text-white text-sm font-semibold"
                    >
                        Search
                    </button>
                </div>
            </div>

            {/* ---------- Table ---------- */}
            {loading ? (
                <div className="py-24 flex items-center justify-center">
                    <FiLoader className="w-6 h-6 text-[#1D4ED8] animate-spin" />
                </div>
            ) : items.length === 0 ? (
                <div className="py-20 text-center border border-dashed border-gray-200 rounded-2xl">
                    <p className="text-gray-500 mb-4">
                        {query || status !== "all"
                            ? "No visas match this filter."
                            : `No ${category} visas yet.`}
                    </p>
                    <Link
                        href={`${basePath}/create`}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-white text-sm font-bold"
                        style={{ backgroundColor: accent }}
                    >
                        <FiPlus className="w-4 h-4" /> Add the first one
                    </Link>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[820px]">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr className="text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">
                                    <th className="px-4 py-3">Country</th>
                                    <th className="px-4 py-3">Visa Type</th>
                                    <th className="px-4 py-3">Processing</th>
                                    <th className="px-4 py-3 text-center">Status</th>
                                    <th className="px-4 py-3">Created</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {items.map((row) => (
                                    <tr key={row._id} className={`hover:bg-gray-50/60 ${!row.isActive ? "opacity-60" : ""}`}>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2.5">
                                                <span className="text-xl leading-none">{row.flag || "🌍"}</span>
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-brand-dark text-sm truncate">{row.country}</p>
                                                    <p className="text-[11px] text-gray-400 truncate">/{row.countrySlug}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-700">{row.visaType || "—"}</td>
                                        <td className="px-4 py-3 text-[13px] text-gray-500">{row.processingTime || "—"}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center">
                                                <button
                                                    role="switch"
                                                    aria-checked={row.isActive}
                                                    aria-label={`${row.isActive ? "Deactivate" : "Activate"} ${row.country}`}
                                                    disabled={busyId === row._id}
                                                    onClick={() => toggleStatus(row)}
                                                    className={`relative w-11 h-6 rounded-full transition-colors disabled:opacity-50 ${
                                                        row.isActive ? "bg-green-500" : "bg-gray-300"
                                                    }`}
                                                >
                                                    <span
                                                        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                                                            row.isActive ? "translate-x-5" : "translate-x-0"
                                                        }`}
                                                    />
                                                </button>
                                            </div>
                                            <p className={`text-[10px] text-center mt-1 font-bold ${row.isActive ? "text-green-600" : "text-gray-400"}`}>
                                                {row.isActive ? "ACTIVE" : "INACTIVE"}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-500">
                                            {row.createdAt
                                                ? new Date(row.createdAt).toLocaleDateString(undefined, { dateStyle: "medium" })
                                                : "—"}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-1">
                                                <a
                                                    href={`/visa/details/${category}/${row.countrySlug}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 rounded-lg text-gray-500 hover:bg-blue-50 hover:text-blue-600"
                                                    title="View live page"
                                                >
                                                    <FiExternalLink size={15} />
                                                </a>
                                                <Link
                                                    href={`${basePath}/create?edit=${row._id}`}
                                                    className="p-2 rounded-lg text-gray-500 hover:bg-amber-50 hover:text-amber-600"
                                                    title="Edit"
                                                >
                                                    <FiEdit2 size={15} />
                                                </Link>
                                                <button
                                                    onClick={() => setConfirmDelete(row)}
                                                    disabled={busyId === row._id}
                                                    className="p-2 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                                                    title="Delete"
                                                >
                                                    <FiTrash2 size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ---------- Delete confirmation ---------- */}
            {confirmDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
                        <div className="p-5 flex items-start gap-4">
                            <div className="w-11 h-11 rounded-full bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0">
                                <FiAlertTriangle className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-lg font-bold text-brand-dark">Delete this visa page?</h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    <span className="font-semibold">{confirmDelete.country}</span> ({category}) and all
                                    of its content will be permanently removed. This cannot be undone.
                                </p>
                                <p className="text-[12px] text-gray-500 mt-2">
                                    If you only want to take it off the website, use the status toggle instead.
                                </p>
                            </div>
                            <button
                                onClick={() => setConfirmDelete(null)}
                                className="ml-auto w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 flex-shrink-0"
                                aria-label="Close"
                            >
                                <FiX className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex gap-2 p-4 bg-gray-50 border-t border-gray-100">
                            <button
                                onClick={() => setConfirmDelete(null)}
                                className="flex-1 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={remove}
                                disabled={busyId === confirmDelete._id}
                                className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-bold disabled:opacity-60 inline-flex items-center justify-center gap-2"
                            >
                                {busyId === confirmDelete._id
                                    ? <><FiLoader className="w-4 h-4 animate-spin" /> Deleting…</>
                                    : <><FiTrash2 className="w-4 h-4" /> Delete</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
