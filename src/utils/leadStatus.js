// ===================================================================
// Lead status catalogue — frontend mirror
// -------------------------------------------------------------------
// ⚠ এই তালিকা backend-এর সাথে হুবহু মিলতে হবে:
//      visalinkair_server/src/app/modules/lead/lead.constants.ts
//   নতুন status যোগ/বাদ দিলে দুই ফাইলেই করতে হবে, নইলে server
//   "invalid enum value" বলে reject করবে।
//   মিল আছে কিনা দেখতে:  npm run check:lead-status  (server-এ)
//
// stage: open → এখনো কাজ চলছে · won → সফল · lost → শেষ, সফল নয়
// confirmed: true হলে লিডটা "My Leads" থেকে সরে "Confirmed Leads"
//   মেনুতে চলে যায়। stage থেকে আলাদা — confirmed মানেই কাজ শেষ নয়।
// ===================================================================

export const LEAD_STATUS_META = {
    // ── কল করার ধাপ (My Leads) ──
    new: { label: "New", bn: "নতুন", stage: "open", confirmed: false, color: "#3b82f6", badge: "bg-blue-100 text-blue-700" },
    assigned: { label: "Assigned", bn: "দেওয়া হয়েছে", stage: "open", confirmed: false, color: "#6366f1", badge: "bg-indigo-100 text-indigo-700" },
    contacted: { label: "Contacted", bn: "কথা হয়েছে", stage: "open", confirmed: false, color: "#f59e0b", badge: "bg-amber-100 text-amber-800" },
    no_response: { label: "No Response", bn: "ধরেনি", stage: "open", confirmed: false, color: "#94a3b8", badge: "bg-slate-100 text-slate-600" },
    will_inform: { label: "Will Inform", bn: "জানাবে", stage: "open", confirmed: false, color: "#14b8a6", badge: "bg-teal-100 text-teal-700" },
    follow_up: { label: "Follow-up", bn: "ফলো-আপ", stage: "open", confirmed: false, color: "#a855f7", badge: "bg-purple-100 text-purple-700" },
    price_sent: { label: "Price Sent", bn: "দাম পাঠানো", stage: "open", confirmed: false, color: "#0ea5e9", badge: "bg-sky-100 text-sky-700" },
    // ── কনফার্ম হওয়ার পরের ধাপ (Confirmed Leads) ──
    confirmed: { label: "Confirmed", bn: "কনফার্ম", stage: "open", confirmed: true, color: "#8b5cf6", badge: "bg-violet-100 text-violet-700" },
    docs_pending: { label: "Docs Pending", bn: "ডকুমেন্ট বাকি", stage: "open", confirmed: true, color: "#eab308", badge: "bg-yellow-100 text-yellow-800" },
    payment_pending: { label: "Payment Pending", bn: "পেমেন্ট বাকি", stage: "open", confirmed: true, color: "#f97316", badge: "bg-orange-100 text-orange-700" },
    paid: { label: "Paid", bn: "পেমেন্ট হয়েছে", stage: "won", confirmed: true, color: "#059669", badge: "bg-emerald-100 text-emerald-700" },
    approved: { label: "Approved", bn: "অ্যাপ্রুভ", stage: "won", confirmed: true, color: "#16a34a", badge: "bg-green-100 text-green-700" },
    converted: { label: "Converted", bn: "সম্পন্ন", stage: "won", confirmed: true, color: "#22c55e", badge: "bg-green-100 text-green-800" },
    // ── বাদ পড়া ──
    not_interested: { label: "Not Interested", bn: "আগ্রহ নেই", stage: "lost", confirmed: false, color: "#78716c", badge: "bg-stone-100 text-stone-600" },
    wrong_number: { label: "Wrong Number", bn: "ভুল নাম্বার", stage: "lost", confirmed: false, color: "#a8a29e", badge: "bg-stone-100 text-stone-500" },
    cancelled: { label: "Cancelled", bn: "বাতিল", stage: "lost", confirmed: false, color: "#ef4444", badge: "bg-red-100 text-red-700" },
};

export const LEAD_STATUSES = Object.keys(LEAD_STATUS_META);

const byStage = (stage) => LEAD_STATUSES.filter((s) => LEAD_STATUS_META[s].stage === stage);
export const OPEN_STATUSES = byStage("open");
export const WON_STATUSES = byStage("won");
export const LOST_STATUSES = byStage("lost");

// Confirmed Leads মেনুতে যেগুলো দেখাবে / My Leads-এ যেগুলো থাকবে
export const CONFIRMED_STATUSES = LEAD_STATUSES.filter((s) => LEAD_STATUS_META[s].confirmed);
export const UNCONFIRMED_STATUSES = LEAD_STATUSES.filter((s) => !LEAD_STATUS_META[s].confirmed);
export const isConfirmedStatus = (s) => !!LEAD_STATUS_META[s]?.confirmed;

// Grouped for <optgroup> in dropdowns — সব option flat দেখালে পড়া কঠিন
export const STATUS_GROUPS = [
    { label: "Calling", statuses: UNCONFIRMED_STATUSES.filter((s) => LEAD_STATUS_META[s].stage === "open") },
    { label: "Confirmed — processing", statuses: CONFIRMED_STATUSES.filter((s) => LEAD_STATUS_META[s].stage === "open") },
    { label: "Success", statuses: WON_STATUSES },
    { label: "Closed / lost", statuses: LOST_STATUSES },
];

export const statusLabel = (s) => LEAD_STATUS_META[s]?.label || (s ? String(s).replace(/_/g, " ") : "—");
export const statusColor = (s) => LEAD_STATUS_META[s]?.color || "#cbd5e1";
export const statusBadge = (s) => LEAD_STATUS_META[s]?.badge || "bg-gray-100 text-gray-600";
export const statusStage = (s) => LEAD_STATUS_META[s]?.stage || "open";
export const isOpenStatus = (s) => statusStage(s) === "open";
export const isWonStatus = (s) => statusStage(s) === "won";
export const isLostStatus = (s) => statusStage(s) === "lost";
