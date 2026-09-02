"use client";

// ===================================================================
// PackageBookingModal — dedicated modal for Hajj/Umrah package booking.
// No payment method. Collects name + phone + email + persons + note and
// submits as an inquiry (service: hajj-package | umrah-package) so it
// lands in Admin → All Queries → Hajj/Umrah Package Inquiry.
// ===================================================================

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    LuX, LuLoader, LuArrowRight, LuCheck, LuUser, LuPhone, LuMail,
    LuUsers, LuMessageSquare,
} from "react-icons/lu";
import { FaKaaba, FaMosque } from "react-icons/fa6";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function PackageBookingModal({ isOpen, onClose, pkg, packageType = "hajj" }) {
    const isHajj = packageType === "hajj";
    const service = isHajj ? "hajj-package" : "umrah-package";
    const serviceLabel = isHajj ? "Hajj Package" : "Umrah Package";
    const brandIcon = isHajj ? <FaKaaba className="w-5 h-5" /> : <FaMosque className="w-5 h-5" />;

    const [form, setForm] = useState({ name: "", email: "", phone: "", persons: 1, message: "" });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const [inqId, setInqId] = useState("");

    // Reset when the modal opens for a new package.
    useEffect(() => {
        if (isOpen) {
            setForm({ name: "", email: "", phone: "", persons: 1, message: "" });
            setLoading(false);
            setSuccess(false);
            setError("");
            setInqId("");
        }
    }, [isOpen, pkg?._id]);

    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    const submit = async (e) => {
        e.preventDefault();
        setError("");
        if (!form.name.trim() || !form.phone.trim()) {
            setError("Name and WhatsApp number are required.");
            return;
        }
        setLoading(true);
        try {
            const pkgName = pkg?.name || pkg?.nameBn || "Package";
            const summaryLines = [
                `Package type: ${isHajj ? "Hajj" : "Umrah"}`,
                `Package: ${pkgName}`,
                pkg?.duration ? `Duration: ${pkg.duration}` : null,
                pkg?.hotel ? `Hotel: ${pkg.hotel}` : null,
                pkg?.price ? `Price/person: $${pkg.price}` : null,
                `Persons: ${form.persons || 1}`,
                form.message ? `Note: ${form.message}` : null,
            ].filter(Boolean);
            const summary = summaryLines.join("\n");

            const res = await fetch(`${API}/api/inquiries`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    service,
                    serviceLabel,
                    name: form.name,
                    email: form.email,
                    phone: form.phone,
                    subject: `${serviceLabel}: ${pkgName}`,
                    message: summary,
                    extra: {
                        packageType: isHajj ? "hajj" : "umrah",
                        packageId: pkg?._id || "",
                        packageName: pkgName,
                        duration: pkg?.duration || "",
                        hotel: pkg?.hotel || "",
                        pricePerPerson: pkg?.price || null,
                        persons: form.persons,
                    },
                    pageUrl: typeof window !== "undefined" ? window.location.href : "",
                }),
            });
            const data = await res.json();
            if (!res.ok || !data.success) throw new Error(data.message || "Submission failed");
            setInqId(data.data?._id || "");
            setSuccess(true);
        } catch (err) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    if (!pkg) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div
                            className="pointer-events-auto w-full max-w-lg max-h-[92vh] overflow-y-auto bg-white rounded-2xl shadow-2xl"
                            style={{ fontFamily: "Poppins, sans-serif" }}
                        >
                            {/* Header */}
                            <div className="sticky top-0 bg-white z-10 border-b border-gray-100 p-5 flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center">
                                        {brandIcon}
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{serviceLabel}</p>
                                        <p className="text-lg font-black text-brand-dark leading-tight">
                                            {pkg.name || pkg.nameBn}
                                        </p>
                                        {(pkg.duration || pkg.price) && (
                                            <p className="text-[11px] text-gray-500 mt-0.5">
                                                {pkg.duration && <span>{pkg.duration}</span>}
                                                {pkg.duration && pkg.price && <span className="mx-1.5">·</span>}
                                                {pkg.price && <span className="font-semibold text-emerald-700">${pkg.price}/person</span>}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="w-9 h-9 rounded-full text-gray-500 hover:bg-gray-100 flex items-center justify-center"
                                    aria-label="Close"
                                >
                                    <LuX className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Body */}
                            {success ? (
                                <div className="p-8 text-center">
                                    <div className="w-16 h-16 mx-auto rounded-full bg-green-500 text-white flex items-center justify-center mb-4">
                                        <LuCheck size={28} strokeWidth={3} />
                                    </div>
                                    <h3 className="text-2xl font-black text-brand-dark mb-2" style={{ fontFamily: "Teko, sans-serif" }}>
                                        BOOKING SUBMITTED
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-1">
                                        Your <span className="font-bold">{pkg.name || pkg.nameBn}</span> booking request has been received.
                                    </p>
                                    <p className="text-sm text-gray-600 mb-5">
                                        Our team will reach out on <span className="font-bold text-whatsapp">WhatsApp</span> within 24 hours.
                                    </p>
                                    {inqId && (
                                        <p className="text-[11px] text-gray-400 mb-4">
                                            Reference: <code className="font-mono text-gray-600">{inqId.slice(-8).toUpperCase()}</code>
                                        </p>
                                    )}
                                    <button
                                        onClick={onClose}
                                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-brand-dark hover:bg-brand-dark-hover text-white text-sm font-bold"
                                    >
                                        Done
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={submit} className="p-5 space-y-4">
                                    {/* Name */}
                                    <FormField label="Full Name" icon={<LuUser size={14} />} required>
                                        <input
                                            type="text"
                                            value={form.name}
                                            onChange={(e) => set("name", e.target.value)}
                                            placeholder="Your full name"
                                            className="fld"
                                            required
                                        />
                                    </FormField>

                                    {/* Phone + Persons */}
                                    <div className="grid grid-cols-1 sm:grid-cols-[1fr_120px] gap-3">
                                        <FormField label="WhatsApp Number" icon={<LuPhone size={14} />} required>
                                            <input
                                                type="tel"
                                                value={form.phone}
                                                onChange={(e) => set("phone", e.target.value)}
                                                placeholder="+8801XXXXXXXXX"
                                                className="fld"
                                                required
                                            />
                                        </FormField>
                                        <FormField label="Persons" icon={<LuUsers size={14} />} required>
                                            <input
                                                type="number"
                                                min="1"
                                                max="50"
                                                value={form.persons}
                                                onChange={(e) => set("persons", e.target.value)}
                                                className="fld"
                                                required
                                            />
                                        </FormField>
                                    </div>

                                    {/* Email */}
                                    <FormField label="Email (optional)" icon={<LuMail size={14} />}>
                                        <input
                                            type="email"
                                            value={form.email}
                                            onChange={(e) => set("email", e.target.value)}
                                            placeholder="you@example.com"
                                            className="fld"
                                        />
                                    </FormField>

                                    {/* Note */}
                                    <FormField label="Message (optional)" icon={<LuMessageSquare size={14} />}>
                                        <textarea
                                            rows={3}
                                            value={form.message}
                                            onChange={(e) => set("message", e.target.value)}
                                            placeholder="Any special requirement — preferred month, hotel tier, group size…"
                                            className="fld resize-none"
                                        />
                                    </FormField>

                                    {error && (
                                        <div className="rounded-lg bg-red-50 border border-red-100 text-red-700 text-sm px-3 py-2">
                                            {error}
                                        </div>
                                    )}

                                    <div className="flex flex-col sm:flex-row gap-2 pt-2">
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="sm:w-32 py-3 rounded-lg border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm transition-all disabled:opacity-60"
                                        >
                                            {loading ? (
                                                <><LuLoader className="w-4 h-4 animate-spin" /> Submitting...</>
                                            ) : (
                                                <>Confirm Booking <LuArrowRight size={16} /></>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            )}

                            <style jsx>{`
                                :global(.fld) {
                                    width: 100%;
                                    padding: 0.6rem 0.8rem;
                                    border-radius: 0.5rem;
                                    border: 1px solid #e5e7eb;
                                    background: #ffffff;
                                    color: var(--color-brand-dark);
                                    font-size: 0.875rem;
                                    outline: none;
                                    transition: all 0.15s;
                                }
                                :global(.fld:focus) {
                                    border-color: #10b981;
                                    box-shadow: 0 0 0 3px rgba(16,185,129,0.15);
                                }
                            `}</style>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

function FormField({ label, icon, required, children }) {
    return (
        <div>
            <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                {icon && <span className="text-gray-400">{icon}</span>}
                {label}
                {required && <span className="text-red-500">*</span>}
            </span>
            {children}
        </div>
    );
}
