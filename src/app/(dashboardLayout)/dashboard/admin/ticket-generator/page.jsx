"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import Link from "next/link";
import { selectToken } from "@/redux/features/authSlice";
import {
    FiUpload, FiLoader, FiX, FiDownload, FiRefreshCw, FiSave,
    FiCheck, FiEdit3, FiEye, FiEyeOff, FiPlus, FiPrinter, FiList, FiMaximize2, FiMinimize2,
} from "react-icons/fi";
import { LuPlane, LuUser, LuScanLine, LuFileText, LuBanknote } from "react-icons/lu";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/* Templates */
const mkP = () => ({ name: "", type: "ADT", gender: "MALE", passportNo: "", cabin: "7 KG", checked: "1PC (23KG)", eTicket: "" });
const mkF = () => ({ airline: "", flightNo: "", from: "", fromAirport: "", to: "", toAirport: "", departDay: "", departDate: "", departTime: "", arriveDay: "", arriveDate: "", arriveTime: "", transitInfo: "" });
const mkFare = () => ({ type: "ADT", baseFare: "", tax: "", ait: "", grossFare: "", pax: "1", total: "" });

const INIT = {
    bookingRef: "", airlinePnr: "", dateOfIssue: "", status: "Confirmed",
    passengers: [mkP()], flights: [mkF()], fares: [mkFare()], grandTotal: "",
    classInfo: "Economy (T)", refund: "Non-Refundable", route: "One-way", duration: "",
    personalItem: "Laptop Bag", selfTransfer: "No", terminalChange: "No", codeshare: "No", ssrRemarks: "No",
    agencyWebsite: "www.visalinkair.com", agencyPhone: "+880 1738-886644",
    agencyEmail: "info@visalinkair.com", agencyOffice: "Dhaka, Bangladesh",
    // যে ফাইল স্ক্যান করে টিকিটটা বানানো হয়েছে (save করার সময় জমা হয়)।
    sourceFile: "",
};

/* Visibility initial state — controls what shows in PDF */
const INIT_VIS = {
    // Section master toggles
    bookingSection: true, passengerSection: true, flightSection: true, infoSection: true, fareSection: true,
    // Booking fields
    bookingRef: true, airlinePnr: true, dateOfIssue: true, status: true,
    // Passenger columns (applies to all passengers)
    pax_name: true, pax_type: true, pax_gender: true, pax_passportNo: true,
    pax_cabin: true, pax_checked: true, pax_eTicket: true,
    // Flight columns
    flt_airline: true, flt_from: true, flt_to: true, flt_depart: true, flt_arrive: true, flt_transitInfo: true,
    // Info/Meta fields (field-level — also hidden if value is empty)
    classInfo: true, refund: true, route: true, duration: true,
    personalItem: true, selfTransfer: true, terminalChange: true, codeshare: true, ssrRemarks: true,
    // Fare columns
    fare_type: true, fare_baseFare: true, fare_tax: true, fare_ait: true,
    fare_grossFare: true, fare_pax: true, fare_total: true, grandTotal: true,
};

/* -- Eye Toggle Button -- */
const EyeBtn = ({ visKey, vis, onToggleVis, size = 11 }) => (
    <button
        type="button"
        onClick={() => onToggleVis(visKey)}
        title={vis[visKey] ? "Hide from PDF" : "Show in PDF"}
        className={`flex-shrink-0 transition-all hover:scale-110 rounded p-0.5 ${vis[visKey] ? "text-blue-400 hover:text-blue-600" : "text-gray-300 hover:text-gray-500"}`}
    >
        {vis[visKey] ? <FiEye size={size} /> : <FiEyeOff size={size} />}
    </button>
);

