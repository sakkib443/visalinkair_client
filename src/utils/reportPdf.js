// ===================================================================
// Report PDF builder — Visalink Air লোগো সহ
// -------------------------------------------------------------------
// jspdf + jspdf-autotable দিয়ে বানানো (dynamic import, তাই এই দুইটা
// লাইব্রেরি শুধু ডাউনলোড চাপলেই লোড হয় — প্রথম পেজ লোড ভারী হয় না)।
//
// ব্যবহার:
//   await buildReportPdf({ title, subtitle, meta, cards, tables }).save(filename)
// ===================================================================

// jsPDF `var(--…)` বোঝে না, ওর আসল hex লাগে — তাই টোকেনগুলো এখানে
// রানটাইমে রিজলভ করে নেওয়া হয়। উৎস সেই একই জায়গা: globals.css এর
// @theme ব্লক। fallback গুলো শুধু SSR বা ভেরিয়েবল না পেলে কাজে লাগে।
import { hexOf } from "@/theme";

const BRAND = {
    get dark() { return hexOf("--color-brand-dark", "#1a1a4e"); },
    get blue() { return hexOf("--color-brand-blue", "#1D7EDD"); },
    get orange() { return hexOf("--color-brand-accent", "#EF8C2C"); },
    grey: "#64748b",
    light: "#f1f5f9",
};

// PDF-এ লোগোটা মাত্র ~34pt উঁচু বসে, কিন্তু আসল ফাইলটা 1536px চওড়া।
// সরাসরি বসালে jsPDF পুরো bitmap ঢুকিয়ে দেয় আর PDF ১ MB ছাড়িয়ে যায়।
// তাই canvas দিয়ে ছোট করে (print-এ ঝকঝকে থাকার জন্য render মাপের ৩ গুণ)
// তারপর বসাই — ফাইল অনেক হালকা হয়।
const LOGO_RENDER_H = 34; // pt
const LOGO_SCALE = 3;

let logoCache;
const loadLogo = async () => {
    if (logoCache !== undefined) return logoCache;
    try {
        const img = await new Promise((resolve, reject) => {
            const im = new Image();
            im.onload = () => resolve(im);
            im.onerror = () => reject(new Error("logo failed to load"));
            im.src = "/images/logo.png";
        });
        const ratio = img.naturalWidth / img.naturalHeight;
        const h = Math.round(LOGO_RENDER_H * LOGO_SCALE);
        const w = Math.round(h * ratio);

        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, w, h);

        logoCache = { dataUrl: canvas.toDataURL("image/png"), w, h };
    } catch {
        logoCache = null; // লোগো ছাড়াই PDF বানাব — ডাউনলোড আটকাব না
    }
    return logoCache;
};

const fmtNum = (v) =>
    typeof v === "number" ? v.toLocaleString("en-US") : v == null ? "—" : String(v);

/**
 * @param {object} o
 * @param {string} o.title      মূল শিরোনাম, যেমন "Lead Performance Report"
 * @param {string} [o.subtitle] তারিখের রেঞ্জ ইত্যাদি
 * @param {Array<[string,string]>} [o.meta] উপরের ডানে key/value জোড়া
 * @param {Array<{label:string,value:any}>} [o.cards] সারসংক্ষেপের ঘরগুলো
 * @param {Array<{title:string,head:string[],body:Array<Array<any>>,foot?:Array<Array<any>>}>} [o.tables]
 */
