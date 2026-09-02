"use client";

// ===================================================================
// Visalink Air — Reusable Inquiry Form
// Drop into any service page. Submits to POST /api/inquiries. Admin
// sees every submission in a single unified queue.
// ===================================================================

import { useState } from "react";
import { motion } from "framer-motion";
import { LuUser, LuMail, LuPhone, LuMessageSquare, LuLoader, LuCheck } from "react-icons/lu";
import { useLanguage } from "@/context/LanguageContext";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function InquiryForm({
    service,            // machine slug: "study-abroad"
    serviceLabel,       // display: "Study Abroad"
    subjectPlaceholder,
    extraFields = [],   // optional [{name, label, type, placeholder, required}]
    initialValues = {}, // { name?, email?, phone?, subject?, extra?: {...} }
}) {
    const { language } = useLanguage();
    const isBn = language === "bn";
    const bnFont = isBn ? "Hind Siliguri, sans-serif" : undefined;

    const [form, setForm] = useState({
        name: initialValues.name || "",
        email: initialValues.email || "",
        phone: initialValues.phone || "",
        subject: initialValues.subject || "",
        message: initialValues.message || "",
    });
    const [extra, setExtra] = useState(initialValues.extra || {});
    const [status, setStatus] = useState("idle"); // idle | submitting | success | error
    const [errorMsg, setErrorMsg] = useState("");

    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
    const setEx = (k, v) => setExtra((f) => ({ ...f, [k]: v }));

    const submit = async (e) => {
        e.preventDefault();
        if (!form.name.trim() || !form.phone.trim()) {
            setStatus("error");
            setErrorMsg(isBn ? "নাম ও ফোন নম্বর দিন" : "Name and phone are required");
            return;
        }
        setStatus("submitting");
        setErrorMsg("");
        try {
            const res = await fetch(`${API}/api/inquiries`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    service,
                    serviceLabel,
                    ...form,
                    extra,
                    pageUrl: typeof window !== "undefined" ? window.location.href : "",
                }),
            });
            const data = await res.json();
            if (!res.ok || !data.success) throw new Error(data.message || "Submission failed");
            setStatus("success");
            setForm({ name: "", email: "", phone: "", subject: "", message: "" });
            setExtra({});
        } catch (err) {
            setStatus("error");
            setErrorMsg(err.message || (isBn ? "কিছু সমস্যা হয়েছে" : "Something went wrong"));
        }
    };

    if (status === "success") {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-2xl bg-green-50 border border-green-100 p-8 text-center"
            >
                <div className="w-14 h-14 mx-auto rounded-full bg-green-500 text-white flex items-center justify-center mb-4">
                    <LuCheck size={26} />
                </div>
                <h4 className="text-xl font-bold text-green-700 mb-2" style={{ fontFamily: bnFont }}>
                    {isBn ? "ধন্যবাদ!" : "Thank you!"}
                </h4>
                <p className="text-green-700/85 text-sm" style={{ fontFamily: bnFont }}>
                    {isBn
                        ? "আমরা আপনার তথ্য পেয়েছি — আমাদের টিম শীঘ্রই যোগাযোগ করবে।"
                        : "We received your inquiry — our team will reach out shortly."}
                </p>
                <button
                    type="button"
                    onClick={() => setStatus("idle")}
                    className="mt-5 text-sm font-semibold text-green-700 hover:underline"
                    style={{ fontFamily: bnFont }}
                >
                    {isBn ? "আরেকটি পাঠান" : "Send another"}
                </button>
            </motion.div>
        );
    }

    return (
        <form
            onSubmit={submit}
            className="rounded-2xl bg-white border border-gray-100 p-5 sm:p-7 shadow-sm space-y-4"
        >
            <div className="mb-2">
                <h3 className="text-xl font-bold text-brand-dark" style={{ fontFamily: bnFont }}>
                    {isBn ? "সাহায্য দরকার?" : "Get in touch"}
                </h3>
                <p className="text-sm text-gray-500 mt-1" style={{ fontFamily: bnFont }}>
                    {isBn
                        ? "ফর্মটি পূরণ করুন — আমরা ২৪ ঘণ্টার মধ্যে যোগাযোগ করব।"
                        : "Fill the form — we'll reach out within 24 hours."}
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field
                    icon={<LuUser size={16} />}
                    label={isBn ? "পুরো নাম" : "Full name"}
                    value={form.name}
                    onChange={(v) => set("name", v)}
                    required
                    bnFont={bnFont}
                />
                <Field
                    icon={<LuPhone size={16} />}
                    label={isBn ? "ফোন নম্বর" : "Phone"}
                    type="tel"
                    value={form.phone}
                    onChange={(v) => set("phone", v)}
                    required
                    bnFont={bnFont}
                />
            </div>

            <Field
                icon={<LuMail size={16} />}
                label={isBn ? "ইমেইল (ঐচ্ছিক)" : "Email (optional)"}
                type="email"
                value={form.email}
                onChange={(v) => set("email", v)}
                bnFont={bnFont}
            />

            <Field
                icon={<LuMessageSquare size={16} />}
                label={isBn ? "বিষয়" : "Subject"}
                value={form.subject}
                onChange={(v) => set("subject", v)}
                placeholder={subjectPlaceholder}
                bnFont={bnFont}
            />

            {extraFields.map((f) => (
                <Field
                    key={f.name}
                    label={f.label}
                    type={f.type || "text"}
                    value={extra[f.name] || ""}
                    onChange={(v) => setEx(f.name, v)}
                    placeholder={f.placeholder}
                    required={f.required}
                    bnFont={bnFont}
                />
            ))}

            <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5" style={{ fontFamily: bnFont }}>
                    {isBn ? "বার্তা" : "Message"}
                </label>
                <textarea
                    rows={4}
                    value={form.message}
                    onChange={(e) => set("message", e.target.value)}
                    placeholder={isBn ? "আপনার প্রশ্ন বা প্রয়োজন..." : "Tell us what you need..."}
                    className="w-full px-3.5 py-3 rounded-lg border border-gray-200 focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 outline-none text-sm text-gray-800 placeholder-gray-400 resize-none"
                    style={{ fontFamily: bnFont }}
                />
            </div>

            {status === "error" && errorMsg && (
                <div className="rounded-lg bg-red-50 border border-red-100 text-red-700 text-sm px-3 py-2" style={{ fontFamily: bnFont }}>
                    {errorMsg}
                </div>
            )}

            <button
                type="submit"
                disabled={status === "submitting"}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-lg bg-brand-blue hover:bg-brand-blue-hover text-white font-bold text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ fontFamily: bnFont }}
            >
                {status === "submitting" ? (
                    <>
                        <LuLoader className="w-4 h-4 animate-spin" />
                        {isBn ? "পাঠানো হচ্ছে..." : "Submitting..."}
                    </>
                ) : (
                    isBn ? "পাঠান" : "Submit inquiry"
                )}
            </button>
        </form>
    );
}

function Field({ icon, label, type = "text", value, onChange, placeholder, required, bnFont }) {
    return (
        <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5" style={{ fontFamily: bnFont }}>
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
                {icon && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {icon}
                    </span>
                )}
                <input
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    required={required}
                    className={`w-full ${icon ? "pl-10" : "pl-3.5"} pr-3.5 py-2.5 rounded-lg border border-gray-200 focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 outline-none text-sm text-gray-800 placeholder-gray-400`}
                    style={{ fontFamily: bnFont }}
                />
            </div>
        </div>
    );
}
