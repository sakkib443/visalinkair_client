// ===================================================================
// Date-range presets shared by the team-performance pages.
// Backend Asia/Dhaka (UTC+6) ধরে দিন গোনে, তাই এখানেও local day ব্যবহার
// করি — toISOString() দিলে রাত ১২টার পরে একদিন পিছিয়ে যেত।
// ===================================================================

// 'YYYY-MM-DD' in the browser's local timezone (not UTC).
export const isoDay = (d) => {
    const x = new Date(d);
    const m = String(x.getMonth() + 1).padStart(2, "0");
    const day = String(x.getDate()).padStart(2, "0");
    return `${x.getFullYear()}-${m}-${day}`;
};

const daysAgo = (n) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d;
};

// key → { label, range() } ; range() returns null for "all time" (no filter)
export const RANGE_PRESETS = [
    { key: "today", label: "Today", range: () => ({ dateFrom: isoDay(new Date()), dateTo: isoDay(new Date()) }) },
    { key: "yesterday", label: "Yesterday", range: () => ({ dateFrom: isoDay(daysAgo(1)), dateTo: isoDay(daysAgo(1)) }) },
    {
        key: "week",
        label: "This week",
        // সপ্তাহ শুরু শনিবার থেকে — বাংলাদেশের কাজের সপ্তাহ
        range: () => {
            const n = new Date();
            const back = (n.getDay() + 1) % 7; // Sat=6 → 0, Sun=0 → 1, ...
            return { dateFrom: isoDay(daysAgo(back)), dateTo: isoDay(n) };
        },
    },
    { key: "7d", label: "Last 7 days", range: () => ({ dateFrom: isoDay(daysAgo(6)), dateTo: isoDay(new Date()) }) },
    { key: "30d", label: "Last 30 days", range: () => ({ dateFrom: isoDay(daysAgo(29)), dateTo: isoDay(new Date()) }) },
    {
        key: "month",
        label: "This month",
        range: () => {
            const n = new Date();
            return { dateFrom: isoDay(new Date(n.getFullYear(), n.getMonth(), 1)), dateTo: isoDay(n) };
        },
    },
    { key: "all", label: "All time", range: () => ({ dateFrom: "", dateTo: "" }) },
];

export const presetRange = (key) => {
    const p = RANGE_PRESETS.find((x) => x.key === key);
    return p ? p.range() : { dateFrom: "", dateTo: "" };
};

// Which preset (if any) exactly matches this from/to pair? → for chip highlighting
export const matchPreset = (dateFrom, dateTo) => {
    for (const p of RANGE_PRESETS) {
        const r = p.range();
        if (r.dateFrom === (dateFrom || "") && r.dateTo === (dateTo || "")) return p.key;
    }
    return "custom";
};

// Human label for the active range, e.g. "8 Aug 2026" or "1 – 8 Aug 2026"
export const rangeLabel = (dateFrom, dateTo) => {
    if (!dateFrom && !dateTo) return "All time";
    const fmt = (s) =>
        new Date(`${s}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    if (dateFrom && dateTo) return dateFrom === dateTo ? fmt(dateFrom) : `${fmt(dateFrom)} – ${fmt(dateTo)}`;
    return dateFrom ? `From ${fmt(dateFrom)}` : `Until ${fmt(dateTo)}`;
};

// Pull the real reason out of a failed API response (see globalErrorHandler).
export const apiError = (data, res, fallback = "Request failed") => {
    const fields = Array.isArray(data?.errorMessages)
        ? data.errorMessages.map((e) => e?.message).filter(Boolean)
        : [];
    if (fields.length) return fields.join(", ");
    if (data?.message && data.message !== "Validation Error") return data.message;
    return res?.status ? `${fallback} (HTTP ${res.status})` : fallback;
};
