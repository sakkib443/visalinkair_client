"use client";

// ===================================================================
// RemarksList — one shared list component every per-service Remarks
// page renders. Handles stats cards, date filters (single day + range),
// search, pagination, and re-opening a row in RemarkModal for edit.
// ===================================================================

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
    FiRefreshCw, FiLoader, FiEdit3, FiTrash2, FiSearch,
    FiCalendar, FiClock, FiAlertCircle, FiCheckCircle,
    FiMessageSquare, FiX, FiPhone, FiMail, FiChevronRight,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { remarkService } from "@/services/api";
import RemarkModal from "./RemarkModal";

const isoDate = (d) => {
    if (!d) return "";
    const x = new Date(d);
    if (isNaN(x.getTime())) return "";
    const off = x.getTimezoneOffset();
    const local = new Date(x.getTime() - off * 60_000);
    return local.toISOString().slice(0, 10);
};

const prettyDate = (d) => {
    if (!d) return "—";
    try {
        return new Date(d).toLocaleDateString(undefined, {
            year: "numeric", month: "short", day: "numeric",
        });
    } catch { return "—"; }
};

const isSameDay = (a, b) => {
    if (!a || !b) return false;
    const x = new Date(a), y = new Date(b);
    return x.getFullYear() === y.getFullYear()
        && x.getMonth() === y.getMonth()
        && x.getDate() === y.getDate();
};

const isPast = (d) => {
    if (!d) return false;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return new Date(d) < now;
};

