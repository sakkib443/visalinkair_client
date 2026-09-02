"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { selectToken } from "@/redux/features/authSlice";
import { FiFileText, FiArrowLeft, FiSave, FiLoader, FiUploadCloud, FiLink, FiImage } from "react-icons/fi";
import dynamic from "next/dynamic";
// Shared SEO editor — same component the edit page uses.
import SeoSection from "../_shared/SeoSection";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false, loading: () => <div className="h-[300px] bg-gray-50 rounded-lg animate-pulse" /> });
import "react-quill-new/dist/quill.snow.css";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ========== Image Upload Helper ==========
async function uploadToCloudinary(file, token) {
    const formData = new FormData();
    formData.append("image", file);
    const res = await fetch(`${API_BASE}/api/upload/single`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || "Upload failed");
    return data.data.url;
}

// ========== Quill formats ==========
const quillFormats = [
    "header", "font", "bold", "italic", "underline", "strike",
    "color", "background", "align", "list", "bullet",
    "blockquote", "code-block", "link", "image", "video",
    "indent", "direction",
];

export default function CreateBlogPage() {
    const router = useRouter();
    const token = useSelector(selectToken);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("en");
    const [thumbnailUploading, setThumbnailUploading] = useState(false);
    const [thumbnailMode, setThumbnailMode] = useState("upload"); // upload | link
    const quillRefEn = useRef(null);
    const quillRefBn = useRef(null);

    const [formData, setFormData] = useState({
        title: "",
        titleBn: "",
        slug: "",
        content: "",
        contentBn: "",
        excerpt: "",
        excerptBn: "",
        thumbnail: "",
        tags: "",
        status: "draft",
        // SEO — all three optional; server auto-fills any blank field
        // from title / excerpt / content / tags on save.
        metaTitle: "",
        metaDescription: "",
        metaKeywords: "",
    });

    const generateSlug = (title) => title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");

    // ========== Thumbnail Upload ==========
    const handleThumbnailUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) { toast.error("Please select an image file"); return; }

        setThumbnailUploading(true);
        try {
            const url = await uploadToCloudinary(file, token);
            setFormData(prev => ({ ...prev, thumbnail: url }));
            toast.success("Thumbnail uploaded!");
        } catch (err) {
            toast.error(err.message || "Upload failed");
        } finally {
            setThumbnailUploading(false);
        }
    };

    // ========== Quill Image Handler (custom toolbar button) ==========
    const imageHandler = useCallback((quillRef) => {
        const input = document.createElement("input");
        input.setAttribute("type", "file");
        input.setAttribute("accept", "image/*");
        input.click();

        input.onchange = async () => {
            const file = input.files?.[0];
            if (!file) return;
            const editor = quillRef.current?.getEditor();
            if (!editor) return;

            const loadingToast = toast.loading("Uploading image...");
            try {
                const url = await uploadToCloudinary(file, token);
                const range = editor.getSelection(true);
                editor.insertEmbed(range.index, "image", url);
                editor.setSelection(range.index + 1);
                toast.success("Image inserted!", { id: loadingToast });
            } catch (err) {
                toast.error(err.message || "Upload failed", { id: loadingToast });
            }
        };
    }, [token]);

    // Quill modules with custom image handler
    const getQuillModules = useCallback((quillRef) => ({
        toolbar: {
            container: [
                [{ header: [1, 2, 3, 4, false] }],
                [{ font: [] }],
                ["bold", "italic", "underline", "strike"],
                [{ color: [] }, { background: [] }],
                [{ align: [] }],
                [{ list: "ordered" }, { list: "bullet" }],
                ["blockquote", "code-block"],
                ["link", "image", "video"],
                [{ indent: "-1" }, { indent: "+1" }],
                ["clean"],
            ],
            handlers: {
                image: () => imageHandler(quillRef),
            },
        },
    }), [imageHandler]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title.trim()) { toast.error("Title is required"); return; }
        if (!formData.excerpt.trim() || formData.excerpt.trim().length < 20) { toast.error("Excerpt must be at least 20 characters"); return; }
        if (!formData.content.trim() || formData.content.replace(/<[^>]*>/g, '').trim().length < 100) { toast.error("Content must be at least 100 characters"); return; }
        if (!formData.thumbnail.trim()) { toast.error("Thumbnail is required"); return; }

        setLoading(true);
        try {
            const payload = {
                ...formData,
                tags: formData.tags ? formData.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
                // Keywords are typed as a comma-separated string; backend expects an array.
                metaKeywords: formData.metaKeywords
                    ? formData.metaKeywords.split(",").map(k => k.trim()).filter(Boolean)
                    : [],
            };

            const res = await fetch(`${API_BASE}/api/blogs`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (res.ok && data.success) {
                toast.success("Blog post created!");
                router.push("/dashboard/admin/blog");
            } else {
                toast.error(data.message || "Failed to create post");
            }
        } catch {
            toast.error("Error creating post");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 lg:p-8 max-w-5xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/dashboard/admin/blog" className="p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                    <FiArrowLeft size={20} />
                </Link>
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                        <FiFileText className="text-white text-xl" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Blog Post</h1>
                        <p className="text-sm text-gray-500">Write a new blog article</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="w-full">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 space-y-6">

                    {/* Language Tabs */}
                    <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg w-fit">
                        <button type="button" onClick={() => setActiveTab("en")} className={`px-5 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${activeTab === "en" ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                            🇬🇧 English
                        </button>
                        <button type="button" onClick={() => setActiveTab("bn")} className={`px-5 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${activeTab === "bn" ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                            🇧🇩 বাংলা
                        </button>
                    </div>

                    {/* English Fields */}
                    {activeTab === "en" && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-sm font-bold text-gray-500 uppercase block mb-2">Title *</label>
                                    <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value, slug: generateSlug(e.target.value) })} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-brand-dark focus:ring-1 focus:ring-brand-dark/10" placeholder="Blog title in English" required />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-gray-500 uppercase block mb-2">Slug</label>
                                    <input type="text" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none font-mono focus:border-brand-dark focus:ring-1 focus:ring-brand-dark/10" />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-bold text-gray-500 uppercase block mb-2">Excerpt *</label>
                                <textarea value={formData.excerpt} onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })} rows={3} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none resize-none focus:border-brand-dark focus:ring-1 focus:ring-brand-dark/10" placeholder="Brief summary (min 20 chars)..." />
                            </div>

                            <div>
                                <label className="text-sm font-bold text-gray-500 uppercase block mb-2">Content * <span className="text-gray-400 normal-case font-normal">— Click 📷 in toolbar to upload images</span></label>
                                <div className="blog-editor">
                                    <ReactQuill
                                        ref={quillRefEn}
                                        theme="snow"
                                        value={formData.content}
                                        onChange={(val) => setFormData({ ...formData, content: val })}
                                        modules={getQuillModules(quillRefEn)}
                                        formats={quillFormats}
                                        placeholder="Write your blog content here..."
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Bangla Fields */}
                    {activeTab === "bn" && (
                        <div className="space-y-6">
                            <div>
                                <label className="text-sm font-bold text-gray-500 uppercase block mb-2">শিরোনাম (Bangla)</label>
                                <input type="text" value={formData.titleBn} onChange={(e) => setFormData({ ...formData, titleBn: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-brand-dark focus:ring-1 focus:ring-brand-dark/10" placeholder="বাংলায় ব্লগের শিরোনাম" />
                            </div>

                            <div>
                                <label className="text-sm font-bold text-gray-500 uppercase block mb-2">সারসংক্ষেপ (Bangla)</label>
                                <textarea value={formData.excerptBn} onChange={(e) => setFormData({ ...formData, excerptBn: e.target.value })} rows={3} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none resize-none focus:border-brand-dark focus:ring-1 focus:ring-brand-dark/10" placeholder="সংক্ষিপ্ত বিবরণ..." />
                            </div>

                            <div>
                                <label className="text-sm font-bold text-gray-500 uppercase block mb-2">কন্টেন্ট (Bangla) <span className="text-gray-400 normal-case font-normal">— টুলবারে 📷 ক্লিক করে ছবি আপলোড করুন</span></label>
                                <div className="blog-editor">
                                    <ReactQuill
                                        ref={quillRefBn}
                                        theme="snow"
                                        value={formData.contentBn}
                                        onChange={(val) => setFormData({ ...formData, contentBn: val })}
                                        modules={getQuillModules(quillRefBn)}
                                        formats={quillFormats}
                                        placeholder="বাংলায় কন্টেন্ট লিখুন..."
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ========== Thumbnail Section ========== */}
                    <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-gray-500 uppercase">Thumbnail *</h3>
                            <div className="flex gap-1 bg-gray-100 p-0.5 rounded-lg">
                                <button type="button" onClick={() => setThumbnailMode("upload")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all cursor-pointer ${thumbnailMode === "upload" ? "bg-white shadow-sm text-gray-900" : "text-gray-400"}`}>
                                    <FiUploadCloud size={12} /> Upload
                                </button>
                                <button type="button" onClick={() => setThumbnailMode("link")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all cursor-pointer ${thumbnailMode === "link" ? "bg-white shadow-sm text-gray-900" : "text-gray-400"}`}>
                                    <FiLink size={12} /> URL
                                </button>
                            </div>
                        </div>

                        {thumbnailMode === "upload" ? (
                            <div className="space-y-3">
                                <label className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition-all ${thumbnailUploading ? "border-brand-accent bg-brand-accent/5" : "border-gray-200 hover:border-brand-dark hover:bg-gray-50"}`}>
                                    {thumbnailUploading ? (
                                        <div className="flex items-center gap-2 text-brand-accent">
                                            <FiLoader className="animate-spin" size={20} />
                                            <span className="text-sm font-semibold">Uploading...</span>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 text-gray-400">
                                            <FiUploadCloud size={28} />
                                            <span className="text-sm font-semibold">Click to upload thumbnail</span>
                                            <span className="text-[10px]">PNG, JPG, WebP (Max 5MB)</span>
                                        </div>
                                    )}
                                    <input type="file" accept="image/*" onChange={handleThumbnailUpload} className="hidden" disabled={thumbnailUploading} />
                                </label>
                            </div>
                        ) : (
                            <input type="text" value={formData.thumbnail} onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-brand-dark focus:ring-1 focus:ring-brand-dark/10" placeholder="https://example.com/image.jpg" />
                        )}

                        {formData.thumbnail && (
                            <div className="mt-3 relative group">
                                <img src={formData.thumbnail} alt="Thumbnail Preview" className="w-full h-48 object-cover rounded-xl border border-gray-100" onError={(e) => e.target.style.display = 'none'} />
                                <button type="button" onClick={() => setFormData({ ...formData, thumbnail: "" })} className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold cursor-pointer">✕</button>
                            </div>
                        )}
                    </div>

                    {/* Tags */}
                    <div>
                        <label className="text-sm font-bold text-gray-500 uppercase block mb-2">Tags (comma separated)</label>
                        <input type="text" value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-brand-dark focus:ring-1 focus:ring-brand-dark/10" placeholder="visa, travel, guide" />
                        {formData.tags && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                                {formData.tags.split(",").map((t, i) => t.trim() && (
                                    <span key={i} className="px-2.5 py-1 bg-gray-100 rounded-full text-[10px] font-semibold text-gray-600">{t.trim()}</span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Status */}
                    <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
                            <div className="flex-1">
                                <p className="font-bold text-gray-900 dark:text-white">Status</p>
                                <p className="text-sm text-gray-500">Publish immediately or save as draft</p>
                            </div>
                            <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none w-40 cursor-pointer">
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                            </select>
                        </div>
                    </div>

                    {/* ═══ SEO ═══════════════════════════════════════════ */}
                    <SeoSection formData={formData} setFormData={setFormData} />
                </div>

                <div className="flex gap-4 mt-6">
                    <Link href="/dashboard/admin/blog" className="flex-1 text-center py-3 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">Cancel</Link>
                    <button type="submit" disabled={loading} className="flex-1 flex items-center justify-center gap-2 py-3 bg-brand-dark text-white rounded-lg text-sm font-semibold hover:bg-[#032b1e] disabled:bg-gray-300 transition-colors cursor-pointer">
                        {loading ? <FiLoader className="animate-spin" /> : <FiSave />} Create Post
                    </button>
                </div>
            </form>

            <style jsx global>{`
                .blog-editor .ql-container { min-height: 300px; font-size: 14px; font-family: 'Poppins', sans-serif; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px; border-color: #e5e7eb; }
                .blog-editor .ql-toolbar { border-top-left-radius: 8px; border-top-right-radius: 8px; border-color: #e5e7eb; background: #f9fafb; }
                .blog-editor .ql-editor { min-height: 300px; line-height: 1.8; }
                .blog-editor .ql-editor.ql-blank::before { font-style: normal; color: #9ca3af; }
                .blog-editor .ql-toolbar button:hover, .blog-editor .ql-toolbar button.ql-active { color: var(--color-brand-dark); }
                .blog-editor .ql-toolbar button:hover .ql-stroke, .blog-editor .ql-toolbar button.ql-active .ql-stroke { stroke: var(--color-brand-dark); }
                .blog-editor .ql-toolbar button:hover .ql-fill, .blog-editor .ql-toolbar button.ql-active .ql-fill { fill: var(--color-brand-dark); }
                .blog-editor .ql-editor img { max-width: 100%; border-radius: 8px; margin: 16px 0; }
            `}</style>
        </div>
    );
}

// SeoSection extracted to _shared/SeoSection.jsx so both the create and
// edit pages import the same component.
