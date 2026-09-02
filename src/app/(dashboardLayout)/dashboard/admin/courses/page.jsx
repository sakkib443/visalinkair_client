"use client";

// ===================================================================
// All Courses — সিস্টেমে যোগ করা সব কোর্সের লিস্ট।
// এখান থেকেই দেখা, এডিট করা আর ডিলিট করা যায়। ক্যাটাগরি ফিল্টারটা
// ডাটাবেজের ক্যাটাগরি কালেকশন থেকেই আসে, হার্ডকোড করা নেই।
// ===================================================================

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
    FiSearch, FiLoader, FiEdit, FiTrash2, FiEye, FiRefreshCw, FiPlus,
    FiX, FiUsers, FiClock, FiMapPin, FiMonitor, FiBookOpen, FiTag,
    FiCalendar, FiUser, FiStar,
} from "react-icons/fi";
import { useSelector } from "react-redux";
import { selectToken } from "@/redux/features/authSlice";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const STATUS_COLORS = {
    upcoming: "#3B82F6",
    ongoing: "#10B981",
    completed: "#6B7280",
    cancelled: "#EF4444",
};

// populate করা ক্যাটাগরি অবজেক্ট হয়ে আসে, কিন্তু পুরোনো/আন-populate ডাটায়
// শুধু আইডি স্ট্রিং থাকতে পারে — দুটোই সামলানো হচ্ছে।
const categoryOf = (course) =>
    course?.category && typeof course.category === "object" ? course.category : null;

