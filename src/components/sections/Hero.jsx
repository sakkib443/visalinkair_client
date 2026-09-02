"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
    LuPlane,
    LuBed,
    LuMapPin,
    LuMap,
    LuGraduationCap,
    LuTicket,
    LuCalendar,
    LuGlobe,
    LuSearch,
    LuChevronDown,
    LuArrowRightLeft,
    LuX,
    LuCheck,
    LuUsers,
    LuMinus,
    LuPlus,
    LuStar,
} from "react-icons/lu";
import { useLanguage } from "@/context/LanguageContext";
import { BD_AIRPORTS, INTL_AIRPORTS } from "@/utils/airports";
import DatePicker from "@/components/shared/DatePicker";
import CountryPicker from "@/components/shared/CountryPicker";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const DEFAULT_SLIDES = ["/hero.jpg", "/2.jpg", "/3.jpg", "/4.jpg"];
const DEFAULT_SLIDE_SECONDS = 5;

const BRAND = {
    navy: "var(--color-brand-dark)",
    accent: "#FDCB1B",
    accentDark: "#F0BB00",
    primary: "var(--color-brand-blue)",
};

// ─────────────────────────────────────────────────────────────
// Reusable primitives
// ─────────────────────────────────────────────────────────────
const FieldLabel = ({ children, bnFont }) => (
    <p
        className="text-[10px] text-gray-500 font-semibold uppercase tracking-[0.08em] leading-none mb-0.5"
        style={{ fontFamily: bnFont }}
    >
        {children}
    </p>
);