export default function RemarksList({ service, title, Icon, accent = "var(--color-brand-blue)" }) {
    const [items, setItems] = useState([]);
    const [stats, setStats] = useState({ total: 0, today: 0, upcoming: 0, overdue: 0 });
    const [total, setTotal] = useState(0);
    const [pages, setPages] = useState(1);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState(null);

    // Filters
    const [search, setSearch] = useState("");
    const [dateMode, setDateMode] = useState("all"); // all | today | single | range
    const [singleDate, setSingleDate] = useState(isoDate(new Date()));
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    // Modal state — we reuse RemarkModal for edit; it expects an
    // "inquiry-like" object shape so we build one from the remark row.
    const [editing, setEditing] = useState(null);

    const params = useMemo(() => {
        const p = { page, limit: 20, service };
        if (search) p.search = search;
        if (dateMode === "today") p.date = isoDate(new Date());
        else if (dateMode === "single" && singleDate) p.date = singleDate;
        else if (dateMode === "range") {
            if (fromDate) p.from = fromDate;
            if (toDate) p.to = toDate;
        }
        return p;
    }, [page, service, search, dateMode, singleDate, fromDate, toDate]);

    const load = async () => {
        setLoading(true);
        try {
            const [list, s] = await Promise.all([
                remarkService.list(params),
                remarkService.stats({ service }),
            ]);
            setItems(list.data || []);
            setTotal(list.meta?.total || 0);
            setPages(list.meta?.pages || 1);
            setStats(s.data || { total: 0, today: 0, upcoming: 0, overdue: 0 });
        } catch (err) {
            toast.error(err.message || "Failed to load remarks");
        } finally { setLoading(false); }
    };

    // Reload on filter/page changes.
    useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [params]);

    // Real-time-ish: refetch on window focus + every 30 s while the tab
    // is visible. Keeps the "today's remarks" card honest without WS.
    useEffect(() => {
        const onFocus = () => load();
        window.addEventListener("focus", onFocus);
        const id = setInterval(() => {
            if (document.visibilityState === "visible") load();
        }, 30000);
        return () => {
            window.removeEventListener("focus", onFocus);
            clearInterval(id);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params]);

    const removeRemark = async (id) => {
        if (!confirm("Delete this remark entirely?")) return;
        setBusyId(id);
        try {
            await remarkService.remove(id);
            setItems((arr) => arr.filter((x) => x._id !== id));
            toast.success("Deleted");
            load();
        } catch (err) { toast.error(err.message || "Failed"); }
        finally { setBusyId(null); }
    };

    const clearFilters = () => {
        setSearch("");
        setDateMode("all");
        setSingleDate(isoDate(new Date()));
        setFromDate("");
        setToDate("");
        setPage(1);
    };

    return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                <div className="flex items-center gap-3">
                    <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center"
                        style={{ background: `${accent}1a`, color: accent }}
                    >
                        {Icon ? <Icon className="w-5 h-5" /> : <FiMessageSquare className="w-5 h-5" />}
                    </div>
                    <div>
                        <h1
                            className="text-xl sm:text-2xl font-black text-brand-dark uppercase"
                            style={{ fontFamily: "Teko, sans-serif" }}
                        >
                            {title}
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                            Follow-up notes & scheduled call-backs.
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

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                <StatCard label="Total" value={stats.total} color="var(--color-brand-dark)" Icon={FiMessageSquare} />
                <StatCard label="Today" value={stats.today} color="var(--color-brand-accent)" Icon={FiCalendar} />
                <StatCard label="Next 7 days" value={stats.upcoming} color="var(--color-brand-blue)" Icon={FiClock} />
                <StatCard label="Overdue" value={stats.overdue} color="#DC2626" Icon={FiAlertCircle} />
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                    {[
                        ["all", "All"],
                        ["today", "Today"],
                        ["single", "Specific date"],
                        ["range", "Date range"],
                    ].map(([k, label]) => (
                        <button
                            key={k}
                            onClick={() => { setDateMode(k); setPage(1); }}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
                                dateMode === k
                                    ? "bg-brand-dark text-white border-brand-dark"
                                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                    {(dateMode !== "all" || search) && (
                        <button
                            onClick={clearFilters}
                            className="ml-auto text-xs text-gray-500 hover:text-red-600 flex items-center gap-1 cursor-pointer"
                        >
                            <FiX size={12} /> Clear
                        </button>
                    )}
                </div>

                {/* Contextual filter row */}
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_auto] gap-2">
                    {dateMode === "single" && (
                        <input
                            type="date"
                            value={singleDate}
                            onChange={(e) => { setSingleDate(e.target.value); setPage(1); }}
                            className="px-3 py-2 rounded-lg border border-gray-200 focus:border-brand-blue outline-none text-sm"
                        />
                    )}
                    {dateMode === "range" && (
                        <>
                            <div className="flex items-center gap-2">
                                <span className="text-[11px] font-bold uppercase text-gray-500 w-10">From</span>
                                <input
                                    type="date"
                                    value={fromDate}
                                    onChange={(e) => { setFromDate(e.target.value); setPage(1); }}
                                    className="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:border-brand-blue outline-none text-sm"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[11px] font-bold uppercase text-gray-500 w-10">To</span>
                                <input
                                    type="date"
                                    value={toDate}
                                    onChange={(e) => { setToDate(e.target.value); setPage(1); }}
                                    className="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:border-brand-blue outline-none text-sm"
                                />
                            </div>
                        </>
                    )}
                    <div className="relative sm:col-start-4 sm:col-span-1 col-span-full">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search name, phone, email, message"
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 focus:border-brand-blue outline-none text-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Body */}
            {loading ? (
                <div className="py-24 flex items-center justify-center">
                    <FiLoader className="w-6 h-6 text-brand-blue animate-spin" />
                </div>
            ) : items.length === 0 ? (
                <div className="py-24 text-center border border-dashed border-gray-200 rounded-2xl text-gray-500">
                    <FiCheckCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    No remarks match this filter.
                </div>
            ) : (
                <div className="grid gap-3 sm:gap-4">
                    {items.map((r) => (
                        <RemarkCard
                            key={r._id}
                            r={r}
                            onEdit={() => setEditing({
                                _id: r.inquiryId,
                                name: r.inquirySnapshot?.name,
                                phone: r.inquirySnapshot?.phone,
                                email: r.inquirySnapshot?.email,
                                createdAt: r.inquiryDate,
                            })}
                            onDelete={() => removeRemark(r._id)}
                            busy={busyId === r._id}
                            accent={accent}
                        />
                    ))}

                    {pages > 1 && (
                        <div className="flex items-center justify-between px-1 pt-2 text-sm">
                            <span className="text-gray-500">Page {page} of {pages} · {total} total</span>
                            <div className="flex gap-1">
                                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="px-3 py-1.5 rounded-md border border-gray-200 disabled:opacity-40 cursor-pointer">Prev</button>
                                <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page >= pages} className="px-3 py-1.5 rounded-md border border-gray-200 disabled:opacity-40 cursor-pointer">Next</button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {editing && (
                <RemarkModal
                    inquiry={editing}
                    onClose={() => setEditing(null)}
                    onSaved={() => load()}
                />
            )}
        </div>
    );
}

function StatCard({ label, value, color, Icon }) {
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

// ──────────────────────────────────────────────────────────────────
// RemarkCard — one row in the list. Structured as:
//   left  → prominent day/month/year date badge (status-colored)
//   right → header (name + phone + status chip + actions)
//           meta strip (inquiry received · email · WhatsApp)
//           follow-up timeline (numbered, latest first, hides olders)
// Fully responsive: on mobile the date badge collapses to a
// horizontal chip and actions dock into the header row.
// ──────────────────────────────────────────────────────────────────
function RemarkCard({ r, onEdit, onDelete, busy, accent }) {
    const overdue = isPast(r.nextRemarkDate) && !isSameDay(r.nextRemarkDate, new Date());
    const today = isSameDay(r.nextRemarkDate, new Date());

    const badgeCls = overdue
        ? "from-red-500 to-red-600 text-white"
        : today
            ? "from-brand-accent to-[#d67a20] text-white"
            : "from-white to-gray-50 text-brand-dark border border-gray-100";

    const cardCls = overdue
        ? "border-red-200 shadow-sm hover:shadow-lg hover:border-red-300"
        : today
            ? "border-brand-accent/40 shadow-sm hover:shadow-lg hover:border-brand-accent/60"
            : "border-gray-100 hover:border-brand-blue/40 hover:shadow-lg";

    const d = new Date(r.nextRemarkDate);
    const day    = d.toLocaleDateString(undefined, { day: "2-digit" });
    const month  = d.toLocaleDateString(undefined, { month: "short" }).toUpperCase();
    const year   = d.getFullYear();
    const weekday = d.toLocaleDateString(undefined, { weekday: "short" }).toUpperCase();

    const phone = r.inquirySnapshot?.phone;
    const waHref = phone ? `https://wa.me/${phone.replace(/\D/g, "")}` : null;

    const all = [
        { _id: "p", date: r.nextRemarkDate, message: r.message },
        ...(r.followUps || []),
    ];
    const shown = all.slice(-3);
    const hidden = all.length - shown.length;
    const startNo = all.length - shown.length + 1;

    return (
        <article
            className={`group relative bg-white rounded-2xl border transition-all overflow-hidden ${cardCls}`}
        >
            {/* Accent stripe — reflects urgency at a glance */}
            <div
                className={`absolute inset-y-0 left-0 w-1 ${
                    overdue ? "bg-red-500" : today ? "bg-brand-accent" : "bg-transparent"
                }`}
            />

            <div className="p-4 sm:p-5 pl-5 sm:pl-6">
                <div className="flex flex-col sm:flex-row sm:items-stretch gap-4">
                    {/* Date badge */}
                    <div className="flex-shrink-0 flex sm:block gap-3">
                        <div className={`rounded-xl bg-gradient-to-br ${badgeCls} shadow-sm w-20 sm:w-24 py-3 text-center`}>
                            <p className="text-[9px] font-black uppercase tracking-widest opacity-80">{weekday}</p>
                            <p
                                className="text-2xl sm:text-3xl font-black leading-none mt-1"
                                style={{ fontFamily: "Teko, sans-serif" }}
                            >
                                {day}
                            </p>
                            <p className="text-[10px] font-black uppercase tracking-wider mt-1">
                                {month} {year}
                            </p>
                        </div>

                        {/* Status chip — only shown on mobile beside the date */}
                        <div className="flex sm:hidden flex-1 min-w-0 flex-col justify-center gap-1">
                            {overdue && <StatusChip label="OVERDUE" color="bg-red-600 text-white" />}
                            {today && !overdue && <StatusChip label="DUE TODAY" color="bg-brand-accent text-white" />}
                            {!overdue && !today && (
                                <StatusChip label="SCHEDULED" color="bg-brand-blue/10 text-brand-blue" />
                            )}
                            <p className="text-[10px] font-semibold text-gray-500">
                                {all.length} follow-up{all.length > 1 ? "s" : ""}
                            </p>
                        </div>
                    </div>

                    {/* Right column */}
                    <div className="flex-1 min-w-0">
                        {/* Header row: name + chips + actions */}
                        <div className="flex items-start gap-2 mb-2">
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                    <h3 className="font-black text-brand-dark text-base sm:text-lg leading-tight">
                                        {r.inquirySnapshot?.name || "—"}
                                    </h3>
                                    {/* Desktop status chips */}
                                    <span className="hidden sm:inline-flex">
                                        {overdue && <StatusChip label="OVERDUE" color="bg-red-600 text-white" />}
                                        {today && !overdue && <StatusChip label="DUE TODAY" color="bg-brand-accent text-white" />}
                                    </span>
                                </div>
                            </div>

                            {/* Actions — always visible; larger touch target on mobile */}
                            <div className="flex items-center gap-1 flex-shrink-0">
                                <button
                                    onClick={onEdit}
                                    className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:bg-brand-blue/10 hover:text-brand-blue transition-colors cursor-pointer"
                                    title="Edit / add follow-up"
                                    aria-label="Edit remark"
                                >
                                    <FiEdit3 size={15} />
                                </button>
                                <button
                                    onClick={onDelete}
                                    disabled={busy}
                                    className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-40 transition-colors cursor-pointer"
                                    title="Delete remark"
                                    aria-label="Delete remark"
                                >
                                    <FiTrash2 size={15} />
                                </button>
                            </div>
                        </div>

                        {/* Meta strip — phone / whatsapp / email / inquiry date */}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-500 mb-3">
                            {phone && (
                                <a
                                    href={`tel:${phone}`}
                                    className="inline-flex items-center gap-1 font-semibold text-brand-blue hover:underline"
                                >
                                    <FiPhone size={11} /> {phone}
                                </a>
                            )}
                            {waHref && (
                                <a
                                    href={waHref}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 font-semibold text-emerald-600 hover:underline"
                                >
                                    <FaWhatsapp size={11} /> WhatsApp
                                </a>
                            )}
                            {r.inquirySnapshot?.email && (
                                <a
                                    href={`mailto:${r.inquirySnapshot.email}`}
                                    className="inline-flex items-center gap-1 hover:text-brand-dark truncate max-w-[220px]"
                                    title={r.inquirySnapshot.email}
                                >
                                    <FiMail size={11} /> <span className="truncate">{r.inquirySnapshot.email}</span>
                                </a>
                            )}
                            <span className="inline-flex items-center gap-1">
                                <FiCalendar size={11} /> Inquiry {prettyDate(r.inquiryDate)}
                            </span>
                        </div>

                        {/* Follow-up timeline */}
                        <div className="rounded-xl bg-gray-50/70 border border-gray-100 p-3 sm:p-4">
                            <div className="flex items-center justify-between mb-2.5">
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-1.5">
                                    <FiMessageSquare size={11} />
                                    {all.length} follow-up{all.length > 1 ? "s" : ""}
                                </p>
                                {hidden > 0 && (
                                    <button
                                        onClick={onEdit}
                                        className="text-[10px] font-bold text-brand-blue hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                                    >
                                        + {hidden} earlier <FiChevronRight size={10} />
                                    </button>
                                )}
                            </div>

                            <ul className="relative space-y-2.5">
                                {/* Vertical timeline line */}
                                {shown.length > 1 && (
                                    <span
                                        aria-hidden
                                        className="absolute left-[9px] top-1 bottom-1 w-px bg-gradient-to-b from-brand-accent/50 via-gray-200 to-transparent"
                                    />
                                )}
                                {shown.map((fu, i) => {
                                    const n = startNo + i;
                                    const isLatest = i === shown.length - 1;
                                    return (
                                        <li key={fu._id} className="relative flex gap-2.5">
                                            <span
                                                className={`flex-shrink-0 mt-0.5 w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center text-[9px] font-black ${
                                                    isLatest
                                                        ? "border-brand-accent bg-brand-accent text-white"
                                                        : "border-gray-300 bg-white text-gray-500"
                                                }`}
                                            >
                                                {n}
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${
                                                    isLatest ? "text-brand-accent" : "text-gray-500"
                                                }`}>
                                                    {prettyDate(fu.date)}
                                                </p>
                                                <p className="text-xs sm:text-sm text-brand-dark whitespace-pre-wrap break-words leading-relaxed">
                                                    {fu.message}
                                                </p>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </article>
    );
}

function StatusChip({ label, color }) {
    return (
        <span className={`inline-block text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${color}`}>
            {label}
        </span>
    );
}
