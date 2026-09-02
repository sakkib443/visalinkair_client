"use client";
// ===================================================================
// Lead detail popup — admin (team-performance) আর employee দুই জায়গাতেই
// একই component ব্যবহার হয়, তাই status/নোটের চেহারা সব জায়গায় এক থাকে।
//
// দেখায়: লিডের তথ্য, প্রতিবার কলের পুরো হিস্টোরি (কে, কখন, কী status,
// কী নোট), আর নতুন নোট + status দেওয়ার ফর্ম।
// ===================================================================
import { useMemo, useState } from "react";
import {
    LuX, LuPhone, LuMail, LuGlobe, LuCalendar, LuLoader, LuSend, LuClock,
    LuMessageSquare, LuUser, LuTriangleAlert, LuHistory, LuTag,
} from "react-icons/lu";
import { FaWhatsapp } from "react-icons/fa";
import toast from "react-hot-toast";
import { STATUS_GROUPS, statusLabel, statusBadge, statusColor } from "@/utils/leadStatus";
import { apiError } from "@/utils/dateRange";

const BACKEND =
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5000";

const digitsOnly = (p) => String(p || "").replace(/[^\d]/g, "");
const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "");
const svcLabel = (s) => (s ? cap(String(s).replace(/_/g, " ")) : "—");
const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";
const fmtWhen = (d) =>
    d ? new Date(d).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

