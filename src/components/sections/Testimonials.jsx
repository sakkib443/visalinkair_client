"use client";

// ===================================================================
// Home page Testimonials slider
// -------------------------------------------------------------------
// Fully database-driven: whatever a super admin adds under
// Dashboard → Testimonials shows up here, newest first. There is no
// public review submission and no hard-coded fallback content — an empty
// database simply hides the section.
// ===================================================================

import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import { LuStar, LuLoader, LuChevronLeft, LuChevronRight, LuQuote } from "react-icons/lu";
import { useLanguage } from "@/context/LanguageContext";

import "swiper/css";
import "swiper/css/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function Testimonials() {
    const { t, language } = useLanguage();
    const isBn = language === "bn";
    const bnFont = isBn ? "Hind Siliguri, sans-serif" : "Poppins, sans-serif";
    const headingFont = isBn ? "Hind Siliguri, sans-serif" : "Teko, sans-serif";

    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch(`${API_BASE}/api/testimonials`);
                const data = await res.json();
                if (!cancelled && data.success && Array.isArray(data.data)) {
                    setReviews(data.data);
                }
            } catch (err) {
                console.error("Failed to fetch testimonials:", err);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    // Nothing in the database yet — don't render an empty section.
    if (!loading && reviews.length === 0) return null;

    return (
        <section className="py-20 px-4 bg-white">
            <div className="max-w-6xl mx-auto text-center">
                {/* Header */}
                <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-brand-accent" />
                    <div className="flex items-center gap-2 px-5 py-2 rounded-full border border-brand-accent/15 bg-brand-accent/[0.05]">
                        <span
                            className="text-brand-accent text-xs font-semibold tracking-[0.25em] uppercase"
                            style={{ fontFamily: bnFont }}
                        >
                            {t("testimonials")}
                        </span>
                    </div>
                    <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-brand-accent" />
                </div>
                <h2
                    className="text-4xl md:text-5xl lg:text-6xl font-bold mb-10 md:mb-14"
                    style={{
                        fontFamily: headingFont,
                        color: "#111827",
                        textTransform: "uppercase",
                    }}
                >
                    {t("voicesOfOur")}{" "}
                    <span style={{ color: "#3590CF" }}>{t("clients")}</span>
                </h2>

                {/* Slider */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <LuLoader className="w-8 h-8 text-gray-300 animate-spin" />
                    </div>
                ) : (
                    <>
                        <Swiper
                            modules={[Autoplay, Navigation]}
                            spaceBetween={24}
                            slidesPerView={1}
                            loop={reviews.length > 3}
                            speed={700}
                            autoplay={{
                                delay: 5000,
                                disableOnInteraction: false,
                            }}
                            navigation={{
                                prevEl: ".testimonials-prev",
                                nextEl: ".testimonials-next",
                            }}
                            breakpoints={{
                                640: { slidesPerView: 2 },
                                1024: { slidesPerView: 3 },
                            }}
                            className="!pb-2"
                        >
                            {reviews.map((review, i) => (
                                <SwiperSlide key={review._id || i} className="h-auto">
                                    <div className="relative h-full p-8 rounded-2xl border border-gray-100 bg-white text-left hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col">
                                        {/* Quote icon */}
                                        <LuQuote className="absolute top-5 right-5 w-8 h-8 text-brand-blue/10" />

                                        {/* Stars */}
                                        <div className="flex gap-1 mb-4">
                                            {Array.from({ length: review.rating || 5 }).map((_, j) => (
                                                <LuStar
                                                    key={j}
                                                    className="text-brand-accent fill-brand-accent"
                                                    size={16}
                                                />
                                            ))}
                                        </div>

                                        {/* Message */}
                                        <p
                                            className="text-gray-600 text-sm mb-6 leading-relaxed flex-grow line-clamp-5"
                                            style={{ fontFamily: bnFont }}
                                        >
                                            &quot;{review.message}&quot;
                                        </p>

                                        {/* Author */}
                                        <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                                            {review.avatar ? (
                                                <img
                                                    src={review.avatar}
                                                    alt={review.name}
                                                    className="w-11 h-11 rounded-full object-cover ring-2 ring-gray-100"
                                                />
                                            ) : (
                                                <div
                                                    className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold"
                                                    style={{
                                                        backgroundColor: i % 2 === 0 ? "#3590CF" : "var(--color-brand-accent)",
                                                    }}
                                                >
                                                    {review.name?.[0] || "?"}
                                                </div>
                                            )}
                                            <div className="min-w-0 flex-1">
                                                <p
                                                    className="font-bold text-gray-800 text-sm truncate"
                                                    style={{ fontFamily: bnFont }}
                                                >
                                                    {review.name}
                                                </p>
                                                <p
                                                    className="text-xs text-gray-400 truncate"
                                                    style={{ fontFamily: bnFont }}
                                                >
                                                    {review.role || t("verifiedClient")}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>

                        {/* Navigation Arrows */}
                        {reviews.length > 3 && (
                            <div className="flex items-center justify-center gap-3 mt-8">
                                <button
                                    type="button"
                                    className="testimonials-prev w-12 h-12 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-400 hover:border-brand-blue hover:text-brand-blue hover:bg-brand-blue/5 transition-all duration-300 cursor-pointer"
                                    aria-label="Previous"
                                >
                                    <LuChevronLeft className="text-xl" />
                                </button>
                                <button
                                    type="button"
                                    className="testimonials-next w-12 h-12 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-400 hover:border-brand-blue hover:text-brand-blue hover:bg-brand-blue/5 transition-all duration-300 cursor-pointer"
                                    aria-label="Next"
                                >
                                    <LuChevronRight className="text-xl" />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </section>
    );
}
