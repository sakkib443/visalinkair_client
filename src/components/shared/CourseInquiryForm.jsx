"use client";

// ===================================================================
// CourseInquiryForm
//
// একটাই ফর্ম, দুই জায়গায় ব্যবহার হয় —
//   • কোর্স কার্ডের "Get Admission" মোডালে
//   • কোর্স ডিটেইলস পেজের ডানপাশের sticky কার্ডে
//
// দুটো সাবমিট পথ:
//   1) Submit Inquiry     → /api/inquiries এ POST, অ্যাডমিন ড্যাশবোর্ডের
//                            All Queries → Course Inquiry তে জমা হয়
//   2) Inquiry on WhatsApp → একই তথ্য + কোর্সের ডিটেইলস নিয়ে wa.me লিংকে
//                            রিডাইরেক্ট করে
//
// WhatsApp পথটাও আগে সার্ভারে জমা দেওয়ার চেষ্টা করে (source: 'whatsapp'),
// তারপর রিডাইরেক্ট — নাহলে ক্লায়েন্ট WhatsApp-এ চলে গেলে লিডটা ড্যাশবোর্ডে
// আর কখনোই দেখা যেত না। জমা না হলেও রিডাইরেক্ট আটকায় না।
// ===================================================================

import { useState } from "react";
import toast from "react-hot-toast";
import { FiLoader, FiSend, FiUser, FiMail, FiPhone, FiMessageSquare } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { inquiriesApi } from "@/services/api";
import { useSiteSettings, buildWhatsAppUrl } from "@/context/SiteSettingsContext";

const SERVICE = "course";
const SERVICE_LABEL = "Course Admission";

const EMPTY = { name: "", email: "", phone: "", message: "" };

/**
 * কোর্সের তথ্যগুলো একটা পড়ার মতো মেসেজে সাজায় — সার্ভারে `message`
 * হিসেবেও এটাই যায়, WhatsApp-এও এটাই যায়, তাই দুই জায়গায় একই তথ্য থাকে।
 */
const buildMessage = (course, form) => {
    const lines = [
        "Course Admission Inquiry",
        "",
        `Course   : ${course?.title || "—"}`,
        `Category : ${course?.category?.name || "—"}`,
        `Type     : ${course?.courseType === "offline" ? "Offline" : "Online"}`,
    ];

    if (course?.courseType === "offline" && course?.location) {
        lines.push(`Location : ${course.location}`);
    }
    if (course?.duration) lines.push(`Duration : ${course.duration}`);
    if (course?.startDate) lines.push(`Starts   : ${course.startDate}`);
    if (course?.classSchedule) lines.push(`Schedule : ${course.classSchedule}`);
    if (course?.price) lines.push(`Fee      : ${course.price.toLocaleString()} ${course.currency || "BDT"}`);

    lines.push("", "--- Applicant ---", `Name  : ${form.name}`);
    if (form.email) lines.push(`Email : ${form.email}`);
    lines.push(`Phone : ${form.phone}`);
    if (form.message.trim()) lines.push("", `Message: ${form.message.trim()}`);

    return lines.join("\n");
};

