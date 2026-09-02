"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { FiSave, FiLoader, FiRefreshCw, FiExternalLink, FiShield, FiRotateCcw } from "react-icons/fi";
import { selectToken } from "@/redux/features/authSlice";

const ReactQuill = dynamic(() => import("react-quill-new"), {
    ssr: false,
    loading: () => <div className="h-[300px] bg-gray-50 rounded-lg animate-pulse" />,
});
import "react-quill-new/dist/quill.snow.css";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const POLICY_TABS = [
    { type: "privacy", label: "Privacy Policy", href: "/privacy-policy", icon: FiShield },
    { type: "refund", label: "Refund & Cancellation", href: "/refund-policy", icon: FiRotateCcw },
];

const LANG_TABS = [
    { key: "en", label: "English" },
    { key: "bn", label: "বাংলা" },
];

const QUILL_MODULES = {
    toolbar: [
        [{ header: [2, 3, false] }],
        ["bold", "italic", "underline"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link"],
        ["clean"],
    ],
};

const emptyPolicy = () => ({ title: { en: "", bn: "" }, content: { en: "", bn: "" } });

export default function LegalDesignPage() {
    const token = useSelector(selectToken);

    const [policies, setPolicies] = useState({ privacy: emptyPolicy(), refund: emptyPolicy() });
    const [activeType, setActiveType] = useState("privacy");
    const [activeLang, setActiveLang] = useState("en");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const loadPolicies = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/legal-policies`);
            const data = await res.json();
            if (!res.ok || !data.success) throw new Error(data.message || "Failed to load policies");
            const next = { privacy: emptyPolicy(), refund: emptyPolicy() };
            (data.data || []).forEach((p) => {
                if (next[p.type]) {
                    next[p.type] = {
                        title: { en: p.title?.en || "", bn: p.title?.bn || "" },
                        content: { en: p.content?.en || "", bn: p.content?.bn || "" },
                    };
                }
            });
            setPolicies(next);
        } catch (err) {
            toast.error(err.message || "Failed to load policies");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPolicies();
    }, []);

    const setField = (field, value) => {
        setPolicies((prev) => ({
            ...prev,
            [activeType]: {
                ...prev[activeType],
                [field]: { ...prev[activeType][field], [activeLang]: value },
            },
        }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const current = policies[activeType];
        if (!current.title.en.trim() && !current.title.bn.trim()) {
            toast.error("Please add a title (at least one language)");
            return;
        }
        setSaving(true);
        try {
            const res = await fetch(`${API_BASE}/api/legal-policies/${activeType}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ title: current.title, content: current.content }),
            });
            const data = await res.json();
            if (!res.ok || !data.success) throw new Error(data.message || "Save failed");
            toast.success(`${activeType === "privacy" ? "Privacy" : "Refund"} policy saved`);
        } catch (err) {
            toast.error(err.message || "Save failed");
        } finally {
            setSaving(false);
        }
    };

    const activeTab = POLICY_TABS.find((t) => t.type === activeType);
    const current = policies[activeType];

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div>
                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                        <span>Design & Content</span>
                        <span>/</span>
                        <span className="text-gray-600 font-medium">Legal Pages</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Legal Pages</h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                        Edit the Privacy Policy & Refund/Cancellation Policy shown on the public site (English & Bangla)
                    </p>
                </div>
                <button
                    type="button"
                    onClick={loadPolicies}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer disabled:opacity-50"
                >
                    <FiRefreshCw className={loading ? "animate-spin" : ""} />
                    Refresh
                </button>
            </div>

            {/* Policy type tabs */}
            <div className="flex flex-wrap gap-2 mb-5">
                {POLICY_TABS.map((tab) => (
                    <button
                        key={tab.type}
                        type="button"
                        onClick={() => setActiveType(tab.type)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border transition-colors cursor-pointer ${activeType === tab.type
                            ? "bg-brand-blue text-white border-brand-blue"
                            : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex justify-center py-24">
                    <FiLoader className="w-8 h-8 text-brand-blue animate-spin" />
                </div>
            ) : (
                <form onSubmit={handleSave} className="space-y-5">
                    <section className="bg-white rounded-xl border border-gray-100 p-6">
                        {/* Language tabs + live link */}
                        <div className="flex items-center justify-between gap-3 mb-5">
                            <div className="inline-flex rounded-lg border border-gray-200 p-0.5 bg-gray-50">
                                {LANG_TABS.map((lang) => (
                                    <button
                                        key={lang.key}
                                        type="button"
                                        onClick={() => setActiveLang(lang.key)}
                                        className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors cursor-pointer ${activeLang === lang.key ? "bg-white text-brand-blue shadow-sm" : "text-gray-500"
                                            }`}
                                    >
                                        {lang.label}
                                    </button>
                                ))}
                            </div>
                            <Link
                                href={activeTab.href}
                                target="_blank"
                                className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-brand-blue"
                            >
                                <FiExternalLink className="w-3.5 h-3.5" />
                                View live page
                            </Link>
                        </div>

                        {/* Title */}
                        <div className="mb-5">
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                                Page Title ({activeLang === "en" ? "English" : "বাংলা"})
                            </label>
                            <input
                                type="text"
                                value={current.title[activeLang]}
                                onChange={(e) => setField("title", e.target.value)}
                                placeholder={activeLang === "en" ? "Privacy Policy" : "প্রাইভেসি পলিসি"}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 transition-all"
                            />
                        </div>

                        {/* Content */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                                Content ({activeLang === "en" ? "English" : "বাংলা"})
                            </label>
                            <ReactQuill
                                key={`${activeType}-${activeLang}`}
                                theme="snow"
                                value={current.content[activeLang]}
                                onChange={(html) => setField("content", html)}
                                modules={QUILL_MODULES}
                                className="bg-white [&_.ql-editor]:min-h-[320px]"
                            />
                            <p className="text-[11px] text-gray-400 mt-2">
                                Tip: switch the English / বাংলা tab to edit both versions. Both are saved together when you click Save.
                            </p>
                        </div>
                    </section>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center gap-2 px-6 py-3 bg-brand-blue hover:bg-brand-blue-hover disabled:bg-gray-300 text-white font-semibold rounded-lg transition-colors cursor-pointer"
                        >
                            {saving ? <FiLoader className="animate-spin" /> : <FiSave />}
                            {saving ? "Saving..." : `Save ${activeTab.label}`}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
