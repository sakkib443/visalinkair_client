"use client";

// ===================================================================
// DatePicker — professional calendar popup.
// Popup is rendered through a React portal at document.body so it can't
// be clipped by parent overflow or stacked under other elements.
// Value/onChange use ISO date strings ("YYYY-MM-DD").
// ===================================================================

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { LuCalendar, LuChevronLeft, LuChevronRight } from "react-icons/lu";

const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const same = (a, b) => a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const stripTime = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };

const CAL_W = 288;
const CAL_H = 330;

export default function DatePicker({
    value,
    onChange,
    min,
    max,
    disabled = false,
    placeholder = "Pick a date",
    className = "",
    children,
}) {
    const [open, setOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [pos, setPos] = useState({ top: 0, left: 0 });
    const [view, setView] = useState(() => {
        const d = value ? new Date(value) : new Date();
        return new Date(d.getFullYear(), d.getMonth(), 1);
    });
    const triggerRef = useRef(null);
    const panelRef = useRef(null);

    useEffect(() => setMounted(true), []);

    useEffect(() => {
        if (value) {
            const d = new Date(value);
            setView(new Date(d.getFullYear(), d.getMonth(), 1));
        }
    }, [value]);

    // Position the popup right below (or above if not enough room) the trigger.
    const reposition = useCallback(() => {
        if (!triggerRef.current) return;
        const r = triggerRef.current.getBoundingClientRect();
        const scrollY = window.scrollY;
        const scrollX = window.scrollX;
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        // Horizontal: align left of trigger, but flip to right-align if it would overflow.
        let left = r.left + scrollX;
        if (left + CAL_W > vw - 8) left = Math.max(8, vw - CAL_W - 8) + scrollX;

        // Vertical: prefer below trigger with 6px gap; flip above if not enough room.
        let top = r.bottom + scrollY + 6;
        if (r.bottom + CAL_H + 6 > vh - 8 && r.top > CAL_H + 6) {
            top = r.top + scrollY - CAL_H - 6;
        }
        setPos({ top, left });
    }, []);

    useEffect(() => {
        if (!open) return;
        reposition();
        const onScroll = () => reposition();
        const onResize = () => reposition();
        const onClick = (e) => {
            if (
                triggerRef.current && !triggerRef.current.contains(e.target) &&
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

    const today = useMemo(() => stripTime(new Date()), []);
    const minDate = useMemo(() => (min ? stripTime(new Date(min)) : null), [min]);
    const maxDate = useMemo(() => (max ? stripTime(new Date(max)) : null), [max]);
    const selected = value ? stripTime(new Date(value)) : null;

    const year = view.getFullYear();
    const month = view.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const startOffset = firstOfMonth.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells = [];
    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
    while (cells.length % 7 !== 0) cells.push(null);

    const isDisabled = (d) => {
        if (!d) return true;
        if (minDate && d < minDate) return true;
        if (maxDate && d > maxDate) return true;
        return false;
    };

    const display = selected
        ? selected.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })
        : "";

    const pick = (d) => {
        if (isDisabled(d)) return;
        onChange(iso(d));
        setOpen(false);
    };

    return (
        <>
            <button
                ref={triggerRef}
                type="button"
                onClick={() => !disabled && setOpen((v) => !v)}
                disabled={disabled}
                className={
                    className ||
                    "w-full flex items-center gap-2 px-3.5 py-2.5 rounded-lg border border-gray-200 bg-white text-left text-sm text-brand-dark hover:border-brand-blue/40 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed transition-all"
                }
            >
                {children != null ? children : (
                    <>
                        <LuCalendar size={14} className="text-gray-400 flex-shrink-0" />
                        <span className={display ? "" : "text-gray-400"}>
                            {display || placeholder}
                        </span>
                    </>
                )}
            </button>

            {mounted && open && !disabled && createPortal(
                <div
                    ref={panelRef}
                    style={{ position: "absolute", top: pos.top, left: pos.left, width: CAL_W, zIndex: 9999 }}
                    className="bg-white rounded-xl border border-gray-200 shadow-2xl shadow-black/25 p-3"
                >
                    {/* Month header */}
                    <div className="flex items-center justify-between mb-3">
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setView(new Date(year, month - 1, 1)); }}
                            className="w-8 h-8 rounded-md hover:bg-gray-100 text-gray-600 flex items-center justify-center"
                            aria-label="Previous month"
                        >
                            <LuChevronLeft size={16} />
                        </button>
                        <div className="text-sm font-bold text-brand-dark" style={{ fontFamily: "Poppins, sans-serif" }}>
                            {firstOfMonth.toLocaleString("en-US", { month: "long", year: "numeric" })}
                        </div>
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setView(new Date(year, month + 1, 1)); }}
                            className="w-8 h-8 rounded-md hover:bg-gray-100 text-gray-600 flex items-center justify-center"
                            aria-label="Next month"
                        >
                            <LuChevronRight size={16} />
                        </button>
                    </div>

                    {/* Weekday header */}
                    <div className="grid grid-cols-7 gap-0.5 mb-1">
                        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                            <div key={d} className="text-[10px] font-bold text-gray-400 text-center py-1 uppercase tracking-wider">
                                {d}
                            </div>
                        ))}
                    </div>

                    {/* Days grid */}
                    <div className="grid grid-cols-7 gap-0.5">
                        {cells.map((d, i) => {
                            if (!d) return <div key={i} className="h-9" />;
                            const dis = isDisabled(d);
                            const sel = same(d, selected);
                            const isToday = same(d, today);
                            let cls = "h-9 rounded-md text-xs font-semibold transition-all";
                            if (sel) cls += " bg-brand-blue text-white shadow-sm";
                            else if (isToday && !dis) cls += " border-2 border-brand-blue text-brand-blue";
                            else if (dis) cls += " text-gray-300 cursor-not-allowed";
                            else cls += " text-brand-dark hover:bg-brand-blue/10 hover:text-brand-blue cursor-pointer";
                            return (
                                <button
                                    key={i}
                                    type="button"
                                    disabled={dis}
                                    onClick={() => pick(d)}
                                    className={cls}
                                >
                                    {d.getDate()}
                                </button>
                            );
                        })}
                    </div>

                    {/* Footer shortcuts */}
                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                        <button
                            type="button"
                            onClick={() => pick(today)}
                            disabled={isDisabled(today)}
                            className="text-xs font-bold text-brand-blue hover:underline disabled:text-gray-300 disabled:no-underline"
                        >
                            Today
                        </button>
                        {value && (
                            <button
                                type="button"
                                onClick={() => { onChange(""); setOpen(false); }}
                                className="text-xs font-bold text-gray-500 hover:text-red-500"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}
