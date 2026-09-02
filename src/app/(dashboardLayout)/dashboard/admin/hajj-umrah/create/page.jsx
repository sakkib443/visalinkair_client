"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { FiArrowLeft, FiSave, FiPlus, FiTrash2 } from "react-icons/fi";
import { FaKaaba } from "react-icons/fa6";
import { useSelector } from "react-redux";
import { selectToken } from "@/redux/features/authSlice";
import ImageInput from "@/components/shared/ImageInput";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function CreateForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const editId = searchParams.get("id");
    const token = useSelector(selectToken);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [formData, setFormData] = useState({
        name: "", nameBn: "", type: "umrah", subtitle: "", subtitleBn: "",
        image: "", duration: "", durationBn: "", price: "", oldPrice: "",
        currency: "BDT", groupSize: "30", bookings: "0",
        departureDate: "", hotel: "", hotelBn: "", distance: "", distanceBn: "",
        meals: "", mealsBn: "", description: "", descriptionBn: "",
        longDescription: "", longDescriptionBn: "",
        status: "upcoming", isActive: true, isFeatured: false, isPopular: false, order: "0",
        metaTitle: "", metaDescription: "",
    });
    const [features, setFeatures] = useState([""]);
    const [featuresBn, setFeaturesBn] = useState([""]);
    const [excludes, setExcludes] = useState([""]);
    const [excludesBn, setExcludesBn] = useState([""]);
    const [tags, setTags] = useState("");

    useEffect(() => {
        if (editId) {
            setFetching(true);
            fetch(`${API_BASE}/api/hajj-umrah/${editId}`)
                .then(r => r.json())
                .then(data => {
                    if (data.success && data.data) {
                        const d = data.data;
                        setFormData({
                            name: d.name || "", nameBn: d.nameBn || "", type: d.type || "umrah",
                            subtitle: d.subtitle || "", subtitleBn: d.subtitleBn || "",
                            image: d.image || "", duration: d.duration || "", durationBn: d.durationBn || "",
                            price: d.price?.toString() || "", oldPrice: d.oldPrice?.toString() || "",
                            currency: d.currency || "BDT", groupSize: d.groupSize?.toString() || "30",
                            bookings: d.bookings?.toString() || "0", departureDate: d.departureDate || "",
                            hotel: d.hotel || "", hotelBn: d.hotelBn || "",
                            distance: d.distance || "", distanceBn: d.distanceBn || "",
                            meals: d.meals || "", mealsBn: d.mealsBn || "",
                            description: d.description || "", descriptionBn: d.descriptionBn || "",
                            longDescription: d.longDescription || "", longDescriptionBn: d.longDescriptionBn || "",
                            status: d.status || "upcoming", isActive: d.isActive ?? true,
                            isFeatured: d.isFeatured || false, isPopular: d.isPopular || false,
                            order: d.order?.toString() || "0",
                            metaTitle: d.metaTitle || "", metaDescription: d.metaDescription || "",
                        });
                        setFeatures(d.features?.length ? d.features : [""]);
                        setFeaturesBn(d.featuresBn?.length ? d.featuresBn : [""]);
                        setExcludes(d.excludes?.length ? d.excludes : [""]);
                        setExcludesBn(d.excludesBn?.length ? d.excludesBn : [""]);
                        setTags(d.tags?.join(", ") || "");
                    }
                })
                .catch(() => toast.error("Failed to load package"))
                .finally(() => setFetching(false));
        }
    }, [editId]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
    };

    const handleListChange = (setter, list, index, value) => {
        const newList = [...list];
        newList[index] = value;
        setter(newList);
    };
    const addListItem = (setter, list) => setter([...list, ""]);
    const removeListItem = (setter, list, index) => setter(list.filter((_, i) => i !== index));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.price || !formData.duration) {
            toast.error("Fill required fields (name, price, duration)"); return;
        }
        setLoading(true);
        const body = {
            ...formData,
            price: Number(formData.price), oldPrice: Number(formData.oldPrice) || undefined,
            groupSize: Number(formData.groupSize) || 30, bookings: Number(formData.bookings) || 0,
            order: Number(formData.order) || 0,
            features: features.filter(f => f.trim()),
            featuresBn: featuresBn.filter(f => f.trim()),
            excludes: excludes.filter(f => f.trim()),
            excludesBn: excludesBn.filter(f => f.trim()),
            tags: tags.split(",").map(t => t.trim()).filter(Boolean),
        };
        // Remove empty optional fields to prevent validation errors
        ['nameBn', 'subtitle', 'subtitleBn', 'image', 'durationBn', 'departureDate',
         'hotel', 'hotelBn', 'distance', 'distanceBn', 'meals', 'mealsBn',
         'description', 'descriptionBn', 'longDescription', 'longDescriptionBn',
         'metaTitle', 'metaDescription'
        ].forEach(key => { if (!body[key]) delete body[key]; });
        if (body.oldPrice === undefined) delete body.oldPrice;
        try {
            const url = editId ? `${API_BASE}/api/hajj-umrah/${editId}` : `${API_BASE}/api/hajj-umrah`;
            const method = editId ? "PATCH" : "POST";
            const res = await fetch(url, {
                method, headers: { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (data.success) { toast.success(editId ? "Package updated!" : "Package created!"); router.push("/dashboard/admin/hajj-umrah"); }
            else toast.error(data.message || "Failed");
        } catch { toast.error("Network error"); }
        finally { setLoading(false); }
    };

    const inputClass = "w-full px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 text-[13px] focus:border-brand-dark outline-none transition-all placeholder-gray-400";
    const labelClass = "text-[11px] font-bold uppercase text-gray-400 mb-1.5 block";

    if (fetching) return (
        <div className="flex justify-center py-20">
            <div className="text-center"><FaKaaba size={30} className="mx-auto mb-3 animate-pulse" style={{ color: 'var(--color-brand-accent)' }} /><p className="text-gray-400 text-sm">Loading package...</p></div>
        </div>
    );

    return (
        <div className="p-4 lg:p-6 max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
                <Link href="/dashboard/admin/hajj-umrah" className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50"><FiArrowLeft size={16} /></Link>
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-tight" style={{ fontFamily: 'Teko, sans-serif', color: 'var(--color-brand-dark)' }}>{editId ? "Edit" : "Create"} Hajj/Umrah Package</h1>
                    <p className="text-[12px] text-gray-400 mt-0.5">{editId ? "Update existing package" : "Add a new package"}</p>
                </div>
            </div>

            <motion.form onSubmit={handleSubmit} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                {/* Basic Info */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <FaKaaba size={14} style={{ color: 'var(--color-brand-accent)' }} />
                        <h2 className="text-[13px] font-bold uppercase tracking-wider text-gray-500">Basic Information</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div><label className={labelClass}>Package Name (EN) *</label><input name="name" value={formData.name} onChange={handleChange} className={inputClass} placeholder="e.g. Umrah Premium Package" required /></div>
                        <div><label className={labelClass}>Package Name (BN)</label><input name="nameBn" value={formData.nameBn} onChange={handleChange} className={inputClass} placeholder="e.g. উমরাহ প্রিমিয়াম প্যাকেজ" /></div>
                        <div><label className={labelClass}>Subtitle (EN)</label><input name="subtitle" value={formData.subtitle} onChange={handleChange} className={inputClass} placeholder="e.g. Luxury VIP Experience" /></div>
                        <div><label className={labelClass}>Subtitle (BN)</label><input name="subtitleBn" value={formData.subtitleBn} onChange={handleChange} className={inputClass} placeholder="e.g. বিলাসবহুল ভিআইপি অভিজ্ঞতা" /></div>
                        <div><label className={labelClass}>Type *</label>
                            <select name="type" value={formData.type} onChange={handleChange} className={inputClass}>
                                <option value="umrah">Umrah</option><option value="hajj">Hajj</option>
                            </select></div>
                        <div><label className={labelClass}>Status</label>
                            <select name="status" value={formData.status} onChange={handleChange} className={inputClass}>
                                <option value="upcoming">Upcoming</option><option value="active">Active</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option>
                            </select></div>
                        <div><label className={labelClass}>Tags (comma separated)</label><input value={tags} onChange={e => setTags(e.target.value)} className={inputClass} placeholder="Umrah, Premium, Ramadan" /></div>
                        <div className="sm:col-span-2">
                            <ImageInput
                                label="Package Image"
                                value={formData.image}
                                onChange={(v) => setFormData(prev => ({ ...prev, image: v }))}
                                inputClass={inputClass}
                                labelClass={labelClass}
                            />
                        </div>
                    </div>
                    <div className="flex gap-5 mt-4">
                        <label className="flex items-center gap-2 text-[12px] text-gray-600"><input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} className="rounded" /> Active</label>
                        <label className="flex items-center gap-2 text-[12px] text-gray-600"><input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleChange} className="rounded" /> Featured</label>
                        <label className="flex items-center gap-2 text-[12px] text-gray-600"><input type="checkbox" name="isPopular" checked={formData.isPopular} onChange={handleChange} className="rounded" /> Popular</label>
                    </div>
                </div>

                {/* Duration & Pricing */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 p-5">
                    <h2 className="text-[13px] font-bold uppercase tracking-wider text-gray-500 mb-4">💰 Duration & Pricing</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div><label className={labelClass}>Duration (EN) *</label><input name="duration" value={formData.duration} onChange={handleChange} className={inputClass} placeholder="e.g. 10 Days" required /></div>
                        <div><label className={labelClass}>Duration (BN)</label><input name="durationBn" value={formData.durationBn} onChange={handleChange} className={inputClass} placeholder="e.g. ১০ দিন" /></div>
                        <div><label className={labelClass}>Departure Date</label><input name="departureDate" type="date" value={formData.departureDate} onChange={handleChange} className={inputClass} /></div>
                        <div><label className={labelClass}>Price (৳) *</label><input name="price" type="number" value={formData.price} onChange={handleChange} className={inputClass} placeholder="185000" required /></div>
                        <div><label className={labelClass}>Old Price (৳)</label><input name="oldPrice" type="number" value={formData.oldPrice} onChange={handleChange} className={inputClass} placeholder="210000" /></div>
                        <div><label className={labelClass}>Group Size</label><input name="groupSize" type="number" value={formData.groupSize} onChange={handleChange} className={inputClass} placeholder="30" /></div>
                        <div><label className={labelClass}>Order</label><input name="order" type="number" value={formData.order} onChange={handleChange} className={inputClass} placeholder="0" /></div>
                    </div>
                </div>

                {/* Hotel & Meals */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 p-5">
                    <h2 className="text-[13px] font-bold uppercase tracking-wider text-gray-500 mb-4">🏨 Hotel & Meals</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div><label className={labelClass}>Hotel (EN)</label><input name="hotel" value={formData.hotel} onChange={handleChange} className={inputClass} placeholder="5-Star Makkah + 4-Star Madinah" /></div>
                        <div><label className={labelClass}>Hotel (BN)</label><input name="hotelBn" value={formData.hotelBn} onChange={handleChange} className={inputClass} placeholder="৫-স্টার মক্কা + ৪-স্টার মদিনা" /></div>
                        <div><label className={labelClass}>Distance from Haram (EN)</label><input name="distance" value={formData.distance} onChange={handleChange} className={inputClass} placeholder="400m from Haram" /></div>
                        <div><label className={labelClass}>Distance from Haram (BN)</label><input name="distanceBn" value={formData.distanceBn} onChange={handleChange} className={inputClass} placeholder="হারাম থেকে ৪০০ মিটার" /></div>
                        <div><label className={labelClass}>Meals (EN)</label><input name="meals" value={formData.meals} onChange={handleChange} className={inputClass} placeholder="Full Board" /></div>
                        <div><label className={labelClass}>Meals (BN)</label><input name="mealsBn" value={formData.mealsBn} onChange={handleChange} className={inputClass} placeholder="ফুল বোর্ড" /></div>
                    </div>
                </div>

                {/* Description */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 p-5">
                    <h2 className="text-[13px] font-bold uppercase tracking-wider text-gray-500 mb-4">📝 Description</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div><label className={labelClass}>Short Description (EN)</label><textarea name="description" value={formData.description} onChange={handleChange} rows={3} className={`${inputClass} resize-none`} placeholder="Brief overview..." /></div>
                        <div><label className={labelClass}>Short Description (BN)</label><textarea name="descriptionBn" value={formData.descriptionBn} onChange={handleChange} rows={3} className={`${inputClass} resize-none`} placeholder="সংক্ষিপ্ত বিবরণ..." /></div>
                        <div><label className={labelClass}>Full Description (EN)</label><textarea name="longDescription" value={formData.longDescription} onChange={handleChange} rows={4} className={`${inputClass} resize-none`} placeholder="Detailed description..." /></div>
                        <div><label className={labelClass}>Full Description (BN)</label><textarea name="longDescriptionBn" value={formData.longDescriptionBn} onChange={handleChange} rows={4} className={`${inputClass} resize-none`} placeholder="বিস্তারিত বিবরণ..." /></div>
                    </div>
                </div>

                {/* Features (What's Included) */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 p-5">
                    <h2 className="text-[13px] font-bold uppercase tracking-wider text-gray-500 mb-4">✅ What's Included</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Features (EN)</label>
                            {features.map((f, i) => (
                                <div key={i} className="flex gap-2 mb-2">
                                    <input value={f} onChange={e => handleListChange(setFeatures, features, i, e.target.value)} className={inputClass} placeholder={`Feature ${i + 1}`} />
                                    {features.length > 1 && <button type="button" onClick={() => removeListItem(setFeatures, features, i)} className="text-red-400 hover:text-red-600"><FiTrash2 size={14} /></button>}
                                </div>
                            ))}
                            <button type="button" onClick={() => addListItem(setFeatures, features)} className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1"><FiPlus size={12} /> Add Feature</button>
                        </div>
                        <div>
                            <label className={labelClass}>Features (BN)</label>
                            {featuresBn.map((f, i) => (
                                <div key={i} className="flex gap-2 mb-2">
                                    <input value={f} onChange={e => handleListChange(setFeaturesBn, featuresBn, i, e.target.value)} className={inputClass} placeholder={`ফিচার ${i + 1}`} />
                                    {featuresBn.length > 1 && <button type="button" onClick={() => removeListItem(setFeaturesBn, featuresBn, i)} className="text-red-400 hover:text-red-600"><FiTrash2 size={14} /></button>}
                                </div>
                            ))}
                            <button type="button" onClick={() => addListItem(setFeaturesBn, featuresBn)} className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1"><FiPlus size={12} /> Add Feature (BN)</button>
                        </div>
                    </div>
                </div>

                {/* Excludes */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 p-5">
                    <h2 className="text-[13px] font-bold uppercase tracking-wider text-gray-500 mb-4">❌ What's Not Included</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Excludes (EN)</label>
                            {excludes.map((f, i) => (
                                <div key={i} className="flex gap-2 mb-2">
                                    <input value={f} onChange={e => handleListChange(setExcludes, excludes, i, e.target.value)} className={inputClass} placeholder={`Exclude ${i + 1}`} />
                                    {excludes.length > 1 && <button type="button" onClick={() => removeListItem(setExcludes, excludes, i)} className="text-red-400 hover:text-red-600"><FiTrash2 size={14} /></button>}
                                </div>
                            ))}
                            <button type="button" onClick={() => addListItem(setExcludes, excludes)} className="text-[11px] text-red-500 font-semibold flex items-center gap-1 mt-1"><FiPlus size={12} /> Add Exclude</button>
                        </div>
                        <div>
                            <label className={labelClass}>Excludes (BN)</label>
                            {excludesBn.map((f, i) => (
                                <div key={i} className="flex gap-2 mb-2">
                                    <input value={f} onChange={e => handleListChange(setExcludesBn, excludesBn, i, e.target.value)} className={inputClass} placeholder={`বাদ ${i + 1}`} />
                                    {excludesBn.length > 1 && <button type="button" onClick={() => removeListItem(setExcludesBn, excludesBn, i)} className="text-red-400 hover:text-red-600"><FiTrash2 size={14} /></button>}
                                </div>
                            ))}
                            <button type="button" onClick={() => addListItem(setExcludesBn, excludesBn)} className="text-[11px] text-red-500 font-semibold flex items-center gap-1 mt-1"><FiPlus size={12} /> Add Exclude (BN)</button>
                        </div>
                    </div>
                </div>

                {/* SEO */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 p-5">
                    <h2 className="text-[13px] font-bold uppercase tracking-wider text-gray-500 mb-4">🔍 SEO</h2>
                    <div className="grid grid-cols-1 gap-4">
                        <div><label className={labelClass}>Meta Title</label><input name="metaTitle" value={formData.metaTitle} onChange={handleChange} className={inputClass} placeholder="SEO title" /></div>
                        <div><label className={labelClass}>Meta Description</label><textarea name="metaDescription" value={formData.metaDescription} onChange={handleChange} rows={2} className={`${inputClass} resize-none`} placeholder="SEO description" /></div>
                    </div>
                </div>

                {/* Submit */}
                <div className="flex items-center justify-end gap-3 pb-8">
                    <Link href="/dashboard/admin/hajj-umrah" className="px-5 py-2.5 rounded-lg text-[12px] font-semibold text-gray-500 border border-gray-200 hover:bg-gray-50">Cancel</Link>
                    <button type="submit" disabled={loading} className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-[12px] font-semibold text-white disabled:opacity-50" style={{ backgroundColor: 'var(--color-brand-dark)' }}>
                        <FiSave size={14} /> {loading ? "Saving..." : editId ? "Update Package" : "Create Package"}
                    </button>
                </div>
            </motion.form>
        </div>
    );
}

export default function CreateHajjUmrahPage() {
    return (<Suspense fallback={<div className="flex justify-center py-20"><FaKaaba size={30} className="animate-pulse" style={{ color: 'var(--color-brand-accent)' }} /></div>}><CreateForm /></Suspense>);
}