export default function CourseInquiryForm({ course, onSuccess, compact = false }) {
    const settings = useSiteSettings();
    const [form, setForm] = useState(EMPTY);
    const [submitting, setSubmitting] = useState(false);
    const [sendingWa, setSendingWa] = useState(false);

    const change = (e) =>
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    /** নাম আর ফোন ছাড়া সার্ভারই রিকোয়েস্ট ফেরত দেয়, তাই এখানেই আটকানো হচ্ছে */
    const validate = () => {
        if (form.name.trim().length < 2) {
            toast.error("Please enter your full name");
            return false;
        }
        if (form.phone.replace(/\D/g, "").length < 6) {
            toast.error("Please enter a valid phone number");
            return false;
        }
        if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) {
            toast.error("Please enter a valid email address");
            return false;
        }
        return true;
    };

    const payload = (source) => ({
        service: SERVICE,
        serviceLabel: SERVICE_LABEL,
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        subject: `Course Admission — ${course?.title || ""}`.trim(),
        message: buildMessage(course, form),
        source,
        pageUrl: typeof window !== "undefined" ? window.location.href : "",
        // `extra` টাই অ্যাডমিন টেবিলে কলাম হিসেবে দেখানো হয়
        extra: {
            courseId: course?._id || "",
            courseTitle: course?.title || "",
            courseSlug: course?.slug || "",
            categoryName: course?.category?.name || "",
            courseType: course?.courseType || "",
            location: course?.location || "",
            duration: course?.duration || "",
            startDate: course?.startDate || "",
            classSchedule: course?.classSchedule || "",
            price: course?.price ?? null,
            currency: course?.currency || "BDT",
            note: form.message.trim(),
        },
    });

    // ==================== Submit to dashboard ====================
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setSubmitting(true);
        try {
            await inquiriesApi.create(payload("website"));
            toast.success("Inquiry submitted — our team will contact you shortly.");
            setForm(EMPTY);
            onSuccess?.();
        } catch (err) {
            toast.error(err.message || "Could not submit your inquiry");
        } finally {
            setSubmitting(false);
        }
    };

    // ==================== Submit via WhatsApp ====================
    const handleWhatsApp = async () => {
        if (!validate()) return;

        const number = settings?.whatsappNumber;
        if (!number) {
            toast.error("WhatsApp is not configured yet");
            return;
        }

        setSendingWa(true);
        // ড্যাশবোর্ডেও রাখা হচ্ছে — ব্যর্থ হলেও WhatsApp খোলা আটকাবে না
        try {
            await inquiriesApi.create(payload("whatsapp"));
        } catch {
            /* ignore — WhatsApp এ যাওয়াটাই এখানে মুখ্য */
        }

        window.open(
            buildWhatsAppUrl(number, buildMessage(course, form)),
            "_blank",
            "noopener,noreferrer"
        );
        setSendingWa(false);
        setForm(EMPTY);
        onSuccess?.();
    };

    const inputClass =
        "w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-gray-200 bg-white text-[13px] text-brand-dark placeholder-gray-400 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/20 outline-none transition-all";
    const busy = submitting || sendingWa;

    return (
        <form onSubmit={handleSubmit} className={compact ? "space-y-3" : "space-y-3.5"}>
            <Field icon={FiUser}>
                <input
                    name="name"
                    value={form.name}
                    onChange={change}
                    className={inputClass}
                    placeholder="Your full name *"
                    required
                />
            </Field>

            <Field icon={FiPhone}>
                <input
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={change}
                    className={inputClass}
                    placeholder="Phone / WhatsApp number *"
                    required
                />
            </Field>

            <Field icon={FiMail}>
                <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={change}
                    className={inputClass}
                    placeholder="Email address"
                />
            </Field>

            <Field icon={FiMessageSquare} align="top">
                <textarea
                    name="message"
                    value={form.message}
                    onChange={change}
                    rows={compact ? 2 : 3}
                    className={`${inputClass} resize-none`}
                    placeholder="Anything you want to ask?"
                />
            </Field>

            <button
                type="submit"
                disabled={busy}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-[13px] font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: "var(--color-brand-dark)" }}
            >
                {submitting ? <FiLoader className="animate-spin" size={15} /> : <FiSend size={15} />}
                Submit Inquiry
            </button>

            <button
                type="button"
                onClick={handleWhatsApp}
                disabled={busy}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-[13px] font-bold text-white bg-whatsapp hover:bg-whatsapp-hover transition-all disabled:opacity-50"
            >
                {sendingWa ? <FiLoader className="animate-spin" size={15} /> : <FaWhatsapp size={16} />}
                Inquiry on WhatsApp
            </button>

            <p className="text-[10px] text-gray-400 text-center leading-relaxed">
                We never share your details. Our team usually replies within a few hours.
            </p>
        </form>
    );
}

function Field({ icon: Icon, align = "center", children }) {
    return (
        <div className="relative">
            <Icon
                size={14}
                className={`absolute left-3.5 text-gray-400 pointer-events-none ${
                    align === "top" ? "top-3" : "top-1/2 -translate-y-1/2"
                }`}
            />
            {children}
        </div>
    );
}
