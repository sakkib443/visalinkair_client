"use client";

// ===================================================================
// RemarkModal — compact follow-up tracker for a single inquiry.
//
// UX model (per spec):
//   - The very first save IS "Follow-up 1". There is no separate
//     "primary remark" concept exposed to the user — every entry is
//     just a numbered follow-up (date + message).
//   - On re-open, all follow-ups are shown in order. A new
//     "Add Follow-up N+1" composer sits at the bottom.
//   - Follow-up 1 can be edited but NOT deleted individually — the
//     whole remark is deleted via the "Delete all" button in the
//     header. Follow-ups 2+ can be edited or deleted individually.
//
// Backend mapping: the model still has {message, nextRemarkDate,
// followUps[]}. We present them as a single flat list — index 0
// is the primary (message+nextRemarkDate), indexes 1+ are followUps.
// PATCH targets that flat position transparently.
// ===================================================================

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";
import {
    FiX, FiCalendar, FiMessageSquare, FiPlus, FiTrash2, FiEdit3,
    FiLoader, FiCheck, FiSave,
} from "react-icons/fi";
import { remarkService } from "@/services/api";

const inputCls =
    "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#1a1a4e] focus:ring-2 focus:ring-[#1a1a4e]/10";

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

// Flatten (message + nextRemarkDate + followUps[]) → a single ordered
// list of entries the UI treats uniformly. Position 0 is "the primary"
// (persisted at the record root); the rest come from `followUps`.
const flatten = (r) => {
    if (!r) return [];
    return [
        {
            primary: true,
            _id: "primary",
            date: r.nextRemarkDate,
            message: r.message,
        },
        ...(r.followUps || []).map((f) => ({
            primary: false,
            _id: f._id,
            date: f.date,
            message: f.message,
        })),
    ];
};

