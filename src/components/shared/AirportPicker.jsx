"use client";

// ===================================================================
// AirportPicker — text input + suggestions dropdown.
// User can type city, country, or IATA code and pick from matches.
// Value is stored/returned as a display string ("Dhaka (DAC)") that
// reads cleanly in inquiry emails / WhatsApp messages.
// ===================================================================

import { useEffect, useRef, useState } from "react";
import { searchAirports } from "@/utils/airports";

export default function AirportPicker({
    value,
    onChange,
    options,
    placeholder = "Type city, country or code",
    icon,
    required,
    inputClassName = "",
}) {
    const [open, setOpen] = useState(false);
    const [q, setQ] = useState(value || "");
    const wrapRef = useRef(null);

    useEffect(() => setQ(value || ""), [value]);

    useEffect(() => {
        const onClick = (e) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener("mousedown", onClick);
        return () => document.removeEventListener("mousedown", onClick);
    }, []);

    const matches = searchAirports(options, q).slice(0, 8);

    const pick = (a) => {
        const display = `${a.city} (${a.code})`;
        setQ(display);
        onChange(display);
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
                    onChange(e.target.value);
                    setOpen(true);
                }}
                onFocus={() => setOpen(true)}
                placeholder={placeholder}
                required={required}
                className={inputClassName || `w-full ${icon ? "pl-10" : "pl-3.5"} pr-3.5 py-2.5 rounded-lg border border-gray-200 bg-white focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none text-sm text-brand-dark`}
                autoComplete="off"
            />

            {open && matches.length > 0 && (
                <ul
                    role="listbox"
                    className="absolute z-30 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-2xl shadow-black/15 max-h-72 overflow-y-auto p-1 list-none m-0"
                >
                    {matches.map((a) => (
                        <li key={a.code} className="m-0 p-0">
                            <button
                                type="button"
                                onClick={() => pick(a)}
                                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-left hover:bg-brand-blue/5 transition-colors"
                            >
                                <span className="text-lg flex-shrink-0">{a.flag}</span>
                                <span className="flex-1 min-w-0">
                                    <span className="block text-[13px] font-semibold text-brand-dark truncate">
                                        {a.city}, {a.country}
                                    </span>
                                    {a.airport && (
                                        <span className="block text-[11px] text-gray-500 truncate">
                                            {a.airport}
                                        </span>
                                    )}
                                </span>
                                <span className="text-[10px] font-bold tracking-wider text-gray-400 flex-shrink-0">
                                    {a.code}
                                </span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
