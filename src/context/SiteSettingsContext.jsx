"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Default fallback so components never get undefined values during initial render
const DEFAULTS = {
    contactPhone: "+8801738886644",
    contactPhoneAlt: "",
    contactEmail: "info@visalinkair.com",
    whatsappNumber: "8801738886644",
    bkashNumber: "",
    nagadNumber: "",
    rocketNumber: "",
    address: "House 25, Road - 11, DIT Project, Marul Badda, Badda, Dhaka-1214",
    addressBn: "বাসা ২৫, রোড - ১১, ডিআইটি প্রজেক্ট, মেরুল বাড্ডা, বাড্ডা, ঢাকা-১২১৪",

    // Working Hours
    workingDays: "Sat - Thu: Open",
    workingDaysBn: "শনি - বৃহঃ: খোলা",
    workingHours: "9:30 AM - 8:30 PM",
    workingHoursBn: "সকাল ৯:৩০ - রাত ৮:৩০",

    // Map
    mapEmbedUrl: "https://maps.google.com/maps?q=Marul%20Badda%2C%20Badda%2C%20Dhaka-1214%2C%20Bangladesh&t=&z=15&ie=UTF8&iwloc=&output=embed",
    mapLabel: "MARUL BADDA, DHAKA",
    mapLabelBn: "মেরুল বাড্ডা, ঢাকা",

    // Stats
    visaSuccessRate: "98%",
    countriesCount: "50+",
    happyClientsCount: "10K+",

    // Banner strip under the navbar on every visa details page.
    // Editable at Dashboard → Visa Services → Page Banner.
    visaBannerImage:
        "https://images.unsplash.com/photo-1524661135-423995f22d0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1353&q=80",

    social: {
        facebook: "",
        instagram: "",
        twitter: "",
        youtube: "",
        linkedin: "",
        tiktok: "",
    },
};

const SiteSettingsContext = createContext({
    settings: DEFAULTS,
    loading: true,
    refetch: () => {},
});

export function SiteSettingsProvider({ children }) {
    const [settings, setSettings] = useState(DEFAULTS);
    const [loading, setLoading] = useState(true);

    const fetchSettings = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE}/api/settings`);
            const data = await res.json();
            if (data.success && data.data) {
                setSettings({
                    ...DEFAULTS,
                    ...data.data,
                    social: { ...DEFAULTS.social, ...(data.data.social || {}) },
                });
            }
        } catch (err) {
            console.error("Failed to fetch site settings:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    return (
        <SiteSettingsContext.Provider value={{ settings, loading, refetch: fetchSettings }}>
            {children}
        </SiteSettingsContext.Provider>
    );
}

export function useSiteSettings() {
    return useContext(SiteSettingsContext);
}

// Helpers
export function buildWhatsAppUrl(number, message = "") {
    const digits = (number || "").replace(/\D/g, "");
    const text = message ? `?text=${encodeURIComponent(message)}` : "";
    return `https://wa.me/${digits}${text}`;
}

export function buildTelUrl(phone) {
    return `tel:${(phone || "").replace(/[^\d+]/g, "")}`;
}

export function buildMailUrl(email) {
    return `mailto:${email || ""}`;
}
