"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
    LuCalendar, LuClock, LuArrowLeft, LuArrowRight, LuEye, LuTag, LuLoader
} from "react-icons/lu";
import { useLanguage } from "@/context/LanguageContext";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function BlogPostPage() {
    const params = useParams();
    const { language } = useLanguage();
    const [blog, setBlog] = useState(null);
    const [relatedPosts, setRelatedPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const isBn = language === 'bn';

    useEffect(() => {
        const fetchBlog = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${API_BASE}/api/blogs/slug/${params.slug}`);
                const data = await res.json();
                if (data.success && data.data) {
                    setBlog(data.data);
                    setRelatedPosts(data.data.relatedBlogs || []);
                }
            } catch (err) {
                console.error("Failed to fetch blog:", err);
            } finally {
                setLoading(false);
            }
        };
        if (params.slug) fetchBlog();
    }, [params.slug]);

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <LuLoader className="w-10 h-10 text-brand-accent animate-spin" />
            </div>
        );
    }

    if (!blog) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
                <h2 className="text-3xl font-bold text-gray-900 uppercase" style={{ fontFamily: 'Teko, sans-serif' }}>
                    {isBn ? 'ব্লগ পোস্ট পাওয়া যায়নি' : 'BLOG POST NOT FOUND'}
                </h2>
                <Link href="/blog" className="text-[#3590CF] hover:underline text-sm font-medium">
                    {isBn ? '← ব্লগে ফিরুন' : '← Back to Blog'}
                </Link>
            </div>
        );
    }

    const authorName = blog.author?.firstName
        ? `${blog.author.firstName} ${blog.author.lastName || ''}`
        : 'Visalink Air Team';

    const authorInitials = authorName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    return (
        <div className="min-h-screen bg-white">

            {/* ====== HERO SECTION — Left: Title & Meta | Right: Image ====== */}
            <section className="relative overflow-hidden border-b border-gray-200" style={{ background: 'linear-gradient(135deg, #f0f5fa 0%, #e8eff7 40%, #eef4f9 100%)' }}>
                {/* Background decorations */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#3590CF]/5 rounded-full blur-[120px] -mr-32 -mt-32" />
                    <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-brand-accent/5 rounded-full blur-[100px] -ml-20 -mb-20" />
                    <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                </div>

                <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
                    {/* Back button */}
                    <div className="pt-8 pb-4">
                        <Link
                            href="/blog"
                            className="inline-flex items-center gap-2 text-gray-400 hover:text-[#3590CF] transition-colors text-sm font-medium"
                            style={{ fontFamily: 'Poppins, sans-serif' }}
                        >
                            <LuArrowLeft className="w-4 h-4" />
                            {isBn ? 'ব্লগে ফিরুন' : 'Back to Blog'}
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center pb-12 lg:pb-16">
                        {/* LEFT — Title & Meta */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            {/* Tags pills */}
                            {blog.tags?.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-5">
                                    {blog.tags.slice(0, 3).map((tag) => (
                                        <span
                                            key={tag}
                                            className="px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border border-[#3590CF]/20 text-[#3590CF]/70 bg-[#3590CF]/5"
                                            style={{ fontFamily: 'Poppins, sans-serif' }}
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Title */}
                            <h1
                                className="text-3xl md:text-4xl lg:text-5xl xl:text-[3.5rem] font-bold text-gray-900 leading-[1.05] mb-6 uppercase"
                                style={{ fontFamily: 'Teko, sans-serif' }}
                            >
                                {isBn ? blog.titleBn || blog.title : blog.title}
                            </h1>

                            {/* Excerpt */}
                            <p
                                className="text-gray-500 text-sm md:text-[15px] leading-relaxed mb-8 max-w-lg"
                                style={{ fontFamily: 'Poppins, sans-serif' }}
                            >
                                {isBn ? blog.excerptBn || blog.excerpt : blog.excerpt}
                            </p>

                            {/* Author & Meta */}
                            <div className="flex flex-wrap items-center gap-5" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3590CF] to-[#2A74A8] flex items-center justify-center text-white text-xs font-bold shadow-md shadow-[#3590CF]/15">
                                        {authorInitials}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800">{authorName}</p>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">Author</p>
                                    </div>
                                </div>

                                <div className="h-8 w-px bg-gray-200 hidden sm:block" />

                                <div className="flex items-center gap-4 text-gray-400">
                                    <span className="flex items-center gap-1.5 text-xs font-medium">
                                        <LuCalendar className="w-3.5 h-3.5" />
                                        {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </span>
                                    <span className="flex items-center gap-1.5 text-xs font-medium">
                                        <LuClock className="w-3.5 h-3.5" />
                                        {blog.readingTime || 5} min read
                                    </span>
                                    <span className="flex items-center gap-1.5 text-xs font-medium">
                                        <LuEye className="w-3.5 h-3.5" />
                                        {blog.totalViews?.toLocaleString() || 0}
                                    </span>
                                </div>
                            </div>
                        </motion.div>

                        {/* RIGHT — Featured Image */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.15 }}
                            className="relative"
                        >
                            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-gray-300/40 border border-white/80">
                                <div className="aspect-[16/10]">
                                    <img
                                        src={blog.thumbnail}
                                        alt={blog.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                {/* Floating stat badge */}
                                <div className="absolute bottom-4 left-4 flex gap-2">
                                    <div className="backdrop-blur-xl bg-white/80 border border-white/90 rounded-lg px-3 py-1.5 flex items-center gap-1.5 shadow-sm">
                                        <LuEye className="w-3.5 h-3.5 text-gray-600" />
                                        <span className="text-gray-700 text-[10px] font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                            {blog.totalViews?.toLocaleString() || 0} {isBn ? 'ভিউ' : 'views'}
                                        </span>
                                    </div>
                                    <div className="backdrop-blur-xl bg-white/80 border border-white/90 rounded-lg px-3 py-1.5 flex items-center gap-1.5 shadow-sm">
                                        <LuClock className="w-3.5 h-3.5 text-gray-600" />
                                        <span className="text-gray-700 text-[10px] font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                            {blog.readingTime || 5} min
                                        </span>
                                    </div>
                                </div>
                            </div>
                            {/* Decorative ring */}
                            <div className="absolute -bottom-4 -right-4 w-32 h-32 border-2 border-brand-accent/15 rounded-2xl -z-10" />
                            <div className="absolute -top-3 -left-3 w-20 h-20 border-2 border-[#3590CF]/10 rounded-xl -z-10" />
                        </motion.div>
                    </div>
                </div>

            </section>

            {/* ====== CONTENT SECTION ====== */}
            <section className="py-10 md:py-14">
                <div className="max-w-7xl mx-auto px-6 lg:px-12">
                    <motion.article
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="prose prose-lg max-w-none 
                            prose-headings:font-bold prose-headings:text-gray-900 prose-headings:uppercase
                            prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-4
                            prose-p:text-gray-600 prose-p:leading-relaxed prose-p:text-[15px]
                            prose-li:text-gray-600 prose-li:text-[15px]
                            prose-a:text-[#3590CF] prose-a:no-underline hover:prose-a:underline
                            prose-strong:text-gray-800
                            prose-img:rounded-xl prose-img:shadow-lg"
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                        dangerouslySetInnerHTML={{ __html: isBn ? blog.contentBn || blog.content : blog.content }}
                    />

                    {/* Tags bottom */}
                    {blog.tags?.length > 0 && (
                        <div className="mt-14 pt-8 border-t border-gray-100">
                            <div className="flex items-center gap-2 mb-3">
                                <LuTag className="w-4 h-4 text-gray-400" />
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                    {isBn ? 'ট্যাগ' : 'Tags'}
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {blog.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="px-4 py-1.5 bg-gray-50 border border-gray-100 rounded-full text-xs font-semibold text-gray-500 hover:bg-[#3590CF]/5 hover:border-[#3590CF]/20 hover:text-[#3590CF] transition-all cursor-default"
                                        style={{ fontFamily: 'Poppins, sans-serif' }}
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* CTA Box */}
                    <div
                        className="mt-14 p-8 md:p-10 rounded-2xl relative overflow-hidden"
                        style={{ background: 'linear-gradient(135deg, #0a1628 0%, #1a3355 100%)' }}
                    >
                        <div className="absolute top-0 right-0 w-48 h-48 bg-[#3590CF]/10 rounded-full blur-[60px]" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-brand-accent/10 rounded-full blur-[50px]" />

                        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
                            <div className="flex-1">
                                <h3 className="text-2xl md:text-3xl font-bold text-white uppercase mb-2" style={{ fontFamily: 'Teko, sans-serif' }}>
                                    {isBn ? 'ভিসা সহায়তা প্রয়োজন?' : 'NEED VISA ASSISTANCE?'}
                                </h3>
                                <p className="text-white/50 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                    {isBn
                                        ? 'আমাদের বিশেষজ্ঞ টিম আপনাকে সব ধরনের ভিসা প্রসেসিংয়ে সাহায্য করবে।'
                                        : 'Our expert team is here to help you with all types of visa processing and documentation.'}
                                </p>
                            </div>
                            <Link
                                href="/contact"
                                className="inline-flex items-center gap-2 px-7 py-3.5 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all hover:-translate-y-0.5 shadow-lg shadow-brand-accent/30 shrink-0"
                                style={{ fontFamily: 'Poppins, sans-serif', background: 'linear-gradient(135deg, var(--color-brand-accent) 0%, #d67a20 100%)' }}
                            >
                                {isBn ? 'ফ্রি কনসাল্টেশন' : 'FREE CONSULTATION'} <LuArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ====== RELATED POSTS ====== */}
            {relatedPosts.length > 0 && (
                <section className="py-16 border-t border-gray-100" style={{ background: '#f8fafb' }}>
                    <div className="max-w-7xl mx-auto px-6 lg:px-12">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-1 h-8 rounded-full bg-brand-accent" />
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 uppercase" style={{ fontFamily: 'Teko, sans-serif' }}>
                                {isBn ? 'আরো পড়ুন' : 'MORE ARTICLES'}
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {relatedPosts.slice(0, 3).map((post, i) => (
                                <motion.div
                                    key={post._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                >
                                    <Link
                                        href={`/blog/${post.slug}`}
                                        className="group bg-white rounded-xl overflow-hidden border border-gray-100 hover:border-brand-accent/20 hover:shadow-xl transition-all duration-500 block"
                                    >
                                        <div className="aspect-[16/10] overflow-hidden">
                                            <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                        </div>
                                        <div className="p-5">
                                            <h3 className="font-bold text-gray-900 mt-1 line-clamp-2 uppercase group-hover:text-brand-accent transition-colors text-lg" style={{ fontFamily: 'Teko, sans-serif' }}>
                                                {isBn ? post.titleBn || post.title : post.title}
                                            </h3>
                                            <div className="flex items-center gap-3 text-xs text-gray-400 mt-3 font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                                <span className="flex items-center gap-1"><LuClock className="w-3 h-3" />{post.readingTime || 5} min</span>
                                                <span className="flex items-center gap-1"><LuEye className="w-3 h-3" />{post.totalViews?.toLocaleString() || 0}</span>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}
