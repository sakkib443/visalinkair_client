"use client";

// ===================================================================
// Public visa details page — /visa/details/{tourist|student}/{country}
//
// Two columns on large screens:
//   Left  : the admin-authored Summary + rich content (<VisaGuideBody/>)
//   Right : the "Request Visa Assistance" form, sticky alongside it
// Below lg they stack, form first-reachable via the header CTA.
//
// Content comes from GET /api/visa-guides/public/:category/:slug, which
// only serves ACTIVE guides — so the admin's status toggle genuinely
// takes the page down rather than just hiding it from the search list.
// ===================================================================

import { Suspense, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
    LuArrowRight, LuChevronRight, LuGlobe, LuGraduationCap, LuLoader, LuMail,
    LuMap, LuMessageSquare, LuPhone, LuUser, LuCheck,
} from "react-icons/lu";
import { FaWhatsapp } from "react-icons/fa";
import VisaGuideBody from "@/components/shared/VisaGuideBody";
import { useSiteSettings, buildWhatsAppUrl, buildTelUrl } from "@/context/SiteSettingsContext";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function VisaDetailsPage() {
    return (
        <Suspense fallback={<LoadingScreen />}>
            <VisaDetailsInner />
        </Suspense>
    );
}

function LoadingScreen() {
    return (
        <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center">
            <LuLoader className="w-7 h-7 text-[#1f1a17] animate-spin" />
        </div>
    );
}

