"use client";

// ===================================================================
// Public — Course details
//
// লেআউট: উপরে বড় ল্যান্ডস্কেপ কভার ইমেজ, নিচে দুই কলামের গ্রিড —
//   বাম কলাম  → কোর্সের সব ডিটেইলস (মডিউলসহ রিচ-টেক্সট) + গ্যালারি
//   ডান কলাম  → sticky ইনকয়েরি কার্ড, স্ক্রল করলেও সবসময় দেখা যায়
//
// longDescription অ্যাডমিনের লেখা HTML — তাই dangerouslySetInnerHTML দিয়েই
// রেন্ডার করতে হয়। এটা পাবলিক ইউজারের ইনপুট নয়, শুধু super_admin লিখতে পারে।
// ===================================================================

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    FiUsers, FiClock, FiMapPin, FiMonitor, FiLoader, FiCalendar, FiUser,
    FiArrowLeft, FiTag, FiGlobe, FiBarChart2, FiCheckCircle,
} from "react-icons/fi";
import { LuGraduationCap } from "react-icons/lu";
import { coursesApi } from "@/services/api";
import CourseInquiryForm from "@/components/shared/CourseInquiryForm";

export default function CourseDetailsPage() {
    const { slug } = useParams();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [lightbox, setLightbox] = useState(null);

    useEffect(() => {
        if (!slug) return;
        let cancelled = false;

        (async () => {
            setLoading(true);
            try {
                const res = await coursesApi.getBySlug(slug);
                if (cancelled) return;
                if (res?.success && res.data) setCourse(res.data);
                else setNotFound(true);
            } catch {
                if (!cancelled) setNotFound(true);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => { cancelled = true; };
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
                <FiLoader className="animate-spin" size={28} style={{ color: "var(--color-brand-dark)" }} />
            </div>
        );
    }

    if (notFound || !course) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center px-4 text-center">
                <div className="w-16 h-16 rounded-full bg-white border border-gray-100 flex items-center justify-center mb-4">
                    <LuGraduationCap size={26} className="text-gray-300" />
                </div>
                <h1 className="text-2xl font-black text-brand-dark" style={{ fontFamily: "Teko, sans-serif" }}>
                    COURSE NOT FOUND
                </h1>
                <p className="text-[13px] text-gray-500 mt-1 mb-6">
                    This course may have been removed or is no longer running.
                </p>
                <Link
                    href="/courses"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-[12px] font-bold text-white"
                    style={{ backgroundColor: "var(--color-brand-dark)" }}
                >
                    <FiArrowLeft size={13} /> Back to all courses
                </Link>
            </div>
        );
    }

    const category = typeof course.category === "object" ? course.category : null;
    const isOffline = course.courseType === "offline";
    const seatsLeft =
        course.availableSeats ??
        Math.max(0, (course.totalSeats || 0) - (course.enrolledCount || 0));
    const fillPct = course.totalSeats
        ? Math.min(100, ((course.enrolledCount || 0) / course.totalSeats) * 100)
        : 0;

    const facts = [
        { label: "Course Type", value: isOffline ? "Offline (Classroom)" : "Online (Live)", icon: isOffline ? FiMapPin : FiMonitor },
        { label: "Duration", value: course.duration, icon: FiClock },
        { label: "Batch Starts", value: course.startDate, icon: FiCalendar },
        { label: "Class Schedule", value: course.classSchedule, icon: FiClock },
        { label: "Total Seats", value: course.totalSeats, icon: FiUsers },
        { label: "Level", value: course.level, icon: FiBarChart2 },
        { label: "Class Language", value: course.language, icon: FiGlobe },
        { label: "Category", value: category?.name, icon: FiTag },
    ].filter((f) => f.value !== undefined && f.value !== null && f.value !== "");

    return (
        <div className="bg-[#F8FAFC] min-h-screen text-brand-dark" style={{ fontFamily: "Poppins, sans-serif" }}>
            {/* ==================== Breadcrumb ==================== */}
            <div className="max-w-[1280px] mx-auto px-4 md:px-8 pt-6">
                <Link
                    href="/courses"
                    className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-gray-500 hover:text-brand-dark transition-colors"
                >
                    <FiArrowLeft size={13} /> All Courses
                </Link>
            </div>

            {/* ==================== Big landscape cover ==================== */}
            <section className="max-w-[1280px] mx-auto px-4 md:px-8 pt-4">
                <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative rounded-2xl overflow-hidden aspect-[21/9] md:aspect-[21/8] bg-brand-dark"
                >
                    {course.image ? (
                        <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <LuGraduationCap size={64} className="text-white/10" />
                        </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

                    <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8">
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                            {category && (
                                <span
                                    className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide text-white"
                                    style={{ backgroundColor: "var(--color-brand-accent)" }}
                                >
                                    {category.name}
                                </span>
                            )}
                            <span
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide text-white"
                                style={{ backgroundColor: isOffline ? "#8B5CF6" : "#3B82F6" }}
                            >
                                {isOffline ? <FiMapPin size={9} /> : <FiMonitor size={9} />} {course.courseType}
                            </span>
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-white/20 text-white backdrop-blur">
                                {course.status}
                            </span>
                        </div>

                        <h1
                            className="text-3xl md:text-5xl font-black text-white leading-tight max-w-4xl"
                            style={{ fontFamily: "Teko, sans-serif" }}
                        >
                            {course.title}
                        </h1>
                    </div>
                </motion.div>
            </section>

            {/* ==================== Two-column grid ==================== */}
            <section className="max-w-[1280px] mx-auto px-4 md:px-8 py-8 md:py-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">

                    {/* ---------- LEFT: all course details ---------- */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Short description */}
                        <Card>
                            <p className="text-[14px] text-gray-600 leading-relaxed">
                                {course.shortDescription}
                            </p>
                        </Card>

                        {/* Quick facts */}
                        <Card title="Course Information">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {facts.map((f) => (
                                    <div key={f.label} className="flex items-start gap-3 p-3 rounded-lg bg-[#F8FAFC] border border-gray-100">
                                        <f.icon size={15} className="mt-0.5 flex-shrink-0" style={{ color: "var(--color-brand-accent)" }} />
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">{f.label}</p>
                                            <p className="text-[13px] font-semibold text-brand-dark mt-0.5 break-words">{f.value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Location — offline হলেই কেবল */}
                            {isOffline && course.location && (
                                <div className="mt-3 flex items-start gap-3 p-4 rounded-lg bg-brand-accent-soft border border-brand-accent/20">
                                    <FiMapPin size={16} className="mt-0.5 flex-shrink-0" style={{ color: "var(--color-brand-accent)" }} />
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-wide text-brand-accent-ink">Class Location</p>
                                        <p className="text-[13px] font-semibold text-brand-dark mt-0.5">{course.location}</p>
                                    </div>
                                </div>
                            )}
                        </Card>

                        {/* Seats */}
                        <Card title="Seat Availability">
                            <div className="flex items-center justify-between text-[13px] mb-2">
                                <span className="text-gray-500">
                                    <strong className="text-brand-dark">{course.enrolledCount || 0}</strong> of{" "}
                                    <strong className="text-brand-dark">{course.totalSeats}</strong> seats taken
                                </span>
                                <span className={`font-bold ${seatsLeft === 0 ? "text-red-500" : "text-brand-accent"}`}>
                                    {seatsLeft === 0 ? "Seats full" : `${seatsLeft} seats left`}
                                </span>
                            </div>
                            <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all"
                                    style={{
                                        width: `${fillPct}%`,
                                        backgroundColor: fillPct >= 100 ? "#EF4444" : "var(--color-brand-accent)",
                                    }}
                                />
                            </div>
                        </Card>

                        {/* Instructor */}
                        {course.instructor && (
                            <Card title="Your Instructor">
                                <div className="flex items-center gap-4">
                                    <div
                                        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-[16px] flex-shrink-0"
                                        style={{ backgroundColor: "var(--color-brand-dark)" }}
                                    >
                                        {course.instructor.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-[14px] font-bold text-brand-dark">{course.instructor}</p>
                                        {course.instructorTitle && (
                                            <p className="text-[12px] text-gray-500 mt-0.5">{course.instructorTitle}</p>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        )}

                        {/* Full description + modules (rich text) */}
                        {course.longDescription && (
                            <Card title="Course Details & Modules">
                                <div
                                    className="course-content"
                                    dangerouslySetInnerHTML={{ __html: course.longDescription }}
                                />
                            </Card>
                        )}

                        {/* Gallery */}
                        {course.gallery?.length > 0 && (
                            <Card title="Gallery">
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {course.gallery.map((src, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setLightbox(src)}
                                            className="aspect-[4/3] rounded-lg overflow-hidden border border-gray-100 group"
                                        >
                                            <img
                                                src={src}
                                                alt={`${course.title} ${i + 1}`}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        </button>
                                    ))}
                                </div>
                            </Card>
                        )}

                        {/* Tags */}
                        {course.tags?.length > 0 && (
                            <Card title="Topics Covered">
                                <div className="flex flex-wrap gap-2">
                                    {course.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="px-3 py-1.5 rounded-full text-[11px] font-semibold bg-[#F8FAFC] border border-gray-200 text-gray-600"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </Card>
                        )}
                    </div>

                    {/* ---------- RIGHT: sticky inquiry card ---------- */}
                    <aside className="lg:col-span-1">
                        <div className="lg:sticky lg:top-24 space-y-4">
                            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-[0_8px_30px_-12px_rgba(2,30,20,0.15)]">
                                {/* Price header */}
                                <div className="p-5" style={{ backgroundColor: "var(--color-brand-dark)" }}>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/50">
                                        Course Fee
                                    </p>
                                    <div className="flex items-end gap-2.5 mt-1">
                                        <span
                                            className="text-4xl font-black text-white leading-none"
                                            style={{ fontFamily: "Teko, sans-serif" }}
                                        >
                                            {course.price ? course.price.toLocaleString() : "FREE"}
                                        </span>
                                        {course.price ? (
                                            <span className="text-[13px] font-bold text-white/70 pb-1">
                                                {course.currency || "BDT"}
                                            </span>
                                        ) : null}
                                        {course.oldPrice ? (
                                            <span className="text-[13px] text-white/40 line-through pb-1 ml-auto">
                                                {course.oldPrice.toLocaleString()}
                                            </span>
                                        ) : null}
                                    </div>

                                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-[11px] text-white/70">
                                        <span className="flex items-center gap-1.5">
                                            <FiClock size={11} /> {course.duration}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <FiUsers size={11} /> {seatsLeft} seats left
                                        </span>
                                    </div>
                                </div>

                                {/* Form */}
                                <div className="p-5">
                                    <h3 className="text-[13px] font-bold uppercase tracking-wide text-gray-500 mb-1">
                                        Apply for Admission
                                    </h3>
                                    <p className="text-[11px] text-gray-400 mb-4 leading-relaxed">
                                        Send us your details and we will get back to you about the next batch.
                                    </p>
                                    <CourseInquiryForm course={course} compact />
                                </div>
                            </div>

                            {/* Reassurance */}
                            <div className="bg-white rounded-2xl border border-gray-100 p-5">
                                <ul className="space-y-2.5">
                                    {[
                                        "Certificate on completion",
                                        "Job placement assistance",
                                        "Hands-on practical classes",
                                        "Instalment payment available",
                                    ].map((item) => (
                                        <li key={item} className="flex items-start gap-2.5 text-[12px] text-gray-600">
                                            <FiCheckCircle size={14} className="mt-0.5 flex-shrink-0" style={{ color: "var(--color-brand-accent)" }} />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </aside>
                </div>
            </section>

            {/* ==================== Gallery lightbox ==================== */}
            {lightbox && (
                <div
                    className="fixed inset-0 z-[70] bg-black/85 flex items-center justify-center p-4"
                    onClick={() => setLightbox(null)}
                >
                    <img src={lightbox} alt="" className="max-w-full max-h-full rounded-lg object-contain" />
                </div>
            )}

            {/* অ্যাডমিনের রিচ-টেক্সট HTML যেন ফরম্যাটিং হারিয়ে না ফেলে */}
            <style jsx global>{`
                .course-content { font-size: 13.5px; line-height: 1.75; color: #4b5563; }
                .course-content h1,
                .course-content h2,
                .course-content h3,
                .course-content h4 { color: var(--color-brand-dark); font-weight: 800; line-height: 1.3; }
                .course-content h1 { font-size: 1.55em; margin: 1.3em 0 0.5em; }
                .course-content h2 { font-size: 1.35em; margin: 1.3em 0 0.5em; padding-bottom: 0.35em; border-bottom: 1px solid #f1f5f9; }
                .course-content h3 { font-size: 1.12em; margin: 1.1em 0 0.4em; }
                .course-content h4 { font-size: 1em; margin: 1em 0 0.35em; }
                .course-content > *:first-child { margin-top: 0; }
                .course-content p { margin: 0.6em 0; }
                .course-content strong { color: var(--color-brand-dark); font-weight: 700; }
                .course-content ul { list-style: disc; padding-left: 1.4em; margin: 0.6em 0; }
                .course-content ol { list-style: decimal; padding-left: 1.4em; margin: 0.6em 0; }
                .course-content li { margin: 0.3em 0; }
                .course-content a { color: var(--color-brand-accent); text-decoration: underline; }
                .course-content img { max-width: 100%; height: auto; border-radius: 8px; margin: 0.8em 0; }
                .course-content blockquote {
                    border-left: 3px solid var(--color-brand-accent);
                    background: var(--color-brand-accent-soft);
                    padding: 0.75em 1em;
                    margin: 1em 0;
                    border-radius: 0 6px 6px 0;
                    color: var(--color-brand-accent-ink);
                }
                .course-content pre,
                .course-content code {
                    background: #f8fafc;
                    border: 1px solid #e5e7eb;
                    border-radius: 6px;
                    padding: 0.15em 0.4em;
                    font-size: 0.92em;
                }
                .course-content .ql-align-center { text-align: center; }
                .course-content .ql-align-right { text-align: right; }
                .course-content .ql-align-justify { text-align: justify; }
            `}</style>
        </div>
    );
}

function Card({ title, children }) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 md:p-6">
            {title && (
                <h2
                    className="text-lg font-black uppercase tracking-tight mb-4"
                    style={{ fontFamily: "Teko, sans-serif", color: "var(--color-brand-dark)" }}
                >
                    {title}
                </h2>
            )}
            {children}
        </div>
    );
}
