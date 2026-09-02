"use client";

// ===================================================================
// CountryPicker — text input + autocomplete dropdown for countries.
//
// The dropdown is portalled to document.body so it can't be clipped by
// parent overflow or stacked under other elements (e.g. the floating
// hero Search button).
//
// Two data modes:
//  1) `list` prop given  → dropdown is driven by that array. Each entry
//     should be `{ name, nameBn?, slug?, flag?, region?, regionBn? }`
//     (matches the normalised shape callers derive from
//     GET /api/visa-guides/public/countries).
//  2) `list` prop omitted → falls back to the static tourism list in
//     @/utils/countries. Legacy callers keep working.
//
// Callbacks:
//  - `onChange(value)`  fires on every keystroke with the text string
//    (backward-compatible with the old API).
//  - `onSelect(country)` fires only when the user picks a suggestion —
//    receives the full country object so the parent can hold onto its
//    slug for routing.
// ===================================================================

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { searchCountries } from "@/utils/countries";

export default function CountryPicker({
    value,
    onChange,
    onSelect,
    list,
    placeholder = "Type country name",
    icon,
    required,
    inputClassName = "",
}) {
    const [open, setOpen] = useState(false);
    const [q, setQ] = useState(value || "");
    const [mounted, setMounted] = useState(false);
    const [pos, setPos] = useState({ top: 0, left: 0, width: 0, flipUp: false });
    const wrapRef = useRef(null);
    const panelRef = useRef(null);

    useEffect(() => setMounted(true), []);
    useEffect(() => setQ(value || ""), [value]);

    const reposition = useCallback(() => {
        if (!wrapRef.current) return;
        const r = wrapRef.current.getBoundingClientRect();
        const scrollY = window.scrollY;
        const scrollX = window.scrollX;
        const vh = window.innerHeight;
        const PANEL_H = 320;
        const spaceBelow = vh - r.bottom;
        const flipUp = spaceBelow < PANEL_H + 20 && r.top > PANEL_H + 20;
        setPos({
            top: flipUp
                ? r.top + scrollY - PANEL_H - 6
                : r.bottom + scrollY + 6,
            left: r.left + scrollX,
            width: Math.max(r.width, 240),
            flipUp,
        });
    }, []);

    useEffect(() => {
        if (!open) return;
        reposition();
        const onScroll = () => reposition();
        const onResize = () => reposition();
        const onClick = (e) => {
            if (
                wrapRef.current && !wrapRef.current.contains(e.target) &&
                panelRef.current && !panelRef.current.contains(e.target)
            ) setOpen(false);
        };
        window.addEventListener("scroll", onScroll, true);
        window.addEventListener("resize", onResize);
        document.addEventListener("mousedown", onClick);
        return () => {
            window.removeEventListener("scroll", onScroll, true);
            window.removeEventListener("resize", onResize);
            document.removeEventListener("mousedown", onClick);
        };
    }, [open, reposition]);

    // Dynamic list path: filter caller-supplied countries against the query.
    // Static path (no list): use the built-in searchCountries helper.
    const matches = useMemo(() => {
        const query = q.trim().toLowerCase();
        if (Array.isArray(list)) {
            if (!query) return list.slice(0, 60);
            return list
                .filter((c) => {
                    const hay = [c.name, c.nameBn, c.region, c.regionBn]
                        .filter(Boolean)
                        .join(" ")
                        .toLowerCase();
                    return hay.includes(query);
                })
                .slice(0, 60);
        }
        return query ? searchCountries(query).slice(0, 30) : searchCountries("");
    }, [q, list]);

    const pick = (c) => {
        setQ(c.name);
        onChange?.(c.name);
        onSelect?.(c);
        setOpen(false);
    };

    return (
        <div ref={wrapRef} className="relative">
            {icon && (
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10">
                    {icon}
                </span>
            )}
            <input
                type="text"
                value={q}
                onChange={(e) => {
                    setQ(e.target.value);
                    onChange?.(e.target.value);
                    setOpen(true);
                }}
                onFocus={() => setOpen(true)}
                placeholder={placeholder}
                required={required}
                className={inputClassName || `w-full ${icon ? "pl-10" : "pl-3.5"} pr-3.5 py-2.5 rounded-lg border border-gray-200 bg-white focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none text-sm text-brand-dark`}
                autoComplete="off"
            />

            {mounted && open && matches.length > 0 && createPortal(
                <ul
                    ref={panelRef}
                    role="listbox"
                    style={{ position: "absolute", top: pos.top, left: pos.left, width: pos.width, zIndex: 9999 }}
                    className="bg-white border border-gray-200 rounded-lg shadow-2xl shadow-black/20 max-h-72 overflow-y-auto p-1 list-none m-0"
                >
                    {matches.map((c) => (
                        <li key={c.slug || c.name} className="m-0 p-0">
                            <button
                                type="button"
                                onClick={() => pick(c)}
                                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-left hover:bg-brand-blue/5 transition-colors"
                            >
                                {c.flag && (
                                    <span className="text-lg flex-shrink-0">
                                        {c.flag.startsWith("http") ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={c.flag} alt="" className="w-5 h-5 rounded-sm object-cover" />
                                        ) : (
                                            c.flag
                                        )}
                                    </span>
                                )}
                                <span className="flex-1 min-w-0">
                                    <span className="block text-[13px] font-semibold text-brand-dark truncate">
                                        {c.name}
                                    </span>
                                    {c.region && (
                                        <span className="block text-[11px] text-gray-500 truncate">
                                            {c.region}
                                        </span>
                                    )}
                                </span>
                            </button>
                        </li>
                    ))}
                </ul>,
                document.body
            )}
        </div>
    );
}
