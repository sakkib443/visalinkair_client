"use client";

// ===================================================================
// VisaSearchLanding — plain white landing shared by /visa (Tourism)
// and /services/study-abroad (Student). Heading + a single search bar
// (country autocomplete + fixed visa-type label + Search). Nothing
// else — the details page holds the actual visa info and inquiry form.
// ===================================================================

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LuArrowRight, LuGraduationCap, LuMap, LuSearch, LuLoader } from "react-icons/lu";
import Link from "next/link";
import CountryPicker from "@/components/shared/CountryPicker";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function VisaSearchLanding({
    variant = "tourist", // "tourist" | "student"
}) {
    const isStudent = variant === "student";
    const router = useRouter();

    const [countries, setCountries] = useState([]);
    const [loadingCountries, setLoadingCountries] = useState(true);
    const [country, setCountry] = useState(null);
    const [q, setQ] = useState("");
    const [pending, setPending] = useState(false);

    // The dropdown is fed by whatever the super admin has published under
    // this category — the endpoint returns active guides only, so a visa
    // toggled off in the dashboard disappears from search immediately.
    useEffect(() => {
        let cancelled = false;
        const cat = isStudent ? "student" : "tourist";
        fetch(`${API}/api/visa-guides/public/countries?category=${cat}`)
            .then((r) => r.json())
            .then((d) => {
                if (cancelled) return;
                if (d?.success && Array.isArray(d.data)) {
                    // Normalise to the shape CountryPicker expects
                    // ({ name, slug, flag, region }).
                    setCountries(
                        d.data.map((g) => ({
                            name: g.country,
                            nameBn: g.countryBn,
                            slug: g.countrySlug,
                            flag: g.flag,
                            region: g.visaType || "",
                        }))
                    );
                }
            })
            .catch(() => {})
            .finally(() => !cancelled && setLoadingCountries(false));
        return () => { cancelled = true; };
    }, [isStudent]);

    const resolve = () => {
        if (country?.slug) return country;
        const needle = q.trim().toLowerCase();
        if (!needle) return null;
        return countries.find(
            (c) => (c.name || "").toLowerCase() === needle ||
                   (c.nameBn || "").toLowerCase() === needle ||
                   (c.slug || "").toLowerCase() === needle
        ) || null;
    };

    const handleSearch = () => {
        const c = resolve();
        if (!c?.slug) return;
        setPending(true);
        router.push(`/visa/details/${isStudent ? "student" : "tourist"}/${c.slug}`);
    };

    // Same visual treatment on both pages. Only the fixed pill label
    // and the crumb text differ.
    const title = isStudent ? "Student Visa — Apply from Bangladesh" : "Tourism Visa — Apply from Bangladesh";
    const Icon = isStudent ? LuGraduationCap : LuMap;

    return (
        <div
            className="bg-white min-h-[70vh] pt-28 pb-16 md:pt-32"
            style={{ fontFamily: "Poppins, sans-serif" }}
        >
            <div className="max-w-5xl w-full px-4 sm:px-6 mx-auto">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-[12px] text-gray-500 mb-6">
                    <Link href="/" className="hover:text-brand-dark">Home</Link>
                    <span>/</span>
                    <span className="text-brand-dark font-semibold">
                        {isStudent ? "Student Visa" : "Tourism Visa"}
                    </span>
                </nav>

                {/* Heading (no description) */}
                <div className="text-center mb-10">
                    <div
                        className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 bg-brand-accent/10 text-brand-accent"
                    >
                        <Icon size={28} />
                    </div>
                    <h1
                        className="text-3xl sm:text-4xl md:text-5xl font-black text-brand-dark tracking-tight leading-tight"
                        style={{ fontFamily: "Teko, sans-serif" }}
                    >
                        {title.toUpperCase()}
                    </h1>
                </div>

                {/* Wide search bar — wrapped in a card so it reads as
                    one bounded control against the white page. */}
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-[0_10px_30px_-12px_rgba(26,26,78,0.15)] p-5 sm:p-7">
                        <p className="text-center text-[15px] font-bold text-brand-dark mb-4">
                            Select your desired country
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-[1fr_200px_auto] gap-2 sm:gap-3">
                            {/* Country field */}
                            <div className="border border-gray-200 rounded-lg px-4 py-1.5 min-h-[48px] flex flex-col justify-center focus-within:border-brand-blue focus-within:ring-2 focus-within:ring-brand-blue/20 transition-all bg-white">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-0.5">
                                    Country
                                </span>
                                <CountryPicker
                                    list={countries}
                                    value={q}
                                    onChange={(v) => { setQ(v); setCountry(null); }}
                                    onSelect={(c) => { setCountry(c); setQ(c.name); }}
                                    placeholder={loadingCountries ? "Loading countries…" : "Type or select country"}
                                    inputClassName="w-full text-[16px] font-bold text-brand-dark leading-none bg-transparent outline-none placeholder:text-gray-400 placeholder:font-medium"
                                />
                            </div>

                            {/* Visa type (fixed) */}
                            <div className="border border-gray-200 rounded-lg px-4 py-1.5 min-h-[48px] flex items-center gap-2.5 bg-gray-50/60">
                                <Icon size={20} className="text-brand-accent flex-shrink-0" />
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block leading-none mb-0.5">
                                        Visa Type
                                    </span>
                                    <p className="text-[16px] font-bold text-brand-dark leading-none">
                                        {isStudent ? "Student" : "Tourist"}
                                    </p>
                                </div>
                            </div>

                            {/* Search button — same yellow as the home hero */}
                            <button
                                type="button"
                                onClick={handleSearch}
                                disabled={pending || (!country && !q.trim())}
                                className="inline-flex items-center justify-center gap-2 px-7 min-h-[48px] rounded-lg font-bold text-[15px] text-brand-dark transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                                style={{ backgroundColor: "#FDCB1B" }}
                                onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = "#F0BB00"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#FDCB1B"; }}
                            >
                                {pending ? <LuLoader className="w-5 h-5 animate-spin" /> : <LuSearch className="w-5 h-5" />}
                                Search
                                <LuArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
