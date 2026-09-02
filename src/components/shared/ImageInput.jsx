"use client";

// ===================================================================
// ImageInput / ImageGalleryInput
//
// একটাই কম্পোনেন্ট দিয়ে ছবির কাজ — লিংক বসানো যায়, আবার ফাইল আপলোডও
// করা যায়, আর পাশেই ছোট প্রিভিউ দেখা যায়।
//
// আপলোড হওয়া ছবি ব্যাক-এন্ডে relative path হিসেবে জমা হয় (/uploads/...),
// পুরো URL নয় — ফলে ডোমেইন বদলালেও পুরোনো ছবি ভাঙে না। next.config.mjs
// এর rewrite ওই path গুলো API-তে proxy করে, তাই <img src="/uploads/..">
// সরাসরিই কাজ করে।
// ===================================================================

import { useRef, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { FiImage, FiLoader, FiUploadCloud, FiX } from "react-icons/fi";
import { selectToken } from "@/redux/features/authSlice";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ব্যাক-এন্ডের imageFileFilter যা নেয় ঠিক সেটাই — এখানে আগে আটকে দিলে
// ইউজার সাথে সাথে জানতে পারে, সার্ভারে গিয়ে ৪০০ খেয়ে ফিরতে হয় না।
const ACCEPTED = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "image/avif", "image/heic", "image/heif"];
const MAX_BYTES = 10 * 1024 * 1024;

// iPhone-এর HEIC ফাইলে ব্রাউজার প্রায়ই খালি mimetype পাঠায়, তাই extension
// দেখেও একবার যাচাই করা হয় — নাহলে আসল ছবিও "unsupported" বলে আটকে যেত।
const EXT_OK = /\.(jpe?g|png|gif|webp|avif|heic|heif)$/i;

const isAcceptable = (file) =>
    (file.type ? ACCEPTED.includes(file.type.toLowerCase()) : false) || EXT_OK.test(file.name || "");

/**
 * একটি ফাইল সার্ভারে পাঠায় এবং সেভ হওয়া relative URL ফেরত দেয়।
 * ভুল টাইপ / বড় ফাইল এখানেই ধরা পড়ে, তাই কলার শুধু URL নিয়ে ভাবে।
 */
export async function uploadImageFile(file, token) {
    if (!isAcceptable(file)) {
        throw new Error("শুধু JPG, PNG, GIF, WEBP, AVIF বা HEIC ছবি দেওয়া যাবে");
    }
    if (file.size > MAX_BYTES) {
        throw new Error(`ছবিটি ${(file.size / 1024 / 1024).toFixed(1)}MB — সর্বোচ্চ ১০MB পর্যন্ত চলবে`);
    }

    const fd = new FormData();
    fd.append("image", file);

    const res = await fetch(`${API_BASE}/api/upload/single`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
    });

    let json;
    try {
        json = await res.json();
    } catch {
        throw new Error(`আপলোড ব্যর্থ (সার্ভার ${res.status})`);
    }
    if (!res.ok || !json?.success) throw new Error(json?.message || "আপলোড ব্যর্থ");

    return json.data.url;
}

// ─── ছোট প্রিভিউ থাম্বনেইল ───────────────────────────────────────────
// ছবি না থাকলে বা লিংক ভাঙা হলে একটা placeholder দেখায়, যাতে অ্যাডমিন
// সাথে সাথে বোঝে লিংকটা কাজ করছে না।
function Thumb({ src, size = 44, onClear }) {
    const [broken, setBroken] = useState(false);
    const key = src || "";

    return (
        <div
            className="relative flex-shrink-0 rounded-md border border-gray-200 bg-gray-50 overflow-hidden group"
            style={{ width: size, height: size }}
        >
            {src && !broken ? (
                <>
                    <img
                        key={key}
                        src={src}
                        alt="preview"
                        className="w-full h-full object-cover"
                        onError={() => setBroken(true)}
                        onLoad={() => setBroken(false)}
                    />
                    {onClear && (
                        <button
                            type="button"
                            onClick={onClear}
                            title="Remove image"
                            className="absolute inset-0 bg-black/55 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                        >
                            <FiX size={14} />
                        </button>
                    )}
                </>
            ) : (
                <div
                    className={`w-full h-full flex items-center justify-center ${src && broken ? "text-red-300" : "text-gray-300"}`}
                    title={src && broken ? "এই লিংকের ছবি লোড হচ্ছে না" : "কোনো ছবি নেই"}
                >
                    <FiImage size={Math.round(size * 0.4)} />
                </div>
            )}
        </div>
    );
}

/**
 * একটি ছবির ফিল্ড — প্রিভিউ + URL বক্স + Upload বাটন।
 *
 * value / onChange plain string নিয়ে কাজ করে, তাই যেকোনো ফর্মে
 * আগের `<input name="image">` এর জায়গায় সরাসরি বসিয়ে দেওয়া যায়।
 */
