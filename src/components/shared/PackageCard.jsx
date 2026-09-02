"use client";

// ===================================================================
// PackageCard — the Hajj/Umrah package card, extracted from the
// /hajj-umrah page so the home page can reuse it without drift.
// Both surfaces render THIS component, so a design change in one
// place updates the whole site.
// ===================================================================

import { motion } from "framer-motion";
import {
    LuCalendar, LuHotel, LuUsers, LuMapPin, LuCheck, LuArrowRight,
} from "react-icons/lu";
import { FaWhatsapp } from "react-icons/fa";

export default function PackageCard({
    pkg,
    isBn = false,
    fontFamily = "Poppins, sans-serif",
    headingFont = "Teko, sans-serif",
    onBook,
    onWhatsApp,      // pre-built href (or null)
}) {
    const name = isBn && pkg.nameBn ? pkg.nameBn : pkg.name;
    const subtitle = isBn && pkg.subtitleBn ? pkg.subtitleBn : pkg.subtitle;
    const duration = isBn && pkg.durationBn ? pkg.durationBn : pkg.duration;
    const hotel = isBn && pkg.hotelBn ? pkg.hotelBn : pkg.hotel;
    const distance = isBn && pkg.distanceBn ? pkg.distanceBn : pkg.distance;
    const features = (isBn && pkg.featuresBn?.length ? pkg.featuresBn : pkg.features) || [];

    return (
        <motion.article
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.4 }}
            className={`relative rounded-2xl overflow-hidden bg-white border-2 transition-all hover:-translate-y-1 flex flex-col ${
                pkg.isPopular
                    ? "border-emerald-500 shadow-[0_20px_45px_-15px_rgba(16,185,129,0.35)]"
                    : "border-gray-100 hover:border-emerald-500/40 hover:shadow-xl"
            }`}
        >
            {pkg.isPopular && (
                <div
                    className="absolute top-0 inset-x-0 py-1.5 bg-emerald-500 text-white text-center text-[11px] font-black uppercase tracking-widest z-10"
                    style={{ fontFamily }}
                >
                    ⭐ {isBn ? "সবচেয়ে জনপ্রিয়" : "Most Popular"}
                </div>
            )}

            <div className={`p-6 ${pkg.isPopular ? "pt-10" : ""} bg-gradient-to-br from-emerald-50/60 to-transparent`}>
                <h3 className="text-2xl font-black text-brand-dark tracking-tight" style={{ fontFamily: headingFont }}>
                    {name}
                </h3>
                {subtitle && (
                    <p className="text-sm text-gray-500 mt-1" style={{ fontFamily }}>{subtitle}</p>
                )}
                <div className="mt-4 flex items-baseline gap-2 flex-wrap">
                    {pkg.oldPrice && (
                        <span className="text-sm text-gray-400 line-through" style={{ fontFamily: headingFont }}>
                            ${pkg.oldPrice.toLocaleString()}
                        </span>
                    )}
                    <span className="text-4xl font-black text-emerald-700" style={{ fontFamily: headingFont }}>
                        ${pkg.price?.toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-500" style={{ fontFamily }}>
                        {isBn ? "/জন" : "/person"}
                    </span>
                </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 grid grid-cols-2 gap-3">
                {duration && <PkgMeta icon={<LuCalendar size={14} />} label={isBn ? "মেয়াদ" : "Duration"} value={duration} fontFamily={fontFamily} />}
                {hotel && <PkgMeta icon={<LuHotel size={14} />} label={isBn ? "হোটেল" : "Hotel"} value={hotel} fontFamily={fontFamily} />}
                {pkg.groupSize && <PkgMeta icon={<LuUsers size={14} />} label={isBn ? "গ্রুপ" : "Group"} value={`${pkg.groupSize} ${isBn ? "জন" : "pax"}`} fontFamily={fontFamily} />}
                {distance && <PkgMeta icon={<LuMapPin size={14} />} label={isBn ? "দূরত্ব" : "Distance"} value={distance} fontFamily={fontFamily} />}
            </div>

            {features.length > 0 && (
                <div className="px-6 py-4 border-t border-gray-100 flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2" style={{ fontFamily }}>
                        {isBn ? "যা অন্তর্ভুক্ত" : "What's included"}
                    </p>
                    <ul className="space-y-1.5">
                        {features.slice(0, 6).map((f, i) => (
                            <li key={i} className="flex items-start gap-2 text-[13px] text-gray-700" style={{ fontFamily }}>
                                <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <LuCheck size={10} strokeWidth={3} />
                                </span>
                                {f}
                            </li>
                        ))}
                        {features.length > 6 && (
                            <li className="text-[11px] text-emerald-700 font-semibold pl-6" style={{ fontFamily }}>
                                +{features.length - 6} {isBn ? "আরও সুবিধা" : "more benefits"}
                            </li>
                        )}
                    </ul>
                </div>
            )}

            <div className="p-4 border-t border-gray-100 flex gap-2 bg-white">
                <button
                    type="button"
                    onClick={onBook}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-3 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-bold transition-colors"
                    style={{ fontFamily }}
                >
                    {isBn ? "বুক করুন" : "Book Now"} <LuArrowRight size={14} />
                </button>
                {onWhatsApp && (
                    <a
                        href={onWhatsApp}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-lg bg-whatsapp hover:bg-whatsapp-hover text-white transition-colors"
                        aria-label="WhatsApp"
                    >
                        <FaWhatsapp size={16} />
                    </a>
                )}
            </div>
        </motion.article>
    );
}

function PkgMeta({ icon, label, value, fontFamily }) {
    return (
        <div className="min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1" style={{ fontFamily }}>
                {icon} {label}
            </p>
            <p className="text-[13px] font-semibold text-brand-dark mt-0.5 truncate" style={{ fontFamily }}>
                {value}
            </p>
        </div>
    );
}
