"use client";

// ===================================================================
// Testimonials (admin)
// -------------------------------------------------------------------
// Add / edit / delete the testimonials shown in the public home page
// slider. Everything saved here is live immediately — there is no
// approval step and no public review submission any more.
// ===================================================================

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
    FiSearch, FiLoader, FiTrash2, FiEdit, FiStar, FiPlus, FiX,
    FiRefreshCw, FiSave, FiMessageSquare,
} from "react-icons/fi";
import { selectToken } from "@/redux/features/authSlice";
import ImageInput from "@/components/shared/ImageInput";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const EMPTY = { name: "", role: "", avatar: "", rating: 5, message: "" };

const formatDate = (value) =>
    value
        ? new Date(value).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
        : "";

// ==================== FORM MODAL ====================
function TestimonialModal({ initial, onClose, onSaved, token }) {
    const isEdit = Boolean(initial?._id);
    const [f, setF] = useState({
        name: initial?.name || "",
        role: initial?.role || "",
        avatar: initial?.avatar || "",
        rating: initial?.rating || 5,
        message: initial?.message || "",
    });
    const [hoverRating, setHoverRating] = useState(0);
    const [saving, setSaving] = useState(false);
    const set = (k, v) => setF((p) => ({ ...p, [k]: v }));

    const submit = async (e) => {
        e.preventDefault();
        if (!f.name.trim()) return toast.error("Name is required");
        if (f.message.trim().length < 10) return toast.error("Message must be at least 10 characters");

        setSaving(true);
        try {
            const res = await fetch(
                `${API_BASE}/api/testimonials${isEdit ? `/${initial._id}` : ""}`,
                {
                    method: isEdit ? "PATCH" : "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        name: f.name.trim(),
                        role: f.role.trim(),
                        avatar: f.avatar || "",
                        rating: Number(f.rating),
                        message: f.message.trim(),
                    }),
                }
            );
            const data = await res.json();
            if (!res.ok || data.success === false) {
                throw new Error(data.message || data.errorSources?.[0]?.message || "Save failed");
            }
            toast.success(isEdit ? "Testimonial updated" : "Testimonial added");
            onSaved();
            onClose();
        } catch (err) {
            toast.error(err.message || "Save failed");
        } finally {
            setSaving(false);
        }
    };

    const label = "text-[13px] font-bold text-gray-500 block mb-1.5";

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                    <h3 className="text-lg font-bold text-gray-900">
                        {isEdit ? "Edit Testimonial" : "Add Testimonial"}
                    </h3>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
                        aria-label="Close"
                    >
                        <FiX className="w-4 h-4 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={submit} className="px-6 py-5 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className={label}>Name *</label>
                            <input
                                value={f.name}
                                onChange={(e) => set("name", e.target.value)}
                                className="input"
                                placeholder="Client name"
                                maxLength={100}
                                required
                            />
                        </div>
                        <div>
                            <label className={label}>Role / City</label>
                            <input
                                value={f.role}
                                onChange={(e) => set("role", e.target.value)}
                                className="input"
                                placeholder="e.g. Business Owner, Dhaka"
                                maxLength={100}
                            />
                        </div>
                    </div>

                    <ImageInput
                        label="Photo"
                        value={f.avatar}
                        onChange={(url) => set("avatar", url)}
                        hint="Optional — the slider falls back to an initial letter."
                        labelClass={label}
                    />

                    <div>
                        <label className={label}>Rating</label>
                        <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => set("rating", star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    className="p-1"
                                    aria-label={`${star} star`}
                                >
                                    <FiStar
                                        size={26}
                                        className={
                                            (hoverRating || f.rating) >= star
                                                ? "fill-brand-accent text-brand-accent"
                                                : "text-gray-300"
                                        }
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className={label}>Message *</label>
                        <textarea
                            value={f.message}
                            onChange={(e) => set("message", e.target.value)}
                            rows={5}
                            className="input resize-none"
                            placeholder="What the client said about Visalink Air..."
                            maxLength={1000}
                            required
                        />
                        <p className="text-[10px] text-gray-400 mt-1 text-right">
                            {f.message.length}/1000 · minimum 10
                        </p>
                    </div>

                    <div className="flex gap-3 pt-1">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 py-3 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60 transition hover:opacity-90"
                            style={{ background: "var(--color-brand-accent)" }}
                        >
                            {saving ? <FiLoader className="animate-spin" /> : <FiSave />}
                            {isEdit ? "Save Changes" : "Add Testimonial"}
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
}

