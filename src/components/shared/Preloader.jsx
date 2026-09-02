"use client";

// ===================================================================
// Visalink Air — Preloader
// Clean, modern brand loader: deep-navy backdrop, soft aura, a rotating
// gradient ring around the logo, and a refined progress bar.
// Brand colors: Orange (var(--color-brand-accent)) + Blue (#3590CF).
// ===================================================================

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import Logo from "@/components/shared/Logo";

const ORANGE = "var(--color-brand-accent)";
const BLUE = "#3590CF";

// Shows once per browser session — first entry to the site. Reloads,
// failed-login redirects, and client navigation never replay it.
const SEEN_KEY = "visalinkair-preloaded";

export default function Preloader() {
    const [isLoading, setIsLoading] = useState(true);
    const [progress, setProgress] = useState(0);
    // Already shown this session → render nothing at all (no flash, no replay).
    const [skip, setSkip] = useState(false);

    useEffect(() => {
        let seen = false;
        try { seen = sessionStorage.getItem(SEEN_KEY) === "1"; } catch { /* storage blocked */ }
        if (seen) {
            setSkip(true);
            setIsLoading(false);
            return;
        }

        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    try { sessionStorage.setItem(SEEN_KEY, "1"); } catch { /* storage blocked */ }
                    setTimeout(() => setIsLoading(false), 650);
                    return 100;
                }
                // Ease-out fill: quick at first, gently settling near 100%.
                const increment = Math.max(1, Math.ceil((100 - prev) * 0.1)) + Math.floor(Math.random() * 4);
                return Math.min(prev + increment, 100);
            });
        }, 130);

        return () => clearInterval(interval);
    }, []);

    // Seen already → nothing renders (skips the exit animation entirely).
    if (skip) return null;

    return (
        <AnimatePresence mode="wait">
            {isLoading && (
                <motion.div
                    key="preloader"
                    initial={{ opacity: 1 }}
                    exit={{ y: "-100%", transition: { duration: 0.9, ease: [0.76, 0, 0.24, 1] } }}
                    className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
                    style={{ background: "radial-gradient(125% 125% at 50% 0%, #14203a 0%, #0a0f1a 52%, #05070c 100%)" }}
                >
                    {/* Ambient aura blobs */}
                    <motion.div
                        aria-hidden
                        className="pointer-events-none absolute left-1/2 top-[-18%] h-[55vh] w-[55vh] -translate-x-1/2 rounded-full blur-[120px]"
                        style={{ background: `radial-gradient(circle, ${ORANGE}26, transparent 62%)` }}
                        animate={{ opacity: [0.35, 0.6, 0.35], scale: [1, 1.12, 1] }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <motion.div
                        aria-hidden
                        className="pointer-events-none absolute bottom-[-22%] left-[28%] h-[50vh] w-[50vh] rounded-full blur-[130px]"
                        style={{ background: `radial-gradient(circle, ${BLUE}26, transparent 62%)` }}
                        animate={{ opacity: [0.3, 0.55, 0.3], scale: [1.08, 1, 1.08] }}
                        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    />

                    {/* Faint grid for subtle depth */}
                    <div
                        aria-hidden
                        className="pointer-events-none absolute inset-0 opacity-[0.04]"
                        style={{
                            backgroundImage:
                                "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
                            backgroundSize: "56px 56px",
                            WebkitMaskImage: "radial-gradient(circle at 50% 42%, #000 25%, transparent 72%)",
                            maskImage: "radial-gradient(circle at 50% 42%, #000 25%, transparent 72%)",
                        }}
                    />

                    {/* Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } }}
                        className="relative z-10 flex flex-col items-center px-6"
                    >
                        {/* Logo inside a rotating gradient ring */}
                        <div className="relative mb-9 flex h-48 w-48 items-center justify-center">
                            {/* faint full track */}
                            <div aria-hidden className="absolute h-48 w-48 rounded-full border border-white/[0.06]" />

                            {/* rotating gradient arc */}
                            <motion.div
                                aria-hidden
                                className="absolute h-48 w-48 rounded-full"
                                style={{
                                    background: `conic-gradient(from 90deg, transparent 0deg, ${ORANGE} 70deg, ${BLUE} 175deg, transparent 250deg, transparent 360deg)`,
                                    WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 2.5px), #000 calc(100% - 2.5px))",
                                    mask: "radial-gradient(farthest-side, transparent calc(100% - 2.5px), #000 calc(100% - 2.5px))",
                                }}
                                animate={{ rotate: 360 }}
                                transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
                            />

                            {/* soft glow behind the logo */}
                            <div
                                aria-hidden
                                className="absolute h-40 w-40 rounded-full blur-[55px]"
                                style={{ background: `radial-gradient(circle, ${ORANGE}33, ${BLUE}22 58%, transparent 72%)` }}
                            />

                            {/* logo badge (gentle float) */}
                            <motion.div
                                className="relative z-10"
                                animate={{ y: [0, -5, 0] }}
                                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <Logo className="h-24 w-auto max-w-[200px]" />
                            </motion.div>
                        </div>

                        {/* Tagline */}
                        <motion.p
                            className="mb-9 text-[11px] font-semibold uppercase tracking-[0.5em] text-white/45"
                            animate={{ opacity: [0.4, 0.7, 0.4] }}
                            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                        >
                            Elite Travel Assistance
                        </motion.p>

                        {/* Progress */}
                        <div className="flex w-72 flex-col items-center">
                            <div className="mb-3 flex w-full items-baseline justify-between">
                                <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-white/40">
                                    Loading
                                </span>
                                <span className="text-sm font-semibold tabular-nums text-white/90">
                                    {progress}%
                                </span>
                            </div>

                            <div className="relative h-[3px] w-full overflow-hidden rounded-full bg-white/10">
                                <motion.div
                                    className="absolute left-0 top-0 h-full rounded-full"
                                    style={{
                                        background: `linear-gradient(90deg, ${ORANGE}, ${BLUE})`,
                                        boxShadow: `0 0 12px ${ORANGE}99`,
                                    }}
                                    initial={{ width: "0%" }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.3, ease: "easeOut" }}
                                />
                                {/* shimmer sweep */}
                                <motion.div
                                    className="absolute top-0 h-full w-16"
                                    style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)" }}
                                    animate={{ x: ["-64px", "288px"] }}
                                    transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
                                />
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
