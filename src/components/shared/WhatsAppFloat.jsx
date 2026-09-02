"use client";

import { useState, useEffect } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { LuX } from "react-icons/lu";
import { motion, AnimatePresence } from "framer-motion";
import { useSiteSettings, buildWhatsAppUrl } from "@/context/SiteSettingsContext";

const DEFAULT_MESSAGE = "Hello! I need help with visa/tour services.";

export default function WhatsAppFloat() {
    const [showTooltip, setShowTooltip] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [isPulsing, setIsPulsing] = useState(true);
    const { settings } = useSiteSettings();

    // Show button after a slight delay for smooth page load
    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 1500);
        return () => clearTimeout(timer);
    }, []);

    // Stop pulsing after 10 seconds
    useEffect(() => {
        const timer = setTimeout(() => setIsPulsing(false), 10000);
        return () => clearTimeout(timer);
    }, []);

    const handleClick = () => {
        if (!settings.whatsappNumber) return;
        window.open(
            buildWhatsAppUrl(settings.whatsappNumber, DEFAULT_MESSAGE),
            "_blank",
            "noopener,noreferrer"
        );
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
                    className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3"
                >
                    {/* Tooltip Bubble */}
                    <AnimatePresence>
                        {showTooltip && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                                transition={{ duration: 0.2 }}
                                className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 max-w-[260px] relative"
                                style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}
                            >
                                <button
                                    onClick={() => setShowTooltip(false)}
                                    className="absolute top-2 right-2 w-5 h-5 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                                >
                                    <LuX className="w-3 h-3 text-gray-500" />
                                </button>
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-full bg-whatsapp flex items-center justify-center flex-shrink-0">
                                        <FaWhatsapp className="text-white w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[13px] font-bold text-gray-800 leading-tight">Visalink Air Support</p>
                                        <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">
                                            আমাদের সাথে WhatsApp এ যোগাযোগ করুন!
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleClick}
                                    className="w-full mt-3 py-2 rounded-xl text-white text-[12px] font-bold transition-all hover:brightness-110 active:scale-[0.97]"
                                    style={{ backgroundColor: 'var(--color-whatsapp)' }}
                                >
                                    💬 Chat on WhatsApp
                                </button>
                                {/* Arrow */}
                                <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white border-b border-r border-gray-100 rotate-45" />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Main WhatsApp Button */}
                    <motion.button
                        onClick={() => {
                            if (showTooltip) {
                                handleClick();
                            } else {
                                setShowTooltip(true);
                            }
                        }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="relative w-[60px] h-[60px] rounded-full flex items-center justify-center shadow-2xl transition-shadow hover:shadow-[0_8px_30px_rgba(37,211,102,0.5)] group"
                        style={{
                            background: 'linear-gradient(135deg, var(--color-whatsapp) 0%, #128C7E 100%)',
                        }}
                        aria-label="Chat on WhatsApp"
                    >
                        <FaWhatsapp className="text-white w-7 h-7 drop-shadow-sm" />

                        {/* Pulse ring animation */}
                        {isPulsing && (
                            <>
                                <span className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ backgroundColor: 'var(--color-whatsapp)' }} />
                                <span className="absolute -inset-1 rounded-full animate-pulse opacity-10 border-2" style={{ borderColor: 'var(--color-whatsapp)' }} />
                            </>
                        )}

                        {/* Online indicator dot */}
                        <span className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-[#4ADE80] border-2 border-white shadow-sm" />
                    </motion.button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
