"use client";

// ===================================================================
// VisaGuideEditor — split-screen author view for a Tourist / Student
// visa page.
//
//   Left  : country picker + summary fields + rich-text (Quill) body
//   Right : live preview, rendered through the SAME <VisaGuideBody />
//           and `.visa-content` stylesheet the public page uses, at a
//           selectable Desktop / Tablet / Mobile width.
//
// On lg+ the two panes sit side by side with a draggable divider and
// each scrolls independently inside a fixed-height shell. Below lg they
// stack — editor first, preview underneath — and the page scrolls
// normally, because two side-by-side panes on a phone are unusable and
// nested scroll areas on touch are worse.
// ===================================================================

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import toast from "react-hot-toast";
import {
    FiArrowLeft, FiSave, FiLoader, FiMonitor, FiTablet, FiSmartphone,
    FiEye, FiStar, FiList, FiFileText, FiAlertCircle,
} from "react-icons/fi";
import { visaGuideService } from "@/services/api";
import CountryPicker from "@/components/shared/CountryPicker";
import VisaGuideBody from "@/components/shared/VisaGuideBody";
import { useSiteSettings } from "@/context/SiteSettingsContext";

const QuillEditor = dynamic(() => import("@/components/shared/QuillEditor"), {
    ssr: false,
    loading: () => <div className="h-[420px] bg-gray-50 rounded-lg animate-pulse" />,
});
import "react-quill-new/dist/quill.snow.css";

// Memoised at module scope — a fresh object each render makes ReactQuill
// tear down and rebuild the editor, which loses the caret on every keystroke.
const QUILL_MODULES = {
    toolbar: [
        [{ header: [1, 2, 3, 4, false] }],
        [{ size: ["small", false, "large", "huge"] }],
        ["bold", "italic", "underline", "strike"],
        [{ color: [] }, { background: [] }],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ indent: "-1" }, { indent: "+1" }],
        [{ align: [] }],
        ["blockquote", "code-block"],
        ["link"],
        ["clean"],
    ],
    clipboard: { matchVisual: false },
};
const QUILL_FORMATS = [
    "header", "size", "bold", "italic", "underline", "strike",
    "color", "background", "list", "indent", "align",
    "blockquote", "code-block", "link",
];

const DEVICES = [
    { key: "desktop", label: "Desktop", icon: FiMonitor, width: "100%" },
    { key: "tablet", label: "Tablet", icon: FiTablet, width: "768px" },
    { key: "mobile", label: "Mobile", icon: FiSmartphone, width: "390px" },
];

const EMPTY = {
    country: "", countryBn: "", flag: "",
    visaType: "", processingTime: "", processingFee: "", embassyFee: "",
    validity: "", stayDuration: "", entryType: "",
    content: "", isActive: true, order: 0,
    metaTitle: "", metaDescription: "",
};

export default function VisaGuideEditor({ category, accent = "var(--color-brand-accent)" }) {
    return (
        <Suspense fallback={<div className="p-10 text-center text-gray-400">Loading editor…</div>}>
            <EditorInner category={category} accent={accent} />
        </Suspense>
    );
}