export default function LeadDetailModal({ lead, token, onClose, onUpdated }) {
    const [status, setStatus] = useState(lead?.status || "contacted");
    const [note, setNote] = useState("");
    const [nextFollowUp, setNextFollowUp] = useState("");
    const [saving, setSaving] = useState(false);

    // নতুন কল আগে — সর্বশেষ কী হয়েছে সেটাই আগে চোখে পড়ুক
    const history = useMemo(() => {
        const logs = Array.isArray(lead?.callLogs) ? [...lead.callLogs] : [];
        return logs.sort((a, b) => new Date(b.at) - new Date(a.at));
    }, [lead]);

    const overdue =
        lead?.nextFollowUp && new Date(lead.nextFollowUp) <= new Date();

    const submit = async () => {
        if (!note.trim()) { toast.error("Note is required"); return; }
        setSaving(true);
        try {
            const body = { comment: note.trim() };
            if (status) body.status = status;
            if (nextFollowUp) body.nextFollowUp = nextFollowUp;

            const res = await fetch(`${BACKEND}/api/leads/${lead._id}/log`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify(body),
            });
            const data = await res.json().catch(() => null);
            if (!res.ok || data?.success === false) throw new Error(apiError(data, res, "Failed to save note"));
            toast.success("Note saved");
            setNote("");
            setNextFollowUp("");
            onUpdated?.(data.data);
        } catch (e) {
            toast.error(e.message || "Failed to save note");
        } finally {
            setSaving(false);
        }
    };

    if (!lead) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl"
                onClick={(e) => e.stopPropagation()}>

                {/* ── Header ── */}
                <div className="flex items-start justify-between gap-3 p-5 border-b border-gray-100">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                            style={{ background: "var(--color-brand-dark)" }}>
                            {(lead.name || "?")[0]?.toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <h3 className="font-bold text-gray-900 text-lg truncate">{lead.name || "Unknown"}</h3>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${statusBadge(lead.status)}`}>
                                    {statusLabel(lead.status)}
                                </span>
                                <span className="text-xs text-gray-400">
                                    {history.length} call{history.length === 1 ? "" : "s"} logged
                                </span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition flex-shrink-0">
                        <LuX size={18} />
                    </button>
                </div>

                <div className="overflow-y-auto flex-grow">
                    {/* ── Contact + meta ── */}
                    <div className="p-5 border-b border-gray-100">
                        <div className="flex flex-wrap items-center gap-2 mb-4">
                            <a href={`https://wa.me/${digitsOnly(lead.phone)}`} target="_blank" rel="noreferrer"
                                className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg text-white transition hover:opacity-90"
                                style={{ background: "var(--color-whatsapp)" }}>
                                <FaWhatsapp size={14} /> WhatsApp
                            </a>
                            <a href={`tel:${lead.phone}`}
                                className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition">
                                <LuPhone size={14} /> {lead.phone}
                            </a>
                            {lead.email && (
                                <a href={`mailto:${lead.email}`}
                                    className="inline-flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition">
                                    <LuMail size={14} /> {lead.email}
                                </a>
                            )}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <Meta icon={LuTag} label="Service" value={svcLabel(lead.service)} />
                            <Meta icon={LuGlobe} label="Source" value={svcLabel(lead.source)} />
                            <Meta icon={LuGlobe} label="Country" value={lead.country || "—"} />
                            <Meta icon={LuCalendar} label="Lead came in" value={fmtDate(lead.createdAt)} />
                            {lead.assignedAt && <Meta icon={LuUser} label="Assigned on" value={fmtDate(lead.assignedAt)} />}
                            {lead.assignedToName && <Meta icon={LuUser} label="Assigned to" value={lead.assignedToName} />}
                            <Meta icon={LuClock} label="Next follow-up"
                                value={lead.nextFollowUp ? fmtDate(lead.nextFollowUp) : "—"}
                                warn={overdue} />
                        </div>
                        {lead.message && (
                            <div className="mt-4 rounded-lg bg-gray-50 border border-gray-100 p-3">
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1">
                                    Customer&apos;s message
                                </p>
                                <p className="text-sm text-gray-700 break-words whitespace-pre-wrap">{lead.message}</p>
                            </div>
                        )}
                    </div>

                    {/* ── Add note ── */}
                    <div className="p-5 border-b border-gray-100 bg-[#3590CF]/5">
                        <h4 className="text-sm font-bold text-gray-700 flex items-center gap-1.5 mb-3">
                            <LuMessageSquare size={15} /> Log a call / add a note
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                            <label className="block">
                                <span className="text-[11px] font-semibold text-gray-500">Status after this call</span>
                                <select value={status} onChange={(e) => setStatus(e.target.value)}
                                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-[#3590CF]/30">
                                    {STATUS_GROUPS.map((g) => (
                                        <optgroup key={g.label} label={g.label}>
                                            {g.statuses.map((s) => (
                                                <option key={s} value={s}>{statusLabel(s)}</option>
                                            ))}
                                        </optgroup>
                                    ))}
                                </select>
                            </label>
                            <label className="block">
                                <span className="text-[11px] font-semibold text-gray-500">Next follow-up (optional)</span>
                                <input type="date" value={nextFollowUp} onChange={(e) => setNextFollowUp(e.target.value)}
                                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-[#3590CF]/30" />
                            </label>
                        </div>
                        <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3}
                            placeholder="What did the customer say? e.g. দাম জানতে চেয়েছে, পরে জানাবে…"
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-[#3590CF]/30 resize-none" />
                        <div className="flex justify-end mt-2">
                            <button onClick={submit} disabled={saving || !note.trim()}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-40"
                                style={{ background: "#3590CF" }}>
                                {saving ? <LuLoader size={14} className="animate-spin" /> : <LuSend size={14} />} Save note
                            </button>
                        </div>
                    </div>

                    {/* ── Call history ── */}
                    <div className="p-5">
                        <h4 className="text-sm font-bold text-gray-700 flex items-center gap-1.5 mb-1">
                            <LuHistory size={15} /> Call history
                        </h4>
                        <p className="text-[11px] text-gray-400 mb-4">
                            Every call and status change on this lead, newest first.
                        </p>
                        {history.length === 0 ? (
                            <p className="text-sm text-gray-400 py-8 text-center">
                                No calls logged yet. Add the first note above.
                            </p>
                        ) : (
                            <ol className="relative border-l-2 border-gray-100 ml-2 space-y-4">
                                {history.map((h, i) => (
                                    <li key={i} className="ml-5 relative">
                                        <span className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full border-2 border-white"
                                            style={{ background: statusColor(h.status) }} />
                                        <div className="flex flex-wrap items-center gap-2">
                                            {h.status && (
                                                <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${statusBadge(h.status)}`}>
                                                    {statusLabel(h.status)}
                                                </span>
                                            )}
                                            <span className="text-xs font-medium text-gray-600">
                                                {h.byName || (h.by ? "Team" : "Customer")}
                                            </span>
                                            <span className="text-[11px] text-gray-400 ml-auto whitespace-nowrap">{fmtWhen(h.at)}</span>
                                        </div>
                                        {h.comment && (
                                            <p className="text-sm text-gray-700 mt-1 break-words whitespace-pre-wrap">{h.comment}</p>
                                        )}
                                    </li>
                                ))}
                            </ol>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function Meta({ icon: Icon, label, value, warn }) {
    return (
        <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide flex items-center gap-1">
                <Icon size={11} /> {label}
            </p>
            <p className={`text-sm mt-0.5 ${warn ? "font-semibold text-red-600" : "text-gray-800"}`}>
                {value}{warn ? " (overdue)" : ""}
            </p>
        </div>
    );
}
