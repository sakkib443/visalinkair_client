"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
    FiArrowLeft, FiSave, FiMapPin, FiDollarSign,
    FiImage, FiFileText, FiPlus, FiTrash2, FiLoader,
    FiTag, FiHelpCircle, FiStar,
} from "react-icons/fi";
import { LuBed } from "react-icons/lu";
import { useSelector } from "react-redux";
import { selectToken } from "@/redux/features/authSlice";
import ImageInput, { ImageGalleryInput } from "@/components/shared/ImageInput";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const hotelCategories = [
    { value: "luxury", label: "Luxury" },
    { value: "mid-range", label: "Mid-Range" },
    { value: "budget", label: "Budget" },
    { value: "boutique", label: "Boutique" },
    { value: "resort", label: "Resort" },
    { value: "business", label: "Business" },
    { value: "hostel", label: "Hostel" },
];

const statuses = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "maintenance", label: "Maintenance" },
];

function HotelForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const editId = searchParams.get("id");
    const isEdit = !!editId;

    const token = useSelector(selectToken);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        nameBn: "",
        image: "",
        gallery: [],
        location: "",
        locationBn: "",
        city: "",
        cityBn: "",
        country: "",
        countryBn: "",
        starRating: "3",
        hotelCategory: "mid-range",
        roomType: "",
        roomTypeBn: "",
        pricePerNight: "",
        oldPrice: "",
        currency: "BDT",
        totalRooms: "",
        availableRooms: "",
        checkInTime: "14:00",
        checkOutTime: "12:00",
        description: "",
        descriptionBn: "",
        longDescription: "",
        longDescriptionBn: "",
        status: "active",
        isActive: true,
        isFeatured: false,
        rating: "0",
        order: "0",
        metaTitle: "",
        metaDescription: "",
    });

    const [amenities, setAmenities] = useState("");
    const [amenitiesBn, setAmenitiesBn] = useState("");
    const [tags, setTags] = useState("");
    const [faqs, setFaqs] = useState([]);

    useEffect(() => {
        if (isEdit) fetchHotel();
    }, [editId]);

    const fetchHotel = async () => {
        setFetching(true);
        try {
            const res = await fetch(`${API_BASE}/api/hotels/${editId}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            const data = await res.json();
            if (data.success && data.data) {
                const h = data.data;
                setFormData({
                    name: h.name || "",
                    nameBn: h.nameBn || "",
                    image: h.image || "",
                    gallery: Array.isArray(h.gallery) ? h.gallery : [],
                    location: h.location || "",
                    locationBn: h.locationBn || "",
                    city: h.city || "",
                    cityBn: h.cityBn || "",
                    country: h.country || "",
                    countryBn: h.countryBn || "",
                    starRating: h.starRating?.toString() || "3",
                    hotelCategory: h.hotelCategory || "mid-range",
                    roomType: h.roomType || "",
                    roomTypeBn: h.roomTypeBn || "",
                    pricePerNight: h.pricePerNight?.toString() || "",
                    oldPrice: h.oldPrice?.toString() || "",
                    currency: h.currency || "BDT",
                    totalRooms: h.totalRooms?.toString() || "",
                    availableRooms: h.availableRooms?.toString() || "",
                    checkInTime: h.checkInTime || "14:00",
                    checkOutTime: h.checkOutTime || "12:00",
                    description: h.description || "",
                    descriptionBn: h.descriptionBn || "",
                    longDescription: h.longDescription || "",
                    longDescriptionBn: h.longDescriptionBn || "",
                    status: h.status || "active",
                    isActive: h.isActive !== false,
                    isFeatured: h.isFeatured || false,
                    rating: h.rating?.toString() || "0",
                    order: h.order?.toString() || "0",
                    metaTitle: h.metaTitle || "",
                    metaDescription: h.metaDescription || "",
                });
                setAmenities((h.amenities || []).join("\n"));
                setAmenitiesBn((h.amenitiesBn || []).join("\n"));
                setTags((h.tags || []).join(", "));
                setFaqs(h.faqs || []);
            } else {
                toast.error("Hotel not found");
                router.push("/dashboard/admin/hotels");
            }
        } catch {
            toast.error("Failed to fetch hotel");
            router.push("/dashboard/admin/hotels");
        } finally {
            setFetching(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const addFaq = () => {
        setFaqs(prev => [...prev, { question: "", questionBn: "", answer: "", answerBn: "" }]);
    };

    const updateFaq = (index, field, value) => {
        setFaqs(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
    };

    const removeFaq = (index) => {
        setFaqs(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.city || !formData.location || !formData.pricePerNight) {
            toast.error("Please fill required fields (Name, City, Location, Price)");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                ...formData,
                starRating: Number(formData.starRating) || 3,
                pricePerNight: Number(formData.pricePerNight) || 0,
                oldPrice: formData.oldPrice ? Number(formData.oldPrice) : undefined,
                totalRooms: formData.totalRooms ? Number(formData.totalRooms) : 0,
                availableRooms: formData.availableRooms ? Number(formData.availableRooms) : 0,
                rating: Number(formData.rating) || 0,
                order: Number(formData.order) || 0,
                amenities: amenities.split("\n").map(s => s.trim()).filter(Boolean),
                amenitiesBn: amenitiesBn.split("\n").map(s => s.trim()).filter(Boolean),
                tags: tags.split(",").map(s => s.trim()).filter(Boolean),
                faqs: faqs.filter(f => f.question && f.answer),
            };

            // Remove empty optional fields to prevent validation errors
            ['roomType', 'roomTypeBn', 'country', 'countryBn', 'image',
             'metaTitle', 'metaDescription', 'description', 'descriptionBn',
             'longDescription', 'longDescriptionBn', 'nameBn', 'locationBn', 'cityBn'
            ].forEach(key => { if (!payload[key]) delete payload[key]; });
            if (payload.oldPrice === undefined) delete payload.oldPrice;

            const url = isEdit ? `${API_BASE}/api/hotels/${editId}` : `${API_BASE}/api/hotels`;
            const method = isEdit ? "PATCH" : "POST";

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (data.success) {
                toast.success(isEdit ? "Hotel updated successfully!" : "Hotel created successfully!");
                router.push("/dashboard/admin/hotels");
            } else {
                toast.error(data.message || "Failed to save hotel");
            }
        } catch {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 text-[13px] text-gray-700 dark:text-gray-200 focus:border-brand-dark focus:ring-1 focus:ring-brand-dark/10 outline-none transition-all placeholder-gray-400";

    if (fetching) {
        return (
            <div className="flex items-center justify-center py-32">
                <FiLoader className="animate-spin" size={24} style={{ color: 'var(--color-brand-dark)' }} />
            </div>
        );
    }

    return (
        <div className="p-4 lg:p-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <Link href="/dashboard/admin/hotels" className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50">
                    <FiArrowLeft size={16} />
                </Link>
                <div className="flex-1">
                    <h1 className="text-2xl font-black uppercase tracking-tight" style={{ fontFamily: 'Teko, sans-serif', color: 'var(--color-brand-dark)' }}>
                        {isEdit ? "Edit Hotel" : "Add New Hotel"}
                    </h1>
                    <p className="text-[12px] text-gray-400 mt-0.5">
                        {isEdit ? `Editing: ${formData.name}` : "Add a new hotel to your listings"}
                    </p>
                </div>
            </div>

            <motion.form onSubmit={handleSubmit} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">

                {/* ==== Section 1: Basic Info ==== */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700/50 p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <LuBed size={14} style={{ color: 'var(--color-brand-accent)' }} />
                        <h2 className="text-[13px] font-bold uppercase tracking-wider text-gray-500">Hotel Details</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                            <label className="text-[11px] font-bold uppercase text-gray-400 mb-1.5 block">Hotel Name (English) *</label>
                            <input name="name" value={formData.name} onChange={handleChange} className={inputClass} placeholder="e.g. Grand Dhaka Palace" required />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="text-[11px] font-bold uppercase text-gray-400 mb-1.5 block">Hotel Name (Bengali)</label>
                            <input name="nameBn" value={formData.nameBn} onChange={handleChange} className={inputClass} placeholder="e.g. গ্র্যান্ড ঢাকা প্যালেস" />
                        </div>
                        <div>
                            <label className="text-[11px] font-bold uppercase text-gray-400 mb-1.5 block">City (English) *</label>
                            <input name="city" value={formData.city} onChange={handleChange} className={inputClass} placeholder="e.g. Dhaka" required />
                        </div>
                        <div>
                            <label className="text-[11px] font-bold uppercase text-gray-400 mb-1.5 block">City (Bengali)</label>
                            <input name="cityBn" value={formData.cityBn} onChange={handleChange} className={inputClass} placeholder="e.g. ঢাকা" />
                        </div>
                        <div>
                            <label className="text-[11px] font-bold uppercase text-gray-400 mb-1.5 block">Location / Address *</label>
                            <input name="location" value={formData.location} onChange={handleChange} className={inputClass} placeholder="e.g. Gulshan-2, Dhaka" required />
                        </div>
                        <div>
                            <label className="text-[11px] font-bold uppercase text-gray-400 mb-1.5 block">Location (Bengali)</label>
                            <input name="locationBn" value={formData.locationBn} onChange={handleChange} className={inputClass} placeholder="e.g. গুলশান-২, ঢাকা" />
                        </div>
                        <div>
                            <label className="text-[11px] font-bold uppercase text-gray-400 mb-1.5 block">Country</label>
                            <input name="country" value={formData.country} onChange={handleChange} className={inputClass} placeholder="e.g. Bangladesh" />
                        </div>
                        <div>
                            <label className="text-[11px] font-bold uppercase text-gray-400 mb-1.5 block">Star Rating *</label>
                            <select name="starRating" value={formData.starRating} onChange={handleChange} className={inputClass}>
                                <option value="1">1 Star ★</option>
                                <option value="2">2 Stars ★★</option>
                                <option value="3">3 Stars ★★★</option>
                                <option value="4">4 Stars ★★★★</option>
                                <option value="5">5 Stars ★★★★★</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[11px] font-bold uppercase text-gray-400 mb-1.5 block">Category *</label>
                            <select name="hotelCategory" value={formData.hotelCategory} onChange={handleChange} className={inputClass}>
                                {hotelCategories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-[11px] font-bold uppercase text-gray-400 mb-1.5 block">Room Type</label>
                            <input name="roomType" value={formData.roomType} onChange={handleChange} className={inputClass} placeholder="e.g. Deluxe Double Room" />
                        </div>
                        <div className="sm:col-span-2">
                            <ImageInput
                                label="Cover Image"
                                value={formData.image}
                                onChange={(v) => setFormData(prev => ({ ...prev, image: v }))}
                                inputClass={inputClass}
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <ImageGalleryInput
                                label="Gallery"
                                value={formData.gallery}
                                onChange={(v) => setFormData(prev => ({ ...prev, gallery: v }))}
                                hint="হোটেলের ডিটেইল পেজে এই ছবিগুলো গ্যালারিতে দেখাবে"
                            />
                        </div>
                    </div>
                </div>

                {/* ==== Section 2: Pricing & Rooms ==== */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700/50 p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <FiDollarSign size={14} style={{ color: 'var(--color-brand-accent)' }} />
                        <h2 className="text-[13px] font-bold uppercase tracking-wider text-gray-500">Pricing & Rooms</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="text-[11px] font-bold uppercase text-gray-400 mb-1.5 block">Price Per Night *</label>
                            <input name="pricePerNight" type="number" value={formData.pricePerNight} onChange={handleChange} className={inputClass} placeholder="0" required />
                        </div>
                        <div>
                            <label className="text-[11px] font-bold uppercase text-gray-400 mb-1.5 block">Old Price (Strike-through)</label>
                            <input name="oldPrice" type="number" value={formData.oldPrice} onChange={handleChange} className={inputClass} placeholder="0" />
                        </div>
                        <div>
                            <label className="text-[11px] font-bold uppercase text-gray-400 mb-1.5 block">Currency</label>
                            <select name="currency" value={formData.currency} onChange={handleChange} className={inputClass}>
                                <option value="BDT">BDT (৳)</option>
                                <option value="USD">USD ($)</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[11px] font-bold uppercase text-gray-400 mb-1.5 block">Total Rooms</label>
                            <input name="totalRooms" type="number" value={formData.totalRooms} onChange={handleChange} className={inputClass} placeholder="0" />
                        </div>
                        <div>
                            <label className="text-[11px] font-bold uppercase text-gray-400 mb-1.5 block">Available Rooms</label>
                            <input name="availableRooms" type="number" value={formData.availableRooms} onChange={handleChange} className={inputClass} placeholder="0" />
                        </div>
                        <div>
                            <label className="text-[11px] font-bold uppercase text-gray-400 mb-1.5 block">Rating (0-5)</label>
                            <input name="rating" type="number" step="0.1" min="0" max="5" value={formData.rating} onChange={handleChange} className={inputClass} />
                        </div>
                        <div>
                            <label className="text-[11px] font-bold uppercase text-gray-400 mb-1.5 block">Check-in Time</label>
                            <input name="checkInTime" type="time" value={formData.checkInTime} onChange={handleChange} className={inputClass} />
                        </div>
                        <div>
                            <label className="text-[11px] font-bold uppercase text-gray-400 mb-1.5 block">Check-out Time</label>
                            <input name="checkOutTime" type="time" value={formData.checkOutTime} onChange={handleChange} className={inputClass} />
                        </div>
                        <div>
                            <label className="text-[11px] font-bold uppercase text-gray-400 mb-1.5 block">Display Order</label>
                            <input name="order" type="number" value={formData.order} onChange={handleChange} className={inputClass} placeholder="0" />
                        </div>
                    </div>
                </div>

                {/* ==== Section 3: Description ==== */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700/50 p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <FiFileText size={14} style={{ color: 'var(--color-brand-accent)' }} />
                        <h2 className="text-[13px] font-bold uppercase tracking-wider text-gray-500">Description</h2>
                    </div>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-[11px] font-bold uppercase text-gray-400 mb-1.5 block">Short Description (English)</label>
                                <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className={`${inputClass} resize-none`} placeholder="Brief overview of the hotel..." />
                            </div>
                            <div>
                                <label className="text-[11px] font-bold uppercase text-gray-400 mb-1.5 block">Short Description (Bengali)</label>
                                <textarea name="descriptionBn" value={formData.descriptionBn} onChange={handleChange} rows={3} className={`${inputClass} resize-none`} placeholder="হোটেলের সংক্ষিপ্ত বিবরণ..." />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-[11px] font-bold uppercase text-gray-400 mb-1.5 block">Long Description (English)</label>
                                <textarea name="longDescription" value={formData.longDescription} onChange={handleChange} rows={4} className={`${inputClass} resize-none`} placeholder="Detailed description of the hotel..." />
                            </div>
                            <div>
                                <label className="text-[11px] font-bold uppercase text-gray-400 mb-1.5 block">Long Description (Bengali)</label>
                                <textarea name="longDescriptionBn" value={formData.longDescriptionBn} onChange={handleChange} rows={4} className={`${inputClass} resize-none`} placeholder="হোটেলের বিস্তারিত বিবরণ..." />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ==== Section 4: Amenities & Tags ==== */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700/50 p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <FiTag size={14} style={{ color: 'var(--color-brand-accent)' }} />
                        <h2 className="text-[13px] font-bold uppercase tracking-wider text-gray-500">Amenities & Tags</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-[11px] font-bold uppercase text-gray-400 mb-1.5 block">Amenities (English, one per line)</label>
                            <textarea value={amenities} onChange={(e) => setAmenities(e.target.value)} rows={4} className={`${inputClass} resize-none`} placeholder={"Free WiFi\nSwimming Pool\nGym\nRestaurant\n24/7 Room Service"} />
                        </div>
                        <div>
                            <label className="text-[11px] font-bold uppercase text-gray-400 mb-1.5 block">Amenities (Bengali, one per line)</label>
                            <textarea value={amenitiesBn} onChange={(e) => setAmenitiesBn(e.target.value)} rows={4} className={`${inputClass} resize-none`} placeholder={"বিনামূল্যে ওয়াইফাই\nসুইমিং পুল\nজিম\nরেস্তোরাঁ"} />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="text-[11px] font-bold uppercase text-gray-400 mb-1.5 block">Tags (comma separated)</label>
                            <input value={tags} onChange={(e) => setTags(e.target.value)} className={inputClass} placeholder="Luxury, Pool, Business, Family Friendly" />
                        </div>
                    </div>
                </div>

                {/* ==== Section 5: FAQs ==== */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700/50 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <FiHelpCircle size={14} style={{ color: 'var(--color-brand-accent)' }} />
                            <h2 className="text-[13px] font-bold uppercase tracking-wider text-gray-500">FAQs</h2>
                        </div>
                        <button type="button" onClick={addFaq} className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-[10px] font-bold uppercase tracking-wider text-gray-500 hover:bg-gray-50">
                            <FiPlus size={12} /> Add FAQ
                        </button>
                    </div>
                    <div className="space-y-4">
                        {faqs.length === 0 && (
                            <p className="text-[12px] text-gray-400 text-center py-4">No FAQs yet. Click "Add FAQ" to start.</p>
                        )}
                        {faqs.map((faq, index) => (
                            <div key={index} className="bg-[#F8FAFC] dark:bg-gray-700/30 rounded-lg p-4 relative">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-[11px] font-bold uppercase text-gray-400">FAQ #{index + 1}</span>
                                    <button type="button" onClick={() => removeFaq(index)} className="w-7 h-7 rounded-full bg-red-50 text-red-400 hover:bg-red-100 flex items-center justify-center">
                                        <FiTrash2 size={12} />
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <input value={faq.question} onChange={(e) => updateFaq(index, 'question', e.target.value)} className={inputClass} placeholder="Question (English)" />
                                    <input value={faq.questionBn || ""} onChange={(e) => updateFaq(index, 'questionBn', e.target.value)} className={inputClass} placeholder="Question (Bengali)" />
                                    <input value={faq.answer} onChange={(e) => updateFaq(index, 'answer', e.target.value)} className={inputClass} placeholder="Answer (English)" />
                                    <input value={faq.answerBn || ""} onChange={(e) => updateFaq(index, 'answerBn', e.target.value)} className={inputClass} placeholder="Answer (Bengali)" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ==== Section 6: Status & SEO ==== */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700/50 p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <FiStar size={14} style={{ color: 'var(--color-brand-accent)' }} />
                        <h2 className="text-[13px] font-bold uppercase tracking-wider text-gray-500">Status & SEO</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="text-[11px] font-bold uppercase text-gray-400 mb-1.5 block">Status</label>
                            <select name="status" value={formData.status} onChange={handleChange} className={inputClass}>
                                {statuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                            </select>
                        </div>
                        <div className="flex items-center gap-5 pt-5">
                            <label className="flex items-center gap-2 text-[12px] font-semibold text-gray-600 cursor-pointer">
                                <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} className="w-4 h-4 rounded border-gray-300" />
                                Active
                            </label>
                            <label className="flex items-center gap-2 text-[12px] font-semibold text-gray-600 cursor-pointer">
                                <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleChange} className="w-4 h-4 rounded border-gray-300" />
                                Featured
                            </label>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                        <div>
                            <label className="text-[11px] font-bold uppercase text-gray-400 mb-1.5 block">Meta Title (SEO)</label>
                            <input name="metaTitle" value={formData.metaTitle} onChange={handleChange} className={inputClass} placeholder="SEO title" />
                        </div>
                        <div>
                            <label className="text-[11px] font-bold uppercase text-gray-400 mb-1.5 block">Meta Description (SEO)</label>
                            <input name="metaDescription" value={formData.metaDescription} onChange={handleChange} className={inputClass} placeholder="SEO description" />
                        </div>
                    </div>
                </div>

                {/* Submit */}
                <div className="flex items-center justify-end gap-3">
                    <Link href="/dashboard/admin/hotels" className="px-5 py-2.5 rounded-lg text-[12px] font-semibold text-gray-500 border border-gray-200 hover:bg-gray-50">
                        Cancel
                    </Link>
                    <button type="submit" disabled={loading} className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-[12px] font-semibold text-white disabled:opacity-50" style={{ backgroundColor: 'var(--color-brand-dark)' }}>
                        {loading ? <FiLoader size={14} className="animate-spin" /> : <FiSave size={14} />}
                        {loading ? "Saving..." : isEdit ? "Update Hotel" : "Create Hotel"}
                    </button>
                </div>
            </motion.form>
        </div>
    );
}

export default function CreateHotel() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center py-32">
                <FiLoader className="animate-spin" size={24} style={{ color: 'var(--color-brand-dark)' }} />
            </div>
        }>
            <HotelForm />
        </Suspense>
    );
}