export default function AllCoursesPage() {
    const [courses, setCourses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all");
    const [viewing, setViewing] = useState(null);
    const [deleting, setDeleting] = useState(null);

    const token = useSelector(selectToken);
    const router = useRouter();

    const authHeaders = useMemo(
        () => (token ? { Authorization: `Bearer ${token}` } : {}),
        [token]
    );

    const fetchCourses = useCallback(async () => {
        setLoading(true);
        try {
            const [courseRes, catRes] = await Promise.all([
                fetch(`${API_BASE}/api/courses`, { headers: authHeaders }).then((r) => r.json()),
                fetch(`${API_BASE}/api/courses/categories`, { headers: authHeaders }).then((r) => r.json()),
            ]);

            setCourses(courseRes?.success && Array.isArray(courseRes.data) ? courseRes.data : []);
            setCategories(catRes?.success && Array.isArray(catRes.data) ? catRes.data : []);
        } catch {
            toast.error("Failed to load courses");
            setCourses([]);
        } finally {
            setLoading(false);
        }
    }, [authHeaders]);

    useEffect(() => { fetchCourses(); }, [fetchCourses]);

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this course?")) return;

        setDeleting(id);
        try {
            const res = await fetch(`${API_BASE}/api/courses/${id}`, {
                method: "DELETE",
                headers: authHeaders,
            });
            const data = await res.json();

            if (data.success) {
                toast.success("Course deleted successfully");
                setCourses((prev) => prev.filter((c) => c._id !== id));
                if (viewing?._id === id) setViewing(null);
            } else {
                toast.error(data.message || "Failed to delete course");
            }
        } catch {
            toast.error("Something went wrong");
        } finally {
            setDeleting(null);
        }
    };

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return courses.filter((c) => {
            const cat = categoryOf(c);
            const matchSearch =
                !q ||
                c.title?.toLowerCase().includes(q) ||
                c.instructor?.toLowerCase().includes(q) ||
                cat?.name?.toLowerCase().includes(q);

            const catId = cat?._id || c.category;
            const matchCategory = categoryFilter === "all" || catId === categoryFilter;
            const matchType = typeFilter === "all" || c.courseType === typeFilter;

            return matchSearch && matchCategory && matchType;
        });
    }, [courses, search, categoryFilter, typeFilter]);

    const stats = useMemo(() => ([
        { label: "Total Courses", value: courses.length, color: "var(--color-brand-dark)" },
        { label: "Online", value: courses.filter((c) => c.courseType === "online").length, color: "#3B82F6" },
        { label: "Offline", value: courses.filter((c) => c.courseType === "offline").length, color: "var(--color-brand-accent)" },
        { label: "Categories", value: categories.length, color: "#8B5CF6" },
    ]), [courses, categories]);

    return (
        <div className="p-4 lg:p-6 space-y-5">
            {/* ==================== View Modal ==================== */}
            <AnimatePresence>
                {viewing && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setViewing(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.95 }}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-5 sticky top-0 z-10" style={{ backgroundColor: "var(--color-brand-dark)" }}>
                                <div className="flex items-start justify-between gap-4">
                                    <div className="text-white min-w-0">
                                        <p className="text-[10px] uppercase tracking-wider opacity-60 font-bold">
                                            {categoryOf(viewing)?.name || "Course"}
                                        </p>
                                        <h3 className="text-lg font-bold mt-0.5">{viewing.title}</h3>
                                    </div>
                                    <button
                                        onClick={() => setViewing(null)}
                                        className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white flex-shrink-0"
                                    >
                                        <FiX size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="p-5 space-y-4">
                                {viewing.image && (
                                    <img
                                        src={viewing.image}
                                        alt={viewing.title}
                                        className="w-full h-44 object-cover rounded-lg"
                                    />
                                )}

                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {[
                                        { label: "Type", value: viewing.courseType, icon: FiMonitor },
                                        { label: "Duration", value: viewing.duration, icon: FiClock },
                                        { label: "Total Seats", value: viewing.totalSeats, icon: FiUsers },
                                        { label: "Enrolled", value: viewing.enrolledCount ?? 0, icon: FiUsers },
                                        {
                                            label: "Seats Left",
                                            value: Math.max(0, (viewing.totalSeats || 0) - (viewing.enrolledCount || 0)),
                                            icon: FiUsers,
                                        },
                                        { label: "Status", value: viewing.status, icon: FiTag },
                                        { label: "Instructor", value: viewing.instructor || "—", icon: FiUser },
                                        { label: "Start Date", value: viewing.startDate || "—", icon: FiCalendar },
                                        {
                                            label: "Fee",
                                            value: viewing.price ? `৳${viewing.price.toLocaleString()}` : "Free",
                                            icon: FiTag,
                                        },
                                    ].map((item) => (
                                        <div key={item.label} className="bg-[#F8FAFC] dark:bg-gray-700/30 rounded-lg p-3">
                                            <p className="text-[10px] text-gray-400 uppercase font-bold">{item.label}</p>
                                            <p className="text-[13px] font-semibold text-gray-700 dark:text-gray-200 mt-0.5 capitalize break-words">
                                                {item.value}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                {viewing.courseType === "offline" && viewing.location && (
                                    <div className="bg-brand-accent-soft dark:bg-brand-accent/10 rounded-lg p-3">
                                        <p className="text-[10px] text-brand-accent-ink uppercase font-bold mb-1 flex items-center gap-1">
                                            <FiMapPin size={10} /> Location
                                        </p>
                                        <p className="text-[12px] text-gray-700 dark:text-gray-200">{viewing.location}</p>
                                    </div>
                                )}

                                {viewing.shortDescription && (
                                    <div className="bg-[#F8FAFC] dark:bg-gray-700/30 rounded-lg p-3">
                                        <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Short Description</p>
                                        <p className="text-[12px] text-gray-600 dark:text-gray-300">{viewing.shortDescription}</p>
                                    </div>
                                )}

                                {viewing.longDescription && (
                                    <div className="bg-[#F8FAFC] dark:bg-gray-700/30 rounded-lg p-3">
                                        <p className="text-[10px] text-gray-400 uppercase font-bold mb-2">
                                            Full Description & Modules
                                        </p>
                                        {/* এডিটরে লেখা HTML — অ্যাডমিন নিজেই লিখেছে, তাই এখানে রেন্ডার করা হচ্ছে */}
                                        <div
                                            className="course-html text-[12px] text-gray-600 dark:text-gray-300 max-h-64 overflow-y-auto"
                                            dangerouslySetInnerHTML={{ __html: viewing.longDescription }}
                                        />
                                    </div>
                                )}

                                <div className="flex gap-2 pt-2">
                                    <button
                                        onClick={() => {
                                            setViewing(null);
                                            router.push(`/dashboard/admin/courses/create?id=${viewing._id}`);
                                        }}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-[12px] font-semibold text-white"
                                        style={{ backgroundColor: "var(--color-brand-dark)" }}
                                    >
                                        <FiEdit size={13} /> Edit Course
                                    </button>
                                    <button
                                        onClick={() => handleDelete(viewing._id)}
                                        className="px-4 py-2.5 rounded-lg text-[12px] font-semibold text-red-500 border border-red-200 hover:bg-red-50"
                                    >
                                        <FiTrash2 size={13} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ==================== Header ==================== */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1
                        className="text-2xl font-black uppercase tracking-tight"
                        style={{ fontFamily: "Teko, sans-serif", color: "var(--color-brand-dark)" }}
                    >
                        All Courses
                    </h1>
                    <p className="text-[12px] text-gray-400 mt-0.5">{courses.length} courses</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={fetchCourses}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-[11px] font-semibold text-gray-500 hover:bg-gray-50"
                    >
                        <FiRefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
                    </button>
                    <Link
                        href="/dashboard/admin/courses/create"
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[11px] font-semibold text-white"
                        style={{ backgroundColor: "var(--color-brand-dark)" }}
                    >
                        <FiPlus size={13} /> Add New Course
                    </Link>
                </div>
            </div>

            {/* ==================== Stats ==================== */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {stats.map((s) => (
                    <div
                        key={s.label}
                        className="bg-white dark:bg-gray-800 rounded-xl p-3.5 border border-gray-100 dark:border-gray-700/50"
                    >
                        <p className="text-xl font-semibold" style={{ color: s.color }}>{s.value}</p>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase mt-1">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* ==================== Filters ==================== */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-100 dark:border-gray-700/50 space-y-3">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                        <input
                            placeholder="Search by course, instructor or category..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#F5F6FA] dark:bg-gray-700 border border-gray-100 dark:border-gray-600 text-[13px] focus:border-brand-dark outline-none"
                        />
                    </div>
                    <div className="flex gap-1.5">
                        {["all", "online", "offline"].map((t) => (
                            <button
                                key={t}
                                onClick={() => setTypeFilter(t)}
                                className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wide transition-all ${
                                    typeFilter === t ? "text-white" : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                                }`}
                                style={typeFilter === t ? { backgroundColor: "var(--color-brand-dark)" } : {}}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ক্যাটাগরি চিপগুলো ডাটাবেজ থেকেই আসছে */}
                {categories.length > 0 && (
                    <div className="flex gap-1.5 flex-wrap pt-1 border-t border-gray-50 dark:border-gray-700/50">
                        <button
                            onClick={() => setCategoryFilter("all")}
                            className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wide transition-all ${
                                categoryFilter === "all" ? "text-white" : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                            }`}
                            style={categoryFilter === "all" ? { backgroundColor: "var(--color-brand-blue)" } : {}}
                        >
                            All Categories
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat._id}
                                onClick={() => setCategoryFilter(cat._id)}
                                className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wide transition-all ${
                                    categoryFilter === cat._id ? "text-white" : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                                }`}
                                style={categoryFilter === cat._id ? { backgroundColor: "var(--color-brand-blue)" } : {}}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* ==================== Course Grid ==================== */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <FiLoader className="animate-spin" size={24} style={{ color: "var(--color-brand-dark)" }} />
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <FiBookOpen size={24} className="text-gray-300" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-400 mb-1">No Courses Found</h3>
                    <p className="text-[12px] text-gray-400 mb-4">
                        {courses.length === 0
                            ? "Add your first course to get started"
                            : "Try changing the filters"}
                    </p>
                    <Link
                        href="/dashboard/admin/courses/create"
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[11px] font-semibold text-white"
                        style={{ backgroundColor: "var(--color-brand-dark)" }}
                    >
                        <FiPlus size={13} /> Add New Course
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map((course, i) => {
                        const cat = categoryOf(course);
                        const seatsLeft = Math.max(
                            0,
                            (course.totalSeats || 0) - (course.enrolledCount || 0)
                        );
                        const fillPct = course.totalSeats
                            ? Math.min(100, ((course.enrolledCount || 0) / course.totalSeats) * 100)
                            : 0;

                        return (
                            <motion.div
                                key={course._id}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: Math.min(i * 0.04, 0.3) }}
                                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700/50 overflow-hidden group hover:shadow-lg transition-all flex flex-col"
                            >
                                {/* Cover */}
                                <div className="h-36 relative overflow-hidden" style={{ backgroundColor: "var(--color-brand-dark)" }}>
                                    {course.image ? (
                                        <img
                                            src={course.image}
                                            alt={course.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <FiBookOpen size={40} className="text-white/10" />
                                        </div>
                                    )}

                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            {cat && (
                                                <span
                                                    className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase text-white"
                                                    style={{ backgroundColor: "var(--color-brand-accent)" }}
                                                >
                                                    {cat.name}
                                                </span>
                                            )}
                                            <span
                                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase text-white"
                                                style={{ backgroundColor: course.courseType === "online" ? "#3B82F6" : "#8B5CF6" }}
                                            >
                                                {course.courseType === "online" ? <FiMonitor size={8} /> : <FiMapPin size={8} />}
                                                {course.courseType}
                                            </span>
                                            <span
                                                className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase text-white"
                                                style={{ backgroundColor: STATUS_COLORS[course.status] || "#6B7280" }}
                                            >
                                                {course.status}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="absolute top-3 right-3 flex gap-1.5">
                                        <button
                                            onClick={() => setViewing(course)}
                                            className="w-8 h-8 rounded-lg bg-white/90 backdrop-blur flex items-center justify-center text-gray-600 hover:bg-white shadow-sm"
                                            title="View"
                                        >
                                            <FiEye size={14} />
                                        </button>
                                        <Link
                                            href={`/dashboard/admin/courses/create?id=${course._id}`}
                                            className="w-8 h-8 rounded-lg bg-white/90 backdrop-blur flex items-center justify-center text-gray-600 hover:bg-white shadow-sm"
                                            title="Edit"
                                        >
                                            <FiEdit size={14} />
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(course._id)}
                                            disabled={deleting === course._id}
                                            className="w-8 h-8 rounded-lg bg-red-50 backdrop-blur flex items-center justify-center text-red-500 hover:bg-red-100 disabled:opacity-50 shadow-sm"
                                            title="Delete"
                                        >
                                            {deleting === course._id ? (
                                                <FiLoader size={14} className="animate-spin" />
                                            ) : (
                                                <FiTrash2 size={14} />
                                            )}
                                        </button>
                                    </div>

                                    {course.isFeatured && (
                                        <span className="absolute top-3 left-3 w-7 h-7 rounded-lg bg-amber-400 flex items-center justify-center shadow-sm" title="Featured">
                                            <FiStar size={13} className="text-white" />
                                        </span>
                                    )}
                                </div>

                                {/* Body */}
                                <div className="p-4 flex-1 flex flex-col">
                                    <h3 className="text-[13px] font-bold text-gray-800 dark:text-white line-clamp-2">
                                        {course.title}
                                    </h3>
                                    <p className="text-[11px] text-gray-400 line-clamp-2 mt-1 flex-1">
                                        {course.shortDescription}
                                    </p>

                                    {course.courseType === "offline" && course.location && (
                                        <p className="text-[10px] text-gray-400 flex items-start gap-1 mt-2">
                                            <FiMapPin size={10} className="mt-0.5 flex-shrink-0" />
                                            <span className="line-clamp-1">{course.location}</span>
                                        </p>
                                    )}

                                    {/* সিট ভরে যাওয়ার বার */}
                                    <div className="mt-3">
                                        <div className="flex items-center justify-between text-[10px] mb-1">
                                            <span className="text-gray-400">
                                                {course.enrolledCount || 0}/{course.totalSeats || 0} enrolled
                                            </span>
                                            <span
                                                className={`font-bold ${seatsLeft === 0 ? "text-red-500" : "text-gray-500"}`}
                                            >
                                                {seatsLeft === 0 ? "Sold out" : `${seatsLeft} seats left`}
                                            </span>
                                        </div>
                                        <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all"
                                                style={{
                                                    width: `${fillPct}%`,
                                                    backgroundColor: fillPct >= 100 ? "#EF4444" : "var(--color-brand-accent)",
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-700/50">
                                        <div>
                                            <p className="text-base font-bold" style={{ color: "var(--color-brand-dark)" }}>
                                                {course.price
                                                    ? `৳${course.price.toLocaleString()}`
                                                    : "Free"}
                                            </p>
                                            {course.oldPrice ? (
                                                <p className="text-[10px] text-gray-400 line-through">
                                                    ৳{course.oldPrice.toLocaleString()}
                                                </p>
                                            ) : null}
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[11px] font-semibold text-gray-600 dark:text-gray-300 flex items-center gap-1 justify-end">
                                                <FiClock size={10} /> {course.duration}
                                            </p>
                                            {course.instructor && (
                                                <p className="text-[10px] text-gray-400 truncate max-w-[120px]">
                                                    {course.instructor}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {!course.isActive && (
                                        <p className="mt-2 text-[10px] font-bold uppercase text-gray-400 bg-gray-50 dark:bg-gray-700/40 rounded px-2 py-1 text-center">
                                            Inactive — not visible on the website
                                        </p>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* মডালের ভেতর রিচ-টেক্সট HTML যেন ফরম্যাটিং হারিয়ে না ফেলে */}
            <style jsx global>{`
                .course-html h1, .course-html h2, .course-html h3,
                .course-html h4, .course-html h5, .course-html h6 {
                    font-weight: 700;
                    margin: 0.6em 0 0.3em;
                    color: var(--color-brand-dark);
                }
                .course-html h1 { font-size: 1.35em; }
                .course-html h2 { font-size: 1.2em; }
                .course-html h3 { font-size: 1.08em; }
                .course-html p { margin: 0.35em 0; }
                .course-html ul { list-style: disc; padding-left: 1.3em; margin: 0.35em 0; }
                .course-html ol { list-style: decimal; padding-left: 1.3em; margin: 0.35em 0; }
                .course-html a { color: var(--color-brand-accent); text-decoration: underline; }
                .course-html img { max-width: 100%; border-radius: 6px; margin: 0.5em 0; }
                .course-html blockquote {
                    border-left: 3px solid var(--color-brand-accent);
                    padding-left: 0.75em;
                    margin: 0.5em 0;
                    color: #6b7280;
                }
            `}</style>
        </div>
    );
}
