"use client";

// ===================================================================
// Flight Inquiry — single centered form. Nothing else on the page.
// Auto-fills every field the visitor already picked in the Hero
// (from / to / dates / trip type / passengers / class), lets them
// fill the rest, submit as an inquiry, or open WhatsApp with the
// same info pre-filled.
// ===================================================================

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import {
    LuUser, LuMail, LuPhone, LuMessageSquare, LuLoader, LuCheck,
    LuChevronRight, LuMapPin, LuCalendar, LuUsers, LuPlane, LuPlus, LuX,
} from "react-icons/lu";
import { FaWhatsapp } from "react-icons/fa";
import { useSiteSettings, buildWhatsAppUrl } from "@/context/SiteSettingsContext";
import AirportPicker from "@/components/shared/AirportPicker";
import DatePicker from "@/components/shared/DatePicker";
import { BD_AIRPORTS, INTL_AIRPORTS, ALL_AIRPORTS } from "@/utils/airports";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function FlightPage() {
    return (
        <Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center text-gray-400">Loading…</div>}>
            <FlightInquiry />
        </Suspense>
    );
}

function FlightInquiry() {
    const searchParams = useSearchParams();
    const { settings } = useSiteSettings();

    // Everything from the home-page Hero pre-fills here.
    const initial = useMemo(() => ({
        tripType:   searchParams.get("type")      || "oneway",
        from:       searchParams.get("from")      || "",
        to:         searchParams.get("to")        || "",
        departDate: searchParams.get("dep")       || "",
        returnDate: searchParams.get("ret")       || "",
        passengers: searchParams.get("travelers") || "1",
        cabin:      searchParams.get("class")     || "economy",
    }), [searchParams]);

    const [form, setForm] = useState({
        ...initial,
        name: "",
        phone: "",
        email: "",
        message: "",
    });
    // Extra multi-city legs beyond the primary from/to/depart row.
    // Seeded from URL: ?leg1From=…&leg1To=…&leg1Date=…&leg2From=…
    const [legs, setLegs] = useState(() => {
        const out = [];
        for (let i = 1; i <= 8; i++) {
            const f = searchParams.get(`leg${i}From`);
            const t = searchParams.get(`leg${i}To`);
            const d = searchParams.get(`leg${i}Date`);
            if (f || t || d) out.push({ from: f || "", to: t || "", date: d || "" });
        }
        return out.length ? out : [{ from: "", to: "", date: "" }];
    });
    const [status, setStatus] = useState("idle"); // idle | submitting | success | error
    const [errorMsg, setErrorMsg] = useState("");

    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
    const setLeg = (i, k, v) => setLegs((arr) => arr.map((l, idx) => idx === i ? { ...l, [k]: v } : l));
    const addLeg = () => setLegs((arr) => [...arr, { from: "", to: "", date: "" }]);
    const removeLeg = (i) => setLegs((arr) => arr.filter((_, idx) => idx !== i));

    // Compose a readable summary used both in the inquiry `message` and WhatsApp.
    const summary = useMemo(() => {
        const lines = [`Trip type: ${labelType(form.tripType)}`];
        if (form.tripType === "multi") {
            lines.push(`Leg 1: ${form.from || "-"} → ${form.to || "-"} on ${form.departDate || "-"}`);
            legs.forEach((l, i) => {
                if (l.from || l.to || l.date) {
                    lines.push(`Leg ${i + 2}: ${l.from || "-"} → ${l.to || "-"} on ${l.date || "-"}`);
                }
            });
        } else {
            lines.push(`From: ${form.from || "-"}`);
            lines.push(`To: ${form.to || "-"}`);
            lines.push(`Departure: ${form.departDate || "-"}`);
            if (form.tripType === "round") lines.push(`Return: ${form.returnDate || "-"}`);
        }
        lines.push(`Passengers: ${form.passengers || "1"}`);
        lines.push(`Class: ${labelCabin(form.cabin)}`);
        if (form.message) lines.push(`Note: ${form.message}`);
        return lines.join("\n");
    }, [form, legs]);

    const submit = async (e) => {
        e.preventDefault();
        if (!form.name.trim() || !form.phone.trim()) {
            setStatus("error");
            setErrorMsg("Name and WhatsApp number are required.");
            return;
        }
        if (!form.from.trim() || !form.to.trim() || !form.departDate) {
            setStatus("error");
            setErrorMsg("From, To and Departure date are required.");
            return;
        }
        setStatus("submitting");
        setErrorMsg("");
        try {
            const res = await fetch(`${API}/api/inquiries`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    service: "flight-booking",
                    serviceLabel: "Flight Booking",
                    name: form.name,
                    email: form.email,
                    phone: form.phone,
                    subject: `Flight: ${form.from} → ${form.to}`,
                    message: summary,
                    extra: {
                        tripType:  form.tripType,
                        from:      form.from,
                        to:        form.to,
                        departDate: form.departDate,
                        returnDate: form.returnDate,
                        passengers: form.passengers,
                        cabin:     form.cabin,
                        ...(form.tripType === "multi" ? { legs } : {}),
                    },
                    pageUrl: typeof window !== "undefined" ? window.location.href : "",
                }),
            });
            const data = await res.json();
            if (!res.ok || !data.success) throw new Error(data.message || "Submission failed");

            // Right-side toast with progress bar, then form clears — stays on same page.
            const firstName = form.name.split(" ")[0] || "traveler";
            const TOAST_MS = 5000;
            toast.custom(
                (t) => (
                    <div
                        className={`pointer-events-auto w-[360px] max-w-[calc(100vw-2rem)] rounded-2xl bg-white shadow-2xl border border-gray-100 overflow-hidden ${
                            t.visible ? "animate-slide-in-right" : "animate-slide-out-right"
                        }`}
                    >
                        <div className="flex items-start gap-3 p-4">
                            <div className="w-10 h-10 rounded-full bg-green-500/10 text-green-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <LuCheck className="w-5 h-5" strokeWidth={3} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-black text-brand-dark flex items-center gap-1.5">
                                    <LuPlane className="w-4 h-4 -rotate-45 text-brand-blue" />
                                    Thank you, {firstName}!
                                </p>
                                <p className="text-[13px] text-gray-600 mt-1 leading-snug">
                                    Your flight inquiry has been submitted successfully.
                                </p>
                                <p className="text-[13px] text-gray-600 leading-snug">
                                    Our team will reach out on <span className="font-bold text-whatsapp">WhatsApp</span> within 24 hours.
                                </p>
                            </div>
                            <button
                                onClick={() => toast.dismiss(t.id)}
                                className="text-gray-400 hover:text-gray-700 p-1 flex-shrink-0"
                                aria-label="Dismiss"
                            >
                                <LuX className="w-4 h-4" />
                            </button>
                        </div>
                        {/* Progress bar — shrinks from 100% to 0% over the toast duration */}
                        <div className="h-1 bg-gray-100">
                            <div
                                className="h-full bg-gradient-to-r from-brand-blue to-brand-dark animate-progress-shrink"
                                style={{ animationDuration: `${TOAST_MS}ms` }}
                            />
                        </div>
                    </div>
                ),
                { duration: TOAST_MS, position: "top-right" }
            );

            // Reset all form fields — same page stays.
            setForm({
                tripType: "oneway",
                from: "",
                to: "",
                departDate: "",
                returnDate: "",
                passengers: "1",
                cabin: "economy",
                name: "",
                phone: "",
                email: "",
                message: "",
            });
            setLegs([{ from: "", to: "", date: "" }]);
            setStatus("idle");
            setErrorMsg("");
        } catch (err) {
            setStatus("error");
            setErrorMsg(err.message || "Something went wrong");
        }
    };

    const wa = settings?.whatsappNumber;
    const waHref = wa
        ? buildWhatsAppUrl(wa, `Hi, I'd like a flight quote.\n\n${summary}\n\nName: ${form.name || "-"}\nPhone: ${form.phone || "-"}${form.email ? `\nEmail: ${form.email}` : ""}`)
        : null;

    return (
        <div className="flex-1 py-10 md:py-14 px-4 bg-[#F8FAFC]" style={{ fontFamily: "Poppins, sans-serif" }}>
            <div className="max-w-3xl mx-auto">
                {/* Breadcrumb + title */}
                <nav className="flex items-center gap-2 text-gray-400 text-xs mb-4">
                    <Link href="/" className="hover:text-brand-blue">Home</Link>
                    <LuChevronRight size={12} />
                    <span className="text-gray-600">Flight Inquiry</span>
                </nav>
                <div className="mb-6 text-center">
                    <h1 className="text-3xl md:text-4xl font-black text-brand-dark tracking-tight uppercase" style={{ fontFamily: "Teko, sans-serif" }}>
                        Flight Booking Inquiry
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Fill in the details — we'll get back with fare, airline & schedule on WhatsApp.
                    </p>
                </div>

                {/* Form card */}
                <form onSubmit={submit} className="rounded-2xl bg-white border border-gray-100 shadow-[0_15px_40px_-15px_rgba(0,0,0,0.12)] p-5 md:p-8 space-y-5">
                    {/* Trip type */}
                    <div className="grid grid-cols-3 gap-2 p-1 rounded-lg bg-gray-100">
                        {[
                            { v: "oneway", label: "One Way" },
                            { v: "round",  label: "Round Way" },
                            { v: "multi",  label: "Multi City" },
                        ].map((o) => (
                            <button
                                key={o.v}
                                type="button"
                                onClick={() => set("tripType", o.v)}
                                className={`py-2 rounded-md text-xs md:text-sm font-bold transition-all ${
                                    form.tripType === o.v
                                        ? "bg-white text-brand-dark shadow-sm"
                                        : "text-gray-500 hover:text-gray-700"
                                }`}
                            >
                                {o.label}
                            </button>
                        ))}
                    </div>

                    {/* From + To — autocomplete on city/country/code */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field label="From" icon={<LuMapPin size={14} />} required>
                            <AirportPicker
                                value={form.from}
                                onChange={(v) => set("from", v)}
                                options={BD_AIRPORTS}
                                placeholder="City, code (e.g. Dhaka / DAC)"
                                required
                            />
                        </Field>
                        <Field label="To" icon={<LuMapPin size={14} />} required>
                            <AirportPicker
                                value={form.to}
                                onChange={(v) => set("to", v)}
                                options={INTL_AIRPORTS}
                                placeholder="City, country or code"
                                required
                            />
                        </Field>
                    </div>

                    {/* Dates row — Return field is hidden for multi-city */}
                    <div className={form.tripType === "multi" ? "" : "grid grid-cols-1 md:grid-cols-2 gap-4"}>
                        <Field label={form.tripType === "multi" ? "Leg 1 — Departure Date" : "Departure Date"} icon={<LuCalendar size={14} />} required>
                            <DatePicker
                                value={form.departDate}
                                onChange={(v) => set("departDate", v)}
                                min={new Date()}
                                placeholder="Select departure date"
                            />
                        </Field>
                        {form.tripType !== "multi" && (
                            <Field label={form.tripType === "round" ? "Return Date" : "Return Date (optional)"} icon={<LuCalendar size={14} />}>
                                <DatePicker
                                    value={form.returnDate}
                                    onChange={(v) => set("returnDate", v)}
                                    min={form.departDate || new Date()}
                                    placeholder={form.tripType === "round" ? "Select return date" : "Not required"}
                                    disabled={form.tripType !== "round"}
                                />
                            </Field>
                        )}
                    </div>

                    {/* Multi-city extra legs */}
                    {form.tripType === "multi" && (
                        <div className="space-y-3 pt-1">
                            {legs.map((l, i) => (
                                <div key={i} className="rounded-lg border border-gray-200 bg-gray-50/60 p-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                                            Leg {i + 2}
                                        </span>
                                        {legs.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeLeg(i)}
                                                className="w-6 h-6 rounded-full bg-white border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 flex items-center justify-center"
                                                aria-label="Remove leg"
                                            >
                                                <LuX size={13} />
                                            </button>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <Field label="From" icon={<LuMapPin size={14} />} required>
                                            <AirportPicker
                                                value={l.from}
                                                onChange={(v) => setLeg(i, "from", v)}
                                                options={ALL_AIRPORTS}
                                                placeholder="City / code"
                                                required
                                            />
                                        </Field>
                                        <Field label="To" icon={<LuMapPin size={14} />} required>
                                            <AirportPicker
                                                value={l.to}
                                                onChange={(v) => setLeg(i, "to", v)}
                                                options={ALL_AIRPORTS}
                                                placeholder="City / code"
                                                required
                                            />
                                        </Field>
                                        <Field label="Date" icon={<LuCalendar size={14} />} required>
                                            <DatePicker
                                                value={l.date}
                                                onChange={(v) => setLeg(i, "date", v)}
                                                min={form.departDate || new Date()}
                                                placeholder="Pick a date"
                                            />
                                        </Field>
                                    </div>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addLeg}
                                className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-lg border-2 border-dashed border-gray-300 text-brand-blue hover:border-brand-blue hover:bg-brand-blue/5 text-sm font-bold transition-all"
                            >
                                <LuPlus size={14} /> Add Another City
                            </button>
                        </div>
                    )}

                    {/* Passengers + Class */}
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Passengers" icon={<LuUsers size={14} />} required>
                            <input
                                type="number"
                                min="1"
                                max="9"
                                value={form.passengers}
                                onChange={(e) => set("passengers", e.target.value)}
                                className="input"
                                required
                            />
                        </Field>
                        <Field label="Class" icon={<LuPlane size={14} />}>
                            <select
                                value={form.cabin}
                                onChange={(e) => set("cabin", e.target.value)}
                                className="input"
                            >
                                <option value="economy">Economy</option>
                                <option value="premium">Premium Economy</option>
                                <option value="business">Business</option>
                                <option value="first">First</option>
                            </select>
                        </Field>
                    </div>

                    <div className="h-px bg-gray-100" />

                    {/* Contact */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field label="Full Name" icon={<LuUser size={14} />} required>
                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) => set("name", e.target.value)}
                                placeholder="Your name"
                                className="input"
                                required
                            />
                        </Field>
                        <Field label="WhatsApp Number" icon={<LuPhone size={14} />} required>
                            <input
                                type="tel"
                                value={form.phone}
                                onChange={(e) => set("phone", e.target.value)}
                                placeholder="+8801XXXXXXXXX"
                                className="input"
                                required
                            />
                        </Field>
                    </div>

                    <Field label="Email (optional)" icon={<LuMail size={14} />}>
                        <input
                            type="email"
                            value={form.email}
                            onChange={(e) => set("email", e.target.value)}
                            placeholder="you@example.com"
                            className="input"
                        />
                    </Field>

                    <Field label="Message (optional)" icon={<LuMessageSquare size={14} />}>
                        <textarea
                            rows={3}
                            value={form.message}
                            onChange={(e) => set("message", e.target.value)}
                            placeholder="Any preference — airline, timing, extra baggage…"
                            className="input resize-none"
                        />
                    </Field>

                    {status === "error" && errorMsg && (
                        <div className="rounded-lg bg-red-50 border border-red-100 text-red-700 text-sm px-3 py-2">
                            {errorMsg}
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="space-y-2 pt-1">
                        <button
                            type="submit"
                            disabled={status === "submitting"}
                            className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-lg bg-brand-dark hover:bg-brand-dark-hover text-white font-bold text-sm transition-all disabled:opacity-60"
                        >
                            {status === "submitting" ? (
                                <><LuLoader className="w-4 h-4 animate-spin" /> Sending...</>
                            ) : (
                                "Submit Inquiry"
                            )}
                        </button>
                        {waHref && (
                            <a
                                href={waHref}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-lg bg-whatsapp hover:bg-whatsapp-hover text-white font-bold text-sm transition-all"
                            >
                                <FaWhatsapp size={16} /> Send on WhatsApp
                            </a>
                        )}
                    </div>
                </form>
            </div>

            {/* Local input style */}
            <style jsx>{`
                :global(.input) {
                    width: 100%;
                    padding: 0.65rem 0.85rem;
                    border-radius: 0.5rem;
                    border: 1px solid #e5e7eb;
                    background: #ffffff;
                    color: var(--color-brand-dark);
                    font-size: 0.9rem;
                    outline: none;
                    transition: all 0.15s;
                }
                :global(.input:focus) {
                    border-color: var(--color-brand-blue);
                    box-shadow: 0 0 0 3px rgba(29,126,221,0.15);
                }
            `}</style>
        </div>
    );
}

// ── Small labelled field wrapper ────────────────────
function Field({ label, icon, required, children }) {
    // NOTE: This is deliberately a <div>, not a <label>. A <label> around a
    // button/DatePicker re-fires the click on its first form control, which
    // double-toggles the picker's `open` state and makes it appear broken.
    return (
        <div className="block">
            <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                {icon && <span className="text-gray-400">{icon}</span>}
                {label}
                {required && <span className="text-red-500">*</span>}
            </span>
            {children}
        </div>
    );
}

// ── Helpers ─────────────────────────────────────────
function labelType(t) {
    return { oneway: "One Way", round: "Round Way", multi: "Multi City" }[t] || t;
}
function labelCabin(c) {
    return { economy: "Economy", premium: "Premium Economy", business: "Business", first: "First" }[c] || c;
}
