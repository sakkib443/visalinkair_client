"use client";

// ===================================================================
// Visalink Air — Blog listing.
//   Simple layout: heading + 3-column card grid. No hero, no featured
//   post, no search / category chips, no newsletter block.
// Posts come from /api/blogs (admin-managed).
// ===================================================================

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { LuArrowRight, LuArrowUpRight, LuLoader } from "react-icons/lu";
import { useLanguage } from "@/context/LanguageContext";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const fmtDate = (d, isBn) => {
    if (!d) return "";
    try {
        return new Date(d).toLocaleDateString(isBn ? "bn-BD" : "en-US", {
            year: "numeric", month: "short", day: "numeric",
        });
    } catch { return ""; }
};

export default function BlogPage() {
    const { language } = useLanguage();
    const isBn = language === "bn";
    const fontFamily = isBn ? "Hind Siliguri, sans-serif" : "Poppins, sans-serif";
    const headingFont = isBn ? "Hind Siliguri, sans-serif" : "Teko, sans-serif";

    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const res = await fetch(`${API_BASE}/api/blogs?status=published&limit=50`);
                const data = await res.json();
                if (data.success && data.data) {
                    // Newest first — the only ordering this page cares about.
                    const sorted = [...data.data].sort(
                        (a, b) => new Date(b.publishedAt || b.createdAt || 0)
                                - new Date(a.publishedAt || a.createdAt || 0)
                    );
                    setBlogs(sorted);
                }
            } catch (err) {
                console.error("Failed to fetch blogs:", err);
            } finally { setLoading(false); }
        })();
    }, []);

    return (
        <div className="bg-white pt-28 pb-16 min-h-screen">
            <section className="max-w-6xl mx-auto px-5 sm:px-8">
                {/* ── Heading ─────────────────────────────── */}
                <div className="text-center mb-10 md:mb-14">
                    <div className="flex items-center justify-center gap-3 mb-3">
                        <span className="h-[1px] w-8 bg-gradient-to-r from-transparent to-brand-accent" />
                        <span
                            className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.25em] text-brand-accent"
                            style={{ fontFamily }}
                        >
                            {isBn ? "ব্লগ" : "Blog"}
                        </span>
                        <span className="h-[1px] w-8 bg-gradient-to-l from-transparent to-brand-accent" />
                    </div>
                    <h1
                        className="text-3xl md:text-5xl font-black text-brand-dark tracking-tight uppercase"
                        style={{ fontFamily: headingFont }}
                    >
                        {isBn ? "সাম্প্রতিক ব্লগ" : "Latest Blogs"}
                    </h1>
                </div>

                {/* ── Grid / states ───────────────────────── */}
                {loading ? (
                    <div className="py-24 flex items-center justify-center">
                        <LuLoader className="w-8 h-8 text-brand-blue animate-spin" />
                    </div>
                ) : blogs.length === 0 ? (
                    <div className="py-24 text-center">
                        <div className="text-6xl mb-3">📰</div>
                        <h3
                            className="text-2xl font-bold text-brand-dark mb-2"
                            style={{ fontFamily: headingFont }}
                        >
                            {isBn ? "কোনো পোস্ট পাওয়া যায়নি" : "No posts found"}
                        </h3>
                        <p className="text-gray-500" style={{ fontFamily }}>
                            {isBn ? "শীঘ্রই নতুন পোস্ট আসছে।" : "New posts coming soon."}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {blogs.map((b, i) => {
                            // `author` comes back either populated as
                            // { firstName, lastName } or as a plain string;
                            // rendering the object directly explodes.
                            const a = b.author;
                            const authorName = typeof a === "string"
                                ? a
                                : a
                                    ? [a.firstName, a.lastName].filter(Boolean).join(" ").trim()
                                    : "";
                            const tags = Array.isArray(b.tags) ? b.tags.slice(0, 3) : [];
                            const href = `/blog/${b.slug || b._id}`;
                            return (
                                <motion.article
                                    key={b._id || b.slug || i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-80px" }}
                                    transition={{ duration: 0.35, delay: (i % 3) * 0.05 }}
                                    className="group flex flex-col bg-white rounded-2xl overflow-hidden hover:-translate-y-1 transition-transform duration-300"
                                >
                                    {/* Image — square hero */}
                                    <Link
                                        href={href}
                                        className="block relative aspect-square overflow-hidden bg-gray-100 rounded-2xl"
                                    >
                                        {(b.thumbnail || b.coverImage) ? (
                                            <img
                                                src={b.thumbnail || b.coverImage}
                                                alt={b.title}
                                                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center text-5xl text-gray-200">📝</div>
                                        )}
                                    </Link>

                                    {/* Body */}
                                    <div className="pt-5 px-1 flex flex-col flex-1">
                                        {/* Date · Author */}
                                        <div
                                            className="flex items-center gap-2 text-[13px] text-gray-500"
                                            style={{ fontFamily }}
                                        >
                                            <span>{fmtDate(b.publishedAt || b.createdAt, isBn)}</span>
                                            {authorName && (
                                                <>
                                                    <span className="w-1 h-1 rounded-full bg-gray-400" />
                                                    <span>{authorName}</span>
                                                </>
                                            )}
                                        </div>

                                        {/* Title with arrow */}
                                        <Link href={href} className="mt-3 block">
                                            <h3
                                                className="text-[20px] md:text-[22px] font-black text-[#0a1628] leading-snug tracking-tight group-hover:text-brand-blue transition-colors flex items-start gap-2"
                                                style={{ fontFamily }}
                                            >
                                                <span className="flex-1">{isBn && b.titleBn ? b.titleBn : b.title}</span>
                                                <LuArrowUpRight
                                                    size={22}
                                                    className="flex-shrink-0 mt-0.5 text-gray-500 group-hover:text-brand-blue group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all"
                                                />
                                            </h3>
                                        </Link>

                                        {/* Tags */}
                                        {tags.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-5">
                                                {tags.map((t, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="px-4 py-1.5 rounded-full border border-gray-200 text-[13px] text-gray-700 bg-white"
                                                        style={{ fontFamily }}
                                                    >
                                                        {t}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {/* Read More button */}
                                        <Link
                                            href={href}
                                            className="mt-5 inline-flex items-center justify-center gap-2 py-3 rounded-lg bg-brand-dark hover:bg-[#12123a] text-white text-sm font-bold transition-colors"
                                            style={{ fontFamily }}
                                        >
                                            {isBn ? "বিস্তারিত পড়ুন" : "Read More"}
                                            <LuArrowRight size={14} />
                                        </Link>
                                    </div>
                                </motion.article>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
}
