"use client";

// ===================================================================
// Visa Page Banner — the single image shown under the navbar on EVERY
// visa details page (/visa/details/tourist/* and /student/*).
//
// Stored on the site-settings singleton, which the whole app already
// loads through SiteSettingsContext — so changing it here updates every
// visa page at once with no extra request anywhere on the public site.
// ===================================================================

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
    FiImage, FiLoader, FiSave, FiRotateCcw, FiExternalLink, FiInfo,
} from "react-icons/fi";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import ImageInput from "@/components/shared/ImageInput";
import { apiFetch } from "@/services/api";

// Ships as the out-of-the-box banner; the Reset button restores it.
const DEFAULT_BANNER =
    "https://images.unsplash.com/photo-1524661135-423995f22d0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1353&q=80";

export default function VisaBannerPage() {
    const { settings, loading, refetch } = useSiteSettings();

    const [value, setValue] = useState("");
    const [initial, setInitial] = useState("");
    const [saving, setSaving] = useState(false);

    // Seed from context once it has loaded. Guarded on `loading` so the
    // field isn't briefly populated with the placeholder default and then
    // saved over the admin's real value.
    useEffect(() => {
        if (loading) return;
        const v = settings.visaBannerImage || "";
        setValue(v);
        setInitial(v);
    }, [loading, settings.visaBannerImage]);

    const dirty = value !== initial;

    const save = async () => {
        setSaving(true);
        try {
            await apiFetch("/api/settings", {
                method: "PATCH",
                body: JSON.stringify({ visaBannerImage: value.trim() }),
            });
            setInitial(value);
            await refetch();          // push the new banner into every page
            toast.success("Banner updated — it is live on all visa pages now");
        } catch (err) {
            toast.error(err.message || "Could not save the banner");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center">
                <FiLoader className="w-6 h-6 text-[#1D4ED8] animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-xl bg-brand-accent/10 text-brand-accent flex items-center justify-center flex-shrink-0">
                    <FiImage className="w-5 h-5" />
                </div>
                <div>
                    <h1 className="text-2xl font-black text-brand-dark" style={{ fontFamily: "Teko, sans-serif" }}>
                        VISA PAGE BANNER
                    </h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                        One image, shown under the navbar on every Tourist &amp; Student visa details page.
                    </p>
                </div>
            </div>

            {/* Editor card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 mb-5">
                <ImageInput
                    label="Banner Image"
                    value={value}
                    onChange={setValue}
                    placeholder="https://…  or click Upload"
                    hint="Wide, landscape images work best — around 1400×400 or wider. Upload a file or paste any image URL."
                    thumbSize={56}
                />

                <div className="flex flex-wrap items-center gap-2 mt-5 pt-5 border-t border-gray-100">
                    <button
                        onClick={save}
                        disabled={saving || !dirty}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-accent hover:brightness-110 text-white text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {saving ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiSave className="w-4 h-4" />}
                        {saving ? "Saving…" : "Save Banner"}
                    </button>

                    <button
                        onClick={() => setValue(DEFAULT_BANNER)}
                        disabled={saving || value === DEFAULT_BANNER}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 disabled:opacity-40"
                    >
                        <FiRotateCcw className="w-4 h-4" /> Reset to default
                    </button>

                    {dirty && (
                        <span className="text-[12px] text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2.5 py-1.5">
                            Unsaved changes
                        </span>
                    )}

                    <Link
                        href="/visa/details/tourist/singapore"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-auto inline-flex items-center gap-1.5 text-[12px] font-semibold text-brand-accent-ink hover:underline"
                    >
                        View a live page <FiExternalLink size={12} />
                    </Link>
                </div>
            </div>

            {/* Live preview — mirrors the real hero: image + blue overlay */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
                    <FiImage className="w-4 h-4 text-gray-400" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                        Preview
                    </span>
                    <span className="text-[11px] text-gray-400 ml-auto">
                        Shown with the same blue overlay the real page uses
                    </span>
                </div>

                <div
                    className="relative min-h-[190px] flex items-end"
                    style={{
                        backgroundImage: value
                            ? `linear-gradient(135deg, rgba(31,26,23,0.88) 0%, rgba(45,38,33,0.82) 55%, rgba(31,26,23,0.88) 100%), url("${value}")`
                            : "linear-gradient(135deg, #1f1a17 0%, #2d2621 55%, #1f1a17 100%)",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                    }}
                >
                    <div className="p-6 text-white">
                        <p className="text-[11px] text-white mb-1.5">Home / Tourism Visa / Singapore</p>
                        <p className="text-[20px] font-bold leading-snug">
                            🇸🇬 Apply online for Singapore Tourist Visa from Bangladesh
                        </p>
                    </div>
                </div>

                {!value && (
                    <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-start gap-2">
                        <FiInfo className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                        <p className="text-[12px] text-gray-500">
                            No banner set — visa pages fall back to the plain blue gradient.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
