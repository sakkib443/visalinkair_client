"use client";

// ===================================================================
// Shared editor used by both /create and /[id] pages.
// Handles all fields, bilingual EN/BN, dynamic section builder, and
// submits either POST or PATCH depending on the presence of `id`.
// ===================================================================

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
    FiSave, FiTrash2, FiPlus, FiChevronUp, FiChevronDown, FiLoader,
} from "react-icons/fi";
import { servicesApi } from "@/services/api";

const bi = (en = "", bn = "") => ({ en, bn });

const SECTION_TYPES = [
    { value: "text",     label: "Text (paragraph)" },
    { value: "features", label: "Features (icon grid)" },
    { value: "list",     label: "List (chips grid)" },
    { value: "stats",    label: "Stats (compact row)" },
    { value: "faq",      label: "FAQ (accordion)" },
    { value: "image",    label: "Image (single)" },
];

const emptyItem = () => ({
    title: bi(),
    description: bi(),
    icon: "",
    image: "",
    link: "",
});

const emptySection = () => ({
    type: "features",
    title: bi(),
    content: bi(),
    items: [emptyItem()],
    order: 0,
    isActive: true,
});

const emptyService = () => ({
    slug: "",
    type: "study_abroad",
    title: bi(),
    subtitle: bi(),
    description: bi(),
    heroImage: "",
    icon: "",
    sections: [],
    formEnabled: true,
    ctaText: bi(),
    ctaLink: "",
    seoTitle: bi(),
    seoDescription: bi(),
    seoKeywords: "",
    order: 0,
    isActive: true,
});

