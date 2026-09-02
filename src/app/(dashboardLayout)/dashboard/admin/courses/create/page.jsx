"use client";

// ===================================================================
// Add / Edit Course
//
// একই পেজেই দুটো কাজ — `?id=<courseId>` থাকলে এডিট মোড, না থাকলে নতুন
// কোর্স। ব্লগ/হোটেল ফর্মেও একই প্যাটার্ন, তাই আলাদা এডিট রুট বানানো হয়নি।
//
// লং ডেসক্রিপশনটা Quill রিচ-টেক্সট এডিটর — হেডিং, বোল্ড, কালার, বুলেট
// পয়েন্ট সবই ওয়ার্ডের মতো করে লেখা যায় এবং HTML হিসেবে ডাটাবেজে জমা হয়।
// ===================================================================

import { useState, useEffect, useRef, useCallback, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
    FiArrowLeft, FiSave, FiLoader, FiFileText, FiMonitor, FiMapPin,
    FiUsers, FiDollarSign, FiSettings, FiUser, FiBookOpen,
} from "react-icons/fi";
import { useSelector } from "react-redux";
import { selectToken } from "@/redux/features/authSlice";
import ImageInput, { ImageGalleryInput } from "@/components/shared/ImageInput";
import CourseCategoryManager from "../_components/CourseCategoryManager";

// সরাসরি react-quill-new নয়, প্রজেক্টের QuillEditor র‍্যাপারটাই ব্যবহার
// করা হচ্ছে — next/dynamic ref ভরসাযোগ্যভাবে ফরওয়ার্ড করে না, তাই টুলবারের
// ছবি বাটনকে ক্যারেটের জায়গায় ছবি বসাতে হলে `onEditorReady` দিয়ে Quill
// ইনস্ট্যান্সটা নিতে হয় (দেখুন components/shared/QuillEditor.jsx)।
const QuillEditor = dynamic(() => import("@/components/shared/QuillEditor"), {
    ssr: false,
    loading: () => <div className="h-[320px] bg-gray-50 rounded-lg animate-pulse" />,
});
import "react-quill-new/dist/quill.snow.css";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ==================== Quill config ====================
// ওয়ার্ডের মতো ফরম্যাটিং — হেডিং, ফন্ট সাইজ, বোল্ড/ইটালিক/আন্ডারলাইন,
// টেক্সট ও ব্যাকগ্রাউন্ড কালার, অ্যালাইনমেন্ট, নাম্বার/বুলেট লিস্ট,
// ইনডেন্ট, কোট, লিংক ও ছবি।
//
// টুলবার ও formats মডিউল-স্কোপে রাখা ইচ্ছাকৃত — প্রতি রেন্ডারে নতুন অবজেক্ট
// গেলে এডিটরটা ভেঙে আবার তৈরি হয়, ফলে প্রতিটা কি-স্ট্রোকে ক্যারেট লাফিয়ে
// শুরুতে চলে যায়।
const QUILL_TOOLBAR = [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ size: ["small", false, "large", "huge"] }],
    ["bold", "italic", "underline", "strike"],
    [{ color: [] }, { background: [] }],
    [{ script: "sub" }, { script: "super" }],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ indent: "-1" }, { indent: "+1" }],
    [{ align: [] }],
    ["blockquote", "code-block"],
    ["link", "image", "video"],
    ["clean"],
];

const quillFormats = [
    "header", "size", "bold", "italic", "underline", "strike",
    "color", "background", "align", "list", "indent",
    "blockquote", "code-block", "link", "image", "video", "script",
];

async function uploadImage(file, token) {
    const fd = new FormData();
    fd.append("image", file);
    const res = await fetch(`${API_BASE}/api/upload/single`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || "Upload failed");
    return data.data.url;
}

const emptyForm = {
    title: "",
    image: "",
    gallery: [],
    category: "",
    shortDescription: "",
    longDescription: "",
    courseType: "online",
    location: "",
    totalSeats: "30",
    enrolledCount: "0",
    duration: "",
    startDate: "",
    classSchedule: "",
    instructor: "",
    instructorTitle: "",
    price: "0",
    oldPrice: "",
    currency: "BDT",
    level: "",
    language: "",
    tags: "",
    metaTitle: "",
    metaDescription: "",
    status: "upcoming",
    isActive: true,
    isFeatured: false,
    order: "0",
};

function CourseForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const editId = searchParams.get("id");
    const isEdit = !!editId;

    const token = useSelector(selectToken);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [formData, setFormData] = useState(emptyForm);

    // QuillEditor `onEditorReady` দিয়ে একবারই Quill ইনস্ট্যান্সটা হাতে দেয়;
    // ref বদলায় না বলে নিচের হ্যান্ডলারের identity স্থিরই থাকে।
    const editorRef = useRef(null);
    const handleEditorReady = useCallback((editor) => { editorRef.current = editor; }, []);

    // ==================== Load for edit ====================
    useEffect(() => {
        if (!isEdit) return;

        let cancelled = false;
        const fetchCourse = async () => {
            setFetching(true);
            try {
                const res = await fetch(`${API_BASE}/api/courses/${editId}`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                });
                const data = await res.json();
                if (cancelled) return;

                if (data.success && data.data) {
                    const c = data.data;
                    setFormData({
                        title: c.title || "",
                        image: c.image || "",
                        gallery: Array.isArray(c.gallery) ? c.gallery : [],
                        // সার্ভার category populate করে পাঠায়, তাই অবজেক্ট হলে
                        // ভেতর থেকে _id নিতে হয় — নাহলে ক্যাটাগরি সিলেক্টেড দেখাত না।
                        category:
                            typeof c.category === "object" && c.category !== null
                                ? c.category._id
                                : c.category || "",
                        shortDescription: c.shortDescription || "",
                        longDescription: c.longDescription || "",
                        courseType: c.courseType || "online",
                        location: c.location || "",
                        totalSeats: c.totalSeats?.toString() ?? "30",
                        enrolledCount: c.enrolledCount?.toString() ?? "0",
                        duration: c.duration || "",
                        startDate: c.startDate || "",
                        classSchedule: c.classSchedule || "",
                        instructor: c.instructor || "",
                        instructorTitle: c.instructorTitle || "",
                        price: c.price?.toString() ?? "0",
                        oldPrice: c.oldPrice?.toString() ?? "",
                        currency: c.currency || "BDT",
                        level: c.level || "",
                        language: c.language || "",
                        tags: (c.tags || []).join(", "),
                        metaTitle: c.metaTitle || "",
                        metaDescription: c.metaDescription || "",
                        status: c.status || "upcoming",
                        isActive: c.isActive !== false,
                        isFeatured: !!c.isFeatured,
                        order: c.order?.toString() ?? "0",
                    });
                } else {
                    toast.error("Course not found");
                    router.push("/dashboard/admin/courses");
                }
            } catch {
                if (!cancelled) {
                    toast.error("Failed to load course");
                    router.push("/dashboard/admin/courses");
                }
            } finally {
                if (!cancelled) setFetching(false);
            }
        };

        fetchCourse();
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editId, token]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    };

    // ==================== Quill image upload ====================
    // টুলবারের ছবি বাটন — ফাইল বেছে নিয়ে সার্ভারে আপলোড করে ক্যারেটের
    // ঠিক জায়গাতেই ছবিটা বসিয়ে দেয়।
    const insertImage = useCallback(() => {
        const input = document.createElement("input");
        input.setAttribute("type", "file");
        input.setAttribute("accept", "image/*");
        input.click();

        input.onchange = async () => {
            const file = input.files?.[0];
            if (!file) return;
            const editor = editorRef.current;
            if (!editor) return;

            const t = toast.loading("Uploading image...");
            try {
                const url = await uploadImage(file, token);
                const range = editor.getSelection(true);
                editor.insertEmbed(range.index, "image", url);
                editor.setSelection(range.index + 1);
                toast.success("Image inserted", { id: t });
            } catch (err) {
                toast.error(err.message || "Upload failed", { id: t });
            }
        };
    }, [token]);

    // useMemo — token না বদলালে অবজেক্টটা একই থাকে, তাই টাইপ করার সময়
    // এডিটর রিমাউন্ট হয় না।
    const quillModules = useMemo(() => ({
        toolbar: {
            container: QUILL_TOOLBAR,
            handlers: { image: insertImage },
        },
        clipboard: { matchVisual: false },
    }), [insertImage]);

    // ==================== Submit ====================
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.category) {
            toast.error("Please select a category");
            return;
        }
        if (!formData.title.trim()) {
            toast.error("Course title is required");
            return;
        }
        if (formData.shortDescription.trim().length < 10) {
            toast.error("Short description must be at least 10 characters");
            return;
        }
        if (!formData.duration.trim()) {
            toast.error("Course duration is required");
            return;
        }
        if (formData.courseType === "offline" && !formData.location.trim()) {
            toast.error("Location is required for an offline course");
            return;
        }
        if (Number(formData.totalSeats) < 1) {
            toast.error("There must be at least 1 seat");
            return;
        }
        // এনরোল সংখ্যা সিটের চেয়ে বেশি হলে "available seats" ঋণাত্মক হয়ে
        // যেত — সেভ করার আগেই ধরিয়ে দেওয়া ভালো।
        if (Number(formData.enrolledCount) > Number(formData.totalSeats)) {
            toast.error("Enrolled count cannot exceed total seats");
            return;
        }

        setLoading(true);
        try {
            // ফাঁকা মানগুলোও পাঠানো হচ্ছে — PATCH এ কি না থাকলে সার্ভার সেটাকে
            // "অপরিবর্তিত" ধরে, ফলে ফিল্ড ক্লিয়ার করা নীরবে ব্যর্থ হতো।
            // oldPrice null দিয়ে ক্লিয়ার হয়, কারণ "" number cast এ আটকে যায়।
            const payload = {
                ...formData,
                totalSeats: Number(formData.totalSeats) || 1,
                enrolledCount: Number(formData.enrolledCount) || 0,
                price: Number(formData.price) || 0,
                oldPrice: formData.oldPrice === "" ? null : Number(formData.oldPrice),
                order: Number(formData.order) || 0,
                tags: formData.tags.split(",").map((s) => s.trim()).filter(Boolean),
            };

            const url = isEdit
                ? `${API_BASE}/api/courses/${editId}`
                : `${API_BASE}/api/courses`;

            const res = await fetch(url, {
                method: isEdit ? "PATCH" : "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (data.success) {
                toast.success(isEdit ? "Course updated!" : "Course created!");
                router.push("/dashboard/admin/courses");
            } else {
                toast.error(data.message || "Failed to save course");
            }
        } catch {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const inputClass =
        "w-full px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 text-[13px] text-gray-700 dark:text-gray-200 focus:border-brand-dark focus:ring-1 focus:ring-brand-dark/10 outline-none transition-all placeholder-gray-400";
    const labelClass = "text-[11px] font-bold uppercase text-gray-400 mb-1.5 block";
    const cardClass =
        "bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700/50 p-5";

    if (fetching) {
        return (
            <div className="flex items-center justify-center py-32">
                <FiLoader className="animate-spin" size={24} style={{ color: "var(--color-brand-dark)" }} />
            </div>
        );
    }

    return (
        <div className="p-4 lg:p-6 max-w-5xl mx-auto">
            {/* ==================== Header ==================== */}
            <div className="flex items-center gap-3 mb-6">
                <Link
                    href="/dashboard/admin/courses"
                    className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50"
                >
                    <FiArrowLeft size={16} />
                </Link>
                <div className="flex-1">
                    <h1
                        className="text-2xl font-black uppercase tracking-tight"
                        style={{ fontFamily: "Teko, sans-serif", color: "var(--color-brand-dark)" }}
                    >
                        {isEdit ? "Edit Course" : "Add New Course"}
                    </h1>
                    <p className="text-[12px] text-gray-400 mt-0.5">
                        {isEdit ? `Editing: ${formData.title}` : "Add a new course to your catalog"}
                    </p>
                </div>
            </div>

            <motion.form
                onSubmit={handleSubmit}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-5"
            >
                {/* ==== ১. ক্যাটাগরি (ডাইনামিক) ==== */}
                <CourseCategoryManager
                    value={formData.category}
                    onChange={(id) => setFormData((prev) => ({ ...prev, category: id }))}
                    inputClass={inputClass}
                />

                {/* ==== ২. বেসিক ইনফো ==== */}
                <div className={cardClass}>
                    <div className="flex items-center gap-2 mb-4">
                        <FiBookOpen size={14} style={{ color: "var(--color-brand-accent)" }} />
                        <h2 className="text-[13px] font-bold uppercase tracking-wider text-gray-500">
                            Course Details
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className={labelClass}>Course Title *</label>
                            <input
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className={inputClass}
                                placeholder="e.g. IELTS Complete Preparation Course"
                                required
                            />
                        </div>
                        <div>
                            <ImageInput
                                label="Course Thumbnail"
                                value={formData.image}
                                onChange={(v) => setFormData((prev) => ({ ...prev, image: v }))}
                                inputClass={inputClass}
                            />
                        </div>
                        <div>
                            <ImageGalleryInput
                                label="Gallery"
                                value={formData.gallery}
                                onChange={(v) => setFormData((prev) => ({ ...prev, gallery: v }))}
                                hint="These images appear in the gallery on the course detail page"
                            />
                        </div>
                    </div>
                </div>

                {/* ==== ৩. শর্ট ডেসক্রিপশন ==== */}
                <div className={cardClass}>
                    <div className="flex items-center gap-2 mb-4">
                        <FiFileText size={14} style={{ color: "var(--color-brand-accent)" }} />
                        <h2 className="text-[13px] font-bold uppercase tracking-wider text-gray-500">
                            Short Description
                        </h2>
                    </div>
                    <textarea
                        name="shortDescription"
                        value={formData.shortDescription}
                        onChange={handleChange}
                        rows={4}
                        maxLength={1000}
                        className={`${inputClass} resize-none`}
                        placeholder="The one or two lines shown on the course card..."
                        required
                    />
                    <p className="text-[10px] text-gray-400 mt-1">
                        {formData.shortDescription.length}/1000
                    </p>
                </div>

                {/* ==== ৪. লং ডেসক্রিপশন — রিচ টেক্সট (ওয়ার্ডের মতো) ==== */}
                <div className={cardClass}>
                    <div className="flex items-center gap-2 mb-1">
                        <FiFileText size={14} style={{ color: "var(--color-brand-accent)" }} />
                        <h2 className="text-[13px] font-bold uppercase tracking-wider text-gray-500">
                            Full Description & Modules
                        </h2>
                    </div>
                    <p className="text-[11px] text-gray-400 mb-4">
                        Write it like a Word document — headings, bold, colors, bullet points and
                        images all work. Lay out the modules and course details here.
                    </p>

                    <div className="course-editor">
                        <QuillEditor
                            theme="snow"
                            value={formData.longDescription}
                            onChange={(v) =>
                                setFormData((prev) => ({ ...prev, longDescription: v }))
                            }
                            onEditorReady={handleEditorReady}
                            modules={quillModules}
                            formats={quillFormats}
                            placeholder="Module 1: Listening — ..."
                        />
                    </div>
                </div>

                {/* ==== ৫. কোর্স টাইপ ও লোকেশন ==== */}
                <div className={cardClass}>
                    <div className="flex items-center gap-2 mb-4">
                        <FiMonitor size={14} style={{ color: "var(--color-brand-accent)" }} />
                        <h2 className="text-[13px] font-bold uppercase tracking-wider text-gray-500">
                            Course Type
                        </h2>
                    </div>

                    <div className="grid grid-cols-2 gap-3 max-w-md">
                        {[
                            { value: "online", label: "Online", icon: FiMonitor, hint: "Video / live classes" },
                            { value: "offline", label: "Offline", icon: FiMapPin, hint: "In-person classroom" },
                        ].map((opt) => {
                            const active = formData.courseType === opt.value;
                            return (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() =>
                                        setFormData((prev) => ({ ...prev, courseType: opt.value }))
                                    }
                                    className={`flex items-start gap-2.5 p-3.5 rounded-lg border-2 text-left transition-all ${
                                        active
                                            ? "border-brand-blue bg-brand-blue-soft dark:bg-brand-blue/10"
                                            : "border-gray-200 dark:border-gray-600 hover:border-gray-300"
                                    }`}
                                >
                                    <opt.icon
                                        size={16}
                                        className="mt-0.5"
                                        style={{ color: active ? "var(--color-brand-blue)" : "#9CA3AF" }}
                                    />
                                    <span>
                                        <span
                                            className={`block text-[13px] font-bold ${
                                                active ? "text-brand-blue" : "text-gray-600 dark:text-gray-300"
                                            }`}
                                        >
                                            {opt.label}
                                        </span>
                                        <span className="block text-[10px] text-gray-400 mt-0.5">{opt.hint}</span>
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* অফলাইন বেছে নিলেই কেবল লোকেশন ফিল্ড আসে */}
                    {formData.courseType === "offline" && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="mt-4 overflow-hidden"
                        >
                            <label className={labelClass}>Location *</label>
                            <input
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                className={inputClass}
                                placeholder="e.g. House 12, Road 5, Dhanmondi, Dhaka"
                            />
                        </motion.div>
                    )}
                </div>

                {/* ==== ৬. সিট, ডিউরেশন ও শিডিউল ==== */}
                <div className={cardClass}>
                    <div className="flex items-center gap-2 mb-4">
                        <FiUsers size={14} style={{ color: "var(--color-brand-accent)" }} />
                        <h2 className="text-[13px] font-bold uppercase tracking-wider text-gray-500">
                            Seats, Duration & Schedule
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className={labelClass}>Total Seats *</label>
                            <input
                                name="totalSeats"
                                type="number"
                                min="1"
                                value={formData.totalSeats}
                                onChange={handleChange}
                                className={inputClass}
                                placeholder="30"
                                required
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Already Enrolled</label>
                            <input
                                name="enrolledCount"
                                type="number"
                                min="0"
                                value={formData.enrolledCount}
                                onChange={handleChange}
                                className={inputClass}
                                placeholder="0"
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Available Seats</label>
                            <div className="px-3.5 py-2.5 rounded-lg bg-[#F8FAFC] dark:bg-gray-700/30 border border-gray-100 dark:border-gray-600 text-[13px] font-semibold text-gray-600 dark:text-gray-300">
                                {Math.max(
                                    0,
                                    (Number(formData.totalSeats) || 0) - (Number(formData.enrolledCount) || 0)
                                )}{" "}
                                <span className="font-normal text-gray-400">seats left</span>
                            </div>
                        </div>

                        <div>
                            <label className={labelClass}>Duration *</label>
                            <input
                                name="duration"
                                value={formData.duration}
                                onChange={handleChange}
                                className={inputClass}
                                placeholder="e.g. 3 Months / 24 Classes"
                                required
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Batch Start Date</label>
                            <input
                                name="startDate"
                                type="date"
                                value={formData.startDate}
                                onChange={handleChange}
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Class Schedule</label>
                            <input
                                name="classSchedule"
                                value={formData.classSchedule}
                                onChange={handleChange}
                                className={inputClass}
                                placeholder="e.g. Sat, Mon, Wed — 7:00 PM"
                            />
                        </div>
                    </div>
                </div>

                {/* ==== ৭. ইন্সট্রাক্টর ==== */}
                <div className={cardClass}>
                    <div className="flex items-center gap-2 mb-4">
                        <FiUser size={14} style={{ color: "var(--color-brand-accent)" }} />
                        <h2 className="text-[13px] font-bold uppercase tracking-wider text-gray-500">
                            Instructor
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Instructor Name</label>
                            <input
                                name="instructor"
                                value={formData.instructor}
                                onChange={handleChange}
                                className={inputClass}
                                placeholder="e.g. Rafiqul Islam"
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Instructor Title</label>
                            <input
                                name="instructorTitle"
                                value={formData.instructorTitle}
                                onChange={handleChange}
                                className={inputClass}
                                placeholder="e.g. Senior IELTS Trainer"
                            />
                        </div>
                    </div>
                </div>

                {/* ==== ৮. প্রাইসিং ==== */}
                <div className={cardClass}>
                    <div className="flex items-center gap-2 mb-4">
                        <FiDollarSign size={14} style={{ color: "var(--color-brand-accent)" }} />
                        <h2 className="text-[13px] font-bold uppercase tracking-wider text-gray-500">
                            Pricing
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className={labelClass}>Course Fee</label>
                            <input
                                name="price"
                                type="number"
                                min="0"
                                value={formData.price}
                                onChange={handleChange}
                                className={inputClass}
                                placeholder="0"
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Old Price (Strike-through)</label>
                            <input
                                name="oldPrice"
                                type="number"
                                min="0"
                                value={formData.oldPrice}
                                onChange={handleChange}
                                className={inputClass}
                                placeholder="Leave empty to hide"
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Currency</label>
                            <select
                                name="currency"
                                value={formData.currency}
                                onChange={handleChange}
                                className={inputClass}
                            >
                                <option value="BDT">BDT (৳)</option>
                                <option value="USD">USD ($)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* ==== ৯. অতিরিক্ত তথ্য ও পাবলিশ সেটিংস ==== */}
                <div className={cardClass}>
                    <div className="flex items-center gap-2 mb-4">
                        <FiSettings size={14} style={{ color: "var(--color-brand-accent)" }} />
                        <h2 className="text-[13px] font-bold uppercase tracking-wider text-gray-500">
                            Extra Info & Publish Settings
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className={labelClass}>Level</label>
                            <input
                                name="level"
                                value={formData.level}
                                onChange={handleChange}
                                className={inputClass}
                                placeholder="e.g. Beginner"
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Class Language</label>
                            <input
                                name="language"
                                value={formData.language}
                                onChange={handleChange}
                                className={inputClass}
                                placeholder="e.g. Bangla"
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Status</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className={inputClass}
                            >
                                <option value="upcoming">Upcoming</option>
                                <option value="ongoing">Ongoing</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                        <div className="sm:col-span-2">
                            <label className={labelClass}>Tags (comma separated)</label>
                            <input
                                name="tags"
                                value={formData.tags}
                                onChange={handleChange}
                                className={inputClass}
                                placeholder="IELTS, Speaking, Live Class"
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Display Order</label>
                            <input
                                name="order"
                                type="number"
                                min="0"
                                value={formData.order}
                                onChange={handleChange}
                                className={inputClass}
                                placeholder="0"
                            />
                        </div>
                        <div className="sm:col-span-3">
                            <label className={labelClass}>Meta Title (SEO)</label>
                            <input
                                name="metaTitle"
                                value={formData.metaTitle}
                                onChange={handleChange}
                                className={inputClass}
                                placeholder="Title shown in search results"
                            />
                        </div>
                        <div className="sm:col-span-3">
                            <label className={labelClass}>Meta Description (SEO)</label>
                            <textarea
                                name="metaDescription"
                                value={formData.metaDescription}
                                onChange={handleChange}
                                rows={2}
                                className={`${inputClass} resize-none`}
                                placeholder="Description shown in search results"
                            />
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-5 mt-5 pt-4 border-t border-gray-100 dark:border-gray-700/50">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                name="isActive"
                                checked={formData.isActive}
                                onChange={handleChange}
                                className="w-4 h-4 rounded accent-brand-blue"
                            />
                            <span className="text-[12px] font-semibold text-gray-600 dark:text-gray-300">
                                Active <span className="font-normal text-gray-400">(visible on the website)</span>
                            </span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                name="isFeatured"
                                checked={formData.isFeatured}
                                onChange={handleChange}
                                className="w-4 h-4 rounded accent-brand-blue"
                            />
                            <span className="text-[12px] font-semibold text-gray-600 dark:text-gray-300">
                                Featured <span className="font-normal text-gray-400">(shown on the homepage)</span>
                            </span>
                        </label>
                    </div>
                </div>

                {/* ==== Submit ==== */}
                <div className="flex items-center justify-end gap-3 pb-4">
                    <Link
                        href="/dashboard/admin/courses"
                        className="px-5 py-2.5 rounded-lg border border-gray-200 text-[12px] font-semibold text-gray-500 hover:bg-gray-50"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-[12px] font-semibold text-white disabled:opacity-50"
                        style={{ backgroundColor: "var(--color-brand-dark)" }}
                    >
                        {loading ? <FiLoader size={14} className="animate-spin" /> : <FiSave size={14} />}
                        {isEdit ? "Update Course" : "Create Course"}
                    </button>
                </div>
            </motion.form>

            {/* Quill এর ডিফল্ট স্টাইল ড্যাশবোর্ডের সাথে মেলানো */}
            <style jsx global>{`
                .course-editor .ql-toolbar {
                    border-top-left-radius: 8px;
                    border-top-right-radius: 8px;
                    border-color: #e5e7eb;
                    background: #f9fafb;
                }
                .course-editor .ql-container {
                    border-bottom-left-radius: 8px;
                    border-bottom-right-radius: 8px;
                    border-color: #e5e7eb;
                    font-family: Poppins, sans-serif;
                    font-size: 14px;
                }
                .course-editor .ql-editor {
                    min-height: 320px;
                }
                .course-editor .ql-toolbar button:hover,
                .course-editor .ql-toolbar button.ql-active {
                    color: var(--color-brand-dark);
                }
                .course-editor .ql-toolbar button:hover .ql-stroke,
                .course-editor .ql-toolbar button.ql-active .ql-stroke {
                    stroke: var(--color-brand-dark);
                }
                .course-editor .ql-toolbar button:hover .ql-fill,
                .course-editor .ql-toolbar button.ql-active .ql-fill {
                    fill: var(--color-brand-dark);
                }
            `}</style>
        </div>
    );
}

export default function AddCoursePage() {
    // useSearchParams কে Suspense boundary দরকার (Next App Router)
    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center py-32">
                    <FiLoader className="animate-spin" size={24} style={{ color: "var(--color-brand-dark)" }} />
                </div>
            }
        >
            <CourseForm />
        </Suspense>
    );
}
