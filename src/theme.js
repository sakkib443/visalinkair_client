// ===================================================================
// Visalink Air — Theme accessor
//
// এখানে কোনো রঙের মান লেখা নেই, ইচ্ছে করেই। সব মান আছে
// `src/app/globals.css` এর @theme ব্লকে — সেটাই একমাত্র উৎস।
// এই ফাইলটা শুধু সেই CSS variable গুলোর দিকে পয়েন্ট করে, যাতে
// inline `style={{}}` থেকেও একই টোকেন ব্যবহার করা যায়:
//
//     import { THEME } from "@/theme";
//     <button style={{ backgroundColor: THEME.dark, color: THEME.onBrand }}>
//
// JSX ক্লাসে সরাসরি Tailwind ইউটিলিটিই ভালো — `bg-brand-dark`,
// `text-brand-accent`, `hover:bg-brand-blue-hover` ইত্যাদি।
//
// রঙ বদলাতে হলে শুধু globals.css এর @theme ব্লকটা বদলান — অ্যাডমিন
// ড্যাশবোর্ড আর ক্লায়েন্ট সাইড দুই জায়গাতেই একসাথে বদলে যাবে।
// ===================================================================

/** Inline style-এ ব্যবহারের জন্য টোকেন (CSS variable রেফারেন্স)। */
export const THEME = {
    /** প্রাইমারি বাটন ও ডার্ক সারফেস (dark blue) */
    dark: "var(--color-brand-dark)",
    darkHover: "var(--color-brand-dark-hover)",

    /** সেকেন্ডারি বাটন, লিংক, অ্যাকটিভ স্টেট */
    blue: "var(--color-brand-blue)",
    blueHover: "var(--color-brand-blue-hover)",
    blueSoft: "var(--color-brand-blue-soft)",

    /** শুধু ছোট হাইলাইট — আইকন, লেবেল, ব্যাজ, প্রোগ্রেস বার */
    accent: "var(--color-brand-accent)",
    accentHover: "var(--color-brand-accent-hover)",
    accentSoft: "var(--color-brand-accent-soft)",
    accentInk: "var(--color-brand-accent-ink)",

    /** শুধু WhatsApp বাটন */
    whatsapp: "var(--color-whatsapp)",
    whatsappHover: "var(--color-whatsapp-hover)",

    /** ডার্ক/ব্লু সারফেসের উপরের টেক্সট */
    onBrand: "var(--color-on-brand)",

    /** পেজ ব্যাকগ্রাউন্ড */
    surface: "var(--color-surface)",
    surfaceMuted: "var(--color-surface-muted)",
};

/**
 * টোকেনের আসল hex মানটা ফেরত দেয়।
 *
 * ক্যানভাস বা PDF জেনারেটরের (jsPDF, html2canvas) মতো জায়গায় `var(...)`
 * কাজ করে না, ওদের সত্যিকারের রঙ লাগে — সেখানেই এটা ব্যবহার করুন।
 * ব্রাউজারের বাইরে (SSR) বা ভেরিয়েবল না পেলে `fallback` ফেরত যায়।
 *
 * `fallback` অবশ্যই আসল hex হতে হবে, var() নয় — কারণ যে জায়গাগুলোর
 * জন্য এই ফাংশন, সেখানে var() পড়তেই পারে না।
 *
 *     hexOf("--color-brand-dark", "#1a1a4e")
 */
export const hexOf = (varName, fallback = "#1a1a4e") => {
    if (typeof window === "undefined" || !document?.documentElement) return fallback;
    const value = getComputedStyle(document.documentElement)
        .getPropertyValue(varName)
        .trim();
    return value || fallback;
};

export default THEME;