/* -- Column Tag Toggle (for array section headers) -- */
const ColTag = ({ label, visKey, vis, onToggleVis }) => (
    <button
        type="button"
        onClick={() => onToggleVis(visKey)}
        className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold border transition-all ${vis[visKey]
            ? "border-blue-200 text-blue-600 bg-blue-50 hover:bg-blue-100"
            : "border-gray-200 text-gray-400 bg-gray-50 hover:bg-gray-100 line-through"
            }`}
    >
        {vis[visKey] ? <FiEye size={8} /> : <FiEyeOff size={8} />}
        <span className="ml-0.5">{label}</span>
    </button>
);

/* -- Input Field with Eye Toggle -- */
const F = ({ label, value, onChange, placeholder, className = "", select, options = [], visKey, vis, onToggleVis }) => {
    const isEmpty = !value || value.toString().trim() === "";
    const isHidden = visKey && vis && !vis[visKey];
    return (
        <div className={`flex flex-col gap-1 ${className}`}>
            <div className="flex items-center justify-between gap-1">
                <label className={`text-[10px] font-bold uppercase tracking-wider leading-none ${isHidden ? "text-gray-300" : isEmpty ? "text-amber-500" : "text-gray-400"}`}>
                    {label}{isEmpty && <span className="text-red-400 ml-0.5">*</span>}
                </label>
                {visKey && vis && onToggleVis && <EyeBtn visKey={visKey} vis={vis} onToggleVis={onToggleVis} size={10} />}
            </div>
            <div className={`transition-opacity ${isHidden ? "opacity-25" : "opacity-100"}`}>
                {select ? (
                    <select value={value} onChange={onChange}
                        className="w-full px-2.5 py-2 border border-gray-200 rounded-md text-sm font-normal outline-none focus:border-blue-400 bg-white transition-all">
                        {options.map(o => <option key={o}>{o}</option>)}
                    </select>
                ) : (
                    <input type="text" value={value} onChange={onChange} placeholder={placeholder}
                        className="w-full px-2.5 py-2 border border-gray-200 rounded-md text-sm font-normal outline-none focus:border-blue-400 bg-white transition-all" />
                )}
            </div>
        </div>
    );
};

/* -- Barcode -- */
function Barcode({ value }) {
    const chars = (value || "AMB0000000").split("");
    const bars = [];
    for (let i = 0; i < 60; i++) {
        const seed = (chars[i % chars.length]?.charCodeAt(0) || 65) + i;
        bars.push(seed % 4 === 0 ? 3 : seed % 3 === 0 ? 2 : 1);
    }
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 1, height: 36 }}>
                {bars.map((w, i) => (
                    <div key={i} style={{ width: w, height: i % 7 === 0 ? 36 : i % 5 === 0 ? 28 : 22, background: "#1f2937", flexShrink: 0 }} />
                ))}
            </div>
            <span style={{ fontSize: 8, fontFamily: "monospace", letterSpacing: 1, color: "#374151", fontWeight: 600 }}>
                {value || "AMB0000000"}
            </span>
        </div>
    );
}

/* -- Ticket Preview (PDF render target) -- */
function TicketPreview({ form, vis }) {
    const TEAL = "#3a9bba"; const TEAL_DARK = "#2d7d96"; const BORDER = "#b8d4dc";
    const S = {
        thTeal: { background: TEAL, color: "#fff", fontSize: 11, fontWeight: 700, padding: "6px 8px", textAlign: "left", border: "1px solid " + TEAL_DARK, whiteSpace: "nowrap" },
        td: { fontSize: 12, padding: "5px 8px", border: "1px solid " + BORDER, verticalAlign: "middle" },
    };
    const passCols = [
        { key: "name", label: "Passenger Name", visKey: "pax_name", style: { fontWeight: 600 } },
        { key: "type", label: "Type", visKey: "pax_type", style: { textAlign: "center" } },
        { key: "gender", label: "Gender", visKey: "pax_gender", style: { textAlign: "center" } },
        { key: "passportNo", label: "Passport Number", visKey: "pax_passportNo", style: { fontFamily: "monospace" } },
        { key: "cabin", label: "Cabin", visKey: "pax_cabin", style: { textAlign: "center" } },
        { key: "checked", label: "Checked", visKey: "pax_checked", style: { textAlign: "center" } },
        { key: "eTicket", label: "E-Ticket", visKey: "pax_eTicket", style: { fontFamily: "monospace", fontSize: 11 } },
    ].filter(c => vis[c.visKey]);
    const infoFields = [
        { key: "classInfo", label: "Class" }, { key: "refund", label: "Refund" }, { key: "route", label: "Route" },
        { key: "duration", label: "Duration" }, { key: "personalItem", label: "Personal Item" },
        { key: "selfTransfer", label: "Self-Transfer" }, { key: "terminalChange", label: "Terminal Change" },
        { key: "codeshare", label: "Codeshare" }, { key: "ssrRemarks", label: "SSR Remarks" },
    ].filter(f => vis[f.key] && form[f.key]);
    const showInfoCol = vis.infoSection && infoFields.length > 0;
    const fltVisCount = [vis.flt_airline, vis.flt_from, vis.flt_to, vis.flt_depart, vis.flt_arrive, showInfoCol].filter(Boolean).length;
    const fareCols = [
        { key: "type", label: "Type", visKey: "fare_type", style: { fontWeight: 600, textAlign: "left" } },
        { key: "baseFare", label: "Base Fare", visKey: "fare_baseFare", style: { textAlign: "right" } },
        { key: "tax", label: "Tax", visKey: "fare_tax", style: { textAlign: "right" } },
        { key: "ait", label: "AIT", visKey: "fare_ait", style: { textAlign: "right" } },
        { key: "grossFare", label: "Gross Fare", visKey: "fare_grossFare", style: { textAlign: "right", fontWeight: 600 } },
        { key: "pax", label: "No of PAX", visKey: "fare_pax", style: { textAlign: "center" } },
        { key: "total", label: "Total (BDT)", visKey: "fare_total", style: { textAlign: "right", fontWeight: 700 } },
    ].filter(c => vis[c.visKey]);

    /* Build atomic blocks for row-level pagination */
    const blocks = [];
    if (vis.bookingSection) blocks.push({ kind: 'booking' });
    if (vis.passengerSection && passCols.length > 0) {
        form.passengers.forEach((_, i) => blocks.push({ kind: 'passenger', idx: i }));
    }
    if (vis.flightSection) {
        form.flights.forEach((_, i) => blocks.push({ kind: 'flight', idx: i }));
    }
    if (vis.fareSection && fareCols.length > 0) {
        form.fares.forEach((_, i) => blocks.push({ kind: 'fare', idx: i }));
        if (vis.grandTotal) blocks.push({ kind: 'fareTotal' });
    }

    const [gifH, setGifH] = useState(0);
    const [pgAssign, setPgAssign] = useState(null);
    const measGifRef = useRef(null);
    const bookingMeasRef = useRef(null);
    const sectionHeadRefs = useRef({});
    const rowRefs = useRef({});

    /* -- Renderers -- */
    const renderBookingInner = () => (
        <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #d1d5db" }}>
            <thead><tr>
                {vis.bookingRef && <th style={S.thTeal}>Booking Reference</th>}
                {vis.airlinePnr && <th style={S.thTeal}>Airline PNR</th>}
                {vis.dateOfIssue && <th style={S.thTeal}>Date of Issue</th>}
                {vis.status && <th style={{ ...S.thTeal, borderRight: "none" }}>Status</th>}
            </tr></thead>
            <tbody><tr>
                {vis.bookingRef && <td style={{ ...S.td, fontWeight: 700, fontSize: 13 }}>{form.bookingRef || "---"}</td>}
                {vis.airlinePnr && <td style={{ ...S.td, fontWeight: 700, fontSize: 13 }}>{form.airlinePnr || "---"}</td>}
                {vis.dateOfIssue && <td style={S.td}>{form.dateOfIssue || "---"}</td>}
                {vis.status && <td style={{ ...S.td, borderRight: "none" }}><span style={{ background: TEAL, color: "#fff", padding: "2px 10px", borderRadius: 3, fontSize: 11, fontWeight: 700 }}>{form.status || "Confirmed"}</span></td>}
            </tr></tbody>
        </table>
    );

    const passengerRowTds = (i) => {
        const p = form.passengers[i];
        return passCols.map((c, j) => <td key={c.key} style={{ ...S.td, ...c.style, borderRight: j < passCols.length - 1 ? "1px solid " + BORDER : "none" }}>{p[c.key] || "---"}</td>);
    };

    const renderPassengerHead = () => (
        <div>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 3 }}>Passenger Information</div>
            <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #d1d5db" }}>
                <thead><tr>{passCols.map((c, i) => <th key={c.key} style={{ ...S.thTeal, borderRight: i < passCols.length - 1 ? "1px solid " + TEAL_DARK : "none" }}>{c.label}</th>)}</tr></thead>
                <tbody></tbody>
            </table>
        </div>
    );

    const renderPassengerGroup = (indices) => (
        <div>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 3 }}>Passenger Information</div>
            <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #d1d5db" }}>
                <thead><tr>{passCols.map((c, i) => <th key={c.key} style={{ ...S.thTeal, borderRight: i < passCols.length - 1 ? "1px solid " + TEAL_DARK : "none" }}>{c.label}</th>)}</tr></thead>
                <tbody>{indices.map(i => <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#f8fafc" }}>{passengerRowTds(i)}</tr>)}</tbody>
            </table>
        </div>
    );

    const flightRowPair = (i, isFirstInData) => {
        const f = form.flights[i];
        const out = [];
        out.push(
            <tr key={"f" + i} style={{ background: i % 2 === 0 ? "#fff" : "#f8fafc", verticalAlign: "top" }}>
                {vis.flt_airline && <td style={{ ...S.td, padding: "6px 8px" }}><div style={{ width: 22, height: 22, borderRadius: "50%", background: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 2 }}><span style={{ fontSize: 12 }}>&#9992;</span></div><div style={{ fontWeight: 700, color: TEAL_DARK, fontSize: 11 }}>{f.airline || "---"}</div><div style={{ fontSize: 10, color: "#6b7280" }}>{f.flightNo}</div></td>}
                {vis.flt_from && <td style={{ ...S.td, padding: "6px 8px" }}><div style={{ fontSize: 20, fontWeight: 900, lineHeight: 1 }}>{f.from || "---"}</div><div style={{ fontSize: 10, color: "#6b7280", marginTop: 2 }}>{f.fromAirport}</div></td>}
                {vis.flt_to && <td style={{ ...S.td, padding: "6px 8px" }}><div style={{ fontSize: 20, fontWeight: 900, lineHeight: 1 }}>{f.to || "---"}</div><div style={{ fontSize: 10, color: "#6b7280", marginTop: 2 }}>{f.toAirport}</div></td>}
                {vis.flt_depart && <td style={{ ...S.td, padding: "6px 8px" }}><div style={{ fontSize: 10, color: "#6b7280" }}>{f.departDay}</div><div style={{ fontSize: 12, fontWeight: 700 }}>{f.departDate}</div><div style={{ fontSize: 15, fontWeight: 900, color: TEAL_DARK }}>{f.departTime}</div></td>}
                {vis.flt_arrive && <td style={{ ...S.td, padding: "6px 8px" }}><div style={{ fontSize: 10, color: "#6b7280" }}>{f.arriveDay}</div><div style={{ fontSize: 12, fontWeight: 700 }}>{f.arriveDate}</div><div style={{ fontSize: 15, fontWeight: 900, color: TEAL_DARK }}>{f.arriveTime}</div></td>}
                {showInfoCol && <td style={{ ...S.td, padding: "6px 8px", fontSize: 10, color: "#4b5563", lineHeight: 1.6, borderRight: "none" }}>{isFirstInData && infoFields.map(fld => <div key={fld.key}><b>{fld.label}:</b> {form[fld.key]}</div>)}</td>}
            </tr>
        );
        if (vis.flt_transitInfo && f.transitInfo) {
            out.push(
                <tr key={"t" + i}><td colSpan={fltVisCount} style={{ background: "#f9f9f9", padding: "4px 12px", textAlign: "center", fontSize: 11, fontWeight: 600, color: "#1f2937", borderTop: "1px dashed " + BORDER, borderBottom: "1px dashed " + BORDER }}>{f.transitInfo}</td></tr>
            );
        }
        return out;
    };

    const renderFlightHead = () => (
        <div>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 3 }}>Itinerary Information</div>
            <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #d1d5db" }}>
                <thead><tr>
                    {vis.flt_airline && <th style={{ ...S.thTeal, width: "10%" }}>Airline</th>}
                    {vis.flt_from && <th style={S.thTeal}>From</th>}
                    {vis.flt_to && <th style={S.thTeal}>To</th>}
                    {vis.flt_depart && <th style={{ ...S.thTeal, width: "13%" }}>Depart</th>}
                    {vis.flt_arrive && <th style={{ ...S.thTeal, width: "13%" }}>Arrive</th>}
                    {showInfoCol && <th style={{ ...S.thTeal, width: "22%", borderRight: "none" }}>Info</th>}
                </tr></thead>
                <tbody></tbody>
            </table>
        </div>
    );

    const renderFlightGroup = (indices) => (
        <div>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 3 }}>Itinerary Information</div>
            <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #d1d5db" }}>
                <thead><tr>
                    {vis.flt_airline && <th style={{ ...S.thTeal, width: "10%" }}>Airline</th>}
                    {vis.flt_from && <th style={S.thTeal}>From</th>}
                    {vis.flt_to && <th style={S.thTeal}>To</th>}
                    {vis.flt_depart && <th style={{ ...S.thTeal, width: "13%" }}>Depart</th>}
                    {vis.flt_arrive && <th style={{ ...S.thTeal, width: "13%" }}>Arrive</th>}
                    {showInfoCol && <th style={{ ...S.thTeal, width: "22%", borderRight: "none" }}>Info</th>}
                </tr></thead>
                <tbody>{indices.map(i => flightRowPair(i, i === 0))}</tbody>
            </table>
        </div>
    );

    const fareRowTds = (i) => {
        const fare = form.fares[i];
        return fareCols.map((c, j) => <td key={c.key} style={{ ...S.td, ...c.style, borderRight: j < fareCols.length - 1 ? "1px solid " + BORDER : "none" }}>{fare[c.key]}</td>);
    };

    const renderFareHead = () => (
        <div>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 3 }}>Fare Details</div>
            <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #d1d5db" }}>
                <thead><tr>{fareCols.map((c, i) => <th key={c.key} style={{ ...S.thTeal, borderRight: i < fareCols.length - 1 ? "1px solid " + TEAL_DARK : "none", textAlign: "right" }}>{c.label}</th>)}</tr></thead>
                <tbody></tbody>
            </table>
        </div>
    );

    const renderFareGroup = (indices, includeTotal) => (
        <div>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 3 }}>Fare Details</div>
            <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #d1d5db" }}>
                <thead><tr>{fareCols.map((c, i) => <th key={c.key} style={{ ...S.thTeal, borderRight: i < fareCols.length - 1 ? "1px solid " + TEAL_DARK : "none", textAlign: "right" }}>{c.label}</th>)}</tr></thead>
                <tbody>
                    {indices.map(i => <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#f8fafc" }}>{fareRowTds(i)}</tr>)}
                    {includeTotal && <tr style={{ background: "#fef3c7" }}><td colSpan={Math.max(1, fareCols.length - 1)} style={{ ...S.td, fontWeight: 900, fontSize: 12, textAlign: "right", paddingRight: 12 }}>Grand Total (BDT)</td><td style={{ ...S.td, fontWeight: 900, fontSize: 14, textAlign: "right", color: "#b45309", borderRight: "none" }}>{form.grandTotal}</td></tr>}
                </tbody>
            </table>
        </div>
    );

    /* Pagination — measure each row + section header, pack into pages */
    useEffect(() => {
        const calc = () => {
            const h = measGifRef.current ? measGifRef.current.offsetHeight : 0;
            if (!h) return;
            const slot = h * 0.67;
            const gap = 8;

            const bookingH = bookingMeasRef.current ? bookingMeasRef.current.offsetHeight : 0;
            const headH = {
                passenger: sectionHeadRefs.current.passenger ? sectionHeadRefs.current.passenger.offsetHeight : 0,
                flight: sectionHeadRefs.current.flight ? sectionHeadRefs.current.flight.offsetHeight : 0,
                fare: sectionHeadRefs.current.fare ? sectionHeadRefs.current.fare.offsetHeight : 0,
            };
            const rowH = (key) => rowRefs.current[key] ? rowRefs.current[key].offsetHeight : 0;

            const blockCost = (block, sectionOnPage) => {
                let cost = gap;
                if (block.kind === 'booking') {
                    cost += bookingH;
                } else if (block.kind === 'fareTotal') {
                    cost += rowH('fareTotal');
                    if (sectionOnPage !== 'fare') cost += headH.fare;
                } else {
                    cost += rowH(`${block.kind}-${block.idx}`);
                    if (sectionOnPage !== block.kind) cost += headH[block.kind];
                }
                return cost;
            };

            const pages = [];
            let curPage = [];
            let curH = 0;
            let curSection = null;

            for (const block of blocks) {
                const cost = blockCost(block, curSection);
                if (curH + cost > slot && curPage.length > 0) {
                    pages.push(curPage);
                    curPage = [];
                    curH = 0;
                    curSection = null;
                    const costNew = blockCost(block, null);
                    curPage.push(block);
                    curH += costNew;
                } else {
                    curPage.push(block);
                    curH += cost;
                }
                curSection = block.kind === 'fareTotal' ? 'fare' : block.kind;
            }
            if (curPage.length > 0) pages.push(curPage);

            if (JSON.stringify(pages) !== JSON.stringify(pgAssign) || h !== gifH) {
                setGifH(h);
                setPgAssign(pages);
            }
        };
        calc();
        const t = setTimeout(calc, 150);
        return () => clearTimeout(t);
    });

    /* Group consecutive same-kind blocks on a page into single table renders */
    const renderPageContent = (pageBlocks) => {
        const groups = [];
        let cur = null;
        for (const b of pageBlocks) {
            const gkind = b.kind === 'fareTotal' ? 'fare' : b.kind;
            if (!cur || cur.gkind !== gkind) {
                cur = { gkind, items: [] };
                groups.push(cur);
            }
            cur.items.push(b);
        }
        return groups.map((g, gi) => {
            if (g.gkind === 'booking') return <div key={gi}>{renderBookingInner()}</div>;
            if (g.gkind === 'passenger') return <div key={gi}>{renderPassengerGroup(g.items.map(b => b.idx))}</div>;
            if (g.gkind === 'flight') return <div key={gi}>{renderFlightGroup(g.items.map(b => b.idx))}</div>;
            if (g.gkind === 'fare') {
                const indices = g.items.filter(b => b.kind === 'fare').map(b => b.idx);
                const hasTotal = g.items.some(b => b.kind === 'fareTotal');
                return <div key={gi}>{renderFareGroup(indices, hasTotal)}</div>;
            }
            return null;
        });
    };

    const finalPgs = pgAssign || (blocks.length > 0 ? [blocks] : [[]]);

    return (
        <div id="ticket-print" style={{ fontFamily: "Arial, sans-serif", fontSize: 11, color: "#1f2937" }}>
            {/* Measure template height at real container width */}
            <img ref={measGifRef} src="/tickettemplate.png" alt="" crossOrigin="anonymous"
                style={{ position: "absolute", top: 0, left: 0, width: "100%", visibility: "hidden", pointerEvents: "none", zIndex: -1 }} />
            {/* Measurement layer — each unit measured individually at real content width */}
            <div style={{ position: "absolute", top: 0, left: "4%", right: "4%", visibility: "hidden", pointerEvents: "none", zIndex: -1, display: "flex", flexDirection: "column", gap: 8 }}>
                {vis.bookingSection && <div ref={bookingMeasRef}>{renderBookingInner()}</div>}
                {vis.passengerSection && passCols.length > 0 && (
                    <div ref={el => { sectionHeadRefs.current.passenger = el; }}>{renderPassengerHead()}</div>
                )}
                {vis.passengerSection && passCols.length > 0 && form.passengers.map((_, i) => (
                    <div key={`mp${i}`} ref={el => { rowRefs.current[`passenger-${i}`] = el; }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #d1d5db" }}><tbody>
                            <tr style={{ background: i % 2 === 0 ? "#fff" : "#f8fafc" }}>{passengerRowTds(i)}</tr>
                        </tbody></table>
                    </div>
                ))}
                {vis.flightSection && (
                    <div ref={el => { sectionHeadRefs.current.flight = el; }}>{renderFlightHead()}</div>
                )}
                {vis.flightSection && form.flights.map((_, i) => (
                    <div key={`mf${i}`} ref={el => { rowRefs.current[`flight-${i}`] = el; }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #d1d5db" }}><tbody>
                            {flightRowPair(i, i === 0)}
                        </tbody></table>
                    </div>
                ))}
                {vis.fareSection && fareCols.length > 0 && (
                    <div ref={el => { sectionHeadRefs.current.fare = el; }}>{renderFareHead()}</div>
                )}
                {vis.fareSection && fareCols.length > 0 && form.fares.map((_, i) => (
                    <div key={`mfare${i}`} ref={el => { rowRefs.current[`fare-${i}`] = el; }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #d1d5db" }}><tbody>
                            <tr style={{ background: i % 2 === 0 ? "#fff" : "#f8fafc" }}>{fareRowTds(i)}</tr>
                        </tbody></table>
                    </div>
                ))}
                {vis.fareSection && fareCols.length > 0 && vis.grandTotal && (
                    <div ref={el => { rowRefs.current['fareTotal'] = el; }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #d1d5db" }}><tbody>
                            <tr style={{ background: "#fef3c7" }}><td colSpan={Math.max(1, fareCols.length - 1)} style={{ ...S.td, fontWeight: 900, fontSize: 12, textAlign: "right", paddingRight: 12 }}>Grand Total (BDT)</td><td style={{ ...S.td, fontWeight: 900, fontSize: 14, textAlign: "right", color: "#b45309", borderRight: "none" }}>{form.grandTotal}</td></tr>
                        </tbody></table>
                    </div>
                )}
            </div>
            {/* Pages — template repeats on every page */}
            {finalPgs.map((pageBlocks, pi) => (
                <div key={pi} style={{ position: "relative" }}>
                    <img src="/tickettemplate.png" alt="e-Ticket" style={{ width: "100%", display: "block" }} crossOrigin="anonymous" />
                    {pi === 0 && vis.bookingRef && form.bookingRef && (
                        <div style={{ position: "absolute", top: "12%", right: "5%", zIndex: 2 }}>
                            <Barcode value={form.bookingRef} />
                        </div>
                    )}
                    <div style={{ position: "absolute", top: "16%", left: "4%", right: "4%", bottom: "15%", overflow: "hidden", display: "flex", flexDirection: "column", gap: 8 }}>
                        {renderPageContent(pageBlocks)}
                    </div>
                </div>
            ))}
        </div>
    );
}

/* ------------------------------------------------------
   Main Page
------------------------------------------------------ */
export default function TicketGeneratorPage() {
    const [step, setStep] = useState(1);
    const [file, setFile] = useState(null);
    const [fileType, setFileType] = useState(null);
    const [imgPrev, setImgPrev] = useState(null);
    const [extracting, setExtracting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [form, setForm] = useState({ ...INIT, passengers: [mkP()], flights: [mkF()], fares: [mkFare()] });
    const [vis, setVis] = useState({ ...INIT_VIS });
    const [generating, setGenerating] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editId, setEditId] = useState(null);
    const [scanning, setScanning] = useState(false);
    const [scanLine, setScanLine] = useState(0);
    const [pdfUrl, setPdfUrl] = useState(null);
    const [showFullscreen, setShowFullscreen] = useState(false);
    const fileRef = useRef(null);
    const token = useSelector(selectToken);

    const toggleVis = useCallback((key) => {
        setVis(prev => ({ ...prev, [key]: !prev[key] }));
    }, []);

    /* Load existing ticket if ?id= */
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const id = params.get("id");
        if (id) {
            setEditId(id);
            fetch(`${API}/api/tickets/${id}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} }).then(r => r.json()).then(json => {
                if (json.success && json.data) {
                    const d = json.data;
                    setForm({ ...INIT, ...d, passengers: d.passengers?.length ? d.passengers : [mkP()], flights: d.flights?.length ? d.flights : [mkF()], fares: d.fares?.length ? d.fares : [mkFare()] });
                    // আগে সেভ করা কাগজটা প্রিভিউ প্যানেলে ফিরিয়ে আনা হয়।
                    if (d.sourceFile) {
                        if (/\.pdf$/i.test(d.sourceFile)) { setPdfUrl(d.sourceFile); setFileType("pdf"); setImgPrev(null); }
                        else { setImgPrev(d.sourceFile); setFileType("image"); setPdfUrl(null); }
                    }
                    toast.success("Document loaded!");
                }
            }).catch(() => toast.error("Load failed"));
        }
    }, []);

    const handleFile = useCallback((f) => {
        if (!f) return;
        const isPdf = f.type === "application/pdf";
        const isImg = f.type.startsWith("image/");
        if (!isPdf && !isImg) { toast.error("PDF or Image only"); return; }
        setFile(f); setFileType(isPdf ? "pdf" : "image");
        if (isImg) { const r = new FileReader(); r.onload = e => setImgPrev(e.target.result); r.readAsDataURL(f); setPdfUrl(null); }
        else { setImgPrev(null); setPdfUrl(URL.createObjectURL(f)); }
    }, []);

    /* AI Scan & Extract */
    const handleScanExtract = async () => {
        if (!file) { toast.error("Upload a file first"); return; }
        setScanning(true); setExtracting(true); setProgress(0); setScanLine(0);
        const scanInterval = setInterval(() => { setScanLine(prev => (prev >= 100 ? 0 : prev + 2)); }, 50);
        try {
            const fd = new FormData(); fd.append("pdf", file);
            setProgress(30);
            const res = await fetch(`${API}/api/pdf-extract`, { method: "POST", headers: token ? { Authorization: `Bearer ${token}` } : {}, body: fd });
            setProgress(70);
            const json = await res.json();
            if (!json.success) throw new Error(json.message || "Failed");
            const d = json.data; setProgress(100); clearInterval(scanInterval); setScanLine(100);
            const firstFlight = d.flights?.[0] || {};
            setForm(prev => ({
                ...prev,
                bookingRef: d.bookingRef || prev.bookingRef,
                airlinePnr: d.airlinePnr || prev.airlinePnr,
                dateOfIssue: d.dateOfIssue || prev.dateOfIssue,
                status: d.status || prev.status,
                grandTotal: d.grandTotal || prev.grandTotal,
                classInfo: firstFlight.classInfo || d.classInfo || prev.classInfo,
                refund: firstFlight.refund || d.refund || prev.refund,
                route: firstFlight.route || d.route || prev.route,
                duration: firstFlight.duration || d.duration || prev.duration,
                personalItem: firstFlight.personalItem || d.personalItem || prev.personalItem,
                selfTransfer: firstFlight.selfTransfer || d.selfTransfer || prev.selfTransfer,
                terminalChange: firstFlight.terminalChange || d.terminalChange || prev.terminalChange,
                codeshare: firstFlight.codeshare || d.codeshare || prev.codeshare,
                ssrRemarks: firstFlight.ssrRemarks || d.ssrRemarks || prev.ssrRemarks,
                passengers: d.passengers?.length ? d.passengers : [mkP()],
                flights: d.flights?.length ? d.flights.map(f => ({
                    airline: f.airline || "", flightNo: f.flightNo || "", from: f.from || "", fromAirport: f.fromAirport || "",
                    to: f.to || "", toAirport: f.toAirport || "", departDay: f.departDay || "", departDate: f.departDate || "",
                    departTime: f.departTime || "", arriveDay: f.arriveDay || "", arriveDate: f.arriveDate || "",
                    arriveTime: f.arriveTime || "", transitInfo: f.transitInfo || ""
                })) : [mkF()],
                fares: d.fares?.length ? d.fares : [mkFare()],
            }));
            toast.success(json.aiParsed ? "AI extracted all data!" : "Text extracted, please check");
        } catch (e) {
            clearInterval(scanInterval);
            toast.error(e.message === "Failed to fetch" ? "Backend not running!" : `Extract failed: ${e.message}`);
        }
        finally { setExtracting(false); setScanning(false); setProgress(0); setScanLine(0); }
    };

    const add = (k, mk) => setForm(p => ({ ...p, [k]: [...p[k], mk()] }));
    const del = (k, i) => setForm(p => ({ ...p, [k]: p[k].filter((_, j) => j !== i) }));
    const upd = (k, i, field, v) => setForm(p => { const a = [...p[k]]; a[i] = { ...a[i], [field]: v }; return { ...p, [k]: a }; });

    // স্ক্যান করা কাগজটাও টিকিটের সাথে জমা হয় — আগে OCR-এর পর ফাইলটা
    // হারিয়ে যেত, ফলে পরে আসল ডকুমেন্ট আর মেলানো যেত না।
    const handleSave = async () => {
        setSaving(true);
        try {
            let sourceFile = form.sourceFile || "";

            if (file && !sourceFile) {
                try {
                    const fd = new FormData();
                    fd.append("document", file);
                    const up = await fetch(`${API}/api/upload/document`, {
                        method: "POST",
                        headers: token ? { Authorization: `Bearer ${token}` } : {},
                        body: fd,
                    });
                    const uj = await up.json();
                    if (uj.success) {
                        sourceFile = uj.data.url;
                        setForm(p => ({ ...p, sourceFile }));
                    } else {
                        // ফাইল সংযুক্ত না হলেও টিকিটের বাকি তথ্য সেভ হবে।
                        toast.error(uj.message || "ফাইল সংযুক্ত করা যায়নি");
                    }
                } catch {
                    toast.error("ফাইল সংযুক্ত করা যায়নি");
                }
            }

            const url = editId ? `${API}/api/tickets/${editId}` : `${API}/api/tickets`;
            const method = editId ? "PUT" : "POST";
            const res = await fetch(url, { method, headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify({ ...form, sourceFile }) });
            const json = await res.json();
            if (!json.success) throw new Error(json.message || "Save failed");
            if (!editId && json.data?._id) setEditId(json.data._id);
            toast.success(editId ? "Updated!" : "Saved!");
        } catch { toast.error("Save failed"); }
        finally { setSaving(false); }
    };

    const downloadPDF = async () => {
        setGenerating(true);
        try {
            const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import("html2canvas-pro"), import("jspdf")]);
            const el = document.getElementById("ticket-print");

            // Capture at scale 1 to avoid dimension confusion
            const canvas = await html2canvas(el, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: "#ffffff",
                logging: false,
            });

            const imgW = canvas.width;
            const imgH = canvas.height;

            // PDF page width = canvas width, height = canvas height (portrait, px units)
            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "px",
                format: [imgW, imgH],
                hotfixes: ["px_scaling"],
            });

            // Add image covering the full page exactly — no offset, no shift
            pdf.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", 0, 0, imgW, imgH);

            pdf.save(`eTicket_${form.bookingRef || "Visalink Air"}.pdf`);
            toast.success("PDF downloaded!");
        } catch (e) { console.error(e); toast.error("PDF generation failed"); }
        finally { setGenerating(false); }
    };

    const downloadImg = async () => {
        setGenerating(true);
        try {
            const { default: html2canvas } = await import("html2canvas-pro");
            const el = document.getElementById("ticket-print");
            const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
            const a = document.createElement("a");
            a.download = `eTicket_${form.bookingRef || "Visalink Air"}.png`;
            a.href = canvas.toDataURL("image/png"); a.click();
            toast.success("Image downloaded!");
        } catch { toast.error("Image download failed"); }
        finally { setGenerating(false); }
    };

    const reset = () => {
        setStep(1); setFile(null); setFileType(null); setImgPrev(null); setEditId(null);
        setForm({ ...INIT, passengers: [mkP()], flights: [mkF()], fares: [mkFare()] });
        setVis({ ...INIT_VIS });
        window.history.replaceState({}, '', window.location.pathname);
    };

    useEffect(() => { import("html2canvas-pro").catch(() => { }); import("jspdf").catch(() => { }); }, []);

    /* Fill progress */
    const countFilled = () => {
        let filled = 0, total = 0;
        ['bookingRef', 'airlinePnr', 'dateOfIssue', 'status'].forEach(k => { total++; if (form[k]) filled++; });
        form.passengers.forEach(p => { ['name', 'passportNo', 'eTicket'].forEach(k => { total++; if (p[k]) filled++; }); });
        form.flights.forEach(f => { ['airline', 'flightNo', 'from', 'to', 'departDate', 'departTime', 'arriveDate', 'arriveTime'].forEach(k => { total++; if (f[k]) filled++; }); });
        form.fares.forEach(f => { ['baseFare', 'tax', 'grossFare', 'total'].forEach(k => { total++; if (f[k]) filled++; }); });
        ['grandTotal', 'classInfo'].forEach(k => { total++; if (form[k]) filled++; });
        return { filled, total };
    };
    const { filled: filledCount, total: totalFields } = countFilled();
    const fillPercent = totalFields > 0 ? Math.round((filledCount / totalFields) * 100) : 0;
    const hiddenCount = Object.values(vis).filter(v => !v).length;

    // এইমাত্র বাছা ফাইল, নাকি সেভ করা এন্ট্রি থেকে ফিরে আসা কাগজ — যেকোনো
    // একটা থাকলেই স্ক্যানার প্যানেলে প্রিভিউ দেখাবে।
    const hasDoc = Boolean(file || imgPrev || pdfUrl);

    /* Passenger column defs for ColTag */
    const PAX_COLS = [
        { label: "Name", key: "pax_name" }, { label: "Type", key: "pax_type" },
        { label: "Gender", key: "pax_gender" }, { label: "Passport", key: "pax_passportNo" },
        { label: "Cabin", key: "pax_cabin" }, { label: "Checked", key: "pax_checked" },
        { label: "E-Ticket", key: "pax_eTicket" },
    ];
    const FLT_COLS = [
        { label: "Airline", key: "flt_airline" }, { label: "From", key: "flt_from" },
        { label: "To", key: "flt_to" }, { label: "Depart", key: "flt_depart" },
        { label: "Arrive", key: "flt_arrive" }, { label: "Transit", key: "flt_transitInfo" },
    ];
    const FARE_COLS = [
        { label: "Type", key: "fare_type" }, { label: "Base", key: "fare_baseFare" },
        { label: "Tax", key: "fare_tax" }, { label: "AIT", key: "fare_ait" },
        { label: "Gross", key: "fare_grossFare" }, { label: "PAX", key: "fare_pax" },
        { label: "Total", key: "fare_total" }, { label: "Grand Total", key: "grandTotal" },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="p-4 lg:p-6 space-y-4">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black text-gray-800 flex items-center gap-2"><LuPlane className="text-blue-600" /> Ticket Generator</h1>
                        <p className="text-xs text-gray-500 mt-0.5">Upload → Scan → Edit → Preview & Download</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/dashboard/admin/all-tickets" className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-100"><FiList size={13} /> All Tickets</Link>
                        <button onClick={reset} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-100"><FiRefreshCw size={13} /> Reset</button>
                    </div>
                </div>

                {/* Status bar */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 flex items-center gap-4">
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold text-gray-500 uppercase">Fields Filled</span>
                            <div className="flex items-center gap-3">
                                {hiddenCount > 0 && (
                                    <span className="text-[10px] font-bold text-amber-500 flex items-center gap-1">
                                        <FiEyeOff size={10} /> {hiddenCount} hidden from PDF
                                    </span>
                                )}
                                <span className="text-[11px] font-black text-blue-600">{filledCount}/{totalFields} ({fillPercent}%)</span>
                            </div>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div className="h-full rounded-full" animate={{ width: `${fillPercent}%` }}
                                style={{ background: fillPercent === 100 ? '#22c55e' : fillPercent > 50 ? '#3b82f6' : '#f59e0b' }}
                                transition={{ duration: 0.5 }} />
                        </div>
                    </div>
                    {fillPercent === 100 && <span className="text-green-500 text-xs font-bold flex items-center gap-1"><FiCheck size={14} /> Complete!</span>}
                </div>

                {step !== 3 ? (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-start">
                        {/* --- LEFT: Form Fields --- */}
                        <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">

                            {/* ? Booking */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="flex items-center justify-between px-4 py-2.5 bg-blue-50 border-b border-blue-100">
                                    <div className="flex items-center gap-2"><FiEdit3 size={12} className="text-blue-500" /><span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">Booking Information</span></div>
                                    <EyeBtn visKey="bookingSection" vis={vis} onToggleVis={toggleVis} size={13} />
                                </div>
                                <div className={`p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 transition-opacity ${!vis.bookingSection ? "opacity-40" : ""}`}>
                                    <F label="Booking Reference" value={form.bookingRef} onChange={e => setForm(p => ({ ...p, bookingRef: e.target.value }))} placeholder="AMB2509107220" visKey="bookingRef" vis={vis} onToggleVis={toggleVis} />
                                    <F label="Airline PNR" value={form.airlinePnr} onChange={e => setForm(p => ({ ...p, airlinePnr: e.target.value }))} placeholder="RCU7HW" visKey="airlinePnr" vis={vis} onToggleVis={toggleVis} />
                                    <F label="Date of Issue" value={form.dateOfIssue} onChange={e => setForm(p => ({ ...p, dateOfIssue: e.target.value }))} placeholder="19-Sep-2025" visKey="dateOfIssue" vis={vis} onToggleVis={toggleVis} />
                                    <F label="Status" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} select options={["Confirmed", "Pending", "Cancelled"]} visKey="status" vis={vis} onToggleVis={toggleVis} />
                                </div>
                            </div>

                            {/* ? Passengers */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="flex items-center justify-between px-4 py-2.5 bg-purple-50 border-b border-purple-100">
                                    <div className="flex items-center gap-2"><LuUser size={12} className="text-purple-500" /><span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">Passengers ({form.passengers.length})</span></div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => add("passengers", mkP)} className="flex items-center gap-1 text-[10px] font-bold text-purple-600 hover:underline"><FiPlus size={11} /> Add</button>
                                        <EyeBtn visKey="passengerSection" vis={vis} onToggleVis={toggleVis} size={13} />
                                    </div>
                                </div>
                                {/* Column toggles */}
                                <div className="px-4 pt-2.5 pb-1 flex flex-wrap gap-1.5 border-b border-gray-50">
                                    <span className="text-[9px] font-bold text-gray-400 uppercase self-center mr-1">PDF Columns:</span>
                                    {PAX_COLS.map(c => <ColTag key={c.key} label={c.label} visKey={c.key} vis={vis} onToggleVis={toggleVis} />)}
                                </div>
                                <div className="p-4 space-y-3">
                                    {form.passengers.map((p, i) => (
                                        <div key={i} className="relative p-3 bg-gray-50 rounded-xl border border-gray-100">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-[10px] font-bold text-gray-500 uppercase">Passenger #{i + 1}</span>
                                                {form.passengers.length > 1 && <button onClick={() => del("passengers", i)} className="w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"><FiX size={9} /></button>}
                                            </div>
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                                <F label="Full Name" value={p.name} onChange={e => upd("passengers", i, "name", e.target.value)} placeholder="MR GOLAM MONZUR AHAMED" className="col-span-2" />
                                                <F label="Type" value={p.type} onChange={e => upd("passengers", i, "type", e.target.value)} select options={["ADT", "CHD", "INF"]} />
                                                <F label="Gender" value={p.gender} onChange={e => upd("passengers", i, "gender", e.target.value)} select options={["MALE", "FEMALE"]} />
                                                <F label="Passport No" value={p.passportNo} onChange={e => upd("passengers", i, "passportNo", e.target.value)} placeholder="A07141595" />
                                                <F label="Cabin Baggage" value={p.cabin} onChange={e => upd("passengers", i, "cabin", e.target.value)} placeholder="7 KG" />
                                                <F label="Checked Baggage" value={p.checked} onChange={e => upd("passengers", i, "checked", e.target.value)} placeholder="1PC (23KG)" />
                                                <F label="E-Ticket No" value={p.eTicket} onChange={e => upd("passengers", i, "eTicket", e.target.value)} placeholder="1762872306487" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* ? Flights */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="flex items-center justify-between px-4 py-2.5 bg-orange-50 border-b border-orange-100">
                                    <div className="flex items-center gap-2"><LuPlane size={12} className="text-orange-500" /><span className="text-[11px] font-bold text-orange-700 uppercase tracking-wider">Flights ({form.flights.length})</span></div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => add("flights", mkF)} className="flex items-center gap-1 text-[10px] font-bold text-orange-600 hover:underline"><FiPlus size={11} /> Add</button>
                                        <EyeBtn visKey="flightSection" vis={vis} onToggleVis={toggleVis} size={13} />
                                    </div>
                                </div>
                                {/* Column toggles */}
                                <div className="px-4 pt-2.5 pb-1 flex flex-wrap gap-1.5 border-b border-gray-50">
                                    <span className="text-[9px] font-bold text-gray-400 uppercase self-center mr-1">PDF Columns:</span>
                                    {FLT_COLS.map(c => <ColTag key={c.key} label={c.label} visKey={c.key} vis={vis} onToggleVis={toggleVis} />)}
                                </div>
                                <div className="p-4 space-y-4">
                                    {form.flights.map((f, i) => (
                                        <div key={i} className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-[10px] font-bold text-gray-500 uppercase">Flight #{i + 1}</span>
                                                {form.flights.length > 1 && <button onClick={() => del("flights", i)} className="w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"><FiX size={9} /></button>}
                                            </div>
                                            <div className="space-y-2">
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                                    <F label="Airline" value={f.airline} onChange={e => upd("flights", i, "airline", e.target.value)} placeholder="Emirates" />
                                                    <F label="Flight No" value={f.flightNo} onChange={e => upd("flights", i, "flightNo", e.target.value)} placeholder="EK 585" />
                                                    <F label="From (IATA)" value={f.from} onChange={e => upd("flights", i, "from", e.target.value)} placeholder="DAC" />
                                                    <F label="To (IATA)" value={f.to} onChange={e => upd("flights", i, "to", e.target.value)} placeholder="DXB" />
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                    <F label="From Airport" value={f.fromAirport} onChange={e => upd("flights", i, "fromAirport", e.target.value)} placeholder="Hazrat Shahjalal Intl Airport" />
                                                    <F label="To Airport" value={f.toAirport} onChange={e => upd("flights", i, "toAirport", e.target.value)} placeholder="Dubai International Airport" />
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div className="p-2 bg-blue-50 rounded-lg">
                                                        <p className="text-[9px] font-bold text-blue-500 mb-1.5 uppercase">Departure</p>
                                                        <div className="grid grid-cols-3 gap-2">
                                                            <F label="Day" value={f.departDay} onChange={e => upd("flights", i, "departDay", e.target.value)} placeholder="FRI" />
                                                            <F label="Date" value={f.departDate} onChange={e => upd("flights", i, "departDate", e.target.value)} placeholder="29 May 2026" />
                                                            <F label="Time" value={f.departTime} onChange={e => upd("flights", i, "departTime", e.target.value)} placeholder="01:40" />
                                                        </div>
                                                    </div>
                                                    <div className="p-2 bg-green-50 rounded-lg">
                                                        <p className="text-[9px] font-bold text-green-500 mb-1.5 uppercase">Arrival</p>
                                                        <div className="grid grid-cols-3 gap-2">
                                                            <F label="Day" value={f.arriveDay} onChange={e => upd("flights", i, "arriveDay", e.target.value)} placeholder="FRI" />
                                                            <F label="Date" value={f.arriveDate} onChange={e => upd("flights", i, "arriveDate", e.target.value)} placeholder="29 May 2026" />
                                                            <F label="Time" value={f.arriveTime} onChange={e => upd("flights", i, "arriveTime", e.target.value)} placeholder="04:30" />
                                                        </div>
                                                    </div>
                                                </div>
                                                <F label="Transit Info" value={f.transitInfo} onChange={e => upd("flights", i, "transitInfo", e.target.value)} placeholder="Transit in Dubai (DXB) 4h 15m" className="w-full" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* ? Flight Info/Meta */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="flex items-center justify-between px-4 py-2.5 bg-teal-50 border-b border-teal-100">
                                    <div className="flex items-center gap-2"><LuFileText size={12} className="text-teal-500" /><span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider">Flight Info (Common for all segments)</span></div>
                                    <EyeBtn visKey="infoSection" vis={vis} onToggleVis={toggleVis} size={13} />
                                </div>
                                <div className={`p-4 grid grid-cols-2 sm:grid-cols-4 gap-2 transition-opacity ${!vis.infoSection ? "opacity-40" : ""}`}>
                                    <F label="Class" value={form.classInfo} onChange={e => setForm(p => ({ ...p, classInfo: e.target.value }))} placeholder="Economy (T)" visKey="classInfo" vis={vis} onToggleVis={toggleVis} />
                                    <F label="Duration" value={form.duration} onChange={e => setForm(p => ({ ...p, duration: e.target.value }))} placeholder="4h 50m" visKey="duration" vis={vis} onToggleVis={toggleVis} />
                                    <F label="Refund" value={form.refund} onChange={e => setForm(p => ({ ...p, refund: e.target.value }))} placeholder="Non-Refundable" visKey="refund" vis={vis} onToggleVis={toggleVis} />
                                    <F label="Route" value={form.route} onChange={e => setForm(p => ({ ...p, route: e.target.value }))} placeholder="One-way" visKey="route" vis={vis} onToggleVis={toggleVis} />
                                    <F label="Personal Item" value={form.personalItem} onChange={e => setForm(p => ({ ...p, personalItem: e.target.value }))} placeholder="Laptop Bag" visKey="personalItem" vis={vis} onToggleVis={toggleVis} />
                                    <F label="Self-Transfer" value={form.selfTransfer} onChange={e => setForm(p => ({ ...p, selfTransfer: e.target.value }))} select options={["No", "Yes"]} visKey="selfTransfer" vis={vis} onToggleVis={toggleVis} />
                                    <F label="Terminal Change" value={form.terminalChange} onChange={e => setForm(p => ({ ...p, terminalChange: e.target.value }))} select options={["No", "Yes"]} visKey="terminalChange" vis={vis} onToggleVis={toggleVis} />
                                    <F label="Codeshare" value={form.codeshare} onChange={e => setForm(p => ({ ...p, codeshare: e.target.value }))} select options={["No", "Yes"]} visKey="codeshare" vis={vis} onToggleVis={toggleVis} />
                                    <F label="SSR Remarks" value={form.ssrRemarks} onChange={e => setForm(p => ({ ...p, ssrRemarks: e.target.value }))} placeholder="No" visKey="ssrRemarks" vis={vis} onToggleVis={toggleVis} />
                                </div>
                            </div>

                            {/* ? Fares */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="flex items-center justify-between px-4 py-2.5 bg-green-50 border-b border-green-100">
                                    <div className="flex items-center gap-2"><LuBanknote size={12} className="text-green-500" /><span className="text-[11px] font-bold text-green-700 uppercase tracking-wider">Fare Details</span></div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => add("fares", mkFare)} className="flex items-center gap-1 text-[10px] font-bold text-green-600 hover:underline"><FiPlus size={11} /> Add</button>
                                        <EyeBtn visKey="fareSection" vis={vis} onToggleVis={toggleVis} size={13} />
                                    </div>
                                </div>
                                {/* Column toggles */}
                                <div className="px-4 pt-2.5 pb-1 flex flex-wrap gap-1.5 border-b border-gray-50">
                                    <span className="text-[9px] font-bold text-gray-400 uppercase self-center mr-1">PDF Columns:</span>
                                    {FARE_COLS.map(c => <ColTag key={c.key} label={c.label} visKey={c.key} vis={vis} onToggleVis={toggleVis} />)}
                                </div>
                                <div className="p-4 space-y-2">
                                    {form.fares.map((f, i) => (
                                        <div key={i} className="relative grid grid-cols-3 sm:grid-cols-7 gap-2 p-2 bg-gray-50 rounded-xl">
                                            {form.fares.length > 1 && <button onClick={() => del("fares", i)} className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center z-10"><FiX size={9} /></button>}
                                            <F label="Type" value={f.type} onChange={e => upd("fares", i, "type", e.target.value)} select options={["ADT", "CHD", "INF"]} />
                                            <F label="Base Fare" value={f.baseFare} onChange={e => upd("fares", i, "baseFare", e.target.value)} placeholder="1,23,093" />
                                            <F label="Tax" value={f.tax} onChange={e => upd("fares", i, "tax", e.target.value)} placeholder="26,106" />
                                            <F label="AIT" value={f.ait} onChange={e => upd("fares", i, "ait", e.target.value)} placeholder="22" />
                                            <F label="Gross Fare" value={f.grossFare} onChange={e => upd("fares", i, "grossFare", e.target.value)} placeholder="1,49,222" />
                                            <F label="PAX" value={f.pax} onChange={e => upd("fares", i, "pax", e.target.value)} placeholder="2" />
                                            <F label="Total (BDT)" value={f.total} onChange={e => upd("fares", i, "total", e.target.value)} placeholder="2,98,444" />
                                        </div>
                                    ))}
                                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                        <div className="flex items-center gap-1.5">
                                            <EyeBtn visKey="grandTotal" vis={vis} onToggleVis={toggleVis} />
                                            <span className={`text-xs font-bold transition-colors ${!vis.grandTotal ? "text-gray-300" : "text-gray-600"}`}>Grand Total (BDT)</span>
                                        </div>
                                        <input value={form.grandTotal} onChange={e => setForm(p => ({ ...p, grandTotal: e.target.value }))} placeholder="4,10,367"
                                            className={`w-40 px-3 py-1.5 border-2 border-orange-300 rounded-xl text-sm font-bold text-orange-600 outline-none focus:border-orange-500 text-right transition-opacity ${!vis.grandTotal ? "opacity-30" : ""}`} />
                                    </div>
                                </div>
                            </div>

                            {/* Agency */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                                    <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">Agency Info</span>
                                    <span className="text-[9px] text-gray-400">(DB only — baked into GIF template)</span>
                                </div>
                                <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <F label="Website" value={form.agencyWebsite} onChange={e => setForm(p => ({ ...p, agencyWebsite: e.target.value }))} placeholder="www.visalinkair.com" />
                                    <F label="Phone" value={form.agencyPhone} onChange={e => setForm(p => ({ ...p, agencyPhone: e.target.value }))} placeholder="+880 1738-886644" />
                                    <F label="Email" value={form.agencyEmail} onChange={e => setForm(p => ({ ...p, agencyEmail: e.target.value }))} placeholder="info@visalinkair.com" />
                                    <F label="Office" value={form.agencyOffice} onChange={e => setForm(p => ({ ...p, agencyOffice: e.target.value }))} placeholder="Dhaka, Bangladesh" />
                                </div>
                            </div>

                            <button onClick={() => setStep(3)} className="flex items-center gap-2 px-8 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 mb-4">
                                <FiEye size={14} /> Preview & Download
                            </button>
                        </div>

                        {/* --- RIGHT: Upload & Scan --- */}
                        <div className="space-y-4 sticky top-4 self-start">
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                    <div className="flex items-center gap-2 px-4 py-2.5 bg-indigo-50 border-b border-indigo-100">
                                        <LuScanLine size={13} className="text-indigo-500" />
                                        <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">Document Scanner</span>
                                    </div>
                                    <div className="p-4 space-y-4">
                                        {/* hasDoc — এই মুহূর্তে বাছা ফাইল, অথবা সেভ করা এন্ট্রি
                                            থেকে ফিরে আসা কাগজ। দুটোর যেকোনোটাই থাকলে প্রিভিউ দেখাবে। */}
                                        <div onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files?.[0]); }} onDragOver={e => e.preventDefault()}
                                            className={`relative border-2 border-dashed rounded-2xl overflow-hidden transition-all ${hasDoc ? "border-green-400 bg-green-50/30" : "border-gray-200 hover:border-blue-400 hover:bg-blue-50/20 cursor-pointer"}`}
                                            onClick={() => !hasDoc && !scanning && fileRef.current?.click()}
                                            style={{ minHeight: hasDoc ? "auto" : 200 }}>
                                            {scanning && <motion.div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent z-20" animate={{ top: `${scanLine}%` }} transition={{ duration: 0.05 }} style={{ boxShadow: "0 0 15px 3px rgba(59,130,246,0.5)" }} />}
                                            {scanning && <div className="absolute inset-0 bg-blue-500/5 z-10 flex items-center justify-center"><div className="text-center"><motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}><LuScanLine size={40} className="text-blue-500 mx-auto" /></motion.div><p className="text-xs font-bold text-blue-600 mt-2">AI Scanning... {progress}%</p></div></div>}
                                            {hasDoc ? (
                                                <div className="relative">
                                                    <button onClick={(e) => { e.stopPropagation(); setShowFullscreen(true); }}
                                                        className="absolute top-2 right-2 z-30 bg-white/90 hover:bg-white border border-gray-200 rounded-lg p-1.5 shadow-sm transition-all hover:scale-110">
                                                        <FiMaximize2 size={14} className="text-gray-600" />
                                                    </button>
                                                    {fileType === "pdf" && pdfUrl ? (
                                                        <iframe src={pdfUrl} className="w-full rounded-xl" style={{ height: 280 }} title="PDF Preview" />
                                                    ) : imgPrev ? (
                                                        <img src={imgPrev} className="w-full max-h-64 object-contain rounded-xl" alt="preview" />
                                                    ) : (
                                                        <div className="w-16 h-16 mx-auto my-6 bg-red-50 rounded-2xl flex items-center justify-center"><LuFileText size={32} className="text-red-400" /></div>
                                                    )}
                                                    <div className="p-2 text-center border-t border-gray-100">
                                                        <p className="text-[11px] font-bold text-green-600 flex items-center justify-center gap-1 truncate"><FiCheck size={12} />{file ? file.name : "সংরক্ষিত ডকুমেন্ট"}</p>
                                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${fileType === "pdf" ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"}`}>{fileType}</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="p-6 text-center cursor-pointer">
                                                    <FiUpload size={36} className="mx-auto text-gray-300 mb-3" />
                                                    <p className="font-bold text-gray-600 text-sm">Click or Drag & Drop</p>
                                                    <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG, WEBP</p>
                                                </div>
                                            )}
                                            <input ref={fileRef} type="file" accept="image/*,.pdf" onChange={e => handleFile(e.target.files?.[0])} className="hidden" />
                                        </div>
                                        {extracting && <div className="space-y-1"><div className="h-2 bg-gray-100 rounded-full overflow-hidden"><motion.div className="h-full bg-gradient-to-r from-blue-500 to-blue-700 rounded-full" style={{ width: `${progress}%` }} /></div><p className="text-xs text-center text-gray-400">Extracting... {progress}%</p></div>}
                                        <div className="grid grid-cols-2 gap-2">
                                            <button onClick={handleScanExtract} disabled={!file || extracting} className="col-span-2 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-sm disabled:opacity-40 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-200">
                                                {extracting ? <><FiLoader size={14} className="animate-spin" /> Scanning...</> : <><LuScanLine size={14} /> AI Scan & Extract</>}
                                            </button>
                                            <button onClick={() => fileRef.current?.click()} disabled={extracting} className="flex items-center justify-center gap-2 py-2 border border-gray-200 text-gray-600 rounded-xl font-semibold text-xs disabled:opacity-30 hover:bg-gray-50"><FiUpload size={12} /> Change File</button>
                                            <button onClick={() => { setFile(null); setImgPrev(null); setFileType(null); setPdfUrl(null); setForm(p => ({ ...p, sourceFile: "" })); }} disabled={!hasDoc || extracting} className="flex items-center justify-center gap-2 py-2 border border-gray-200 text-gray-600 rounded-xl font-semibold text-xs disabled:opacity-30 hover:bg-gray-50"><FiX size={12} /> Clear</button>
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Stats */}
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Quick Summary</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-purple-50 rounded-xl p-3 text-center"><p className="text-xl font-black text-purple-600">{form.passengers.length}</p><p className="text-[10px] text-purple-400 font-bold">Passengers</p></div>
                                        <div className="bg-orange-50 rounded-xl p-3 text-center"><p className="text-xl font-black text-orange-600">{form.flights.length}</p><p className="text-[10px] text-orange-400 font-bold">Flights</p></div>
                                        <div className="bg-green-50 rounded-xl p-3 text-center"><p className="text-xl font-black text-green-600">{form.fares.length}</p><p className="text-[10px] text-green-400 font-bold">Fare Types</p></div>
                                        <div className="bg-blue-50 rounded-xl p-3 text-center"><p className="text-lg font-black text-blue-600 truncate">{form.grandTotal || "—"}</p><p className="text-[10px] text-blue-400 font-bold">Total (BDT)</p></div>
                                    </div>
                                    {hiddenCount > 0 && (
                                        <div className="mt-3 p-2.5 bg-amber-50 rounded-xl border border-amber-100">
                                            <p className="text-[10px] font-bold text-amber-600 flex items-center gap-1.5">
                                                <FiEyeOff size={11} /> {hiddenCount} field{hiddenCount > 1 ? "s" : ""} hidden from PDF
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                ) : (
                    /* Preview & Download */
                    <div className="space-y-4">
                        <div className="flex flex-wrap gap-3">
                            <button onClick={() => setStep(1)} className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">← Edit</button>
                            <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 disabled:opacity-60 shadow-lg shadow-green-200">
                                {saving ? <FiLoader size={14} className="animate-spin" /> : <FiSave size={14} />} {editId ? "Update" : "Save"}
                            </button>
                            <button onClick={downloadPDF} disabled={generating} className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-60 shadow-lg shadow-blue-200">
                                {generating ? <FiLoader size={14} className="animate-spin" /> : <FiDownload size={14} />} PDF
                            </button>
                            <button onClick={downloadImg} disabled={generating} className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-bold hover:bg-orange-600 disabled:opacity-60">
                                {generating ? <FiLoader size={14} className="animate-spin" /> : <FiDownload size={14} />} Image
                            </button>
                            <button onClick={() => window.print()} className="flex items-center gap-2 px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50"><FiPrinter size={14} /> Print</button>
                        </div>
                        <div className="bg-gray-200 rounded-2xl p-6 overflow-x-auto">
                            <div className="mx-auto shadow-2xl rounded-xl overflow-hidden" style={{ maxWidth: 900 }}>
                                <TicketPreview form={form} vis={vis} />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Fullscreen Modal */}
            {showFullscreen && hasDoc && (
                <div className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center p-4" onClick={() => setShowFullscreen(false)}>
                    <div className="relative w-full h-full max-w-5xl max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-4 py-2 bg-gray-100 border-b">
                            <span className="text-sm font-bold text-gray-700 truncate">{file ? file.name : "সংরক্ষিত ডকুমেন্ট"}</span>
                            <button onClick={() => setShowFullscreen(false)} className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded-lg text-xs font-bold hover:bg-red-600"><FiMinimize2 size={12} /> Close</button>
                        </div>
                        <div className="w-full h-[calc(100%-44px)]">
                            {fileType === "pdf" && pdfUrl ? (
                                <iframe src={pdfUrl} className="w-full h-full" title="PDF Full Preview" />
                            ) : imgPrev ? (
                                <div className="w-full h-full flex items-center justify-center bg-gray-50 p-4">
                                    <img src={imgPrev} className="max-w-full max-h-full object-contain rounded-lg shadow-lg" alt="Full Preview" />
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}