function VisaDetailsInner() {
    const { category, slug } = useParams();
    const { settings } = useSiteSettings();

    const isStudent = category === "student";
    const serviceKey = isStudent ? "student-visa" : "tourism-visa";
    const serviceLabel = isStudent ? "Student Visa" : "Tourism Visa";
    // Both categories now use the brand orange — the visa details page
    // is deliberately blue-free, so the Student sidebar card no longer
    // paints navy blue where Tourist paints orange.
    const accent = "var(--color-brand-accent)";
    const Icon = isStudent ? LuGraduationCap : LuMap;
    // Shared across every visa details page; admin-editable in the dashboard.
    const bannerImage = settings?.visaBannerImage || "";

    const [guide, setGuide] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notFoundErr, setNotFoundErr] = useState(false);

    // Inquiry form
    const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [submittedRef, setSubmittedRef] = useState("");
    const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    useEffect(() => {
        if (category !== "tourist" && category !== "student") {
            setNotFoundErr(true);
            setLoading(false);
            return;
        }
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch(`${API}/api/visa-guides/public/${category}/${slug}`);
                const data = await res.json();
                if (cancelled) return;
                if (!res.ok || !data.success || !data.data) {
                    setNotFoundErr(true);
                } else {
                    setGuide(data.data);
                }
            } catch {
                if (!cancelled) setNotFoundErr(true);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [category, slug]);

    const submitInquiry = async (e) => {
        e.preventDefault();
        setSubmitError("");
        if (!form.name.trim() || !form.phone.trim()) {
            setSubmitError("Name and phone number are required.");
            return;
        }
        setSubmitting(true);
        try {
            const summary = [
                "From: Bangladesh",
                `To: ${guide?.country || ""}`,
                `Visa type: ${guide?.visaType || (isStudent ? "Student" : "Tourist")}`,
                guide?.processingFee ? `Quoted fee: ${guide.processingFee}` : null,
                form.message ? `Note: ${form.message}` : null,
            ].filter(Boolean).join("\n");

            const res = await fetch(`${API}/api/inquiries`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    service: serviceKey,
                    serviceLabel,
                    name: form.name,
                    phone: form.phone,
                    email: form.email,
                    subject: `${serviceLabel}: ${guide?.country || slug}`,
                    message: summary,
                    extra: {
                        visaType: guide?.visaType || (isStudent ? "Student" : "Tourist"),
                        from: "Bangladesh",
                        to: guide?.country || "",
                        toSlug: guide?.countrySlug || slug,
                        visaGuideId: guide?._id || "",
                        category,
                    },
                    pageUrl: typeof window !== "undefined" ? window.location.href : "",
                }),
            });
            const data = await res.json();
            if (!res.ok || !data.success) throw new Error(data.message || "Submission failed");
            setSubmittedRef(data.data?._id || "sent");
            setForm({ name: "", phone: "", email: "", message: "" });
        } catch (err) {
            setSubmitError(err.message || "Something went wrong.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <LoadingScreen />;

    if (notFoundErr || !guide) {
        return (
            <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center px-4">
                <div className="text-center">
                    <LuGlobe size={48} className="text-gray-300 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-500 mb-2">Visa page not found</h1>
                    <p className="text-sm text-gray-500 mb-5 max-w-sm">
                        This visa may have been removed or is temporarily unavailable.
                    </p>
                    <Link
                        href={isStudent ? "/services/study-abroad" : "/visa"}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-white text-sm font-bold"
                        style={{ backgroundColor: accent }}
                    >
                        Browse other countries <LuArrowRight size={14} />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen" style={{ fontFamily: "Poppins, sans-serif" }}>

            {/* ================= HERO =================
                The banner image comes from site settings (Dashboard →
                Visa Page Banner) and is shared by every visa details page.
                It sits UNDER a warm-dark gradient overlay rather than
                replacing it — white text over a light photo fails contrast
                outright.

                The alpha is set for the WORST case — a pure-white image —
                not for the map that ships today, because an admin can
                swap the picture at any moment. At these values white text
                clears 7:1 even against a fully-white photo, and the tone
                is warm charcoal (blue-free) to match the brand's orange
                system throughout the page. */}
            <div
                className="relative overflow-hidden pt-24 md:pt-28"
                style={
                    bannerImage
                        ? {
                              backgroundImage: `linear-gradient(135deg, rgba(31,26,23,0.88) 0%, rgba(45,38,33,0.82) 55%, rgba(31,26,23,0.88) 100%), url("${bannerImage}")`,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                          }
                        : { background: "linear-gradient(135deg, #1f1a17 0%, #2d2621 55%, #1f1a17 100%)" }
                }
            >
                {/* Decorative rings only read well on the flat gradient —
                    over a photo they just add noise. */}
                {!bannerImage && (
                    <svg className="absolute right-0 top-0 h-full w-1/2 opacity-[0.08]" viewBox="0 0 600 400" preserveAspectRatio="none" fill="none" aria-hidden="true">
                        <circle cx="450" cy="200" r="300" stroke="white" strokeWidth="0.8" />
                        <circle cx="450" cy="200" r="220" stroke="white" strokeWidth="0.5" />
                        <circle cx="450" cy="200" r="140" stroke="white" strokeWidth="0.3" />
                    </svg>
                )}

                <div className="relative z-10 max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12 pb-11">
                    {/* Breadcrumb */}
                    {/* Full white, not white/90 — over a photo the extra 10%
                        transparency is the difference between passing and
                        failing AA. Only the decorative chevrons are dimmed. */}
                    <nav className="flex flex-wrap items-center gap-1.5 text-[12.5px] mb-6">
                        <Link href="/" className="text-white hover:underline transition-colors">Home</Link>
                        <LuChevronRight size={12} className="text-white/75" />
                        <Link
                            href={isStudent ? "/services/study-abroad" : "/visa"}
                            className="text-white font-medium hover:underline transition-colors"
                        >
                            {serviceLabel}
                        </Link>
                        <LuChevronRight size={12} className="text-white/75" />
                        {/* White, not the brand yellow — #FDCB1B lands at
                            3.28:1 over this overlay and fails AA. */}
                        <span className="text-white font-semibold">{guide.country}</span>
                    </nav>

                    <div className="flex items-start gap-3.5 mb-5">
                        {guide.flag && <span className="text-4xl leading-none">{guide.flag}</span>}
                        <h1 className="text-[23px] sm:text-[28px] md:text-[34px] font-bold text-white leading-[1.25] max-w-4xl">
                            Apply online for {guide.country} {guide.visaType || (isStudent ? "Student" : "Tourist")} visa from Bangladesh
                        </h1>
                    </div>

                    {/* Quick facts */}
                    <div className="flex flex-wrap gap-2">
                        {[
                            guide.processingTime && ["Processing", guide.processingTime],
                            guide.stayDuration && ["Stay", guide.stayDuration],
                            guide.entryType && ["Entry", guide.entryType],
                        ].filter(Boolean).map(([label, value]) => (
                            <span
                                key={label}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/15 border border-white/30 text-[12.5px] text-white"
                            >
                                <span className="text-white">{label}:</span>
                                <span className="font-semibold">{value}</span>
                            </span>
                        ))}
                        <a
                            href="#request-form"
                            className="lg:hidden inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[12.5px] font-bold text-[#1f1a17]"
                            style={{ backgroundColor: "#FDCB1B" }}
                        >
                            Request assistance <LuArrowRight size={13} />
                        </a>
                    </div>
                </div>
            </div>

            {/* ================= BODY =================
                No card around the left column — the content sits directly
                on the white page. The wider shell plus the asymmetric gap
                pulls the reading column left and gives it room to breathe. */}
            <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12 py-10 lg:py-12">
                <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 xl:gap-20">

                    {/* ---------- LEFT: content ---------- */}
                    <div className="flex-grow min-w-0 lg:max-w-[820px]">
                        <VisaGuideBody guide={guide} />
                    </div>

                    {/* ---------- RIGHT: inquiry form ---------- */}
                    <div className="w-full lg:w-[370px] flex-shrink-0">
                        <div id="request-form" className="lg:sticky lg:top-24 space-y-5 scroll-mt-24">

                            <div className="rounded-xl overflow-hidden shadow-lg bg-white">
                                <div
                                    className="px-5 py-4"
                                    style={{ background: `linear-gradient(135deg, ${accent} 0%, ${accent}dd 100%)` }}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <Icon size={15} className="text-white/85" />
                                        <p className="text-[11px] font-bold uppercase tracking-widest text-white/85">
                                            {serviceLabel}
                                        </p>
                                    </div>
                                    <h2 className="text-[19px] font-bold text-white leading-tight">
                                        Request Visa Assistance
                                    </h2>
                                    <p className="text-[11.5px] text-white/85 mt-1 leading-relaxed">
                                        Please share your contact information. Our team will get in touch with you shortly.
                                    </p>
                                </div>

                                {submittedRef ? (
                                    <div className="p-6 text-center">
                                        <div className="w-14 h-14 mx-auto rounded-full bg-green-500 flex items-center justify-center mb-3">
                                            <LuCheck size={26} className="text-white" strokeWidth={3} />
                                        </div>
                                        <h3 className="text-[17px] font-bold text-[#1f1a17]">Request received</h3>
                                        <p className="text-[13px] text-gray-500 mt-1">
                                            Our visa specialists will reach out on WhatsApp shortly.
                                        </p>
                                        {submittedRef !== "sent" && (
                                            <p className="text-[11px] text-gray-400 mt-3">
                                                Ref: <code className="font-mono text-gray-600">{submittedRef.slice(-8).toUpperCase()}</code>
                                            </p>
                                        )}
                                        <button
                                            onClick={() => setSubmittedRef("")}
                                            className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-semibold text-brand-accent-ink hover:underline"
                                        >
                                            Send another request <LuArrowRight size={12} />
                                        </button>
                                    </div>
                                ) : (
                                    <form onSubmit={submitInquiry} className="p-5 space-y-3">
                                        <FormField label="Name" icon={<LuUser size={13} />} required>
                                            <input
                                                type="text"
                                                value={form.name}
                                                onChange={(e) => setField("name", e.target.value)}
                                                placeholder="Enter your name"
                                                className="vd-fld"
                                                required
                                            />
                                        </FormField>

                                        <FormField label="Phone Number" icon={<LuPhone size={13} />} required>
                                            <input
                                                type="tel"
                                                value={form.phone}
                                                onChange={(e) => setField("phone", e.target.value)}
                                                placeholder="+8801XXXXXXXXX"
                                                className="vd-fld"
                                                required
                                            />
                                        </FormField>

                                        <FormField label="Email Address" icon={<LuMail size={13} />}>
                                            <input
                                                type="email"
                                                value={form.email}
                                                onChange={(e) => setField("email", e.target.value)}
                                                placeholder="someone@example.com"
                                                className="vd-fld"
                                            />
                                        </FormField>

                                        <FormField label="Message (optional)" icon={<LuMessageSquare size={13} />}>
                                            <textarea
                                                rows={3}
                                                value={form.message}
                                                onChange={(e) => setField("message", e.target.value)}
                                                placeholder="Preferred travel dates, special requirements…"
                                                className="vd-fld resize-none"
                                            />
                                        </FormField>

                                        {submitError && (
                                            <div className="rounded-md bg-red-50 border border-red-100 text-red-700 text-[12px] px-3 py-2">
                                                {submitError}
                                            </div>
                                        )}

                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="w-full py-3 rounded-lg font-bold text-[13px] text-[#1f1a17] transition-all disabled:opacity-60 inline-flex items-center justify-center gap-2"
                                            style={{ backgroundColor: "#FDCB1B" }}
                                        >
                                            {submitting
                                                ? <><LuLoader className="w-4 h-4 animate-spin" /> Submitting…</>
                                                : <>Submit <LuArrowRight size={14} /></>}
                                        </button>

                                        <p className="text-[10px] text-gray-400 text-center pt-1">
                                            By submitting, you agree to be contacted on WhatsApp.
                                        </p>

                                        <style jsx>{`
                                            :global(.vd-fld) {
                                                width: 100%;
                                                padding: 0.6rem 0.75rem;
                                                border-radius: 0.5rem;
                                                border: 1px solid #e5e7eb;
                                                background: #fff;
                                                color: #1f1a17;
                                                font-size: 13px;
                                                outline: none;
                                                transition: border-color .15s, box-shadow .15s;
                                            }
                                        `}</style>
                                    </form>
                                )}
                            </div>

                            {/* Quick contact */}
                            <div className="rounded-xl overflow-hidden" style={{ background: "linear-gradient(135deg, #1f1a17 0%, #2d2621 100%)" }}>
                                <div className="p-5 relative">
                                    <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-[#f5a623] opacity-10 blur-2xl" />
                                    <div className="relative z-10">
                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#f5a623] mb-2">
                                            Need Help?
                                        </p>
                                        <p className="text-[13px] font-semibold text-white mb-1">Get in Touch</p>
                                        <p className="text-[11px] text-white/40 leading-relaxed mb-4">
                                            Our visa specialists are always here to help.
                                        </p>
                                        <div className="space-y-2">
                                            <a
                                                href={buildTelUrl(settings?.contactPhone)}
                                                className="w-full py-2.5 rounded-lg flex items-center justify-center gap-2 text-[11px] font-semibold text-white hover:opacity-90"
                                                style={{ backgroundColor: "#f5a623" }}
                                            >
                                                <LuPhone size={12} /> Call Now
                                            </a>
                                            <a
                                                href={buildWhatsAppUrl(settings?.whatsappNumber)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-full py-2.5 rounded-lg flex items-center justify-center gap-2 text-[11px] font-semibold text-white border border-white/15 hover:bg-white/5"
                                            >
                                                <FaWhatsapp size={12} /> WhatsApp
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function FormField({ label, icon, required, children }) {
    return (
        <label className="block">
            <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                {icon && <span className="text-gray-400">{icon}</span>}
                {label}
                {required && <span className="text-red-500">*</span>}
            </span>
            {children}
        </label>
    );
}
