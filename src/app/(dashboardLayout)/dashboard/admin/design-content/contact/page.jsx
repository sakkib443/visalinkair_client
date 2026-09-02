"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
    FiSave,
    FiLoader,
    FiPhone,
    FiMail,
    FiMapPin,
    FiRefreshCw,
    FiClock,
    FiMap,
    FiBarChart2,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { selectToken } from "@/redux/features/authSlice";
import { useSiteSettings } from "@/context/SiteSettingsContext";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function ContactDesignPage() {
    const token = useSelector(selectToken);
    const { settings: liveSettings, refetch } = useSiteSettings();

    const [form, setForm] = useState({
        contactPhone: "",
        contactPhoneAlt: "",
        contactEmail: "",
        whatsappNumber: "",
        bkashNumber: "",
        nagadNumber: "",
        rocketNumber: "",
        address: "",
        addressBn: "",
        workingDays: "",
        workingDaysBn: "",
        workingHours: "",
        workingHoursBn: "",
        mapEmbedUrl: "",
        mapLabel: "",
        mapLabelBn: "",
        visaSuccessRate: "",
        countriesCount: "",
        happyClientsCount: "",
    });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setForm({
            contactPhone: liveSettings.contactPhone || "",
            contactPhoneAlt: liveSettings.contactPhoneAlt || "",
            contactEmail: liveSettings.contactEmail || "",
            whatsappNumber: liveSettings.whatsappNumber || "",
            bkashNumber: liveSettings.bkashNumber || "",
            nagadNumber: liveSettings.nagadNumber || "",
            rocketNumber: liveSettings.rocketNumber || "",
            address: liveSettings.address || "",
            addressBn: liveSettings.addressBn || "",
            workingDays: liveSettings.workingDays || "",
            workingDaysBn: liveSettings.workingDaysBn || "",
            workingHours: liveSettings.workingHours || "",
            workingHoursBn: liveSettings.workingHoursBn || "",
            mapEmbedUrl: liveSettings.mapEmbedUrl || "",
            mapLabel: liveSettings.mapLabel || "",
            mapLabelBn: liveSettings.mapLabelBn || "",
            visaSuccessRate: liveSettings.visaSuccessRate || "",
            countriesCount: liveSettings.countriesCount || "",
            happyClientsCount: liveSettings.happyClientsCount || "",
        });
    }, [liveSettings]);

    const reload = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/settings`);
            const data = await res.json();
            if (!res.ok || !data.success) throw new Error(data.message || "Failed to refresh settings");
            await refetch();
            toast.success("Settings refreshed");
        } catch (err) {
            toast.error(err.message || "Failed to refresh settings");
        } finally {
            setLoading(false);
        }
    };

    const handleField = (key, value) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!form.contactPhone.trim() || !form.contactEmail.trim() || !form.whatsappNumber.trim()) {
            toast.error("Phone, Email, and WhatsApp number are required");
            return;
        }
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
            toast.success("Contact settings saved successfully");
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
                        <span className="text-gray-600 font-medium">Contact Page</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Contact Page Settings</h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                        Manage contact info, working hours, map & stats shown on the Contact page
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
                {/* Contact Information */}
                <section className="bg-white rounded-xl border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-1">Contact Information</h2>
                    <p className="text-xs text-gray-500 mb-5">
                        Phone, email & address — used in Footer, Navbar, Hero, Contact page
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field
                            label="Primary Phone *"
                            icon={<FiPhone />}
                            value={form.contactPhone}
                            onChange={(v) => handleField("contactPhone", v)}
                            placeholder="+8801738886644"
                        />
                        <Field
                            label="Alternate Phone"
                            icon={<FiPhone />}
                            value={form.contactPhoneAlt}
                            onChange={(v) => handleField("contactPhoneAlt", v)}
                            placeholder="Optional"
                        />
                        <Field
                            label="Email *"
                            icon={<FiMail />}
                            value={form.contactEmail}
                            onChange={(v) => handleField("contactEmail", v)}
                            placeholder="info@visalinkair.com"
                            type="email"
                        />
                        <Field
                            label="WhatsApp Number * (digits only)"
                            icon={<FaWhatsapp className="text-whatsapp" />}
                            value={form.whatsappNumber}
                            onChange={(v) => handleField("whatsappNumber", v.replace(/\D/g, ""))}
                            placeholder="8801738886644"
                            help="Country code + number, no + or spaces. Used in wa.me links."
                        />
                        <Field
                            label="Address (English)"
                            icon={<FiMapPin />}
                            value={form.address}
                            onChange={(v) => handleField("address", v)}
                            placeholder="House 25, Road - 11, DIT Project, Marul Badda, Badda, Dhaka-1214"
                            wide
                        />
                        <Field
                            label="Address (Bangla)"
                            icon={<FiMapPin />}
                            value={form.addressBn}
                            onChange={(v) => handleField("addressBn", v)}
                            placeholder="বাসা ২৫, রোড - ১১, ডিআইটি প্রজেক্ট, মেরুল বাড্ডা, বাড্ডা, ঢাকা-১২১৪"
                            wide
                        />
                    </div>
                </section>

                {/* Mobile Payment Numbers */}
                <section className="bg-white rounded-xl border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-1">Mobile Payment Numbers</h2>
                    <p className="text-xs text-gray-500 mb-5">
                        &quot;Send Money&quot; numbers shown at checkout for manual bKash / Nagad / Rocket payment. Leave blank to fall back to the WhatsApp number.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field
                            label="bKash Number"
                            icon={<FiPhone />}
                            value={form.bkashNumber}
                            onChange={(v) => handleField("bkashNumber", v)}
                            placeholder="01XXXXXXXXX"
                        />
                        <Field
                            label="Nagad Number"
                            icon={<FiPhone />}
                            value={form.nagadNumber}
                            onChange={(v) => handleField("nagadNumber", v)}
                            placeholder="01XXXXXXXXX"
                        />
                        <Field
                            label="Rocket Number"
                            icon={<FiPhone />}
                            value={form.rocketNumber}
                            onChange={(v) => handleField("rocketNumber", v)}
                            placeholder="01XXXXXXXXX"
                        />
                    </div>
                </section>

                {/* Working Hours */}
                <section className="bg-white rounded-xl border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-1">Working Hours</h2>
                    <p className="text-xs text-gray-500 mb-5">
                        Office days & hours — shown on Contact page cards
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field
                            label="Working Days (English)"
                            icon={<FiClock />}
                            value={form.workingDays}
                            onChange={(v) => handleField("workingDays", v)}
                            placeholder="Sat - Thu: Open"
                        />
                        <Field
                            label="Working Days (Bangla)"
                            icon={<FiClock />}
                            value={form.workingDaysBn}
                            onChange={(v) => handleField("workingDaysBn", v)}
                            placeholder="শনি - বৃহঃ: খোলা"
                        />
                        <Field
                            label="Working Hours (English)"
                            icon={<FiClock />}
                            value={form.workingHours}
                            onChange={(v) => handleField("workingHours", v)}
                            placeholder="9:30 AM - 8:30 PM"
                        />
                        <Field
                            label="Working Hours (Bangla)"
                            icon={<FiClock />}
                            value={form.workingHoursBn}
                            onChange={(v) => handleField("workingHoursBn", v)}
                            placeholder="সকাল ৯:৩০ - রাত ৮:৩০"
                        />
                    </div>
                </section>

                {/* Map Settings */}
                <section className="bg-white rounded-xl border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-1">Map Settings</h2>
                    <p className="text-xs text-gray-500 mb-5">
                        Google Maps embed URL & label for the Contact page
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field
                            label="Google Maps Embed URL"
                            icon={<FiMap />}
                            value={form.mapEmbedUrl}
                            onChange={(v) => handleField("mapEmbedUrl", v)}
                            placeholder="https://www.google.com/maps/embed?pb=..."
                            wide
                        />
                        <Field
                            label="Map Label (English)"
                            icon={<FiMapPin />}
                            value={form.mapLabel}
                            onChange={(v) => handleField("mapLabel", v)}
                            placeholder="MARUL BADDA, DHAKA"
                        />
                        <Field
                            label="Map Label (Bangla)"
                            icon={<FiMapPin />}
                            value={form.mapLabelBn}
                            onChange={(v) => handleField("mapLabelBn", v)}
                            placeholder="মেরুল বাড্ডা, ঢাকা"
                        />
                    </div>
                </section>

                {/* Stats */}
                <section className="bg-white rounded-xl border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-1">Statistics</h2>
                    <p className="text-xs text-gray-500 mb-5">
                        Key numbers displayed on the Contact page
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Field
                            label="Visa Success Rate"
                            icon={<FiBarChart2 />}
                            value={form.visaSuccessRate}
                            onChange={(v) => handleField("visaSuccessRate", v)}
                            placeholder="98%"
                        />
                        <Field
                            label="Countries Count"
                            icon={<FiBarChart2 />}
                            value={form.countriesCount}
                            onChange={(v) => handleField("countriesCount", v)}
                            placeholder="50+"
                        />
                        <Field
                            label="Happy Clients Count"
                            icon={<FiBarChart2 />}
                            value={form.happyClientsCount}
                            onChange={(v) => handleField("happyClientsCount", v)}
                            placeholder="10K+"
                        />
                    </div>
                </section>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-3 bg-brand-blue hover:bg-brand-blue-hover disabled:bg-gray-300 text-white font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                        {saving ? <FiLoader className="animate-spin" /> : <FiSave />}
                        {saving ? "Saving..." : "Save Contact Settings"}
                    </button>
                </div>
            </form>
        </div>
    );
}

function Field({ label, icon, value, onChange, placeholder, type = "text", help, wide = false }) {
    return (
        <div className={wide ? "md:col-span-2" : ""}>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                {label}
            </label>
            <div className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg focus-within:border-brand-blue focus-within:ring-2 focus-within:ring-brand-blue/10 transition-all">
                <span className="text-gray-400 flex-shrink-0">{icon}</span>
                <input
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="flex-1 text-sm bg-transparent outline-none text-gray-800 placeholder-gray-400"
                />
            </div>
            {help && <p className="text-[10px] text-gray-400 mt-1">{help}</p>}
        </div>
    );
}