export default function ServiceEditor({ initial, id }) {
    const router = useRouter();
    const [form, setForm] = useState({ ...emptyService(), ...(initial || {}) });
    const [saving, setSaving] = useState(false);

    const set = (path, value) => {
        setForm((prev) => {
            const next = { ...prev };
            const keys = path.split(".");
            let cur = next;
            for (let i = 0; i < keys.length - 1; i++) {
                cur[keys[i]] = { ...(cur[keys[i]] || {}) };
                cur = cur[keys[i]];
            }
            cur[keys[keys.length - 1]] = value;
            return next;
        });
    };

    // ── Section CRUD ─────────────────────────────────────
    const addSection = () => setForm((f) => ({
        ...f,
        sections: [...(f.sections || []), { ...emptySection(), order: (f.sections?.length || 0) }],
    }));
    const removeSection = (idx) => setForm((f) => ({
        ...f,
        sections: f.sections.filter((_, i) => i !== idx),
    }));
    const moveSection = (idx, dir) => {
        setForm((f) => {
            const arr = [...f.sections];
            const j = idx + dir;
            if (j < 0 || j >= arr.length) return f;
            [arr[idx], arr[j]] = [arr[j], arr[idx]];
            arr.forEach((s, i) => { s.order = i; });
            return { ...f, sections: arr };
        });
    };
    const updateSection = (idx, patch) => {
        setForm((f) => {
            const arr = [...f.sections];
            arr[idx] = { ...arr[idx], ...patch };
            return { ...f, sections: arr };
        });
    };
    const addItem = (sIdx) => updateSection(sIdx, {
        items: [...(form.sections[sIdx].items || []), emptyItem()],
    });
    const removeItem = (sIdx, iIdx) => updateSection(sIdx, {
        items: form.sections[sIdx].items.filter((_, i) => i !== iIdx),
    });
    const updateItem = (sIdx, iIdx, patch) => {
        setForm((f) => {
            const arr = [...f.sections];
            const items = [...(arr[sIdx].items || [])];
            items[iIdx] = { ...items[iIdx], ...patch };
            arr[sIdx] = { ...arr[sIdx], items };
            return { ...f, sections: arr };
        });
    };

    // ── Save ─────────────────────────────────────────────
    const save = async (e) => {
        e?.preventDefault();
        if (!form.slug || !form.title?.en) {
            toast.error("Slug and English title are required.");
            return;
        }
        setSaving(true);
        try {
            if (id) {
                await servicesApi.update(id, form);
                toast.success("Saved");
            } else {
                await servicesApi.create(form);
                toast.success("Created");
                router.push("/dashboard/admin/services");
                return;
            }
        } catch (err) {
            toast.error(err.message || "Save failed");
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={save} className="max-w-5xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-brand-dark" style={{ fontFamily: "Teko, sans-serif" }}>
                        {id ? "EDIT SERVICE" : "NEW SERVICE"}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        All content is bilingual (English + বাংলা) and rendered on the public page live.
                    </p>
                </div>
                <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-blue hover:bg-brand-blue-hover text-white text-sm font-semibold disabled:opacity-60"
                >
                    {saving ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiSave className="w-4 h-4" />}
                    {saving ? "Saving..." : "Save"}
                </button>
            </div>

            {/* Basic */}
            <Card title="Basic">
                <Row>
                    <Input label="Slug (URL)" value={form.slug} onChange={(v) => set("slug", v.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} required />
                    <Select label="Type" value={form.type} onChange={(v) => set("type", v)} options={[
                        { value: "study_abroad", label: "Study Abroad" },
                        { value: "passport",     label: "Passport" },
                        { value: "banking",      label: "Banking" },
                        { value: "career",       label: "Career" },
                        { value: "course",       label: "Course" },
                        { value: "other",        label: "Other" },
                    ]} />
                </Row>
                <Row>
                    <Input label="Icon (emoji or leave blank)" value={form.icon} onChange={(v) => set("icon", v)} placeholder="🎓" />
                    <Input label="Hero image URL" value={form.heroImage} onChange={(v) => set("heroImage", v)} placeholder="/images/xxx.png" />
                </Row>
                <BilingualInput label="Title" value={form.title} onChange={(v) => set("title", v)} required />
                <BilingualInput label="Subtitle" value={form.subtitle} onChange={(v) => set("subtitle", v)} />
                <BilingualTextarea label="Short description" value={form.description} onChange={(v) => set("description", v)} rows={3} />
            </Card>

            {/* Sections */}
            <Card
                title="Page sections"
                subtitle="Add any number of sections in any order. Each renders differently based on type."
                action={
                    <button
                        type="button"
                        onClick={addSection}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-dark hover:bg-brand-dark-hover text-white text-xs font-semibold"
                    >
                        <FiPlus size={13} /> Add section
                    </button>
                }
            >
                {(form.sections || []).length === 0 && (
                    <p className="text-sm text-gray-400 italic text-center py-6">No sections yet — click "Add section" above.</p>
                )}
                <div className="space-y-4">
                    {(form.sections || []).map((sec, sIdx) => (
                        <div key={sIdx} className="border border-gray-200 rounded-xl p-4 bg-gray-50/40">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="w-7 h-7 rounded bg-brand-blue/10 text-brand-blue font-bold text-xs flex items-center justify-center">
                                    {sIdx + 1}
                                </span>
                                <select
                                    value={sec.type}
                                    onChange={(e) => updateSection(sIdx, { type: e.target.value })}
                                    className="text-sm border border-gray-200 rounded px-2 py-1.5 font-semibold text-brand-dark"
                                >
                                    {SECTION_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                                </select>
                                <label className="ml-auto flex items-center gap-2 text-xs text-gray-600">
                                    <input
                                        type="checkbox"
                                        checked={sec.isActive !== false}
                                        onChange={(e) => updateSection(sIdx, { isActive: e.target.checked })}
                                    />
                                    Visible
                                </label>
                                <button type="button" onClick={() => moveSection(sIdx, -1)} disabled={sIdx === 0} className="p-1.5 rounded hover:bg-white disabled:opacity-30" title="Move up"><FiChevronUp size={14} /></button>
                                <button type="button" onClick={() => moveSection(sIdx, 1)} disabled={sIdx === form.sections.length - 1} className="p-1.5 rounded hover:bg-white disabled:opacity-30" title="Move down"><FiChevronDown size={14} /></button>
                                <button type="button" onClick={() => removeSection(sIdx)} className="p-1.5 rounded hover:bg-red-50 hover:text-red-600" title="Delete section"><FiTrash2 size={14} /></button>
                            </div>

                            <BilingualInput label="Section title" value={sec.title || bi()} onChange={(v) => updateSection(sIdx, { title: v })} />

                            {(sec.type === "text" || sec.type === "image") && (
                                <BilingualTextarea
                                    label={sec.type === "image" ? "Image URL (put in EN field)" : "Content (HTML allowed)"}
                                    value={sec.content || bi()}
                                    onChange={(v) => updateSection(sIdx, { content: v })}
                                    rows={sec.type === "image" ? 2 : 4}
                                />
                            )}

                            {(sec.type === "features" || sec.type === "list" || sec.type === "stats" || sec.type === "faq") && (
                                <div className="mt-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Items</p>
                                        <button
                                            type="button"
                                            onClick={() => addItem(sIdx)}
                                            className="text-xs font-semibold text-brand-blue hover:underline inline-flex items-center gap-1"
                                        >
                                            <FiPlus size={12} /> Add item
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {(sec.items || []).map((it, iIdx) => (
                                            <div key={iIdx} className="p-3 rounded-lg bg-white border border-gray-100 grid grid-cols-1 md:grid-cols-[80px_1fr_1fr_28px] gap-2 items-start">
                                                <input
                                                    type="text"
                                                    placeholder="Icon / 🎓"
                                                    value={it.icon || ""}
                                                    onChange={(e) => updateItem(sIdx, iIdx, { icon: e.target.value })}
                                                    className="text-sm px-2 py-1.5 border border-gray-200 rounded"
                                                />
                                                <BilingualInput compact label="Title" value={it.title || bi()} onChange={(v) => updateItem(sIdx, iIdx, { title: v })} />
                                                <BilingualInput compact label="Description" value={it.description || bi()} onChange={(v) => updateItem(sIdx, iIdx, { description: v })} />
                                                <button type="button" onClick={() => removeItem(sIdx, iIdx)} className="p-1.5 rounded hover:bg-red-50 hover:text-red-600 mt-4" title="Remove"><FiTrash2 size={13} /></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </Card>

            {/* CTA + Form */}
            <Card title="Call-to-action & Inquiry form">
                <Row>
                    <BilingualInput label="CTA button text" value={form.ctaText || bi()} onChange={(v) => set("ctaText", v)} />
                    <Input label="CTA link (optional)" value={form.ctaLink} onChange={(v) => set("ctaLink", v)} placeholder="/contact" />
                </Row>
                <label className="flex items-center gap-2 mt-2 text-sm text-gray-700">
                    <input type="checkbox" checked={!!form.formEnabled} onChange={(e) => set("formEnabled", e.target.checked)} />
                    Show inquiry form on this page
                </label>
            </Card>

            {/* SEO */}
            <Card title="SEO">
                <BilingualInput label="SEO title" value={form.seoTitle || bi()} onChange={(v) => set("seoTitle", v)} />
                <BilingualTextarea label="Meta description" value={form.seoDescription || bi()} onChange={(v) => set("seoDescription", v)} rows={2} />
                <Input label="Keywords (comma separated)" value={form.seoKeywords} onChange={(v) => set("seoKeywords", v)} placeholder="visa, study, abroad" />
            </Card>

            {/* Visibility */}
            <Card title="Visibility & order">
                <Row>
                    <Input type="number" label="Display order" value={form.order} onChange={(v) => set("order", Number(v) || 0)} />
                    <div className="flex items-center gap-2 mt-6">
                        <input type="checkbox" id="isActive" checked={!!form.isActive} onChange={(e) => set("isActive", e.target.checked)} />
                        <label htmlFor="isActive" className="text-sm text-gray-700">Published (visible on public site)</label>
                    </div>
                </Row>
            </Card>

            {/* Sticky footer */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                    type="button"
                    onClick={() => router.push("/dashboard/admin/services")}
                    className="px-4 py-2.5 rounded-lg border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-blue hover:bg-brand-blue-hover text-white text-sm font-semibold disabled:opacity-60"
                >
                    {saving ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiSave className="w-4 h-4" />}
                    {saving ? "Saving..." : "Save changes"}
                </button>
            </div>
        </form>
    );
}

// ── UI helpers ──────────────────────────────────────
function Card({ title, subtitle, action, children }) {
    return (
        <section className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h2 className="text-sm font-bold text-brand-dark uppercase tracking-wider">{title}</h2>
                    {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
                </div>
                {action}
            </div>
            <div className="space-y-3">{children}</div>
        </section>
    );
}

function Row({ children }) {
    return <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>;
}

function Input({ label, value, onChange, type = "text", required, placeholder }) {
    return (
        <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
                type={type}
                value={value ?? ""}
                onChange={(e) => onChange(e.target.value)}
                required={required}
                placeholder={placeholder}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none text-sm"
            />
        </div>
    );
}

function Select({ label, value, onChange, options }) {
    return (
        <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">{label}</label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-brand-blue outline-none text-sm bg-white"
            >
                {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
        </div>
    );
}

function BilingualInput({ label, value, onChange, required, compact }) {
    const v = value || { en: "", bn: "" };
    return (
        <div>
            {!compact && (
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <div className="grid grid-cols-2 gap-2">
                <input
                    type="text"
                    value={v.en || ""}
                    onChange={(e) => onChange({ ...v, en: e.target.value })}
                    placeholder={compact ? `${label} (EN)` : "English"}
                    required={required}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none text-sm"
                />
                <input
                    type="text"
                    value={v.bn || ""}
                    onChange={(e) => onChange({ ...v, bn: e.target.value })}
                    placeholder={compact ? `${label} (BN)` : "বাংলা"}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none text-sm"
                    style={{ fontFamily: "Hind Siliguri, sans-serif" }}
                />
            </div>
        </div>
    );
}

function BilingualTextarea({ label, value, onChange, rows = 3 }) {
    const v = value || { en: "", bn: "" };
    return (
        <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">{label}</label>
            <div className="grid grid-cols-2 gap-2">
                <textarea
                    rows={rows}
                    value={v.en || ""}
                    onChange={(e) => onChange({ ...v, en: e.target.value })}
                    placeholder="English"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-brand-blue outline-none text-sm resize-y"
                />
                <textarea
                    rows={rows}
                    value={v.bn || ""}
                    onChange={(e) => onChange({ ...v, bn: e.target.value })}
                    placeholder="বাংলা"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-brand-blue outline-none text-sm resize-y"
                    style={{ fontFamily: "Hind Siliguri, sans-serif" }}
                />
            </div>
        </div>
    );
}
