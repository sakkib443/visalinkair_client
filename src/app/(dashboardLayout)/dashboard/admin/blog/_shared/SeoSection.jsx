"use client";

// ===================================================================
// Blog SEO editor — shared by /blog/create and /blog/[id]/edit.
// Meta Title / Meta Description / Meta Keywords, all optional; the
// server auto-fills anything left blank from title/excerpt/content/tags
// on save (see blog.service.ts → applyAutoSeo).
// ===================================================================

export default function SeoSection({ formData, setFormData }) {
    const titleLen = (formData.metaTitle || "").length;
    const descLen = (formData.metaDescription || "").length;
    const keywords = (formData.metaKeywords || "")
        .split(",").map(k => k.trim()).filter(Boolean);

    const inputCls =
        "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-brand-dark focus:ring-1 focus:ring-brand-dark/10";

    return (
        <div className="pt-5 border-t border-gray-100">
            <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-brand-dark/10 text-brand-dark text-[11px] font-black">SEO</span>
                <h3 className="font-bold text-gray-900">Search Engine Optimization</h3>
            </div>
            <p className="text-[12px] text-gray-500 mb-5">
                Leave any field blank — the system will auto-fill it from the title,
                excerpt, content and tags when you save.
            </p>

            <div className="space-y-5">
                {/* Meta title */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-bold text-gray-500 uppercase">Meta Title</label>
                        <span className={`text-[11px] font-semibold ${titleLen > 70 ? "text-red-500" : "text-gray-400"}`}>
                            {titleLen}/70
                        </span>
                    </div>
                    <input
                        type="text"
                        value={formData.metaTitle || ""}
                        onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                        placeholder="Leave blank to use the post title"
                        maxLength={90}
                        className={inputCls}
                    />
                    <p className="text-[11px] text-gray-400 mt-1">
                        Google shows ~60–70 characters. Under 60 renders in full.
                    </p>
                </div>

                {/* Meta description */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-bold text-gray-500 uppercase">Meta Description</label>
                        <span className={`text-[11px] font-semibold ${descLen > 160 ? "text-red-500" : "text-gray-400"}`}>
                            {descLen}/160
                        </span>
                    </div>
                    <textarea
                        rows={3}
                        value={formData.metaDescription || ""}
                        onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                        placeholder="One or two sentences describing this post. Falls back to the excerpt if left blank."
                        maxLength={200}
                        className={`${inputCls} resize-none`}
                    />
                    <p className="text-[11px] text-gray-400 mt-1">
                        Search-result snippet — around 150–160 characters is ideal.
                    </p>
                </div>

                {/* Meta keywords */}
                <div>
                    <label className="text-sm font-bold text-gray-500 uppercase block mb-2">
                        Meta Keywords <span className="normal-case text-[11px] text-gray-400">(comma-separated)</span>
                    </label>
                    <input
                        type="text"
                        value={formData.metaKeywords || ""}
                        onChange={(e) => setFormData({ ...formData, metaKeywords: e.target.value })}
                        placeholder="e.g. travel packing, carry on tips, luggage"
                        className={inputCls}
                    />
                    {keywords.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                            {keywords.map((k, i) => (
                                <span key={i} className="px-2.5 py-1 bg-gray-100 rounded-full text-[10px] font-semibold text-gray-600">
                                    {k}
                                </span>
                            ))}
                        </div>
                    )}
                    <p className="text-[11px] text-gray-400 mt-1">
                        Also feeds the <code>&lt;meta name="keywords"&gt;</code> tag on the post's HTML page.
                    </p>
                </div>
            </div>
        </div>
    );
}