export default function RemarkModal({ inquiry, onClose, onSaved }) {
    const [mode, setMode] = useState("loading");  // loading | create | edit
    const [remark, setRemark] = useState(null);
    const [saving, setSaving] = useState(false);

    // Composer (used for BOTH first-save and "add next follow-up")
    const [newDate, setNewDate] = useState(isoDate(new Date()));
    const [newMessage, setNewMessage] = useState("");

    // Inline edit state — one row at a time
    const [editingId, setEditingId] = useState(null);
    const [editDate, setEditDate] = useState("");
    const [editMessage, setEditMessage] = useState("");

    // Probe on open: does a remark already exist?
    useEffect(() => {
        if (!inquiry?._id) return;
        let alive = true;
        (async () => {
            try {
                const r = await remarkService.getByInquiry(inquiry._id);
                if (!alive) return;
                if (r?.data) {
                    setRemark(r.data);
                    setMode("edit");
                } else {
                    setMode("create");
                }
            } catch (err) {
                if (!alive) return;
                toast.error(err.message || "Failed to load");
                setMode("create");
            }
        })();
        return () => { alive = false; };
    }, [inquiry?._id]);

    // Escape closes; body scroll lock while open.
    useEffect(() => {
        const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
        window.addEventListener("keydown", onKey);
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            window.removeEventListener("keydown", onKey);
            document.body.style.overflow = prev;
        };
    }, [onClose]);

    const entries = flatten(remark);
    const nextNo = entries.length + 1;

    // ── Create the very first entry (becomes Follow-up 1) ─────────
    const submitFirst = async () => {
        if (!newDate) return toast.error("Pick a date");
        if (!newMessage.trim()) return toast.error("Write a message");
        setSaving(true);
        try {
            const r = await remarkService.create({
                inquiryId: inquiry._id,
                nextRemarkDate: newDate,
                message: newMessage.trim(),
            });
            toast.success("Follow-up 1 saved");
            setRemark(r.data);
            setNewDate(isoDate(new Date()));
            setNewMessage("");
            setMode("edit");
            onSaved?.(r.data);
        } catch (err) {
            toast.error(err.message || "Failed to save");
        } finally { setSaving(false); }
    };

    // ── Append the next follow-up (in edit mode) ──────────────────
    const addNext = async () => {
        if (!newDate) return toast.error("Pick a date");
        if (!newMessage.trim()) return toast.error("Write a message");
        setSaving(true);
        try {
            const r = await remarkService.update(remark._id, {
                addFollowUp: { date: newDate, message: newMessage.trim() },
            });
            toast.success(`Follow-up ${nextNo} added`);
            setRemark(r.data);
            setNewDate(isoDate(new Date()));
            setNewMessage("");
            onSaved?.(r.data);
        } catch (err) {
            toast.error(err.message || "Failed to add");
        } finally { setSaving(false); }
    };

    // ── Inline edit of any entry ──────────────────────────────────
    const startEdit = (e) => {
        setEditingId(e._id);
        setEditDate(isoDate(e.date));
        setEditMessage(e.message);
    };
    const saveEdit = async (e) => {
        if (!editDate || !editMessage.trim()) return toast.error("Both fields required");
        setSaving(true);
        try {
            const patch = e.primary
                ? { nextRemarkDate: editDate, message: editMessage.trim() }
                : { updateFollowUp: { id: e._id, date: editDate, message: editMessage.trim() } };
            const r = await remarkService.update(remark._id, patch);
            toast.success("Updated");
            setRemark(r.data);
            setEditingId(null);
            onSaved?.(r.data);
        } catch (err) {
            toast.error(err.message || "Failed");
        } finally { setSaving(false); }
    };

    // ── Delete a single follow-up (not the primary) ───────────────
    const removeEntry = async (e) => {
        if (e.primary) return; // handled via "Delete all"
        if (!confirm("Delete this follow-up?")) return;
        setSaving(true);
        try {
            const r = await remarkService.update(remark._id, { removeFollowUp: e._id });
            toast.success("Deleted");
            setRemark(r.data);
            onSaved?.(r.data);
        } catch (err) {
            toast.error(err.message || "Failed");
        } finally { setSaving(false); }
    };

    const deleteAll = async () => {
        if (!confirm("Delete every follow-up on this inquiry?")) return;
        setSaving(true);
        try {
            await remarkService.remove(remark._id);
            toast.success("Deleted");
            onSaved?.(null);
            onClose?.();
        } catch (err) {
            toast.error(err.message || "Failed");
            setSaving(false);
        }
    };

    if (typeof document === "undefined") return null;

    const body = (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-xl w-full max-w-md max-h-[85vh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden"
                onClick={(evt) => evt.stopPropagation()}
            >
                {/* Header (fixed) */}
                <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-100 flex-shrink-0">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-[#EF8C2C]/10 text-[#EF8C2C] flex items-center justify-center flex-shrink-0">
                            <FiMessageSquare className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500">Remark</p>
                            <p className="font-bold text-[#1a1a4e] text-sm truncate">
                                {inquiry?.name || "—"}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                        {mode === "edit" && (
                            <button
                                onClick={deleteAll}
                                disabled={saving}
                                className="p-2 rounded-md text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-40 cursor-pointer"
                                title="Delete all follow-ups"
                            >
                                <FiTrash2 size={14} />
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="p-2 rounded-md text-gray-500 hover:bg-gray-100 cursor-pointer"
                            aria-label="Close"
                        >
                            <FiX size={16} />
                        </button>
                    </div>
                </div>

                {/* Body (scrollable) */}
                <div className="flex-1 overflow-y-auto p-3 sm:p-4">
                    {mode === "loading" ? (
                        <div className="py-12 flex items-center justify-center">
                            <FiLoader className="w-5 h-5 text-[#1a1a4e] animate-spin" />
                        </div>
                    ) : (
                        <>
                            {/* Inquiry received date (readonly) */}
                            <div className="flex items-center gap-2 text-[11px] text-gray-500 mb-3">
                                <FiCalendar size={11} />
                                <span>
                                    Inquiry received <b className="text-[#1a1a4e]">{prettyDate(inquiry?.createdAt || remark?.inquiryDate)}</b>
                                </span>
                            </div>

                            {/* Existing follow-ups list (edit mode only) */}
                            {mode === "edit" && entries.length > 0 && (
                                <div className="space-y-2 mb-4">
                                    {entries.map((e, i) => (
                                        <div
                                            key={e._id}
                                            className="rounded-lg border border-gray-100 bg-gray-50/50 p-2.5"
                                        >
                                            {editingId === e._id ? (
                                                <div className="space-y-2">
                                                    <input
                                                        type="date"
                                                        value={editDate}
                                                        onChange={(ev) => setEditDate(ev.target.value)}
                                                        className={inputCls}
                                                    />
                                                    <textarea
                                                        rows={3}
                                                        value={editMessage}
                                                        onChange={(ev) => setEditMessage(ev.target.value)}
                                                        className={`${inputCls} resize-none`}
                                                    />
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => saveEdit(e)}
                                                            disabled={saving}
                                                            className="flex-1 py-1.5 rounded-md bg-[#1a1a4e] text-white text-xs font-bold cursor-pointer disabled:opacity-40"
                                                        >
                                                            Save
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingId(null)}
                                                            className="px-3 py-1.5 rounded-md border border-gray-200 text-xs font-bold text-gray-600 cursor-pointer"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-start gap-2">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-[10px] font-black uppercase tracking-wider text-[#EF8C2C]">
                                                                Follow-up {i + 1}
                                                            </span>
                                                            <span className="text-[10px] text-gray-500">
                                                                · {prettyDate(e.date)}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-[#1a1a4e] whitespace-pre-wrap break-words">
                                                            {e.message}
                                                        </p>
                                                    </div>
                                                    <div className="flex gap-0.5 flex-shrink-0">
                                                        <button
                                                            onClick={() => startEdit(e)}
                                                            className="p-1.5 rounded text-gray-400 hover:bg-white hover:text-[#1a1a4e] cursor-pointer"
                                                            title="Edit"
                                                        >
                                                            <FiEdit3 size={12} />
                                                        </button>
                                                        {!e.primary && (
                                                            <button
                                                                onClick={() => removeEntry(e)}
                                                                className="p-1.5 rounded text-gray-400 hover:bg-white hover:text-red-600 cursor-pointer"
                                                                title="Delete"
                                                            >
                                                                <FiTrash2 size={12} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Composer — new follow-up (or first) */}
                            <div className={`rounded-lg ${mode === "edit" ? "border border-dashed border-gray-200 bg-gray-50/40 p-3" : ""}`}>
                                {mode === "edit" && (
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
                                        Add Follow-up {nextNo}
                                    </p>
                                )}
                                <div className="space-y-2">
                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1">
                                            Next remark date
                                        </label>
                                        <input
                                            type="date"
                                            value={newDate}
                                            onChange={(ev) => setNewDate(ev.target.value)}
                                            className={inputCls}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1">
                                            {mode === "edit" ? "Notes from the next conversation" : "Feedback / remark message"}
                                        </label>
                                        <textarea
                                            rows={3}
                                            value={newMessage}
                                            onChange={(ev) => setNewMessage(ev.target.value)}
                                            placeholder="What was discussed, what to do next…"
                                            className={`${inputCls} resize-none`}
                                        />
                                    </div>
                                    <button
                                        onClick={mode === "create" ? submitFirst : addNext}
                                        disabled={saving}
                                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#1a1a4e] hover:bg-[#12123a] text-white text-sm font-bold disabled:bg-gray-300 cursor-pointer"
                                    >
                                        {saving ? <FiLoader className="animate-spin" size={14} /> : (mode === "create" ? <FiCheck size={14} /> : <FiPlus size={14} />)}
                                        {mode === "create" ? "Save Follow-up 1" : `Add Follow-up ${nextNo}`}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );

    return createPortal(body, document.body);
}