export async function buildReportPdf({ title, subtitle, meta = [], cards = [], tables = [] }) {
    const [{ jsPDF }, autoTableMod] = await Promise.all([
        import("jspdf"),
        import("jspdf-autotable"),
    ]);
    const autoTable = autoTableMod.default || autoTableMod.autoTable;

    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const M = 32; // margin
    const logo = await loadLogo();

    // ── Header ──
    let y = M;
    doc.setFillColor(BRAND.dark);
    doc.rect(0, 0, pageW, 74, "F");

    if (logo) {
        // উচ্চতা ঠিক রেখে চওড়া বের করি, যাতে লোগো চ্যাপ্টা না দেখায়
        const h = LOGO_RENDER_H;
        const w = (logo.w / logo.h) * h;
        doc.addImage(logo.dataUrl, "PNG", M, (74 - h) / 2, w, h);
    } else {
        doc.setTextColor("#ffffff");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.text("VISALINK AIR", M, 44);
    }

    doc.setTextColor("#ffffff");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.text(title || "Report", pageW - M, 34, { align: "right" });
    if (subtitle) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor("#cbd5e1");
        doc.text(subtitle, pageW - M, 50, { align: "right" });
    }
    y = 74 + 20;

    // ── Meta line ──
    if (meta.length) {
        doc.setFontSize(8.5);
        doc.setTextColor(BRAND.grey);
        doc.setFont("helvetica", "normal");
        doc.text(meta.map(([k, v]) => `${k}: ${v}`).join("     |     "), M, y);
        y += 16;
    }

    // ── Summary cards ──
    if (cards.length) {
        const perRow = 6;
        const gap = 8;
        const cardW = (pageW - M * 2 - gap * (perRow - 1)) / perRow;
        const cardH = 44;
        cards.forEach((c, i) => {
            const row = Math.floor(i / perRow);
            const col = i % perRow;
            const x = M + col * (cardW + gap);
            const cy = y + row * (cardH + gap);
            doc.setFillColor(BRAND.light);
            doc.roundedRect(x, cy, cardW, cardH, 4, 4, "F");
            doc.setTextColor(BRAND.dark);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(14);
            doc.text(fmtNum(c.value), x + 8, cy + 22);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(7.5);
            doc.setTextColor(BRAND.grey);
            doc.text(String(c.label).toUpperCase(), x + 8, cy + 34);
        });
        y += Math.ceil(cards.length / perRow) * (cardH + gap) + 8;
    }

    // ── Tables ──
    for (const t of tables) {
        if (!t || !Array.isArray(t.body) || t.body.length === 0) continue;

        if (t.title) {
            // নতুন পেজে গড়িয়ে যাওয়ার আগে শিরোনামের জায়গা আছে কিনা দেখি
            if (y > doc.internal.pageSize.getHeight() - 90) {
                doc.addPage();
                y = M;
            }
            doc.setFont("helvetica", "bold");
            doc.setFontSize(10.5);
            doc.setTextColor(BRAND.dark);
            doc.text(t.title, M, y + 10);
            y += 18;
        }

        autoTable(doc, {
            startY: y,
            margin: { left: M, right: M },
            head: [t.head],
            body: t.body.map((r) => r.map(fmtNum)),
            foot: t.foot ? t.foot.map((r) => r.map(fmtNum)) : undefined,
            theme: "grid",
            styles: { fontSize: 8, cellPadding: 4, lineColor: "#e2e8f0", lineWidth: 0.5 },
            headStyles: { fillColor: BRAND.blue, textColor: "#ffffff", fontStyle: "bold", fontSize: 8 },
            footStyles: { fillColor: BRAND.light, textColor: BRAND.dark, fontStyle: "bold" },
            alternateRowStyles: { fillColor: "#f8fafc" },
        });
        y = doc.lastAutoTable.finalY + 22;
    }

    // ── Footer on every page ──
    const total = doc.internal.getNumberOfPages();
    for (let p = 1; p <= total; p++) {
        doc.setPage(p);
        const h = doc.internal.pageSize.getHeight();
        doc.setDrawColor("#e2e8f0");
        doc.setLineWidth(0.5);
        doc.line(M, h - 26, pageW - M, h - 26);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(BRAND.grey);
        doc.text("Visalink Air — Journey Beyond Borders", M, h - 14);
        doc.text(`Page ${p} of ${total}`, pageW - M, h - 14, { align: "right" });
    }

    return doc;
}