function EditorInner({ category, accent }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const editId = searchParams.get("edit");
    const isStudent = category === "student";
    const basePath = isStudent ? "/dashboard/admin/student-visas" : "/dashboard/admin/tourist-visas";
    // Same shared banner the public page renders, so the preview matches.
    const { settings } = useSiteSettings();
    const bannerImage = settings?.visaBannerImage || "";

    const [form, setForm] = useState(EMPTY);
    const [loading, setLoading] = useState(Boolean(editId));
    const [saving, setSaving] = useState(false);
    const [device, setDevice] = useState("desktop");
    const [leftPct, setLeftPct] = useState(52);
    const [errors, setErrors] = useState({});

    // The drag-resize width is an inline style, and inline styles ignore
    // breakpoints — applying it below lg would fight the stacked layout.
    // So track the breakpoint and only hand the style over on lg+.
    const [isLarge, setIsLarge] = useState(false);
    useEffect(() => {
        const mq = window.matchMedia("(min-width: 1024px)");
        const sync = (e) => setIsLarge(e.matches);
        sync(mq);
        mq.addEventListener("change", sync);
        return () => mq.removeEventListener("change", sync);
    }, []);

    const editorRef = useRef(null);
    const splitRef = useRef(null);
    const draggingRef = useRef(false);

    const set = useCallback((k, v) => {
        setForm((f) => ({ ...f, [k]: v }));
        setErrors((e) => (e[k] ? { ...e, [k]: undefined } : e));
    }, []);

    // ---------- Load for edit ----------
    useEffect(() => {
        if (!editId) return;
        let cancelled = false;
        (async () => {
            try {
                const res = await visaGuideService.getById(editId);
                if (cancelled) return;
                const d = res.data || {};
                setForm({ ...EMPTY, ...d });
            } catch (err) {
                toast.error(err.message || "Could not load this visa page");
                router.replace(basePath);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [editId, basePath, router]);

    // ---------- Draggable divider ----------
    // Listeners live on window (not the handle) so the drag survives the
    // cursor leaving the 8px handle, which is otherwise trivially easy.
    useEffect(() => {
        const onMove = (e) => {
            if (!draggingRef.current || !splitRef.current) return;
            const rect = splitRef.current.getBoundingClientRect();
            const pct = ((e.clientX - rect.left) / rect.width) * 100;
            setLeftPct(Math.min(70, Math.max(30, pct)));
        };
        const onUp = () => {
            if (!draggingRef.current) return;
            draggingRef.current = false;
            document.body.style.cursor = "";
            document.body.style.userSelect = "";
        };
        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);
        return () => {
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseup", onUp);
        };
    }, []);

    const startDrag = () => {
        draggingRef.current = true;
        document.body.style.cursor = "col-resize";
        document.body.style.userSelect = "none";
    };

    // ---------- Custom insert helpers ----------
    const handleEditorReady = useCallback((editor) => { editorRef.current = editor; }, []);

    /** Star bullet — Quill has no star list, so it is a plain line prefixed
     *  with ★. Clearing list formatting first stops the star landing next
     *  to an existing bullet or number. */
    const insertStar = () => {
        const editor = editorRef.current;
        if (!editor) { toast.error("Editor is still loading"); return; }
        editor.focus();
        const range = editor.getSelection(true) || { index: Math.max(0, editor.getLength() - 1), length: 0 };
        editor.formatLine(range.index, Math.max(range.length, 1), "list", false);
        editor.insertText(range.index, "★ ", "user");
        editor.setSelection(range.index + 2, 0);
    };

    /** Drop a ready-made section at the caret so admins are not retyping
     *  the same three headings for every country. */
    const insertBlock = (html) => {
        const editor = editorRef.current;
        if (!editor) { toast.error("Editor is still loading"); return; }
        editor.focus();
        const range = editor.getSelection(true) || { index: editor.getLength() - 1, length: 0 };
        editor.clipboard.dangerouslyPasteHTML(range.index, html, "user");
    };

    const TEMPLATES = [
        {
            label: "Important Notes",
            icon: FiAlertCircle,
            html: "<h2>Important Notes</h2><ul><li>It is advisable to refrain from booking flight tickets until the visa confirmation letter has been received.</li><li>Visalink Air cannot guarantee visa approval, as the decision rests solely with the embassy.</li><li>Visa service fees and charges are non-refundable.</li></ul>",
        },
        {
            label: "Documents Block",
            icon: FiFileText,
            html: "<h2>List of Documents Needed</h2><h3>Documents Needed for Job Holders</h3><ol><li>A passport valid for at least six (6) months, along with all old passports.</li><li>Two recent photographs (white background, 35 mm × 45 mm, matt paper).</li><li>Bank statement for the last six (6) months with a solvency certificate.</li></ol>",
        },
        {
            label: "Summary Intro",
            icon: FiList,
            html: "<h2>Overview</h2><p>Write a short introduction describing how a Bangladeshi passport holder applies for this visa.</p>",
        },
    ];

    // ---------- Save ----------
    const validate = () => {
        const e = {};
        if (!form.country.trim()) e.country = "Country is required";
        else if (form.country.trim().length < 2) e.country = "Country name is too short";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const save = async () => {
        if (!validate()) {
            toast.error("Please pick a country first");
            return;
        }
        setSaving(true);
        try {
            // Send only what the API accepts — `_id`, `countrySlug` and the
            // timestamps are server-managed and rejected by the validator.
            const payload = {
                category,
                country: form.country.trim(),
                countryBn: form.countryBn || "",
                flag: form.flag || "",
                visaType: form.visaType || "",
                processingTime: form.processingTime || "",
                processingFee: form.processingFee || "",
                embassyFee: form.embassyFee || "",
                validity: form.validity || "",
                stayDuration: form.stayDuration || "",
                entryType: form.entryType || "",
                content: form.content || "",
                isActive: Boolean(form.isActive),
                order: Number(form.order) || 0,
                metaTitle: form.metaTitle || "",
                metaDescription: form.metaDescription || "",
            };

            if (editId) {
                await visaGuideService.update(editId, payload);
                toast.success(`${payload.country} updated`);
            } else {
                await visaGuideService.create(payload);
                toast.success(`${payload.country} created`);
            }
            router.push(basePath);
        } catch (err) {
            toast.error(err.message || "Save failed");
        } finally {
            setSaving(false);
        }
    };

    const previewGuide = useMemo(() => ({ ...form, category }), [form, category]);
    const deviceWidth = DEVICES.find((d) => d.key === device)?.width || "100%";

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <FiLoader className="w-6 h-6 text-[#1D4ED8] animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex flex-col lg:h-[calc(100vh-72px)]">
            {/* ================= TOP BAR ================= */}
            <div className="sticky top-0 z-20 lg:static flex flex-wrap items-center gap-3 px-4 sm:px-6 py-3 bg-white border-b border-gray-100 flex-shrink-0">
                <Link
                    href={basePath}
                    className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
                    aria-label="Back to list"
                >
                    <FiArrowLeft className="w-4 h-4" />
                </Link>
                <div className="min-w-0">
                    <h1 className="text-lg font-bold text-brand-dark truncate leading-tight">
                        {editId ? "Edit" : "Add"} {isStudent ? "Student" : "Tourist"} Visa
                        {form.country ? ` — ${form.country}` : ""}
                    </h1>
                    <p className="text-[11px] text-gray-400">
                        Everything you type appears in the live preview on the right.
                    </p>
                </div>

                <div className="flex items-center gap-2 ml-auto">
                    {/* Active toggle */}
                    <button
                        role="switch"
                        aria-checked={form.isActive}
                        onClick={() => set("isActive", !form.isActive)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50"
                        title={form.isActive ? "Visible on the website" : "Hidden from the website"}
                    >
                        <span className={`relative w-9 h-5 rounded-full transition-colors ${form.isActive ? "bg-green-500" : "bg-gray-300"}`}>
                            <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.isActive ? "translate-x-4" : ""}`} />
                        </span>
                        <span className={`text-[11px] font-bold ${form.isActive ? "text-green-600" : "text-gray-400"}`}>
                            {form.isActive ? "ACTIVE" : "INACTIVE"}
                        </span>
                    </button>

                    <button
                        onClick={save}
                        disabled={saving}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-white text-sm font-bold disabled:opacity-60 transition-all hover:brightness-110"
                        style={{ backgroundColor: accent }}
                    >
                        {saving ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiSave className="w-4 h-4" />}
                        {editId ? "Update" : "Publish"}
                    </button>
                </div>
            </div>

            {/* ================= SPLIT BODY =================
                lg+ : side-by-side, each pane scrolls independently.
                < lg: stacked, the page itself scrolls. */}
            <div ref={splitRef} className="flex-1 flex flex-col lg:flex-row min-h-0 lg:overflow-hidden">

                {/* ---------- LEFT / TOP: inputs ---------- */}
                <div
                    className="w-full min-w-0 bg-white lg:overflow-y-auto"
                    style={isLarge ? { flexBasis: `${leftPct}%`, flexGrow: 0, flexShrink: 0 } : undefined}
                >
                    <div className="p-4 sm:p-5 space-y-5">

                        {/* --- Country --- */}
                        <Section title="Country">
                            <div className="grid grid-cols-1 sm:grid-cols-[1fr_110px] gap-3">
                                <Field label="Country" required error={errors.country}>
                                    <CountryPicker
                                        value={form.country}
                                        onChange={(v) => set("country", v)}
                                        onSelect={(c) => {
                                            set("country", c.name);
                                            // Auto-fill the flag only when the admin hasn't set
                                            // one — never clobber a custom value.
                                            if (c.flag && !form.flag) set("flag", c.flag);
                                        }}
                                        placeholder="Type or select a country"
                                        inputClassName="vg-input"
                                    />
                                </Field>
                                <Field label="Flag">
                                    <input
                                        value={form.flag}
                                        onChange={(e) => set("flag", e.target.value)}
                                        placeholder="🇸🇬"
                                        className="vg-input text-center text-lg"
                                    />
                                </Field>
                            </div>
                            <Field label="Country name (Bangla)">
                                <input
                                    value={form.countryBn}
                                    onChange={(e) => set("countryBn", e.target.value)}
                                    placeholder="সিঙ্গাপুর"
                                    className="vg-input"
                                />
                            </Field>
                        </Section>

                        {/* --- Summary fields --- */}
                        <Section title="Summary" hint="Shown as the Summary block above the main content.">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <Field label="Visa Type">
                                    <input
                                        value={form.visaType}
                                        onChange={(e) => set("visaType", e.target.value)}
                                        placeholder={isStudent ? "Student Visa (Student Route)" : "Tourist Visa (E-Visa)"}
                                        className="vg-input"
                                    />
                                </Field>
                                <Field label="Processing Time">
                                    <input
                                        value={form.processingTime}
                                        onChange={(e) => set("processingTime", e.target.value)}
                                        placeholder="07 to 10 working days"
                                        className="vg-input"
                                    />
                                </Field>
                                <Field label="Processing Fee">
                                    <input
                                        value={form.processingFee}
                                        onChange={(e) => set("processingFee", e.target.value)}
                                        placeholder="BDT 6,500 (Without Airport Transfer)"
                                        className="vg-input"
                                    />
                                </Field>
                                <Field label="Embassy Fee">
                                    <input
                                        value={form.embassyFee}
                                        onChange={(e) => set("embassyFee", e.target.value)}
                                        placeholder="BDT 3,000"
                                        className="vg-input"
                                    />
                                </Field>
                                <Field label="Validity">
                                    <input
                                        value={form.validity}
                                        onChange={(e) => set("validity", e.target.value)}
                                        placeholder="3 months from issue"
                                        className="vg-input"
                                    />
                                </Field>
                                <Field label="Duration of Stay">
                                    <input
                                        value={form.stayDuration}
                                        onChange={(e) => set("stayDuration", e.target.value)}
                                        placeholder="Up to 30 days"
                                        className="vg-input"
                                    />
                                </Field>
                                <Field label="Entry Type">
                                    <input
                                        value={form.entryType}
                                        onChange={(e) => set("entryType", e.target.value)}
                                        placeholder="Single Entry"
                                        className="vg-input"
                                    />
                                </Field>
                                <Field label="Display Order">
                                    <input
                                        type="number"
                                        min="0"
                                        value={form.order}
                                        onChange={(e) => set("order", e.target.value)}
                                        className="vg-input"
                                    />
                                </Field>
                            </div>
                        </Section>

                        {/* --- Rich text body --- */}
                        <Section
                            title="Page Content"
                            hint="Requirements, notes, document checklists — formatted exactly as it will appear."
                        >
                            {/* Custom insert strip. Kept OUTSIDE the Quill toolbar
                                on purpose: a custom container gets re-attached on
                                every React re-render and duplicates the toolbar. */}
                            <div className="flex flex-wrap items-center gap-1.5 mb-2">
                                <button
                                    type="button"
                                    onClick={insertStar}
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-gray-200 text-[11.5px] font-semibold text-gray-600 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700"
                                    title="Insert a ★ star point at the cursor"
                                >
                                    <FiStar className="w-3.5 h-3.5" /> Star point
                                </button>
                                <span className="w-px h-5 bg-gray-200 mx-0.5" />
                                {TEMPLATES.map((t) => (
                                    <button
                                        key={t.label}
                                        type="button"
                                        onClick={() => insertBlock(t.html)}
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-gray-200 text-[11.5px] font-semibold text-gray-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"
                                        title={`Insert a ${t.label} section`}
                                    >
                                        <t.icon className="w-3.5 h-3.5" /> {t.label}
                                    </button>
                                ))}
                            </div>

                            <div className="vg-quill">
                                <QuillEditor
                                    theme="snow"
                                    value={form.content}
                                    onChange={(v) => set("content", v)}
                                    onEditorReady={handleEditorReady}
                                    modules={QUILL_MODULES}
                                    formats={QUILL_FORMATS}
                                    placeholder="Start writing the visa requirements…"
                                />
                            </div>
                        </Section>

                        {/* --- SEO --- */}
                        <Section title="SEO" hint="Optional — used for the browser tab and search results.">
                            <Field label="Meta Title">
                                <input
                                    value={form.metaTitle}
                                    onChange={(e) => set("metaTitle", e.target.value)}
                                    placeholder={`${form.country || "Country"} ${isStudent ? "Student" : "Tourist"} Visa from Bangladesh`}
                                    className="vg-input"
                                />
                            </Field>
                            <Field label="Meta Description">
                                <textarea
                                    rows={2}
                                    value={form.metaDescription}
                                    onChange={(e) => set("metaDescription", e.target.value)}
                                    placeholder="Short description for search engines…"
                                    className="vg-input resize-none"
                                />
                            </Field>
                        </Section>

                        <div className="h-8" />
                    </div>
                </div>

                {/* ---------- DIVIDER ---------- */}
                <div
                    onMouseDown={startDrag}
                    role="separator"
                    aria-orientation="vertical"
                    className="hidden lg:flex w-1.5 flex-shrink-0 cursor-col-resize bg-gray-100 hover:bg-[#1D4ED8]/30 transition-colors items-center justify-center group"
                    title="Drag to resize"
                >
                    <span className="w-0.5 h-8 rounded-full bg-gray-300 group-hover:bg-[#1D4ED8]" />
                </div>

                {/* ---------- RIGHT / BOTTOM: live preview ---------- */}
                <div className="w-full min-w-0 lg:flex-1 flex flex-col bg-[#eef1f6] border-t lg:border-t-0 border-gray-200">
                    {/* Device switcher */}
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-white border-b border-gray-100 flex-shrink-0">
                        <FiEye className="w-4 h-4 text-gray-400" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                            Live Preview
                        </span>
                        <div className="ml-auto flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
                            {DEVICES.map((d) => (
                                <button
                                    key={d.key}
                                    onClick={() => setDevice(d.key)}
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition-colors ${
                                        device === d.key
                                            ? "bg-white text-brand-dark shadow-sm"
                                            : "text-gray-500 hover:text-gray-700"
                                    }`}
                                    title={d.label}
                                >
                                    <d.icon className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">{d.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Preview frame */}
                    <div className="flex-1 lg:overflow-y-auto p-4">
                        <div
                            className="mx-auto bg-white rounded-xl shadow-sm transition-all duration-300"
                            style={{ width: deviceWidth, maxWidth: "100%" }}
                        >
                            {/* Mini hero — same banner, gradient and contrast
                                levels as the live page so the preview stays
                                honest about what visitors will actually see. */}
                            <div
                                className="rounded-t-xl px-6 py-6 text-white bg-cover bg-center"
                                style={
                                    bannerImage
                                        ? { backgroundImage: `linear-gradient(135deg, rgba(31,26,23,0.88) 0%, rgba(45,38,33,0.82) 55%, rgba(31,26,23,0.88) 100%), url("${bannerImage}")` }
                                        : { background: "linear-gradient(135deg, #1f1a17 0%, #2d2621 55%, #1f1a17 100%)" }
                                }
                            >
                                <p className="text-[10px] uppercase tracking-widest text-white/80 mb-1.5">
                                    Bangladesh → {form.country || "Country"}
                                </p>
                                <h2 className="text-[17px] sm:text-[20px] font-bold leading-snug">
                                    {form.flag ? `${form.flag} ` : ""}
                                    Apply online for {form.country || "…"} {form.visaType || (isStudent ? "Student" : "Tourist")} visa from Bangladesh
                                </h2>
                            </div>

                            <div className={device === "mobile" ? "px-5 py-6" : "px-7 py-8 sm:px-9"}>
                                <VisaGuideBody guide={previewGuide} compact={device === "mobile"} />
                            </div>

                            {!form.isActive && (
                                <div className="mx-5 mb-5 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-[12px] text-amber-800">
                                    <strong>Inactive.</strong> This page will not be visible on the public
                                    website until you switch it to Active.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Scoped field + Quill styling. `:global` is required because
                Quill renders its own DOM outside React's tree. */}
            <style jsx global>{`
                .vg-input {
                    width: 100%;
                    padding: 0.55rem 0.75rem;
                    border-radius: 0.5rem;
                    border: 1px solid #e5e7eb;
                    background: #fff;
                    color: var(--color-brand-dark);
                    font-size: 13.5px;
                    outline: none;
                    transition: border-color .15s, box-shadow .15s;
                }
                .vg-quill .ql-toolbar.ql-snow {
                    border-color: #e5e7eb;
                    border-radius: 0.5rem 0.5rem 0 0;
                    background: #fafafa;
                }
                /* Only pin the toolbar where the editor owns its own scroll
                   container. On mobile the page scrolls, so a sticky toolbar
                   would detach and float over the sticky top bar. */
                @media (min-width: 1024px) {
                    .vg-quill .ql-toolbar.ql-snow {
                        position: sticky;
                        top: 0;
                        z-index: 5;
                    }
                }
                .vg-quill .ql-container.ql-snow {
                    border-color: #e5e7eb;
                    border-radius: 0 0 0.5rem 0.5rem;
                    font-family: Poppins, sans-serif;
                    font-size: 14px;
                }
                .vg-quill .ql-editor { min-height: 420px; line-height: 1.7; }
                .vg-quill .ql-editor.ql-blank::before { font-style: normal; color: #9ca3af; }
            `}</style>
        </div>
    );
}

/* ---------- small presentational helpers ---------- */
function Section({ title, hint, children }) {
    return (
        <section>
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-500">{title}</h2>
            {hint && <p className="text-[11px] text-gray-400 mt-0.5 mb-2">{hint}</p>}
            <div className={`space-y-3 ${hint ? "" : "mt-2"}`}>{children}</div>
        </section>
    );
}

function Field({ label, required, error, children }) {
    return (
        <label className="block">
            <span className="block text-[11px] font-semibold text-gray-500 mb-1">
                {label}
                {required && <span className="text-red-500 ml-0.5">*</span>}
            </span>
            {children}
            {error && (
                <span className="block text-[11px] text-red-600 mt-1">{error}</span>
            )}
        </label>
    );
}
