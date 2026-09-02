"use client";

// ===================================================================
// VisaGuideBody — the left-hand column of a visa details page.
//
// Deliberately shared by BOTH the admin split-screen live preview and
// the real public page. Rendering them through one component (and one
// `.visa-content` stylesheet in globals.css) is what makes "what the
// admin sees while typing" and "what the visitor gets" the same thing —
// a second, parallel preview implementation would drift immediately.
// ===================================================================

const FALLBACK_HTML =
    '<p style="color:#9ca3af">Start writing on the left and the page will build itself here…</p>';

export default function VisaGuideBody({ guide, compact = false }) {
    if (!guide) return null;

    // Only render the Summary card when at least one field is filled —
    // an empty bordered box reads as a broken page.
    const summaryRows = [
        ["Visa Type", guide.visaType],
        ["Processing Time", guide.processingTime],
        ["Visalink Air Processing Fee", guide.processingFee],
        ["Embassy Fee", guide.embassyFee],
        ["Validity", guide.validity],
        ["Duration of Stay", guide.stayDuration],
        ["Entry Type", guide.entryType],
    ].filter(([, v]) => v && String(v).trim() !== "");

    const hasContent = guide.content && guide.content.replace(/<[^>]*>/g, "").trim() !== "";

    return (
        <div className={compact ? "text-[14px]" : ""}>
            {/* ---------- Summary ---------- */}
            {summaryRows.length > 0 && (
                <section className={compact ? "mb-8" : "mb-11"}>
                    <h2
                        className={`font-bold text-[#1f1a17] ${compact ? "text-[18px] mb-3" : "text-[23px] mb-4"}`}
                        style={{ fontFamily: "Poppins, sans-serif" }}
                    >
                        Summary
                    </h2>
                    <dl className={compact ? "space-y-2" : "space-y-3"}>
                        {summaryRows.map(([label, value]) => (
                            <div
                                key={label}
                                className={`flex flex-col sm:flex-row sm:items-baseline gap-x-2.5 leading-relaxed ${compact ? "text-[13px]" : "text-[15.5px]"}`}
                            >
                                <dt className="font-bold text-[#1f2937] shrink-0">{label}:</dt>
                                <dd className="text-gray-500">{value}</dd>
                            </div>
                        ))}
                    </dl>
                </section>
            )}

            {/* ---------- Rich body ----------
                dangerouslySetInnerHTML is intentional: this field is
                admin-authored rich text, and the server strips <script>,
                <iframe>, inline on* handlers and javascript: URLs before
                it is ever stored (visaGuide.service.ts → sanitizeContent). */}
            <div
                className={`visa-content ${compact ? "visa-content--compact" : ""}`}
                dangerouslySetInnerHTML={{ __html: hasContent ? guide.content : FALLBACK_HTML }}
            />
        </div>
    );
}
