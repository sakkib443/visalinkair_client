"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { FiSave, FiLoader, FiRefreshCw, FiPlus, FiTrash2, FiChevronUp, FiChevronDown } from "react-icons/fi";
import { selectToken } from "@/redux/features/authSlice";
import ImageInput from "@/components/shared/ImageInput";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const SECTIONS = ["hero", "services", "partners", "consultation", "whyChooseUs"];
const TAB_LABELS = { hero: "Hero", services: "Services", partners: "Partners", consultation: "Consultation", whyChooseUs: "Why Choose Us" };

// ─── Reusable Field Components ───────────────────────────────────────
function Field({ label, value, onChange, placeholder, wide, textarea, help }) {
    const Tag = textarea ? "textarea" : "input";
    return (
        <div className={wide ? "md:col-span-2" : ""}>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">{label}</label>
            <Tag
                value={value || ""}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                rows={textarea ? 3 : undefined}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 bg-transparent text-gray-800 placeholder-gray-400 resize-none"
            />
            {help && <p className="text-[10px] text-gray-400 mt-1">{help}</p>}
        </div>
    );
}

// Field-এর মতোই দেখতে, কিন্তু ভেতরে লিংক বক্সের পাশে Upload বাটন ও
// ছোট প্রিভিউ থাকে — এই পেজের সব ছবির ঘরে এটাই ব্যবহার হয়।
function ImageField({ label, value, onChange, placeholder, help, wide }) {
    return (
        <div className={wide ? "md:col-span-2" : ""}>
            <ImageInput
                label={label}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                hint={help}
                labelClass="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5"
                inputClass="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 bg-transparent text-gray-800 placeholder-gray-400"
            />
        </div>
    );
}

function BilingualField({ label, data, onChange, placeholder, textarea }) {
    const d = data || { en: "", bn: "" };
    return (
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label={`${label} (English)`} value={d.en} onChange={(v) => onChange({ ...d, en: v })} placeholder={placeholder} textarea={textarea} />
            <Field label={`${label} (বাংলা)`} value={d.bn} onChange={(v) => onChange({ ...d, bn: v })} placeholder={placeholder} textarea={textarea} />
        </div>
    );
}

