"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { LuLoader, LuArrowLeft, LuShieldCheck } from "react-icons/lu";
import { useLanguage } from "@/context/LanguageContext";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/**
 * Shared renderer for dynamic legal pages (Privacy Policy, Refund Policy).
 * Content is admin-editable and fetched from /api/legal-policies/:type.
 */
export default function PolicyPage({ type }) {
    const { language } = useLanguage();
    const isBn = language === "bn";
    const bodyFont = isBn ? "Hind Siliguri, sans-serif" : "Poppins, sans-serif";
    const headingFont = isBn ? "Hind Siliguri, sans-serif" : "Teko, sans-serif";

    const [policy, setPolicy] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        const fetchPolicy = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${API_BASE}/api/legal-policies/${type}`);
                const data = await res.json();
                if (active && data.success && data.data) setPolicy(data.data);
            } catch (err) {
                console.error("Failed to fetch policy:", err);
            } finally {
                if (active) setLoading(false);
            }
        };
        fetchPolicy();
        return () => { active = false; };
    }, [type]);

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <LuLoader className="w-10 h-10 text-brand-accent animate-spin" />
            </div>
        );
    }

    const title = isBn ? (policy?.title?.bn || policy?.title?.en) : policy?.title?.en;
    const content = isBn ? (policy?.content?.bn || policy?.content?.en) : policy?.content?.en;
    const updatedAt = policy?.updatedAt
        ? new Date(policy.updatedAt).toLocaleDateString(isBn ? "bn-BD" : "en-US", {
            year: "numeric", month: "long", day: "numeric",
        })
        : null;

    return (
        <div className="min-h-screen bg-white">
            {/* ===== HERO ===== */}
            <section
                className="relative overflow-hidden border-b border-gray-200"
                style={{ background: "linear-gradient(135deg, #f0f5fa 0%, #e8eff7 40%, #eef4f9 100%)" }}
            >
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#3590CF]/5 rounded-full blur-[120px] -mr-32 -mt-32" />
                    <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-brand-accent/5 rounded-full blur-[100px] -ml-20 -mb-20" />
                </div>
                <div className="max-w-4xl mx-auto px-6 lg:px-12 relative z-10 py-12 lg:py-16">
                    <div className="pb-4">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 text-gray-400 hover:text-[#3590CF] transition-colors text-sm font-medium"
                            style={{ fontFamily: "Poppins, sans-serif" }}
                        >
                            <LuArrowLeft className="w-4 h-4" />
                            {isBn ? "হোমে ফিরুন" : "Back to Home"}
                        </Link>
                    </div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#3590CF]/20 bg-[#3590CF]/5 mb-4">
                            <LuShieldCheck className="w-3.5 h-3.5 text-[#3590CF]" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#3590CF]" style={{ fontFamily: "Poppins, sans-serif" }}>
                                {isBn ? "লিগ্যাল" : "Legal"}
                            </span>
                        </div>
                        <h1
                            className="text-3xl md:text-5xl font-bold text-gray-900 leading-[1.05] uppercase"
                            style={{ fontFamily: headingFont }}
                        >
                            {title}
                        </h1>
                        {updatedAt && (
                            <p className="text-gray-400 text-xs mt-3" style={{ fontFamily: "Poppins, sans-serif" }}>
                                {isBn ? "সর্বশেষ আপডেট: " : "Last updated: "}{updatedAt}
                            </p>
                        )}
                    </motion.div>
                </div>
            </section>

            {/* ===== CONTENT ===== */}
            <section className="py-10 md:py-14">
                <div className="max-w-4xl mx-auto px-6 lg:px-12">
                    {content ? (
                        <article
                            className="prose prose-lg max-w-none
                                prose-headings:font-bold prose-headings:text-gray-900
                                prose-h2:text-xl prose-h2:mt-9 prose-h2:mb-3
                                prose-p:text-gray-600 prose-p:leading-relaxed prose-p:text-[15px]
                                prose-li:text-gray-600 prose-li:text-[15px]
                                prose-a:text-[#3590CF] prose-a:no-underline hover:prose-a:underline
                                prose-strong:text-gray-800"
                            style={{ fontFamily: bodyFont }}
                            dangerouslySetInnerHTML={{ __html: content }}
                        />
                    ) : (
                        <p className="text-gray-400 text-center py-16" style={{ fontFamily: bodyFont }}>
                            {isBn ? "কন্টেন্ট শীঘ্রই যোগ করা হবে।" : "Content coming soon."}
                        </p>
                    )}
                </div>
            </section>
        </div>
    );
}
