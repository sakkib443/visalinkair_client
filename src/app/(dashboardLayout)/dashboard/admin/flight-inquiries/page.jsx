"use client";

// ===================================================================
// Admin — Flight Inquiries queue
// Every /flight submission (one-way, round, multi-city) lands here.
// Auto-generated INQ-#### number, filter/search, inline status change,
// and an eye button that opens the full submitted payload.
// ===================================================================

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
    FiRefreshCw, FiLoader, FiEye, FiTrash2, FiSearch, FiMail, FiPhone, FiX,
    FiMessageSquare,
} from "react-icons/fi";
import { LuPlane, LuMapPin, LuCalendar, LuUsers, LuMessageSquare } from "react-icons/lu";
import { FaWhatsapp } from "react-icons/fa";
import { inquiriesApi } from "@/services/api";
import RemarkModal from "../_shared/RemarkModal";

const STATUS = {
    new:       { label: "New",       cls: "bg-blue-50 text-blue-700 border-blue-200" },
    contacted: { label: "Contacted", cls: "bg-yellow-50 text-yellow-700 border-yellow-200" },
    converted: { label: "Converted", cls: "bg-green-50 text-green-700 border-green-200" },
    closed:    { label: "Closed",    cls: "bg-gray-100 text-gray-600 border-gray-200" },
    spam:      { label: "Spam",      cls: "bg-red-50 text-red-700 border-red-200" },
};

const TRIP_LABEL = { oneway: "One Way", round: "Round Way", multi: "Multi City" };

// Deterministic auto-generated INQ number from Mongo _id (last 6 hex → base10, padded).
const inqNo = (id = "") => "INQ-" + parseInt(id.slice(-6) || "0", 16).toString().padStart(6, "0");