// ==================== PAGE ====================
export default function AdminTestimonials() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [editing, setEditing] = useState(null); // null = closed, EMPTY = new
    const [acting, setActing] = useState(null);
    const token = useSelector(selectToken);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/testimonials`);
            const data = await res.json();
            setItems(data.success && Array.isArray(data.data) ? data.data : []);
        } catch {
            setItems([]);
            toast.error("Failed to fetch testimonials");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAll();
    }, []);

    const handleDelete = async (item) => {
        if (!confirm(`Delete the testimonial by ${item.name}? This cannot be undone.`)) return;
        setActing(item._id);
        try {
            const res = await fetch(`${API_BASE}/api/testimonials/${item._id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Testimonial deleted");
                setItems((prev) => prev.filter((t) => t._id !== item._id));
            } else {
                toast.error(data.message || "Failed to delete");
            }
        } catch {
            toast.error("Failed to delete");
        } finally {
            setActing(null);
        }
    };

    const filtered = items.filter((t) => {
        const q = search.trim().toLowerCase();
        if (!q) return true;
        return (
            t.name?.toLowerCase().includes(q) ||
            t.role?.toLowerCase().includes(q) ||
            t.message?.toLowerCase().includes(q)
        );
    });

    return (
        <div className="p-6 lg:p-8 space-y-6">
            <AnimatePresence>
                {editing && (
                    <TestimonialModal
                        initial={editing}
                        token={token}
                        onClose={() => setEditing(null)}
                        onSaved={fetchAll}
                    />
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                        <FiStar className="text-white text-xl" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tight" style={{ fontFamily: 'Teko, sans-serif', color: 'var(--color-brand-dark)' }}>
                            Testimonials
                        </h1>
                        <p className="text-[12px] text-gray-400 mt-0.5">
                            {loading
                                ? "Loading…"
                                : `${items.length} testimonial${items.length === 1 ? "" : "s"} — all of them show in the home page slider`}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setEditing(EMPTY)}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition hover:opacity-90 shadow-sm"
                        style={{ background: "var(--color-brand-accent)" }}
                    >
                        <FiPlus size={16} /> Add Testimonial
                    </button>
                    <button onClick={fetchAll} className="p-2.5 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition">
                        <FiRefreshCw className={loading ? "animate-spin" : ""} />
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="card p-4">
                <div className="relative">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        placeholder="Search by name, role or message..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="input pl-12 w-full"
                    />
                </div>
            </div>

            {/* List */}
            {loading ? (
                <div className="card flex items-center justify-center py-20">
                    <FiLoader className="animate-spin text-primary" size={32} />
                </div>
            ) : filtered.length === 0 ? (
                <div className="card text-center py-20 text-gray-400">
                    <FiMessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="font-medium">
                        {items.length === 0 ? "No testimonials yet" : "No testimonials match that search"}
                    </p>
                    {items.length === 0 && (
                        <button
                            onClick={() => setEditing(EMPTY)}
                            className="mt-4 text-sm font-semibold text-brand-accent hover:underline"
                        >
                            Add the first one
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filtered.map((item) => (
                        <motion.div
                            key={item._id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="card p-5 flex flex-col"
                        >
                            {/* Stars + actions */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex gap-0.5">
                                    {Array.from({ length: item.rating || 5 }).map((_, j) => (
                                        <FiStar key={j} size={14} className="fill-brand-accent text-brand-accent" />
                                    ))}
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => setEditing(item)}
                                        className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center hover:bg-amber-200 transition-colors"
                                        title="Edit"
                                    >
                                        <FiEdit size={14} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item)}
                                        disabled={acting === item._id}
                                        className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 transition-colors disabled:opacity-50"
                                        title="Delete"
                                    >
                                        {acting === item._id ? <FiLoader size={14} className="animate-spin" /> : <FiTrash2 size={14} />}
                                    </button>
                                </div>
                            </div>

                            {/* Message */}
                            <p className="text-sm text-gray-600 leading-relaxed flex-grow line-clamp-5">
                                &quot;{item.message}&quot;
                            </p>

                            {/* Author */}
                            <div className="flex items-center gap-3 pt-4 mt-4 border-t border-gray-100">
                                {item.avatar ? (
                                    <img src={item.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-[#3590CF] flex items-center justify-center text-white font-bold text-sm">
                                        {item.name?.[0] || "?"}
                                    </div>
                                )}
                                <div className="min-w-0 flex-1">
                                    <p className="font-bold text-gray-800 text-sm truncate">{item.name}</p>
                                    <p className="text-xs text-gray-400 truncate">
                                        {item.role || "Verified Client"}
                                    </p>
                                </div>
                                <span className="text-[11px] text-gray-300 shrink-0">
                                    {formatDate(item.createdAt)}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