// Boxed dropdown trigger (matches screenshot's field look)
function Dropdown({
    label,
    value,
    valueSub,
    placeholder,
    options,
    onSelect,
    onClear,
    searchable,
    icon,
    bnFont,
    isBn,
}) {
    const [open, setOpen] = useState(false);
    const [q, setQ] = useState("");
    const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
    const [mounted, setMounted] = useState(false);
    const triggerRef = useRef(null);
    const panelRef = useRef(null);

    useEffect(() => setMounted(true), []);

    const reposition = useCallback(() => {
        if (!triggerRef.current) return;
        const r = triggerRef.current.getBoundingClientRect();
        setPos({
            top: r.bottom + window.scrollY + 6,
            left: r.left + window.scrollX,
            width: Math.max(r.width, 260),
        });
    }, []);

    useEffect(() => {
        if (!open) return;
        reposition();
        const onScroll = () => reposition();
        const onClick = (e) => {
            if (
                triggerRef.current && !triggerRef.current.contains(e.target) &&
                panelRef.current && !panelRef.current.contains(e.target)
            ) {
                setOpen(false);
                setQ("");
            }
        };
        window.addEventListener("scroll", onScroll, true);
        window.addEventListener("resize", reposition);
        document.addEventListener("mousedown", onClick);
        return () => {
            window.removeEventListener("scroll", onScroll, true);
            window.removeEventListener("resize", reposition);
            document.removeEventListener("mousedown", onClick);
        };
    }, [open, reposition]);

    const filtered = useMemo(() => {
        if (!searchable || !q.trim()) return options;
        const s = q.trim().toLowerCase();
        return options.filter((o) =>
            (o.label || "").toLowerCase().includes(s) ||
            (o.sub || "").toLowerCase().includes(s) ||
            (o.value || "").toLowerCase().includes(s) ||
            (o.labelBn && o.labelBn.includes(q.trim()))
        );
    }, [options, q, searchable]);

    const selected = useMemo(() => options.find((o) => o.value === value), [options, value]);
    const display = selected ? (isBn && selected.labelBn ? selected.labelBn : selected.label) : null;
    const sub = valueSub || selected?.sub;

    return (
        <div className="relative w-full">
            <button
                ref={triggerRef}
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="w-full h-full min-h-[46px] px-3.5 py-1 text-left rounded-lg bg-white hover:bg-gray-50/70 transition-colors cursor-pointer"
            >
                <FieldLabel bnFont={bnFont}>{label}</FieldLabel>
                <div className="flex items-center gap-2">
                    {icon && <span className="text-gray-400 flex-shrink-0">{icon}</span>}
                    <p
                        className={`text-[14px] font-bold leading-none truncate ${
                            display ? "text-brand-dark" : "text-gray-400"
                        }`}
                        style={{ fontFamily: bnFont }}
                    >
                        {display || placeholder}
                    </p>
                </div>
                {sub && (
                    <p className="text-[10px] text-gray-500 mt-0.5 leading-none truncate" style={{ fontFamily: bnFont }}>
                        {sub}
                    </p>
                )}
            </button>

            {value && onClear && (
                <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onClear(); }}
                    className="absolute top-3 right-3 w-5 h-5 rounded-full bg-gray-100 hover:bg-red-50 text-gray-400 hover:text-red-500 flex items-center justify-center"
                    aria-label="Clear"
                >
                    <LuX size={11} />
                </button>
            )}

            {mounted && open && createPortal(
                <div
                    ref={panelRef}
                    style={{ position: "absolute", top: pos.top, left: pos.left, width: pos.width, zIndex: 9999 }}
                    className="bg-white border border-gray-200 rounded-xl shadow-2xl shadow-black/20 overflow-hidden"
                >
                    {searchable && (
                        <div className="p-2 border-b border-gray-100">
                            <input
                                autoFocus
                                type="text"
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                placeholder={isBn ? "খুঁজুন" : "Search"}
                                className="w-full px-3 py-2 text-[13px] bg-gray-50 rounded-lg outline-none text-gray-800 placeholder-gray-400"
                                style={{ fontFamily: bnFont }}
                            />
                        </div>
                    )}
                    <ul role="listbox" className="max-h-[280px] overflow-y-auto p-1 m-0 list-none">
                        {filtered.length ? filtered.map((opt) => {
                            const active = opt.value === value;
                            const code = (opt.value || "").slice(0, 3).toUpperCase();
                            return (
                                <li key={opt.value}>
                                    <button
                                        type="button"
                                        role="option"
                                        aria-selected={active}
                                        onClick={() => { onSelect(opt.value); setOpen(false); setQ(""); }}
                                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-left cursor-pointer ${
                                            active ? "bg-brand-blue/10" : "hover:bg-gray-100"
                                        }`}
                                    >
                                        {opt.flag && <span className="text-lg flex-shrink-0">{opt.flag}</span>}
                                        <span className="flex-1 min-w-0">
                                            <span
                                                className={`block text-[13px] font-semibold truncate ${
                                                    active ? "text-brand-blue" : "text-gray-900"
                                                }`}
                                                style={{ fontFamily: bnFont }}
                                            >
                                                {isBn && opt.labelBn ? opt.labelBn : opt.label}
                                            </span>
                                            {opt.sub && (
                                                <span className="block text-[11px] text-gray-500 truncate">{opt.sub}</span>
                                            )}
                                        </span>
                                        <span className={`text-[10px] font-bold ${active ? "text-brand-blue" : "text-gray-400"}`}>
                                            {active ? <LuCheck size={14} /> : code}
                                        </span>
                                    </button>
                                </li>
                            );
                        }) : (
                            <li className="py-8 text-center text-gray-400 text-[13px]" style={{ fontFamily: bnFont }}>
                                {isBn ? "কিছু পাওয়া যায়নি" : "No results"}
                            </li>
                        )}
                    </ul>
                </div>,
                document.body
            )}
        </div>
    );
}

// Date box (matches "DEPARTURE DATE — 18 Aug'26 — Tuesday")
function DateField({ label, value, onChange, bnFont, isBn, hint, min }) {
    const parts = useMemo(() => {
        if (!value) return null;
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return null;
        return {
            day: d.getDate(),
            mon: d.toLocaleString("en-US", { month: "short" }),
            yr: String(d.getFullYear()).slice(-2),
            wk: d.toLocaleString("en-US", { weekday: "long" }),
        };
    }, [value]);

    // Uses the shared professional DatePicker popup. The button is styled
    // to keep the Hero widget's rich two-line layout.
    return (
        <DatePicker
            value={value}
            onChange={onChange}
            min={min || new Date()}
            placeholder={hint || (isBn ? "তারিখ নির্বাচন করুন" : "Select date")}
            className="w-full h-full min-h-[46px] block px-3.5 py-1.5 rounded-lg bg-white hover:bg-gray-50/70 transition-colors text-left cursor-pointer"
        >
            <FieldLabel bnFont={bnFont}>{label}</FieldLabel>
            {parts ? (
                <>
                    <p className="text-brand-dark leading-none" style={{ fontFamily: bnFont }}>
                        <span className="text-[15px] font-black">{parts.day}</span>{" "}
                        <span className="text-[12px] font-semibold text-gray-600">
                            {parts.mon}&rsquo;{parts.yr}
                        </span>
                    </p>
                    <p className="text-[10px] text-gray-500 mt-0.5 leading-none" style={{ fontFamily: bnFont }}>
                        {parts.wk}
                    </p>
                </>
            ) : (
                <p className="text-[13px] text-gray-400 font-medium leading-snug" style={{ fontFamily: bnFont }}>
                    {hint || (isBn ? "তারিখ নির্বাচন করুন" : "Select date")}
                </p>
            )}
        </DatePicker>
    );
}

// Traveler + class picker
function TravelerPicker({ travelers, setTravelers, cls, setCls, bnFont, isBn }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    useEffect(() => {
        const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener("mousedown", onClick);
        return () => document.removeEventListener("mousedown", onClick);
    }, []);

    const classes = [
        { v: "economy", label: isBn ? "ইকোনমি" : "Economy" },
        { v: "premium", label: isBn ? "প্রিমিয়াম ইকোনমি" : "Premium Economy" },
        { v: "business", label: isBn ? "বিজনেস" : "Business" },
        { v: "first", label: isBn ? "ফার্স্ট" : "First" },
    ];
    const clsLabel = classes.find((c) => c.v === cls)?.label || classes[0].label;

    return (
        <div className="relative w-full h-full" ref={ref}>
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="w-full h-full min-h-[46px] px-3.5 py-1 text-left rounded-lg bg-white hover:bg-gray-50/70 transition-colors cursor-pointer"
            >
                <FieldLabel bnFont={bnFont}>{isBn ? "যাত্রী, ক্লাস" : "Traveler, Class"}</FieldLabel>
                <p className="text-[14px] font-bold text-brand-dark leading-none" style={{ fontFamily: bnFont }}>
                    {travelers} {isBn ? "যাত্রী" : travelers === 1 ? "Traveler" : "Travelers"}
                </p>
                <p className="text-[11px] text-gray-500 mt-0" style={{ fontFamily: bnFont }}>
                    {clsLabel}
                </p>
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-2 w-[280px] bg-white rounded-xl shadow-2xl border border-gray-100 p-4 z-50">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-sm font-semibold text-brand-dark" style={{ fontFamily: bnFont }}>
                                {isBn ? "যাত্রী সংখ্যা" : "Travelers"}
                            </p>
                            <p className="text-[11px] text-gray-500">{isBn ? "১২ বছরের উপরে" : "Adults (12+)"}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setTravelers(Math.max(1, travelers - 1))}
                                className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:border-brand-dark hover:text-brand-dark disabled:opacity-40"
                                disabled={travelers <= 1}
                            >
                                <LuMinus size={14} />
                            </button>
                            <span className="w-5 text-center font-bold text-brand-dark">{travelers}</span>
                            <button
                                type="button"
                                onClick={() => setTravelers(Math.min(9, travelers + 1))}
                                className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:border-brand-dark hover:text-brand-dark disabled:opacity-40"
                                disabled={travelers >= 9}
                            >
                                <LuPlus size={14} />
                            </button>
                        </div>
                    </div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2" style={{ fontFamily: bnFont }}>
                        {isBn ? "ক্লাস" : "Class"}
                    </p>
                    <div className="grid grid-cols-2 gap-1.5">
                        {classes.map((c) => (
                            <button
                                key={c.v}
                                type="button"
                                onClick={() => { setCls(c.v); setOpen(false); }}
                                className={`px-3 py-2 rounded-lg text-[12px] font-semibold transition-all ${
                                    cls === c.v
                                        ? "bg-brand-dark text-white"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                                style={{ fontFamily: bnFont }}
                            >
                                {c.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// Tab button
function Tab({ active, icon, label, onClick, bnFont }) {
    return (
        <button
            type="button"
            onClick={onClick}
            role="tab"
            aria-selected={active}
            className={`relative flex flex-col lg:flex-row items-center gap-1 lg:gap-2 px-4 sm:px-5 lg:px-7 py-2.5 lg:py-4 text-[12px] lg:text-[15px] font-bold transition-colors cursor-pointer ${
                active ? "text-brand-dark" : "text-gray-500 hover:text-gray-700"
            }`}
            style={{ fontFamily: bnFont }}
        >
            <span className={active ? "text-brand-blue" : "text-gray-400"}>{icon}</span>
            {label}
            {active && (
                <span className="absolute left-2 right-2 lg:left-3 lg:right-3 bottom-0 h-[3px] rounded-full" style={{ backgroundColor: BRAND.accent }} />
            )}
        </button>
    );
}

// Star chip (hotel tab)
function StarChips({ value, onChange, isBn, bnFont }) {
    const stars = [
        { v: "3", label: "3★" },
        { v: "4", label: "4★" },
        { v: "5", label: "5★" },
    ];
    return (
        <div className="w-full h-full min-h-[46px] px-3.5 py-1 rounded-lg bg-white">
            <FieldLabel bnFont={bnFont}>{isBn ? "তারকা" : "Star Rating"}</FieldLabel>
            <div className="flex items-center gap-1.5 mt-1">
                <button
                    type="button"
                    onClick={() => onChange("")}
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-md ${
                        !value ? "bg-brand-dark text-white" : "bg-gray-100 text-gray-600"
                    }`}
                    style={{ fontFamily: bnFont }}
                >
                    {isBn ? "সব" : "All"}
                </button>
                {stars.map((s) => (
                    <button
                        key={s.v}
                        type="button"
                        onClick={() => onChange(value === s.v ? "" : s.v)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                            value === s.v ? "bg-brand-accent text-white" : "bg-gray-100 text-gray-600 hover:bg-brand-accent/10 hover:text-brand-accent"
                        }`}
                    >
                        {s.label}
                    </button>
                ))}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────
export default function Hero({ heroData }) {
    const { t, language } = useLanguage();
    const router = useRouter();
    const isBn = language === "bn";
    const bnFont = isBn ? "Hind Siliguri, sans-serif" : undefined;

    const hd = heroData || {};
    const slides = hd.slides?.length
        ? [...hd.slides].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map((s) => s.image).filter(Boolean)
        : DEFAULT_SLIDES;
    const slideSeconds = Number(hd.slideSeconds) > 0 ? Number(hd.slideSeconds) : DEFAULT_SLIDE_SECONDS;

    const [activeSlide, setActiveSlide] = useState(0);
    useEffect(() => {
        if (slides.length < 2) return;
        const id = setInterval(() => setActiveSlide((s) => (s + 1) % slides.length), slideSeconds * 1000);
        return () => clearInterval(id);
    }, [slides.length, slideSeconds]);
    const slideIdx = slides.length ? activeSlide % slides.length : 0;

    // ── Tabs
    const [activeTab, setActiveTab] = useState("flight");
    const tabs = [
        { id: "flight", label: "Flight",        icon: <LuPlane size={18} className="-rotate-45" /> },
        { id: "visa",   label: "Tourism Visa",  icon: <LuMap size={18} /> },
        { id: "tour",   label: "Student Visa",  icon: <LuGraduationCap size={18} /> },
        { id: "hotel",  label: "Hotel",         icon: <LuBed size={18} /> },
    ];

    // ── Flight state
    const [tripType, setTripType] = useState("oneway"); // oneway | round | multi
    const [flightFrom, setFlightFrom] = useState("DAC");
    const [flightTo, setFlightTo] = useState("CXB");
    const [depDate, setDepDate] = useState(() => {
        const d = new Date(); d.setDate(d.getDate() + 3);
        return d.toISOString().split("T")[0];
    });
    const [retDate, setRetDate] = useState("");
    const [travelers, setTravelers] = useState(1);
    const [cabin, setCabin] = useState("economy");
    // Extra multi-city legs (each: {from, to, date})
    const [flightLegs, setFlightLegs] = useState([{ from: "", to: "", date: "" }]);
    const addLeg = () => setFlightLegs((arr) => [...arr, { from: "", to: "", date: "" }]);
    const removeLeg = (i) => setFlightLegs((arr) => arr.filter((_, idx) => idx !== i));
    const setLegField = (i, k, v) => setFlightLegs((arr) => arr.map((l, idx) => idx === i ? { ...l, [k]: v } : l));

    // From = every Bangladeshi airport; To = every international destination.
    // Dropdown searches label + sub; adding city/country/code into the search
    // haystack via `sub` so typing "London", "UK", or "LHR" all match.
    const toOption = (a) => ({
        value: a.code,
        label: `${a.city} (${a.code})`,
        sub: `${a.airport} · ${a.country}`,
        flag: a.flag,
    });
    const fromAirports = useMemo(() => BD_AIRPORTS.map(toOption), []);
    const toAirports = useMemo(() => INTL_AIRPORTS.map(toOption), []);

    const swapAirports = () => {
        setFlightFrom((f) => { const nf = flightTo; setFlightTo(f); return nf; });
    };

    const handleFlightSearch = () => {
        // Convert IATA codes to display labels ("Dhaka (DAC)") so the /flight
        // page shows a friendly value in its autocomplete inputs.
        const findLabel = (code, list) => list.find((o) => o.value === code)?.label || code;
        const params = new URLSearchParams({
            from: findLabel(flightFrom, fromAirports),
            to:   findLabel(flightTo, toAirports),
            dep: depDate,
            travelers: String(travelers), class: cabin, type: tripType,
        });
        if (tripType === "round" && retDate) params.set("ret", retDate);
        if (tripType === "multi") {
            flightLegs.forEach((l, i) => {
                if (l.from) params.set(`leg${i + 1}From`, l.from);
                if (l.to)   params.set(`leg${i + 1}To`,   l.to);
                if (l.date) params.set(`leg${i + 1}Date`, l.date);
            });
        }
        router.push(`/flight?${params.toString()}`);
    };

    // ── Data for the hotel tab. Visa tabs are fed by per-category lists
    // further below (touristGuides / studentGuides), fetched from
    // /api/visa-guides/public/countries. Tours feature is gone.
    const [hotels, setHotels] = useState([]);

    // Tourism / Student Visa hero — just pick a country. Everything else
    // (dates, persons, notes) is captured on the details page's right-side
    // inquiry form after the visitor clicks Search.
    //
    // Each tab is fed by its OWN list, published by the super admin under
    // Tourist Visa / Student Visa in the dashboard. They differ — a country
    // may have a tourist page but no student page — so one shared list
    // would offer destinations that 404 on arrival.
    const [visaCountry, setVisaCountry] = useState(null);
    const [visaQ, setVisaQ] = useState("");
    const [studentCountry, setStudentCountry] = useState(null);
    const [studentQ, setStudentQ] = useState("");
    const [touristGuides, setTouristGuides] = useState([]);
    const [studentGuides, setStudentGuides] = useState([]);

    const [hotelCity, setHotelCity] = useState("");
    const [hotelCheckIn, setHotelCheckIn] = useState("");
    const [hotelStar, setHotelStar] = useState("");
    // tour state removed with the Tour Packages feature.

    useEffect(() => {
        const ac = new AbortController();
        (async () => {
            try {
                const hRes = await fetch(`${API_BASE}/api/hotels/active`, { signal: ac.signal }).catch(() => null);
                // Visa guide countries are fetched separately below.
                if (hRes) { const d = await hRes.json(); if (d.success && d.data) setHotels(d.data); }
            } catch (err) {
                if (err.name !== "AbortError") console.error("Hero fetch error:", err);
            }
        })();
        return () => ac.abort();
    }, []);

    // Visa guide countries — one request per category, normalised to the
    // { name, slug, flag, region } shape CountryPicker renders.
    useEffect(() => {
        const ac = new AbortController();
        const norm = (rows) => rows.map((g) => ({
            name: g.country,
            nameBn: g.countryBn,
            slug: g.countrySlug,
            flag: g.flag,
            region: g.visaType || "",
        }));
        (async () => {
            try {
                const [tRes, sRes] = await Promise.all([
                    fetch(`${API_BASE}/api/visa-guides/public/countries?category=tourist`, { signal: ac.signal }).catch(() => null),
                    fetch(`${API_BASE}/api/visa-guides/public/countries?category=student`, { signal: ac.signal }).catch(() => null),
                ]);
                if (tRes) { const d = await tRes.json(); if (d.success && d.data) setTouristGuides(norm(d.data)); }
                if (sRes) { const d = await sRes.json(); if (d.success && d.data) setStudentGuides(norm(d.data)); }
            } catch (err) {
                if (err.name !== "AbortError") console.error("Hero visa-guide fetch error:", err);
            }
        })();
        return () => ac.abort();
    }, []);

    // countryOptions removed with the Countries feature — nothing in the
    // hero rendered it (touristGuides/studentGuides feed the visa tabs).
    const hotelCityOptions = useMemo(() => {
        const seen = new Set(); const out = [];
        for (const h of hotels) if (h.city && !seen.has(h.city)) { seen.add(h.city); out.push({ value: h.city, label: h.city, labelBn: h.cityBn || h.city, sub: h.country || "" }); }
        return out;
    }, [hotels]);
    // tourDestOptions/tourTypeOptions removed with the Tour Packages feature.

    // Tourism Visa: pick a super-admin-published country → jump straight to
    // its details page, which carries the requirements and the booking form.
    // A typed-but-unpicked value is matched against the list so pressing
    // Search after typing a full country name still works.
    const resolveCountry = (picked, typedQuery, list) => {
        if (picked?.slug) return picked;
        if (!typedQuery) return null;
        const needle = typedQuery.trim().toLowerCase();
        return list.find(
            (c) => (c.name || "").toLowerCase() === needle ||
                   (c.nameBn || "").toLowerCase() === needle ||
                   (c.slug || "").toLowerCase() === needle
        ) || null;
    };
    const handleVisaSearch = () => {
        const c = resolveCountry(visaCountry, visaQ, touristGuides);
        if (!c?.slug) return;
        router.push(`/visa/details/tourist/${c.slug}`);
    };
    const handleHotelSearch = () => {
        const p = new URLSearchParams();
        if (hotelCity) p.set("city", hotelCity);
        if (hotelStar) p.set("star", hotelStar);
        if (hotelCheckIn) p.set("checkIn", hotelCheckIn);
        router.push(p.toString() ? `/hotel?${p}` : "/hotel");
    };
    // "tour" tab id is repurposed as Student Visa in the UI. Same details
    // route as tourism — only the category segment differs.
    const handleTourSearch = () => {
        const c = resolveCountry(studentCountry, studentQ, studentGuides);
        if (!c?.slug) return;
        router.push(`/visa/details/student/${c.slug}`);
    };

    const config = {
        flight: { handler: handleFlightSearch },
        hotel:  { handler: handleHotelSearch },
        tour:   { handler: handleTourSearch },
        visa:   { handler: handleVisaSearch },
    };

    // ─────────────────────────────────────────────────────
    return (
        <section className="relative min-h-[100svh] lg:min-h-[92vh] bg-[#8FD8F5] overflow-hidden">
            {/* Background slides */}
            <div className="absolute inset-0 z-0">
                {slides.map((src, i) => (
                    <div
                        key={`${src}-${i}`}
                        className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
                        style={{ backgroundImage: `url('${src}')`, opacity: slideIdx === i ? 1 : 0 }}
                    />
                ))}
                <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/10" />
            </div>

            {/* Content */}
            <div className="relative z-10 w-full max-w-[1200px] mx-auto px-4 sm:px-6 pt-[130px] lg:pt-[180px] pb-16">
                {/* Tabs card — sits on top of search card, overlapping slightly */}
                <div className="relative z-20 w-fit mx-auto bg-white rounded-lg shadow-[0_-2px_20px_-8px_rgba(0,0,0,0.1)] -mb-4">
                    <div role="tablist" className="flex items-center">
                        {tabs.map((tab) => (
                            <Tab
                                key={tab.id}
                                active={activeTab === tab.id}
                                icon={tab.icon}
                                label={tab.label}
                                onClick={() => setActiveTab(tab.id)}
                                bnFont={bnFont}
                            />
                        ))}
                    </div>
                </div>

                {/* Search card */}
                <div className="relative z-10 bg-white rounded-2xl shadow-[0_20px_50px_-15px_rgba(0,0,0,0.2)] p-4 lg:p-8 pt-8 lg:pt-14 pb-10 lg:pb-14">
                    {/* Trip type — flight only */}
                    {activeTab === "flight" && (
                        <div className="flex flex-wrap items-center gap-6 mb-5" role="radiogroup">
                            {[
                                { v: "oneway", label: isBn ? "একমুখী" : "One Way" },
                                { v: "round",  label: isBn ? "উভয়মুখী" : "Round Way" },
                                { v: "multi",  label: isBn ? "মাল্টি সিটি" : "Multi City" },
                            ].map((o) => {
                                const active = tripType === o.v;
                                return (
                                    <label key={o.v} className="flex items-center gap-2 cursor-pointer select-none">
                                        <span className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center transition-colors ${
                                            active ? "border-brand-dark" : "border-gray-300"
                                        }`}>
                                            {active && <span className="w-[9px] h-[9px] rounded-full bg-brand-dark" />}
                                        </span>
                                        <input type="radio" name="tripType" value={o.v} checked={active} onChange={() => setTripType(o.v)} className="sr-only" />
                                        <span
                                            className={`text-[14px] font-semibold ${active ? "text-brand-dark" : "text-gray-500"}`}
                                            style={{ fontFamily: bnFont }}
                                        >
                                            {o.label}
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                    )}

                    {/* Fields row */}
                    {activeTab === "flight" && (
                        <div className={`grid grid-cols-2 gap-2 relative ${tripType === "multi" ? "lg:grid-cols-[1fr_1fr_1fr_1fr]" : "lg:grid-cols-[1fr_1fr_1fr_1fr_1fr]"}`}>
                            {/* FROM */}
                            <div className="relative border border-gray-200 rounded-lg overflow-visible">
                                <Dropdown
                                    label="From"
                                    value={flightFrom}
                                    placeholder="City, code (Dhaka / DAC)"
                                    options={fromAirports}
                                    onSelect={setFlightFrom}
                                    searchable
                                    bnFont={bnFont}
                                    isBn={isBn}
                                />
                            </div>

                            {/* TO with swap button positioned between FROM and TO */}
                            <div className="relative border border-gray-200 rounded-lg overflow-visible">
                                <Dropdown
                                    label="To"
                                    value={flightTo}
                                    placeholder="City, country or code"
                                    options={toAirports}
                                    onSelect={setFlightTo}
                                    searchable
                                    bnFont={bnFont}
                                    isBn={isBn}
                                />
                                <button
                                    type="button"
                                    onClick={swapAirports}
                                    aria-label="Swap"
                                    className="flex absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white border border-gray-200 shadow-sm items-center justify-center text-brand-dark hover:bg-brand-dark hover:text-white transition-colors"
                                >
                                    <LuArrowRightLeft size={14} />
                                </button>
                            </div>

                            {/* DEP */}
                            <div className="border border-gray-200 rounded-lg">
                                <DateField
                                    label={isBn ? "যাত্রার তারিখ" : "Departure Date"}
                                    value={depDate}
                                    onChange={setDepDate}
                                    bnFont={bnFont}
                                    isBn={isBn}
                                />
                            </div>

                            {/* RET — hidden in multi-city */}
                            {tripType !== "multi" && (
                                <div className="border border-gray-200 rounded-lg">
                                    <DateField
                                        label={isBn ? "ফিরতি তারিখ" : "Return Date"}
                                        value={tripType === "round" ? retDate : ""}
                                        onChange={(v) => { if (tripType !== "round") setTripType("round"); setRetDate(v); }}
                                        bnFont={bnFont}
                                        isBn={isBn}
                                        hint={isBn ? "ফিরতি ফ্লাইটে সাশ্রয় করুন" : "Save more on return flight"}
                                    />
                                </div>
                            )}

                            {/* TRAVELER */}
                            <div className="col-span-2 lg:col-span-1 border border-gray-200 rounded-lg">
                                <TravelerPicker
                                    travelers={travelers}
                                    setTravelers={setTravelers}
                                    cls={cabin}
                                    setCls={setCabin}
                                    bnFont={bnFont}
                                    isBn={isBn}
                                />
                            </div>
                        </div>
                    )}

                    {/* Multi-city extra legs — same 4-col layout as the primary row */}
                    {activeTab === "flight" && tripType === "multi" && (
                        <div className="mt-2 space-y-2">
                            {flightLegs.map((l, i) => {
                                const isLast = i === flightLegs.length - 1;
                                return (
                                    <div key={i} className="grid grid-cols-2 gap-2 lg:grid-cols-[1fr_1fr_1fr_1fr]">
                                        {/* FROM */}
                                        <div className="border border-gray-200 rounded-lg">
                                            <Dropdown
                                                label={`Leg ${i + 2} · From`}
                                                value={l.from}
                                                placeholder="Select a city"
                                                options={fromAirports.concat(toAirports)}
                                                onSelect={(v) => setLegField(i, "from", v)}
                                                searchable
                                                bnFont={bnFont}
                                                isBn={isBn}
                                            />
                                        </div>
                                        {/* TO */}
                                        <div className="border border-gray-200 rounded-lg">
                                            <Dropdown
                                                label={`Leg ${i + 2} · To`}
                                                value={l.to}
                                                placeholder="Select a city"
                                                options={fromAirports.concat(toAirports)}
                                                onSelect={(v) => setLegField(i, "to", v)}
                                                searchable
                                                bnFont={bnFont}
                                                isBn={isBn}
                                            />
                                        </div>
                                        {/* DATE */}
                                        <div className="border border-gray-200 rounded-lg">
                                            <DateField
                                                label={`Leg ${i + 2} · Date`}
                                                value={l.date}
                                                onChange={(v) => setLegField(i, "date", v)}
                                                bnFont={bnFont}
                                                isBn={isBn}
                                                hint="Pick a date"
                                            />
                                        </div>
                                        {/* Add / Remove cell */}
                                        <div className="col-span-2 lg:col-span-1 flex items-center gap-2">
                                            {isLast ? (
                                                <button
                                                    type="button"
                                                    onClick={addLeg}
                                                    className="flex-1 h-full min-h-[46px] rounded-lg border-2 border-dashed border-gray-300 text-brand-blue hover:border-brand-blue hover:bg-brand-blue/5 text-sm font-bold flex items-center justify-center gap-1.5 transition-all"
                                                >
                                                    <LuPlus size={14} /> Add Another City
                                                </button>
                                            ) : (
                                                <div className="flex-1 h-full min-h-[46px] rounded-lg border border-gray-200 bg-gray-50/60" />
                                            )}
                                            {flightLegs.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeLeg(i)}
                                                    className="w-10 h-10 rounded-full bg-gray-100 hover:bg-red-50 text-gray-400 hover:text-red-500 flex items-center justify-center flex-shrink-0"
                                                    aria-label="Remove leg"
                                                >
                                                    <LuX size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* HOTEL fields */}
                    {activeTab === "hotel" && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            <div className="border border-gray-200 rounded-lg">
                                <Dropdown
                                    label={isBn ? "শহর" : "City"}
                                    value={hotelCity}
                                    placeholder={isBn ? "শহর বাছুন" : "Select city"}
                                    options={hotelCityOptions}
                                    onSelect={setHotelCity}
                                    onClear={() => setHotelCity("")}
                                    searchable
                                    bnFont={bnFont}
                                    isBn={isBn}
                                    icon={<LuMapPin size={16} />}
                                />
                            </div>
                            <div className="border border-gray-200 rounded-lg">
                                <DateField
                                    label={isBn ? "চেক-ইন" : "Check-in"}
                                    value={hotelCheckIn}
                                    onChange={setHotelCheckIn}
                                    bnFont={bnFont}
                                    isBn={isBn}
                                />
                            </div>
                            <div className="border border-gray-200 rounded-lg">
                                <StarChips value={hotelStar} onChange={setHotelStar} isBn={isBn} bnFont={bnFont} />
                            </div>
                        </div>
                    )}

                    {/* STUDENT VISA — Country picker + fixed "Student" label */}
                    {activeTab === "tour" && (
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_180px]">
                            <div className="border border-gray-200 rounded-lg px-3.5 py-1 min-h-[46px] flex flex-col justify-center">
                                <FieldLabel bnFont={bnFont}>{isBn ? "দেশ" : "Country"}</FieldLabel>
                                <CountryPicker
                                    list={studentGuides}
                                    value={studentQ}
                                    onChange={(v) => { setStudentQ(v); setStudentCountry(null); }}
                                    onSelect={(c) => { setStudentCountry(c); setStudentQ(c.name); }}
                                    placeholder={isBn ? "দেশ বাছুন" : "Select country"}
                                    inputClassName="w-full text-[14px] font-bold text-brand-dark leading-none bg-transparent outline-none placeholder:text-gray-400 placeholder:font-medium"
                                />
                            </div>
                            <div className="border border-gray-200 rounded-lg flex items-center px-3.5 py-1 bg-gray-50/60 min-h-[46px]">
                                <LuGraduationCap className="text-brand-blue mr-2 flex-shrink-0" size={20} />
                                <div>
                                    <FieldLabel bnFont={bnFont}>{isBn ? "ভিসার ধরন" : "Visa Type"}</FieldLabel>
                                    <p className="text-[14px] font-bold text-brand-dark leading-tight">{isBn ? "স্টুডেন্ট" : "Student"}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TOURISM VISA — Country picker + fixed "Tourist" label */}
                    {activeTab === "visa" && (
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_180px]">
                            <div className="border border-gray-200 rounded-lg px-3.5 py-1 min-h-[46px] flex flex-col justify-center">
                                <FieldLabel bnFont={bnFont}>{isBn ? "দেশ" : "Country"}</FieldLabel>
                                <CountryPicker
                                    list={touristGuides}
                                    value={visaQ}
                                    onChange={(v) => { setVisaQ(v); setVisaCountry(null); }}
                                    onSelect={(c) => { setVisaCountry(c); setVisaQ(c.name); }}
                                    placeholder={isBn ? "দেশ বাছুন" : "Select country"}
                                    inputClassName="w-full text-[14px] font-bold text-brand-dark leading-none bg-transparent outline-none placeholder:text-gray-400 placeholder:font-medium"
                                />
                            </div>
                            <div className="border border-gray-200 rounded-lg flex items-center px-3.5 py-1 bg-gray-50/60 min-h-[46px]">
                                <LuMap className="text-brand-blue mr-2 flex-shrink-0" size={20} />
                                <div>
                                    <FieldLabel bnFont={bnFont}>{isBn ? "ভিসার ধরন" : "Visa Type"}</FieldLabel>
                                    <p className="text-[14px] font-bold text-brand-dark leading-tight">{isBn ? "ট্যুরিস্ট" : "Tourist"}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Search button — floating below card */}
                <div className="flex justify-center -mt-2 relative z-20">
                    <button
                        type="button"
                        onClick={config[activeTab]?.handler}
                        className="px-12 py-4 rounded-lg text-brand-dark text-[16px] font-bold transition-all hover:-translate-y-0.5 active:scale-[0.98]"
                        style={{
                            fontFamily: bnFont,
                            backgroundColor: BRAND.accent,
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = BRAND.accentDark)}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = BRAND.accent)}
                    >
                        {isBn ? "সার্চ" : "Search"}
                    </button>
                </div>
            </div>
        </section>
    );
}