function SectionCard({ title, desc, children }) {
    return (
        <section className="bg-white rounded-xl border border-gray-100 p-6 mb-5">
            <h2 className="text-lg font-bold text-gray-900 mb-0.5">{title}</h2>
            {desc && <p className="text-xs text-gray-500 mb-5">{desc}</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
        </section>
    );
}

// ─── Hero Background Slides ──────────────────────────────────────────
// The pictures that fade behind the hero. Upload replaces the old workflow of
// dropping files in /public and editing the code.
function SlidesEditor({ slides, setSlides }) {
    const token = useSelector(selectToken);
    const [uploading, setUploading] = useState(false);

    // Upload one file and hand back the saved URL.
    const uploadOne = async (file) => {
        if (!file.type.startsWith("image/")) throw new Error(`${file.name} is not an image`);
        if (file.size > 5 * 1024 * 1024) throw new Error(`${file.name} is over 5MB`);

        const fd = new FormData();
        fd.append("image", file);
        const res = await fetch(`${API_BASE}/api/upload/single`, {
            method: "POST",
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            body: fd,
        });
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.message || "Upload failed");
        return json.data.url;
    };

    // Replace the picture in one row.
    const replaceAt = async (file, index) => {
        if (!file) return;
        setUploading(true);
        try {
            const url = await uploadOne(file);
            const next = [...slides];
            next[index] = { ...next[index], image: url };
            setSlides(next);
            toast.success("Picture replaced");
        } catch (err) {
            toast.error(err.message);
        } finally {
            setUploading(false);
        }
    };

    // Add one or many pictures at once — each uploaded file becomes a slide.
    const addFiles = async (fileList) => {
        const files = Array.from(fileList || []);
        if (!files.length) return;
        setUploading(true);
        const added = [];
        for (const file of files) {
            try {
                added.push({ image: await uploadOne(file) });
            } catch (err) {
                toast.error(err.message);
            }
        }
        if (added.length) {
            setSlides([...slides, ...added]);
            toast.success(`${added.length} picture${added.length === 1 ? "" : "s"} uploaded`);
        }
        setUploading(false);
    };

    const move = (i, dir) => {
        const j = i + dir;
        if (j < 0 || j >= slides.length) return;
        const next = [...slides];
        [next[i], next[j]] = [next[j], next[i]];
        setSlides(next);
    };

    return (
        <section className="bg-white rounded-xl border border-gray-100 p-6 mb-5">
            <h2 className="text-lg font-bold text-gray-900 mb-0.5">Background Pictures</h2>
            <p className="text-xs text-gray-500 mb-5">
                These fade one after another behind the hero — pick several files at once to add
                them all. Uploading, reordering or removing a picture is saved to the database when
                you hit Save Hero. With none saved, the site falls back to the four pictures shipped
                with it.
            </p>

            {slides.length === 0 && (
                <p className="text-[13px] text-gray-400 mb-4">No pictures added yet.</p>
            )}

            <div className="space-y-3">
                {slides.map((s, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200">
                        <img
                            src={s.image}
                            alt={`Slide ${i + 1}`}
                            className="w-24 h-14 rounded object-cover border border-gray-100 flex-shrink-0 bg-gray-50"
                        />
                        <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-bold uppercase text-gray-400">Slide {i + 1}</p>
                            <input
                                value={s.image || ""}
                                onChange={(e) => {
                                    const next = [...slides];
                                    next[i] = { ...next[i], image: e.target.value };
                                    setSlides(next);
                                }}
                                placeholder="/hero.jpg or https://..."
                                className="w-full mt-1 px-2 py-1.5 text-[12px] border border-gray-200 rounded outline-none focus:border-brand-blue bg-transparent text-gray-700"
                            />
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                            <button type="button" onClick={() => move(i, -1)} disabled={i === 0}
                                className="w-7 h-7 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center disabled:opacity-30" title="Move up">
                                <FiChevronUp size={13} />
                            </button>
                            <button type="button" onClick={() => move(i, 1)} disabled={i === slides.length - 1}
                                className="w-7 h-7 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center disabled:opacity-30" title="Move down">
                                <FiChevronDown size={13} />
                            </button>
                            <label className="cursor-pointer px-2.5 py-1.5 rounded text-[11px] font-bold bg-brand-blue text-white hover:opacity-90">
                                Replace
                                <input type="file" accept="image/*" className="hidden" onChange={(e) => replaceAt(e.target.files?.[0], i)} />
                            </label>
                            <button type="button" onClick={() => setSlides(slides.filter((_, x) => x !== i))}
                                className="w-7 h-7 rounded bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center" title="Remove">
                                <FiTrash2 size={13} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex items-center gap-2 mt-4">
                <label className={`cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-bold text-white hover:opacity-90 ${uploading ? "opacity-50 pointer-events-none" : ""}`}
                    style={{ backgroundColor: "var(--color-brand-blue)" }}>
                    {uploading ? <FiLoader size={13} className="animate-spin" /> : <FiPlus size={13} />}
                    {uploading ? "Uploading..." : "Upload Pictures"}
                    <input type="file" accept="image/*" multiple className="hidden" disabled={uploading} onChange={(e) => addFiles(e.target.files)} />
                </label>
                <button type="button" onClick={() => setSlides([...slides, { image: "" }])}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-bold border border-gray-200 text-gray-600 hover:bg-gray-50">
                    <FiPlus size={13} /> Add by URL
                </button>
            </div>
        </section>
    );
}

// ─── Hero Editor ─────────────────────────────────────────────────────
// The hero is a background picture slider and nothing else, so this editor is
// just the pictures plus how fast they change. The badge / heading / button
// fields that used to sit here were never rendered by the Hero component and
// have been removed from the codebase and the database. The search card below
// the pictures is driven by the visa/hotel/tour data, not by page content.
function HeroEditor({ data, setData }) {
    const d = data || {};
    const set = (k, v) => setData({ ...d, [k]: v });

    const slides = d.slides || [];
    const setSlides = (next) => set("slides", next.map((s, i) => ({ ...s, order: i })));

    return (
        <>
            <SlidesEditor slides={slides} setSlides={setSlides} />

            <SectionCard title="Slider Speed" desc="How long each background picture stays before the next one fades in">
                <Field
                    label="Seconds per slide"
                    value={d.slideSeconds ?? ""}
                    onChange={(v) => set("slideSeconds", v === "" ? "" : Number(v))}
                    placeholder="4"
                    help="Leave empty for the default (4 seconds)"
                />
            </SectionCard>
        </>
    );
}

// ─── Services Editor ─────────────────────────────────────────────────
function ServicesEditor({ data, setData }) {
    const d = data || {};
    const items = d.items || [];
    const set = (k, v) => setData({ ...d, [k]: v });
    const setItem = (idx, k, v) => {
        const copy = [...items];
        copy[idx] = { ...copy[idx], [k]: v };
        set("items", copy);
    };
    const addItem = () => {
        set("items", [...items, { title: { en: "", bn: "" }, subtitle: { en: "", bn: "" }, description: { en: "", bn: "" }, icon: "LuTicket", image: "", color: "var(--color-brand-blue)", stats: { en: "", bn: "" }, href: "/", order: items.length + 1, isActive: true }]);
    };
    const removeItem = (idx) => set("items", items.filter((_, i) => i !== idx));
    const moveItem = (idx, dir) => {
        const copy = [...items];
        const target = idx + dir;
        if (target < 0 || target >= copy.length) return;
        [copy[idx], copy[target]] = [copy[target], copy[idx]];
        set("items", copy);
    };

    return (
        <>
            <SectionCard title="Section Header" desc="Title and description of services section">
                <BilingualField label="Tag Text" data={d.tagText} onChange={(v) => set("tagText", v)} placeholder="OUR SERVICES" />
                <BilingualField label="Heading" data={d.heading} onChange={(v) => set("heading", v)} placeholder="WHAT WE" />
                <BilingualField label="Heading Highlight" data={d.headingHighlight} onChange={(v) => set("headingHighlight", v)} placeholder="OFFER" />
                <BilingualField label="Description" data={d.description} onChange={(v) => set("description", v)} placeholder="Comprehensive travel..." textarea />
            </SectionCard>

            <section className="bg-white rounded-xl border border-gray-100 p-6 mb-5">
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Service Items</h2>
                        <p className="text-xs text-gray-500">{items.length} services configured</p>
                    </div>
                    <button type="button" onClick={addItem} className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-brand-blue bg-brand-blue/10 rounded-lg hover:bg-brand-blue/20 cursor-pointer">
                        <FiPlus size={14} /> Add Service
                    </button>
                </div>

                <div className="space-y-4">
                    {items.map((item, idx) => (
                        <div key={idx} className="border border-gray-100 rounded-xl p-5 relative">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm font-bold text-gray-700">#{idx + 1} — {item.title?.en || "New Service"}</span>
                                <div className="flex items-center gap-1">
                                    <button type="button" onClick={() => moveItem(idx, -1)} className="p-1.5 hover:bg-gray-100 rounded cursor-pointer"><FiChevronUp size={14} /></button>
                                    <button type="button" onClick={() => moveItem(idx, 1)} className="p-1.5 hover:bg-gray-100 rounded cursor-pointer"><FiChevronDown size={14} /></button>
                                    <button type="button" onClick={() => removeItem(idx)} className="p-1.5 hover:bg-red-50 text-red-400 rounded cursor-pointer"><FiTrash2 size={14} /></button>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <BilingualField label="Title" data={item.title} onChange={(v) => setItem(idx, "title", v)} placeholder="Visa Processing" />
                                <BilingualField label="Subtitle" data={item.subtitle} onChange={(v) => setItem(idx, "subtitle", v)} placeholder="Immigration" />
                                <BilingualField label="Description" data={item.description} onChange={(v) => setItem(idx, "description", v)} textarea />
                                <BilingualField label="Stats Text" data={item.stats} onChange={(v) => setItem(idx, "stats", v)} placeholder="10K+ Processed" />
                                <Field label="Icon Name" value={item.icon} onChange={(v) => setItem(idx, "icon", v)} placeholder="LuTicket" help="React icon name: LuTicket, LuPlane, LuBed, LuMapPin, LuMoon, LuGraduationCap" />
                                <Field label="Color" value={item.color} onChange={(v) => setItem(idx, "color", v)} placeholder="var(--color-brand-blue)" />
                                <ImageField label="Image" value={item.image} onChange={(v) => setItem(idx, "image", v)} wide />
                                <Field label="Link" value={item.href} onChange={(v) => setItem(idx, "href", v)} placeholder="/visa" />
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <SectionCard title="Bottom CTA" desc="Call to action below service cards">
                <BilingualField label="CTA Text" data={d.bottomCTAText} onChange={(v) => set("bottomCTAText", v)} placeholder="View All Services" />
                <Field label="CTA Link" value={d.bottomCTALink} onChange={(v) => set("bottomCTALink", v)} placeholder="/contact" />
            </SectionCard>
        </>
    );
}

// ─── Partners Editor ─────────────────────────────────────────────────
function PartnersEditor({ data, setData }) {
    const d = data || {};
    const items = d.items || [];
    const set = (k, v) => setData({ ...d, [k]: v });
    const setItem = (idx, k, v) => {
        const copy = [...items];
        copy[idx] = { ...copy[idx], [k]: v };
        set("items", copy);
    };
    const addItem = () => set("items", [...items, { name: "", icon: "LuPlane", image: "", color: "primary", order: items.length + 1 }]);
    const removeItem = (idx) => set("items", items.filter((_, i) => i !== idx));

    return (
        <section className="bg-white rounded-xl border border-gray-100 p-6 mb-5">
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h2 className="text-lg font-bold text-gray-900">Partner Logos</h2>
                    <p className="text-xs text-gray-500">Scrolling partner carousel on homepage</p>
                </div>
                <button type="button" onClick={addItem} className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-brand-blue bg-brand-blue/10 rounded-lg hover:bg-brand-blue/20 cursor-pointer">
                    <FiPlus size={14} /> Add Partner
                </button>
            </div>
            <div className="space-y-3">
                {items.map((item, idx) => (
                    <div key={idx} className="border border-gray-100 rounded-lg p-3 space-y-2">
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-gray-400 w-6">#{idx + 1}</span>
                            <input value={item.name || ""} onChange={(e) => setItem(idx, "name", e.target.value)} placeholder="Partner Name" className="flex-1 text-sm px-2 py-1.5 border border-gray-200 rounded-lg outline-none focus:border-brand-blue" />
                            <input value={item.icon || ""} onChange={(e) => setItem(idx, "icon", e.target.value)} placeholder="Icon" className="w-32 text-sm px-2 py-1.5 border border-gray-200 rounded-lg outline-none focus:border-brand-blue" />
                            <input value={item.color || ""} onChange={(e) => setItem(idx, "color", e.target.value)} placeholder="Color" className="w-24 text-sm px-2 py-1.5 border border-gray-200 rounded-lg outline-none focus:border-brand-blue" />
                            <button type="button" onClick={() => removeItem(idx)} className="p-1.5 hover:bg-red-50 text-red-400 rounded cursor-pointer"><FiTrash2 size={14} /></button>
                        </div>
                        <div className="pl-9">
                            <ImageInput
                                label="Logo"
                                value={item.image}
                                onChange={(v) => setItem(idx, "image", v)}
                                hint="লোগো দিলে সেটাই দেখাবে; খালি রাখলে উপরের Icon দিয়েই আঁকা হবে"
                                thumbSize={36}
                                labelClass="text-[10px] font-bold uppercase text-gray-400 mb-1 block"
                                inputClass="w-full text-sm px-2 py-1.5 border border-gray-200 rounded-lg outline-none focus:border-brand-blue bg-transparent"
                            />
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

// ─── Consultation Editor ─────────────────────────────────────────────
function ConsultationEditor({ data, setData }) {
    const d = data || {};
    const set = (k, v) => setData({ ...d, [k]: v });
    return (
        <>
            <SectionCard title="Section Header" desc="Tag, heading, and description">
                <BilingualField label="Tag Text" data={d.tagText} onChange={(v) => set("tagText", v)} placeholder="IMMIGRATION CONSULTING" />
                <BilingualField label="Heading" data={d.heading} onChange={(v) => set("heading", v)} placeholder="EXPERT IMMIGRATION" />
                <BilingualField label="Heading Highlight" data={d.headingHighlight} onChange={(v) => set("headingHighlight", v)} placeholder="CONSULTING" />
                <BilingualField label="Heading End" data={d.headingEnd} onChange={(v) => set("headingEnd", v)} placeholder="SERVICE" />
                <BilingualField label="Description" data={d.description} onChange={(v) => set("description", v)} textarea />
            </SectionCard>
            <SectionCard title="Experience Block" desc="Experience highlight section">
                <BilingualField label="Title" data={d.experienceTitle} onChange={(v) => set("experienceTitle", v)} placeholder="10+ Years Of Experience" />
                <BilingualField label="Description" data={d.experienceDesc} onChange={(v) => set("experienceDesc", v)} textarea />
                <ImageField label="Experience Image" value={d.experienceImage} onChange={(v) => set("experienceImage", v)} wide />
            </SectionCard>
            <SectionCard title="Images & CTA" desc="Main images and call to action">
                <ImageField label="Main Image 1 (Background)" value={d.mainImage1} onChange={(v) => set("mainImage1", v)} placeholder="/images/img01.png" />
                <ImageField label="Main Image 2 (Person)" value={d.mainImage2} onChange={(v) => set("mainImage2", v)} placeholder="/images/img02.png" />
                <BilingualField label="CTA Text" data={d.ctaText} onChange={(v) => set("ctaText", v)} placeholder="Explore More" />
                <Field label="CTA Link" value={d.ctaLink} onChange={(v) => set("ctaLink", v)} placeholder="/contact" />
                <Field label="Agent Count" value={d.agentCount} onChange={(v) => set("agentCount", v)} placeholder="200+" />
                <BilingualField label="Agent Label" data={d.agentLabel} onChange={(v) => set("agentLabel", v)} placeholder="Real Agents" />
            </SectionCard>
        </>
    );
}

// ─── Why Choose Us Editor ────────────────────────────────────────────
function WhyChooseEditor({ data, setData }) {
    const d = data || {};
    const cards = d.cards || [];
    const stats = d.stats || [];
    const set = (k, v) => setData({ ...d, [k]: v });
    const setCard = (idx, k, v) => { const c = [...cards]; c[idx] = { ...c[idx], [k]: v }; set("cards", c); };
    const setStat = (idx, k, v) => { const s = [...stats]; s[idx] = { ...s[idx], [k]: v }; set("stats", s); };
    const addCard = () => set("cards", [...cards, { title: { en: "", bn: "" }, description: { en: "", bn: "" }, icon: "🎯", color: "var(--color-brand-blue)", order: cards.length + 1 }]);
    const removeCard = (idx) => set("cards", cards.filter((_, i) => i !== idx));
    const addStat = () => set("stats", [...stats, { value: "", label: { en: "", bn: "" }, color: "var(--color-brand-blue)", order: stats.length + 1 }]);
    const removeStat = (idx) => set("stats", stats.filter((_, i) => i !== idx));

    return (
        <>
            <SectionCard title="Section Header" desc="Title and description">
                <BilingualField label="Tag Text" data={d.tagText} onChange={(v) => set("tagText", v)} placeholder="WHY VISALINK AIR" />
                <BilingualField label="Heading" data={d.heading} onChange={(v) => set("heading", v)} placeholder="WHY CHOOSE" />
                <BilingualField label="Heading Highlight" data={d.headingHighlight} onChange={(v) => set("headingHighlight", v)} placeholder="US" />
                <BilingualField label="Description" data={d.description} onChange={(v) => set("description", v)} textarea />
            </SectionCard>

            <section className="bg-white rounded-xl border border-gray-100 p-6 mb-5">
                <div className="flex items-center justify-between mb-5">
                    <div><h2 className="text-lg font-bold text-gray-900">Feature Cards</h2><p className="text-xs text-gray-500">{cards.length} cards</p></div>
                    <button type="button" onClick={addCard} className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-brand-blue bg-brand-blue/10 rounded-lg hover:bg-brand-blue/20 cursor-pointer"><FiPlus size={14} /> Add Card</button>
                </div>
                <div className="space-y-4">
                    {cards.map((card, idx) => (
                        <div key={idx} className="border border-gray-100 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-bold text-gray-700">#{idx + 1} — {card.title?.en || "New"}</span>
                                <button type="button" onClick={() => removeCard(idx)} className="p-1.5 hover:bg-red-50 text-red-400 rounded cursor-pointer"><FiTrash2 size={14} /></button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <BilingualField label="Title" data={card.title} onChange={(v) => setCard(idx, "title", v)} />
                                <BilingualField label="Description" data={card.description} onChange={(v) => setCard(idx, "description", v)} textarea />
                                <Field label="Icon (emoji)" value={card.icon} onChange={(v) => setCard(idx, "icon", v)} placeholder="🎯" />
                                <Field label="Color" value={card.color} onChange={(v) => setCard(idx, "color", v)} placeholder="var(--color-brand-blue)" />
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="bg-white rounded-xl border border-gray-100 p-6 mb-5">
                <div className="flex items-center justify-between mb-5">
                    <div><h2 className="text-lg font-bold text-gray-900">Stats Bar</h2><p className="text-xs text-gray-500">{stats.length} stats</p></div>
                    <button type="button" onClick={addStat} className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-brand-blue bg-brand-blue/10 rounded-lg hover:bg-brand-blue/20 cursor-pointer"><FiPlus size={14} /> Add Stat</button>
                </div>
                <div className="space-y-3">
                    {stats.map((stat, idx) => (
                        <div key={idx} className="flex flex-wrap items-end gap-3 border border-gray-100 rounded-lg p-3">
                            <Field label="Value" value={stat.value} onChange={(v) => setStat(idx, "value", v)} placeholder="10+" />
                            <BilingualField label="Label" data={stat.label} onChange={(v) => setStat(idx, "label", v)} placeholder="Years Experience" />
                            <Field label="Color" value={stat.color} onChange={(v) => setStat(idx, "color", v)} placeholder="var(--color-brand-blue)" />
                            <button type="button" onClick={() => removeStat(idx)} className="p-1.5 hover:bg-red-50 text-red-400 rounded cursor-pointer mb-1"><FiTrash2 size={14} /></button>
                        </div>
                    ))}
                </div>
            </section>
        </>
    );
}

// ─── Main Page ───────────────────────────────────────────────────────
export default function HomeContentPage() {
    const token = useSelector(selectToken);
    const [activeTab, setActiveTab] = useState("hero");
    const [allData, setAllData] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/home-content`);
            const json = await res.json();
            if (json.success && json.data) {
                const map = {};
                json.data.forEach((doc) => { map[doc.section] = doc.data; });
                setAllData(map);
            }
        } catch (err) { console.error("Fetch error:", err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchAll(); }, []);

    const currentData = allData[activeTab] || {};
    const setCurrentData = (newData) => setAllData((prev) => ({ ...prev, [activeTab]: newData }));

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch(`${API_BASE}/api/home-content/${activeTab}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify(currentData),
            });
            const json = await res.json();
            if (!res.ok || !json.success) throw new Error(json.message || "Save failed");
            toast.success(`${TAB_LABELS[activeTab]} saved successfully!`);
        } catch (err) { toast.error(err.message || "Save failed"); }
        finally { setSaving(false); }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <FiLoader className="w-8 h-8 text-gray-300 animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div>
                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                        <span>Design & Content</span><span>/</span>
                        <span className="text-gray-600 font-medium">Home Page</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Home Page Content</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Manage all homepage sections from here</p>
                </div>
                <div className="flex items-center gap-2">
                    <button type="button" onClick={fetchAll} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <FiRefreshCw /> Refresh
                    </button>
                    <button type="button" onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2 bg-brand-blue hover:bg-brand-blue-hover disabled:bg-gray-300 text-white font-semibold rounded-lg transition-colors cursor-pointer text-sm">
                        {saving ? <FiLoader className="animate-spin" /> : <FiSave />}
                        {saving ? "Saving..." : `Save ${TAB_LABELS[activeTab]}`}
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
                {SECTIONS.map((s) => (
                    <button
                        key={s}
                        onClick={() => setActiveTab(s)}
                        className={`px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap cursor-pointer transition-all ${activeTab === s ? "bg-brand-blue text-white shadow-md" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}
                    >
                        {TAB_LABELS[s]}
                    </button>
                ))}
            </div>

            {/* Editor */}
            {activeTab === "hero" && <HeroEditor data={currentData} setData={setCurrentData} />}
            {activeTab === "services" && <ServicesEditor data={currentData} setData={setCurrentData} />}
            {activeTab === "partners" && <PartnersEditor data={currentData} setData={setCurrentData} />}
            {activeTab === "consultation" && <ConsultationEditor data={currentData} setData={setCurrentData} />}
            {activeTab === "whyChooseUs" && <WhyChooseEditor data={currentData} setData={setCurrentData} />}

            {/* Bottom Save */}
            <div className="flex justify-end mt-6">
                <button type="button" onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-3 bg-brand-blue hover:bg-brand-blue-hover disabled:bg-gray-300 text-white font-semibold rounded-lg cursor-pointer">
                    {saving ? <FiLoader className="animate-spin" /> : <FiSave />}
                    {saving ? "Saving..." : `Save ${TAB_LABELS[activeTab]}`}
                </button>
            </div>
        </div>
    );
}