export default function ImageInput({
    label = "Image",
    value = "",
    onChange,
    placeholder = "https://... অথবা Upload চাপুন",
    hint,
    inputClass,
    labelClass,
    thumbSize = 44,
    disabled = false,
}) {
    const token = useSelector(selectToken);
    const [uploading, setUploading] = useState(false);
    const fileRef = useRef(null);

    const handleFile = async (file) => {
        if (!file) return;
        setUploading(true);
        const t = toast.loading("ছবি আপলোড হচ্ছে...");
        try {
            const url = await uploadImageFile(file, token);
            onChange(url);
            toast.success("ছবি আপলোড হয়েছে", { id: t });
        } catch (err) {
            toast.error(err.message, { id: t });
        } finally {
            setUploading(false);
            // একই ছবি পরপর দুবার বাছলেও যেন onChange ট্রিগার হয়
            if (fileRef.current) fileRef.current.value = "";
        }
    };

    const defaultInput =
        "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-brand-blue bg-transparent";
    const defaultLabel = "text-[11px] font-bold uppercase text-gray-400 mb-1.5 block";

    return (
        <div>
            {label && <label className={labelClass || defaultLabel}>{label}</label>}

            <div className="flex items-center gap-2">
                <Thumb src={value} size={thumbSize} onClear={value ? () => onChange("") : undefined} />

                <input
                    type="text"
                    value={value || ""}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={`flex-1 min-w-0 ${inputClass || defaultInput}`}
                />

                <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={disabled || uploading}
                    className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-2.5 rounded-lg bg-brand-blue text-white text-[12px] font-bold hover:opacity-90 disabled:opacity-50 cursor-pointer"
                >
                    {uploading ? <FiLoader size={13} className="animate-spin" /> : <FiUploadCloud size={13} />}
                    {uploading ? "Uploading..." : "Upload"}
                </button>

                <input
                    ref={fileRef}
                    type="file"
                    accept="image/*,.heic,.heif"
                    className="hidden"
                    onChange={(e) => handleFile(e.target.files?.[0])}
                />
            </div>

            {hint && <p className="mt-1 text-[10px] text-gray-400">{hint}</p>}
        </div>
    );
}

/**
 * একাধিক ছবির ফিল্ড (ট্যুর/হোটেলের gallery)।
 * একসাথে কয়েকটা ফাইল বাছা যায়; প্রতিটার প্রিভিউ থাকে, hover করলে ✕ আসে।
 */
export function ImageGalleryInput({
    label = "Gallery",
    value = [],
    onChange,
    hint = "একসাথে কয়েকটা ছবি বাছতে পারেন",
    labelClass,
    disabled = false,
}) {
    const token = useSelector(selectToken);
    const [uploading, setUploading] = useState(false);
    const [urlDraft, setUrlDraft] = useState("");
    const fileRef = useRef(null);

    const images = Array.isArray(value) ? value : [];
    const defaultLabel = "text-[11px] font-bold uppercase text-gray-400 mb-1.5 block";

    const handleFiles = async (fileList) => {
        const files = Array.from(fileList || []);
        if (!files.length) return;

        setUploading(true);
        const t = toast.loading(`${files.length}টি ছবি আপলোড হচ্ছে...`);
        try {
            // একটা ছবি ব্যর্থ হলেও বাকিগুলো যেন জমা হয় — তাই allSettled।
            const results = await Promise.allSettled(files.map((f) => uploadImageFile(f, token)));
            const added = results.filter((r) => r.status === "fulfilled").map((r) => r.value);
            const failed = results.filter((r) => r.status === "rejected");

            if (added.length) onChange([...images, ...added]);

            if (failed.length && added.length) {
                toast.success(`${added.length}টি যোগ হয়েছে, ${failed.length}টি ব্যর্থ`, { id: t });
                toast.error(failed[0].reason?.message || "কিছু ছবি আপলোড হয়নি");
            } else if (failed.length) {
                toast.error(failed[0].reason?.message || "আপলোড ব্যর্থ", { id: t });
            } else {
                toast.success(`${added.length}টি ছবি যোগ হয়েছে`, { id: t });
            }
        } finally {
            setUploading(false);
            if (fileRef.current) fileRef.current.value = "";
        }
    };

    const addUrl = () => {
        const url = urlDraft.trim();
        if (!url) return;
        onChange([...images, url]);
        setUrlDraft("");
    };

    return (
        <div>
            {label && <label className={labelClass || defaultLabel}>{label}</label>}

            {images.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                    {images.map((src, i) => (
                        <Thumb
                            key={`${src}-${i}`}
                            src={src}
                            size={64}
                            onClear={() => onChange(images.filter((_, x) => x !== i))}
                        />
                    ))}
                </div>
            )}

            <div className="flex items-center gap-2">
                <input
                    type="text"
                    value={urlDraft}
                    onChange={(e) => setUrlDraft(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            addUrl();
                        }
                    }}
                    placeholder="https://... লিখে Enter চাপুন"
                    disabled={disabled}
                    className="flex-1 min-w-0 px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-brand-blue bg-transparent"
                />
                <button
                    type="button"
                    onClick={addUrl}
                    disabled={disabled || !urlDraft.trim()}
                    className="flex-shrink-0 px-3 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-[12px] font-bold hover:bg-gray-50 disabled:opacity-40 cursor-pointer"
                >
                    Add URL
                </button>
                <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={disabled || uploading}
                    className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-2.5 rounded-lg bg-brand-blue text-white text-[12px] font-bold hover:opacity-90 disabled:opacity-50 cursor-pointer"
                >
                    {uploading ? <FiLoader size={13} className="animate-spin" /> : <FiUploadCloud size={13} />}
                    {uploading ? "Uploading..." : "Upload"}
                </button>
                <input
                    ref={fileRef}
                    type="file"
                    accept="image/*,.heic,.heif"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFiles(e.target.files)}
                />
            </div>

            {hint && <p className="mt-1 text-[10px] text-gray-400">{hint}</p>}
        </div>
    );
}