export default function FlightInquiriesPage() {
    const [items, setItems] = useState([]);
    const [stats, setStats] = useState({ total: 0, newCount: 0, todayCount: 0, converted: 0 });
    const [total, setTotal] = useState(0);
    const [pages, setPages] = useState(1);
    const [page, setPage] = useState(1);
    const [status, setStatus] = useState("all");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState(null);
    const [detail, setDetail] = useState(null);
    const [remarkFor, setRemarkFor] = useState(null);

    const params = useMemo(() => {
        const p = { page, limit: 20, service: "flight-booking" };
        if (status !== "all") p.status = status;
        if (search) p.search = search;
        return p;
    }, [page, status, search]);

    const load = async () => {
        setLoading(true);
        try {
            const list = await inquiriesApi.list(params);
            setItems(list.data || []);
            setTotal(list.meta?.total || 0);
            setPages(list.meta?.pages || 1);
            // Compute flight-specific mini stats from same list (limit is 20 so use total from meta).
            const s = await inquiriesApi.list({ service: "flight-booking", limit: 1 });
            setStats({
                total: s.meta?.total || 0,
                newCount: items.filter((i) => i.status === "new").length,
                todayCount: items.filter((i) => new Date(i.createdAt) >= new Date(new Date().setHours(0,0,0,0))).length,
                converted: items.filter((i) => i.status === "converted").length,
            });
        } catch (err) {
            toast.error(err.message || "Failed to load");
        } finally { setLoading(false); }
    };

    useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [page, status]);

    const updateStatus = async (id, newStatus) => {
        setBusyId(id);
        try {
            await inquiriesApi.update(id, { status: newStatus });
            setItems((arr) => arr.map((x) => (x._id === id ? { ...x, status: newStatus } : x)));
            toast.success("Status updated");
        } catch (err) { toast.error(err.message || "Failed"); }
        finally { setBusyId(null); }
    };

    const remove = async (id) => {
        if (!confirm("Delete this flight inquiry?")) return;
        setBusyId(id);
        try {
            await inquiriesApi.remove(id);
            setItems((arr) => arr.filter((x) => x._id !== id));
            toast.success("Deleted");
        } catch (err) { toast.error(err.message || "Failed"); }
        finally { setBusyId(null); }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center">
                        <LuPlane className="w-5 h-5 -rotate-45" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-brand-dark" style={{ fontFamily: "Teko, sans-serif" }}>
                            FLIGHT INQUIRIES
                        </h1>
                        <p className="text-sm text-gray-500 mt-0.5">
                            Real-time queue of visitor flight-booking requests.
                        </p>
                    </div>
                </div>
                <button onClick={load} className="p-2.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50" aria-label="Refresh">
                    <FiRefreshCw className="w-4 h-4" />
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                <StatCard label="Total" value={total} color="var(--color-brand-dark)" />
                <StatCard label="On this page" value={items.length} color="var(--color-brand-blue)" />
                <StatCard label="New" value={items.filter((i) => i.status === "new").length} color="var(--color-brand-accent)" />
                <StatCard label="Converted" value={items.filter((i) => i.status === "converted").length} color="#10B981" />
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex flex-wrap gap-1.5">
                        {["all", ...Object.keys(STATUS)].map((s) => (
                            <button
                                key={s}
                                onClick={() => { setStatus(s); setPage(1); }}
                                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                                    status === s
                                        ? "bg-brand-dark text-white border-brand-dark"
                                        : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                                }`}
                            >
                                {s === "all" ? "All" : STATUS[s]?.label || s}
                            </button>
                        ))}
                    </div>
                    <div className="relative flex-1 min-w-[200px] ml-auto">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search name / phone / email / route"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && (setPage(1), load())}
                            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 focus:border-brand-blue outline-none text-sm"
                        />
                    </div>
                    <button onClick={() => { setPage(1); load(); }} className="px-4 py-2 rounded-lg bg-brand-blue hover:bg-brand-blue-hover text-white text-sm font-semibold">
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
                    No flight inquiries match this filter.
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[880px]">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr className="text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">
                                    <th className="px-4 py-3">Inquiry #</th>
                                    <th className="px-4 py-3">Passenger</th>
                                    <th className="px-4 py-3">Route</th>
                                    <th className="px-4 py-3">Type</th>
                                    <th className="px-4 py-3">When</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {items.map((it) => {
                                    const ex = it.extra || {};
                                    return (
                                        <tr key={it._id} className="hover:bg-gray-50/60">
                                            <td className="px-4 py-3">
                                                <code className="text-[11px] font-bold text-brand-dark bg-gray-100 px-2 py-1 rounded">
                                                    {inqNo(it._id)}
                                                </code>
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="font-semibold text-brand-dark text-sm">{it.name}</p>
                                                <p className="text-xs text-gray-500 flex items-center gap-1"><FiPhone size={11} /> {it.phone}</p>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-700">
                                                {ex.tripType === "multi" ? (
                                                    <span className="text-xs font-semibold text-brand-dark">{ex.from || "?"} → +{(ex.legs?.length || 0) + 1} legs</span>
                                                ) : (
                                                    <span>{ex.from || "?"} <span className="text-gray-400">→</span> {ex.to || "?"}</span>
                                                )}
                                                <p className="text-[11px] text-gray-500 mt-0.5">
                                                    {ex.departDate || "—"}{ex.returnDate ? ` · ${ex.returnDate}` : ""} · {ex.passengers || 1} pax
                                                </p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-xs px-2 py-1 rounded-md bg-brand-blue/10 text-brand-blue font-semibold">
                                                    {TRIP_LABEL[ex.tripType] || "—"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-gray-500">
                                                {new Date(it.createdAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                                            </td>
                                            <td className="px-4 py-3">
                                                <select
                                                    value={it.status}
                                                    onChange={(e) => updateStatus(it._id, e.target.value)}
                                                    disabled={busyId === it._id}
                                                    className={`text-xs font-bold border rounded-md px-2 py-1 ${STATUS[it.status]?.cls || ""}`}
                                                >
                                                    {Object.keys(STATUS).map((s) => (
                                                        <option key={s} value={s}>{STATUS[s].label}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => setDetail(it)}
                                                        className="p-2 rounded-lg text-gray-500 hover:bg-blue-50 hover:text-blue-600"
                                                        title="View full details"
                                                    >
                                                        <FiEye size={15} />
                                                    </button>
                                                    <button
                                                        onClick={() => setRemarkFor(it)}
                                                        className="p-2 rounded-lg text-gray-500 hover:bg-amber-50 hover:text-brand-accent"
                                                        title="Remark / follow-up"
                                                    >
                                                        <FiMessageSquare size={15} />
                                                    </button>
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
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {pages > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-sm">
                            <span className="text-gray-500">Page {page} of {pages} · {total} total</span>
                            <div className="flex gap-1">
                                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="px-3 py-1.5 rounded-md border border-gray-200 disabled:opacity-40">Prev</button>
                                <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page >= pages} className="px-3 py-1.5 rounded-md border border-gray-200 disabled:opacity-40">Next</button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Detail modal */}
            {detail && <DetailModal it={detail} onClose={() => setDetail(null)} />}
            {remarkFor && <RemarkModal inquiry={remarkFor} onClose={() => setRemarkFor(null)} />}
        </div>
    );
}

function StatCard({ label, value, color }) {
    return (
        <div className="rounded-2xl bg-white border border-gray-100 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">{label}</p>
            <p className="text-2xl font-black mt-1" style={{ color, fontFamily: "Teko, sans-serif" }}>{value ?? 0}</p>
        </div>
    );
}

// ── Detail modal — full submitted payload with formatted legs ──
function DetailModal({ it, onClose }) {
    const ex = it.extra || {};
    const legs = ex.legs || [];
    const waHref = it.phone
        ? `https://wa.me/${it.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi ${it.name}, regarding your flight inquiry ${inqNo(it._id)}...`)}`
        : null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-100 p-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-brand-blue/10 text-brand-blue flex items-center justify-center">
                            <LuPlane className="w-5 h-5 -rotate-45" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Inquiry</p>
                            <p className="font-bold text-brand-dark">{inqNo(it._id)}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500" aria-label="Close">
                        <FiX className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-5 space-y-5">
                    {/* Passenger */}
                    <Section title="Passenger">
                        <Row label="Name">{it.name}</Row>
                        <Row label="WhatsApp"><a href={`tel:${it.phone}`} className="text-brand-blue font-semibold">{it.phone}</a></Row>
                        {it.email && <Row label="Email"><a href={`mailto:${it.email}`} className="text-brand-blue">{it.email}</a></Row>}
                    </Section>

                    {/* Trip */}
                    <Section title="Trip details">
                        <Row label="Trip type">{TRIP_LABEL[ex.tripType] || "—"}</Row>
                        <Row label="Passengers">{ex.passengers || 1}</Row>
                        <Row label="Class">{ex.cabin || "economy"}</Row>
                    </Section>

                    {/* Legs */}
                    <Section title="Route">
                        <div className="space-y-2">
                            <LegRow n={1} from={ex.from} to={ex.to} date={ex.departDate} />
                            {ex.returnDate && ex.tripType === "round" && (
                                <LegRow n="R" from={ex.to} to={ex.from} date={ex.returnDate} />
                            )}
                            {legs.map((l, i) => (
                                <LegRow key={i} n={i + 2} from={l.from} to={l.to} date={l.date} />
                            ))}
                        </div>
                    </Section>

                    {/* Message */}
                    {it.message && (
                        <Section title="Full message">
                            <pre className="text-xs whitespace-pre-wrap bg-gray-50 border border-gray-100 rounded-lg p-3 font-mono text-gray-700">
                                {it.message}
                            </pre>
                        </Section>
                    )}

                    {/* Meta */}
                    <Section title="Meta">
                        <Row label="Submitted">{new Date(it.createdAt).toLocaleString()}</Row>
                        <Row label="Status">
                            <span className={`text-[11px] px-2 py-0.5 rounded-md border font-bold ${STATUS[it.status]?.cls || ""}`}>
                                {STATUS[it.status]?.label || it.status}
                            </span>
                        </Row>
                        {it.pageUrl && <Row label="Source"><a href={it.pageUrl} target="_blank" rel="noopener noreferrer" className="text-brand-blue text-xs truncate">{it.pageUrl}</a></Row>}
                    </Section>

                    {/* Quick actions */}
                    <div className="flex flex-wrap gap-2 pt-2">
                        {waHref && (
                            <a href={waHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-whatsapp hover:bg-whatsapp-hover text-white text-sm font-bold">
                                <FaWhatsapp size={14} /> Reply on WhatsApp
                            </a>
                        )}
                        {it.email && (
                            <a href={`mailto:${it.email}?subject=Re: Flight Inquiry ${inqNo(it._id)}`} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand-dark hover:bg-brand-dark-hover text-white text-sm font-bold">
                                <FiMail size={14} /> Reply by Email
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function Section({ title, children }) {
    return (
        <div>
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">{title}</h3>
            <div className="rounded-lg border border-gray-100 divide-y divide-gray-100">{children}</div>
        </div>
    );
}
function Row({ label, children }) {
    return (
        <div className="flex items-center gap-3 px-3 py-2 text-sm">
            <span className="text-[11px] font-semibold text-gray-500 w-24 flex-shrink-0">{label}</span>
            <span className="text-brand-dark font-medium">{children ?? "—"}</span>
        </div>
    );
}
function LegRow({ n, from, to, date }) {
    return (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
            <span className="w-7 h-7 rounded-full bg-brand-blue/10 text-brand-blue font-black text-xs flex items-center justify-center">
                {n}
            </span>
            <div className="flex-1 text-sm">
                <p className="font-semibold text-brand-dark">
                    {from || "—"} <span className="text-gray-400 mx-1">→</span> {to || "—"}
                </p>
                <p className="text-[11px] text-gray-500">{date || "—"}</p>
            </div>
        </div>
    );
}
