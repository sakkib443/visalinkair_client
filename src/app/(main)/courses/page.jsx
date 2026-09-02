"use client";

// ===================================================================
// Public — Courses listing
//
// ডাটাবেজের active কোর্সগুলোই এখানে দেখায় (GET /api/courses/active),
// কিছুই হার্ডকোড করা নেই। অ্যাডমিন নতুন কোর্স অ্যাড করলেই এখানে চলে আসে।
//
// প্রতিটা কার্ডে দুটো অ্যাকশন —
//   View Details  → /courses/<slug>
//   Get Admission → ইনকয়েরি মোডাল (CourseInquiryForm)
// ===================================================================

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    FiUsers, FiClock, FiMapPin, FiMonitor, FiLoader, FiX, FiCalendar, FiArrowRight,
} from "react-icons/fi";
import { LuGraduationCap } from "react-icons/lu";
import { coursesApi } from "@/services/api";
import CourseInquiryForm from "@/components/shared/CourseInquiryForm";

const CARD_IMG_FALLBACK_BG = "var(--color-brand-dark)";

export default function CoursesPage() {
    const [courses, setCourses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [activeCat, setActiveCat] = useState("all");
    const [loading, setLoading] = useState(true);
    const [admissionFor, setAdmissionFor] = useState(null);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                const [list, cats] = await Promise.all([
                    coursesApi.listActive(),
                    coursesApi.listCategories(),
                ]);
                if (cancelled) return;
                setCourses(Array.isArray(list?.data) ? list.data : []);
                setCategories(Array.isArray(cats?.data) ? cats.data : []);
            } catch {
                if (!cancelled) setCourses([]);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => { cancelled = true; };
    }, []);

    // মোডাল খোলা থাকলে পেছনের পেজ যেন স্ক্রল না হয়
    useEffect(() => {
        document.body.style.overflow = admissionFor ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [admissionFor]);

    const catIdOf = (c) =>
        c?.category && typeof c.category === "object" ? c.category._id : c?.category;

    const visible =
        activeCat === "all" ? courses : courses.filter((c) => catIdOf(c) === activeCat);

    return (
        <div className="bg-[#F8FAFC] min-h-screen text-brand-dark" style={{ fontFamily: "Poppins, sans-serif" }}>
            {/* ==================== Heading ==================== */}
            <section className="pt-14 pb-10 md:pt-20 md:pb-12 px-4">
                <div className="max-w-3xl mx-auto text-center">
                    <span
                        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.15em] mb-5"
                        style={{ backgroundColor: "var(--color-brand-accent-soft)", color: "var(--color-brand-accent-ink)" }}
                    >
                        <LuGraduationCap size={14} /> Visalink Air Training
                    </span>

                    <h1
                        className="text-4xl md:text-5xl font-black tracking-tight leading-tight"
                        style={{ fontFamily: "Teko, sans-serif" }}
                    >
                        PROFESSIONAL{" "}
                        <span style={{ color: "var(--color-brand-accent)" }}>TRAVEL &amp; VISA</span> COURSES
                    </h1>

                    <p className="mt-3 text-[14px] md:text-[15px] text-gray-500 leading-relaxed max-w-2xl mx-auto">
                        Build a career in the travel industry. Our hands-on courses cover air
                        ticketing on live GDS terminals and complete visa documentation for every
                        major destination — taught by consultants who process these files every day.
                        Each course ends with a certificate and job placement support.
                    </p>
                </div>
            </section>

            {/* ==================== Category filter ==================== */}
            {categories.length > 1 && (
                <div className="px-4 pb-8">
                    <div className="max-w-[1200px] mx-auto flex flex-wrap justify-center gap-2">
                        {[{ _id: "all", name: "All Courses" }, ...categories].map((cat) => {
                            const active = activeCat === cat._id;
                            return (
                                <button
                                    key={cat._id}
                                    onClick={() => setActiveCat(cat._id)}
                                    className={`px-4 py-2 rounded-full text-[12px] font-bold transition-all border ${
                                        active
                                            ? "text-white border-transparent"
                                            : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                                    }`}
                                    style={active ? { backgroundColor: "var(--color-brand-dark)" } : {}}
                                >
                                    {cat.icon ? `${cat.icon} ` : ""}{cat.name}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ==================== Grid ==================== */}
            <section className="px-4 md:px-8 pb-20">
                <div className="max-w-[1200px] mx-auto">
                    {loading ? (
                        <div className="flex justify-center py-24">
                            <FiLoader className="animate-spin" size={26} style={{ color: "var(--color-brand-dark)" }} />
                        </div>
                    ) : visible.length === 0 ? (
                        <div className="text-center py-24">
                            <div className="w-16 h-16 rounded-full bg-white border border-gray-100 flex items-center justify-center mx-auto mb-4">
                                <LuGraduationCap size={26} className="text-gray-300" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-400">No courses available right now</h3>
                            <p className="text-[13px] text-gray-400 mt-1">
                                New batches are announced regularly — please check back soon.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {visible.map((course, i) => (
                                <CourseCard
                                    key={course._id}
                                    course={course}
                                    index={i}
                                    onAdmission={() => setAdmissionFor(course)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* ==================== Admission modal ==================== */}
            <AnimatePresence>
                {admissionFor && (
                    <AdmissionModal course={admissionFor} onClose={() => setAdmissionFor(null)} />
                )}
            </AnimatePresence>
        </div>
    );
}

// ===================================================================
//  Course card
// ===================================================================
function CourseCard({ course, index, onAdmission }) {
    const category = typeof course.category === "object" ? course.category : null;
    const seatsLeft =
        course.availableSeats ??
        Math.max(0, (course.totalSeats || 0) - (course.enrolledCount || 0));
    const isOffline = course.courseType === "offline";

    return (
        <motion.article
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(index * 0.06, 0.4) }}
            className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col hover:shadow-[0_12px_40px_-12px_rgba(2,30,20,0.18)] transition-shadow"
        >
            {/* Landscape cover */}
            <Link href={`/courses/${course.slug}`} className="block relative aspect-[16/9] overflow-hidden group">
                {course.image ? (
                    <img
                        src={course.image}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div
                        className="w-full h-full flex items-center justify-center"
                        style={{ backgroundColor: CARD_IMG_FALLBACK_BG }}
                    >
                        <LuGraduationCap size={44} className="text-white/15" />
                    </div>
                )}

                {/* Online / Offline badge */}
                <span
                    className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur"
                    style={{ backgroundColor: isOffline ? "rgba(139,92,246,0.92)" : "rgba(59,130,246,0.92)" }}
                >
                    {isOffline ? <FiMapPin size={9} /> : <FiMonitor size={9} />}
                    {course.courseType}
                </span>

                {seatsLeft > 0 && seatsLeft <= 5 && (
                    <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase text-white bg-red-500">
                        Only {seatsLeft} left
                    </span>
                )}
            </Link>

            {/* Body */}
            <div className="p-5 flex flex-col flex-1">
                {category && (
                    <p className="text-[11px] font-bold uppercase tracking-wide mb-1.5" style={{ color: "var(--color-brand-accent)" }}>
                        {category.name}
                    </p>
                )}

                <Link href={`/courses/${course.slug}`}>
                    <h2 className="text-[16px] font-bold leading-snug line-clamp-2 hover:text-brand-blue transition-colors">
                        {course.title}
                    </h2>
                </Link>

                <p className="text-[12px] text-gray-500 leading-relaxed line-clamp-2 mt-2 flex-1">
                    {course.shortDescription}
                </p>

                {/* Stats row — সবই ডাটাবেজের আসল সংখ্যা */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 text-[12px]">
                    <span className="flex items-center gap-1.5 text-gray-500">
                        <FiUsers size={12} style={{ color: "var(--color-brand-accent)" }} />
                        <strong className="text-brand-dark">{course.enrolledCount || 0}</strong> Students
                    </span>
                    <span className="flex items-center gap-1.5 text-gray-500">
                        <FiClock size={12} style={{ color: "var(--color-brand-accent)" }} />
                        {course.duration}
                    </span>
                </div>

                <div className="flex items-center justify-between mt-2.5 text-[12px]">
                    <span className="text-gray-500">
                        {seatsLeft > 0 ? (
                            <><strong className="text-brand-dark">{seatsLeft}</strong> seats left</>
                        ) : (
                            <span className="text-red-500 font-semibold">Seats full</span>
                        )}
                    </span>
                    {course.startDate && (
                        <span className="flex items-center gap-1.5 text-gray-500">
                            <FiCalendar size={12} style={{ color: "var(--color-brand-accent)" }} />
                            {course.startDate}
                        </span>
                    )}
                </div>

                {/* Fee */}
                <div className="flex items-end justify-between mt-4 pt-4 border-t border-gray-100">
                    <span className="text-[12px] text-gray-500 font-medium pb-1">Course Fee:</span>
                    <span className="text-right">
                        {course.oldPrice ? (
                            <span className="block text-[12px] text-gray-400 line-through leading-none mb-0.5">
                                {course.oldPrice.toLocaleString()} {course.currency || "BDT"}
                            </span>
                        ) : null}
                        <span className="text-[22px] font-black leading-none" style={{ fontFamily: "Teko, sans-serif" }}>
                            {course.price ? `${course.price.toLocaleString()} ${course.currency || "BDT"}` : "Free"}
                        </span>
                    </span>
                </div>

                {/* Actions —
                    সেকেন্ডারি অ্যাকশনটা আগে ধূসর-অন-ধূসর ছিল, চোখেই পড়ত না।
                    এখন ব্লু আউটলাইন বাটন: হোভারে পুরো ব্লু হয়ে ভরে যায়, তাই
                    নিচের সলিড ডার্ক ব্লু প্রাইমারির সাথে আলাদা করে বোঝা যায়। */}
                <div className="mt-4 space-y-2.5">
                    <Link
                        href={`/courses/${course.slug}`}
                        className="group/details flex items-center justify-center gap-1.5 w-full py-2.5 rounded-lg text-[12.5px] font-bold text-brand-blue bg-white border-[1.5px] border-brand-blue hover:bg-brand-blue hover:text-white transition-colors duration-200"
                    >
                        View Details
                        <FiArrowRight
                            size={13}
                            className="transition-transform duration-200 group-hover/details:translate-x-0.5"
                        />
                    </Link>
                    <button
                        onClick={onAdmission}
                        className="block w-full py-3 rounded-lg text-[13px] font-bold text-white bg-brand-dark hover:bg-brand-dark-hover transition-colors duration-200"
                    >
                        Get Admission
                    </button>
                </div>
            </div>
        </motion.article>
    );
}

// ===================================================================
//  Admission modal
// ===================================================================
function AdmissionModal({ course, onClose }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, y: 12 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 12 }}
                className="bg-white rounded-2xl w-full max-w-md max-h-[92vh] overflow-y-auto shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-5 sticky top-0 z-10" style={{ backgroundColor: "var(--color-brand-dark)" }}>
                    <div className="flex items-start justify-between gap-4">
                        <div className="text-white min-w-0">
                            <p className="text-[10px] uppercase tracking-[0.15em] opacity-60 font-bold">
                                Get Admission
                            </p>
                            <h3 className="text-[15px] font-bold mt-1 leading-snug">{course.title}</h3>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white flex-shrink-0"
                            aria-label="Close"
                        >
                            <FiX size={16} />
                        </button>
                    </div>
                </div>

                <div className="p-5">
                    <p className="text-[12px] text-gray-500 mb-4 leading-relaxed">
                        Fill in your details and our admission team will contact you about the
                        next batch, fees and payment options.
                    </p>
                    <CourseInquiryForm course={course} onSuccess={onClose} compact />
                </div>
            </motion.div>
        </motion.div>
    );
}
