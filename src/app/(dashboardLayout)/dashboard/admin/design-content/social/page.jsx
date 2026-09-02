"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
    FiSave,
    FiLoader,
    FiRefreshCw,
} from "react-icons/fi";
import {
    FaFacebookF,
    FaInstagram,
    FaTwitter,
    FaYoutube,
    FaLinkedin,
    FaTiktok,
} from "react-icons/fa";
import { selectToken } from "@/redux/features/authSlice";
import { useSiteSettings } from "@/context/SiteSettingsContext";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const socialFields = [
    { key: "facebook", label: "Facebook", icon: FaFacebookF, color: "#1877F2", placeholder: "https://facebook.com/your-page" },
    { key: "instagram", label: "Instagram", icon: FaInstagram, color: "#E4405F", placeholder: "https://instagram.com/your-handle" },
    { key: "twitter", label: "Twitter / X", icon: FaTwitter, color: "#1DA1F2", placeholder: "https://twitter.com/your-handle" },
    { key: "youtube", label: "YouTube", icon: FaYoutube, color: "#FF0000", placeholder: "https://youtube.com/@your-channel" },
    { key: "linkedin", label: "LinkedIn", icon: FaLinkedin, color: "#0A66C2", placeholder: "https://linkedin.com/company/your-page" },
    { key: "tiktok", label: "TikTok", icon: FaTiktok, color: "#000000", placeholder: "https://tiktok.com/@your-handle" },
];

export default function SocialLinksPage() {
    const token = useSelector(selectToken);
    const { settings: liveSettings, refetch } = useSiteSettings();

    const [form, setForm] = useState({
        social: {
            facebook: "",
            instagram: "",
            twitter: "",
            youtube: "",
            linkedin: "",
            tiktok: "",
        },
    });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setForm({
            social: {
                facebook: liveSettings.social?.facebook || "",
                instagram: liveSettings.social?.instagram || "",
                twitter: liveSettings.social?.twitter || "",
                youtube: liveSettings.social?.youtube || "",
                linkedin: liveSettings.social?.linkedin || "",
                tiktok: liveSettings.social?.tiktok || "",
            },
        });
    }, [liveSettings]);

    const reload = async () => {
        setLoading(true);
        await refetch();
        setLoading(false);
        toast.success("Settings refreshed");
    };

    const handleSocial = (key, value) => {
        setForm((prev) => ({ ...prev, social: { ...prev.social, [key]: value } }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch(`${API_BASE}/api/settings`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok || !data.success) throw new Error(data.message || "Save failed");
            toast.success("Social links saved successfully");
            await refetch();
        } catch (err) {
            toast.error(err.message || "Save failed");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div>
                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                        <span>Design & Content</span>
                        <span>/</span>
                        <span className="text-gray-600 font-medium">Social Links</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Social Media Links</h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                        Manage social media links shown in Footer, Navbar & across the website
                    </p>
                </div>
                <button
                    type="button"
                    onClick={reload}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer disabled:opacity-50"
                >
                    <FiRefreshCw className={loading ? "animate-spin" : ""} />
                    Refresh
                </button>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
                <section className="bg-white rounded-xl border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-1">Social Media Links</h2>
                    <p className="text-xs text-gray-500 mb-5">
                        Leave empty to hide an icon from the site
                    </p>

                    <div className="space-y-3">
                        {socialFields.map((s) => (
                            <div key={s.key} className="flex items-center gap-3">
                                <span
                                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white flex-shrink-0"
                                    style={{ backgroundColor: s.color }}
                                >
                                    <s.icon size={16} />
                                </span>
                                <div className="flex-1 min-w-0">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                                        {s.label}
                                    </label>
                                    <input
                                        type="url"
                                        value={form.social[s.key]}
                                        onChange={(e) => handleSocial(s.key, e.target.value)}
                                        placeholder={s.placeholder}
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-3 bg-brand-blue hover:bg-brand-blue-hover disabled:bg-gray-300 text-white font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                        {saving ? <FiLoader className="animate-spin" /> : <FiSave />}
                        {saving ? "Saving..." : "Save Social Links"}
                    </button>
                </div>
            </form>
        </div>
    );
}
