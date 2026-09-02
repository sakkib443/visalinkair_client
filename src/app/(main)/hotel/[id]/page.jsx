"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    LuArrowLeft,
    LuMapPin,
    LuStar,
    LuPhone,
    LuMessageCircle,
    LuChevronRight,
    LuCircleCheck,
    LuCircleDot,
    LuShieldCheck,
    LuBed,
    LuArrowRight,
    LuLoader,
    LuWifi,
    LuClock,
    LuUsers,
    LuCalendarDays,
    LuBuilding2,
} from "react-icons/lu";
import { FaWhatsapp } from "react-icons/fa";
import { useLanguage } from "@/context/LanguageContext";
import { useSiteSettings, buildWhatsAppUrl, buildTelUrl } from "@/context/SiteSettingsContext";
import Link from "next/link";
// BookingModal removed with the Bookings feature — the "Book Now" CTA
// now opens WhatsApp with a prefilled message.

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function HotelDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const { language } = useLanguage();
    const { settings } = useSiteSettings();
    const isBn = language === 'bn';
    const fontFamily = isBn ? 'Hind Siliguri, sans-serif' : 'Poppins, sans-serif';
    const headingFont = isBn ? 'Hind Siliguri, sans-serif' : 'Teko, sans-serif';

    const [hotel, setHotel] = useState(null);
    const [relatedHotels, setRelatedHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [activeFaq, setActiveFaq] = useState(null);

    useEffect(() => {
        const fetchHotel = async () => {
            setLoading(true);
            setError(false);
            try {
                let res = await fetch(`${API_BASE}/api/hotels/slug/${id}`);
                let data = await res.json();

                if (!data.success) {
                    res = await fetch(`${API_BASE}/api/hotels/${id}`);
                    data = await res.json();
                }

                if (data.success && data.data) {
                    setHotel(data.data);
                    const relRes = await fetch(`${API_BASE}/api/hotels/active`);
                    const relData = await relRes.json();
                    if (relData.success && relData.data) {
                        setRelatedHotels(
                            relData.data
                                .filter(h => h._id !== data.data._id)
                                .slice(0, 3)
                        );
                    }
                } else {
                    setError(true);
                }
            } catch {
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchHotel();
    }, [id]);

    const getCurrencySymbol = (currency) => currency === 'USD' ? '$' : '৳';

    const renderStars = (count) =>
        Array.from({ length: 5 }, (_, i) => (
            <LuStar key={i} size={15} className={i < count ? 'fill-brand-accent text-brand-accent' : 'text-gray-200'} />
        ));

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]">
                <div className="text-center">
                    <LuLoader size={40} className="animate-spin mx-auto mb-4" style={{ color: 'var(--color-brand-accent)' }} />
                    <p className="text-gray-400 text-sm" style={{ fontFamily }}>{isBn ? 'লোড হচ্ছে...' : 'Loading...'}</p>
                </div>
            </div>
        );
    }

    if (error || !hotel) {
        return (
            <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-4xl font-black text-gray-300 uppercase" style={{ fontFamily: headingFont }}>
                        {isBn ? 'হোটেল পাওয়া যায়নি' : 'Hotel Not Found'}
                    </h1>
                    <Link href="/hotel" className="mt-4 inline-block text-sm font-bold text-brand-accent hover:underline" style={{ fontFamily }}>
                        {isBn ? 'হোটেল পেজে ফিরুন' : 'Back to Hotels'}
                    </Link>
                </div>
            </div>
        );
    }

    const sym = getCurrencySymbol(hotel.currency);
    const savings = (hotel.oldPrice || 0) - (hotel.pricePerNight || 0);
    const name = isBn ? (hotel.nameBn || hotel.name) : hotel.name;
    const location = isBn ? (hotel.locationBn || hotel.location) : hotel.location;
    const city = isBn ? (hotel.cityBn || hotel.city) : hotel.city;
    const description = isBn ? (hotel.descriptionBn || hotel.description) : hotel.description;
    const longDescription = isBn ? (hotel.longDescriptionBn || hotel.longDescription) : hotel.longDescription;
    const roomType = isBn ? (hotel.roomTypeBn || hotel.roomType) : hotel.roomType;

    return (
        <div className="bg-[#F9FAFB] min-h-screen" style={{ fontFamily }}>
            <div className="h-16" />

            <div className="max-w-[1400px] mx-auto px-4 md:px-8 pb-20">

                {/* Breadcrumb */}
                <motion.nav
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2 text-[12px] text-gray-400 mb-6"
                    style={{ fontFamily }}
                >
                    <Link href="/" className="hover:text-gray-700 transition-colors">{isBn ? 'হোম' : 'Home'}</Link>
                    <LuChevronRight size={12} />
                    <Link href="/hotel" className="hover:text-gray-700 transition-colors">{isBn ? 'হোটেল' : 'Hotel'}</Link>
                    <LuChevronRight size={12} />
                    <span className="text-gray-700 font-semibold line-clamp-1">{name}</span>
                </motion.nav>

                {/* ===== HERO HEADER CARD ===== */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white rounded-md border border-gray-100 shadow-sm overflow-hidden mb-10"
                >
                    <div className="flex flex-col md:flex-row">
                        {/* Left: Info */}
                        <div className="flex-grow p-6 md:p-10 flex flex-col justify-center">
                            {/* Top Actions Row */}
                            <div className="flex items-center gap-3 mb-5">
                                <button
                                    onClick={() => router.back()}
                                    className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider hover:text-gray-700 transition-colors"
                                    style={{ fontFamily }}
                                >
                                    <LuArrowLeft size={14} />
                                    {isBn ? 'পিছনে' : 'Back'}
                                </button>
                                <div className="h-4 w-px bg-gray-200" />
                                {hotel.isFeatured && (
                                    <span className="px-2.5 py-1 bg-brand-accent text-white text-[8px] font-bold uppercase tracking-widest rounded-md">
                                        {isBn ? 'ফিচার্ড' : 'Featured'}
                                    </span>
                                )}
                                <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-[8px] font-bold uppercase tracking-widest rounded-md">
                                    {hotel.hotelCategory}
                                </span>
                            </div>

                            {/* City / Location */}
                            <div className="flex items-center gap-2 mb-2">
                                <LuMapPin size={14} className="text-brand-accent" />
                                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest" style={{ fontFamily }}>
                                    {location}
                                </span>
                            </div>

                            {/* Hotel Name */}
                            <h1 className="text-2xl md:text-4xl font-black text-gray-900 uppercase tracking-tight leading-none mb-3" style={{ fontFamily: headingFont }}>
                                {name}
                            </h1>

                            {/* Star Rating Row */}
                            <div className="flex items-center gap-2 mb-4">
                                <div className="flex items-center gap-0.5">
                                    {renderStars(hotel.starRating || 0)}
                                </div>
                                <span className="text-[11px] font-semibold text-gray-500" style={{ fontFamily }}>
                                    {hotel.starRating} {isBn ? 'তারকা হোটেল' : 'Star Hotel'}
                                </span>
                            </div>

                            {/* Short Description */}
                            <p className="text-gray-400 text-sm leading-relaxed mb-5 max-w-lg" style={{ fontFamily }}>
                                {description}
                            </p>

                            {/* Rating + Price + Actions */}
                            <div className="flex items-center gap-6 flex-wrap">
                                {hotel.rating > 0 && (
                                    <div className="flex items-center gap-1.5">
                                        <LuStar size={16} className="text-brand-accent fill-brand-accent" />
                                        <span className="text-sm font-bold text-gray-800">{hotel.rating}</span>
                                        {hotel.reviewsCount > 0 && (
                                            <span className="text-[11px] text-gray-400">({hotel.reviewsCount} {isBn ? 'রিভিউ' : 'reviews'})</span>
                                        )}
                                    </div>
                                )}

                                <div>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-black" style={{ color: '#3590CF', fontFamily: headingFont }}>
                                            {sym}{hotel.pricePerNight?.toLocaleString()}
                                        </span>
                                        {hotel.oldPrice > 0 && (
                                            <span className="text-base text-gray-300 line-through">{sym}{hotel.oldPrice?.toLocaleString()}</span>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-0.5" style={{ fontFamily }}>{isBn ? 'প্রতি রাত' : 'per night'}</p>
                                    {savings > 0 && (
                                        <p className="text-[11px] text-green-600 font-bold mt-0.5" style={{ fontFamily }}>
                                            {isBn ? `${sym}${savings.toLocaleString()} সাশ্রয়` : `You save ${sym}${savings.toLocaleString()}`}
                                        </p>
                                    )}
                                </div>

                            </div>
                        </div>

                        {/* Right: Image */}
                        <div className="md:w-[420px] flex-shrink-0 flex items-stretch p-5">
                            <div className="w-full min-h-[260px] relative overflow-hidden rounded-md">
                                {hotel.image ? (
                                    <img
                                        loading="lazy"
                                        decoding="async"
                                        src={hotel.image}
                                        alt={name}
                                        className="absolute inset-0 w-full h-full object-cover object-center"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: 'var(--color-brand-dark)' }}>
                                        <LuBed size={60} className="text-white/10" />
                                    </div>
                                )}
                                {/* Room Type Badge */}
                                {roomType && (
                                    <div className="absolute bottom-3 left-3 right-3">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider">
                                            <LuBed size={11} />
                                            {roomType}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* ===== MAIN CONTENT ===== */}
                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="flex-grow min-w-0 space-y-8">

                        {/* Quick Stats */}
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                            className="grid grid-cols-2 md:grid-cols-4 gap-4"
                        >
                            {[
                                { icon: LuClock, label: isBn ? 'চেক-ইন' : 'Check-in', value: hotel.checkInTime || '14:00' },
                                { icon: LuCalendarDays, label: isBn ? 'চেক-আউট' : 'Check-out', value: hotel.checkOutTime || '12:00' },
                                { icon: LuBuilding2, label: isBn ? 'মোট রুম' : 'Total Rooms', value: hotel.totalRooms || 'N/A' },
                                { icon: LuUsers, label: isBn ? 'পাওয়া যাচ্ছে' : 'Available', value: hotel.availableRooms || hotel.totalRooms || 'N/A' },
                            ].map((item, i) => (
                                <div key={i} className="bg-white rounded-md border border-gray-100 p-4 text-center shadow-sm">
                                    <item.icon size={20} className="mx-auto mb-2 text-brand-accent" />
                                    <p className="text-[10px] font-bold text-gray-300 uppercase tracking-wider mb-1" style={{ fontFamily }}>{item.label}</p>
                                    <p className="text-sm font-bold text-gray-800" style={{ fontFamily }}>{item.value}</p>
                                </div>
                            ))}
                        </motion.div>

                        {/* About */}
                        {longDescription && (
                            <motion.section
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white rounded-md border border-gray-100 p-6 md:p-8 shadow-sm"
                            >
                                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-4 leading-none" style={{ fontFamily: headingFont }}>
                                    {isBn ? 'হোটেল সম্পর্কে' : 'About This Hotel'}
                                </h2>
                                <p className="text-gray-500 text-sm leading-relaxed mb-4" style={{ fontFamily }}>
                                    {longDescription}
                                </p>
                                {hotel.tags?.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-50">
                                        {hotel.tags.map((tag, i) => (
                                            <span key={i} className="px-3 py-1 bg-gray-50 border border-gray-100 rounded-md text-[10px] font-bold text-gray-500 uppercase tracking-wider">{tag}</span>
                                        ))}
                                    </div>
                                )}
                            </motion.section>
                        )}

                        {/* Amenities */}
                        {hotel.amenities?.length > 0 && (
                            <motion.section
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.25 }}
                                className="bg-white rounded-md border border-gray-100 p-6 md:p-8 shadow-sm"
                            >
                                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-6 leading-none" style={{ fontFamily: headingFont }}>
                                    {isBn ? 'হোটেলের সুবিধাসমূহ' : 'Hotel Amenities'}
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {hotel.amenities.map((am, i) => (
                                        <div key={i} className="flex items-center gap-3 py-2.5 px-4 bg-gray-50 rounded-md">
                                            <LuCircleCheck size={16} className="text-green-500 flex-shrink-0" />
                                            <span className="text-sm text-gray-700 font-medium" style={{ fontFamily }}>
                                                {isBn && hotel.amenitiesBn?.[i] ? hotel.amenitiesBn[i] : am}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </motion.section>
                        )}

                        {/* Gallery */}
                        {hotel.gallery?.length > 0 && (
                            <motion.section
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-white rounded-md border border-gray-100 p-6 md:p-8 shadow-sm"
                            >
                                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-6 leading-none" style={{ fontFamily: headingFont }}>
                                    {isBn ? 'গ্যালারি' : 'Gallery'}
                                </h2>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {hotel.gallery.map((img, i) => (
                                        <div key={i} className="relative h-40 rounded-md overflow-hidden group">
                                            <img
                                                loading="lazy"
                                                decoding="async"
                                                src={img}
                                                alt={`${name} - ${i + 1}`}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </motion.section>
                        )}

                        {/* FAQs */}
                        {hotel.faqs?.length > 0 && (
                            <motion.section
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.35 }}
                                className="bg-white rounded-md border border-gray-100 p-6 md:p-8 shadow-sm"
                            >
                                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-6 leading-none" style={{ fontFamily: headingFont }}>
                                    {isBn ? 'সাধারণ জিজ্ঞাসা' : 'Frequently Asked Questions'}
                                </h2>
                                <div className="space-y-4">
                                    {hotel.faqs.map((faq, idx) => (
                                        <div key={idx} className="border border-gray-100 rounded-md p-5">
                                            <h3 className="text-sm font-bold text-gray-800 mb-2 flex items-start gap-2" style={{ fontFamily }}>
                                                <LuCircleDot size={14} className="text-brand-accent mt-0.5 flex-shrink-0" />
                                                {isBn ? (faq.questionBn || faq.question) : faq.question}
                                            </h3>
                                            <p className="text-[13px] text-gray-500 leading-relaxed pl-[22px]" style={{ fontFamily }}>
                                                {isBn ? (faq.answerBn || faq.answer) : faq.answer}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </motion.section>
                        )}
                    </div>

                    {/* ===== RIGHT SIDEBAR ===== */}
                    <div className="w-full lg:w-[360px] flex-shrink-0">
                        <div className="lg:sticky lg:top-32 space-y-5">

                            {/* Booking Card */}
                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white rounded-md border border-gray-100 p-6 shadow-sm"
                            >
                                <div className="flex items-baseline gap-3 mb-1">
                                    <span className="text-4xl font-black" style={{ color: '#3590CF', fontFamily: headingFont }}>
                                        {sym}{hotel.pricePerNight?.toLocaleString()}
                                    </span>
                                    {hotel.oldPrice > 0 && (
                                        <span className="text-lg text-gray-300 line-through font-medium">{sym}{hotel.oldPrice?.toLocaleString()}</span>
                                    )}
                                </div>
                                {savings > 0 && (
                                    <p className="text-[11px] text-green-600 font-bold mb-1" style={{ fontFamily }}>
                                        {isBn ? `${sym}${savings.toLocaleString()} সাশ্রয়` : `Save ${sym}${savings.toLocaleString()}`}
                                    </p>
                                )}
                                <p className="text-[11px] text-gray-400 mb-6" style={{ fontFamily }}>
                                    {isBn ? 'প্রতি রাত' : 'per night'}
                                    {roomType && ` · ${roomType}`}
                                </p>

                                <div className="space-y-3 mb-6">
                                    {[
                                        { label: isBn ? 'শহর' : 'City', value: city },
                                        { label: isBn ? 'তারকা রেটিং' : 'Star Rating', value: `${'★'.repeat(hotel.starRating || 1)} (${hotel.starRating || 1})` },
                                        { label: isBn ? 'চেক-ইন' : 'Check-in', value: hotel.checkInTime || '14:00' },
                                        { label: isBn ? 'চেক-আউট' : 'Check-out', value: hotel.checkOutTime || '12:00' },
                                        ...(hotel.availableRooms ? [{ label: isBn ? 'পাওয়া যাচ্ছে' : 'Available Rooms', value: `${hotel.availableRooms} ${isBn ? 'রুম' : 'rooms'}` }] : []),
                                        ...(hotel.rating ? [{ label: isBn ? 'গেস্ট রেটিং' : 'Guest Rating', value: `${hotel.rating} ${hotel.reviewsCount ? `(${hotel.reviewsCount})` : ''}` }] : []),
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                                            <span className="text-[12px] text-gray-400 font-medium" style={{ fontFamily }}>{item.label}</span>
                                            <span className="text-[12px] text-gray-800 font-bold" style={{ fontFamily }}>{item.value}</span>
                                        </div>
                                    ))}
                                </div>

                                <a
                                    href={buildWhatsAppUrl(
                                        settings.whatsappNumber,
                                        `Hi, I'd like to book "${hotel?.name || 'this hotel'}". Please share available dates and prices.`
                                    )}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full py-3.5 rounded-md text-[11px] font-bold uppercase tracking-widest text-white transition-all hover:shadow-lg hover:shadow-brand-accent/20 flex items-center justify-center gap-2"
                                    style={{ backgroundColor: 'var(--color-brand-accent)', fontFamily }}
                                >
                                    <LuCalendarDays size={16} />
                                    {isBn ? 'এখনই বুক করুন' : 'Book Now'}
                                </a>

                            </motion.div>

                            {/* Why Choose Us */}
                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-white rounded-md border border-gray-100 p-6 shadow-sm"
                            >
                                <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight mb-4 leading-none" style={{ fontFamily: headingFont }}>
                                    {isBn ? 'কেন আমাদের বেছে নেবেন' : 'Why Choose Us'}
                                </h3>
                                <div className="space-y-3">
                                    {[
                                        { icon: LuShieldCheck, text: isBn ? 'যাচাইকৃত ও নিরাপদ হোটেল' : 'Verified & Safe Hotels' },
                                        { icon: LuCircleCheck, text: isBn ? 'সেরা মূল্য গ্যারান্টি' : 'Best Price Guarantee' },
                                        { icon: LuWifi, text: isBn ? 'তাৎক্ষণিক বুকিং নিশ্চিতকরণ' : 'Instant Booking Confirmation' },
                                        { icon: LuPhone, text: isBn ? '২৪/৭ কাস্টমার সাপোর্ট' : '24/7 Customer Support' },
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-md bg-brand-accent/10 flex items-center justify-center flex-shrink-0">
                                                <item.icon size={14} className="text-brand-accent" />
                                            </div>
                                            <span className="text-[13px] font-semibold text-gray-700" style={{ fontFamily }}>{item.text}</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Contact Card */}
                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.35 }}
                                className="rounded-md p-6 relative overflow-hidden"
                                style={{ backgroundColor: 'var(--color-brand-dark)' }}
                            >
                                <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(239,140,44,0.15)' }} />
                                <div className="relative z-10">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: 'var(--color-brand-accent)' }}>
                                        {isBn ? 'সাহায্য দরকার?' : 'Need Help?'}
                                    </p>
                                    <p className="text-sm font-bold text-white mb-1" style={{ fontFamily }}>
                                        {isBn ? 'হোটেল বিশেষজ্ঞের সাথে কথা বলুন' : 'Talk to a Hotel Expert'}
                                    </p>
                                    <p className="text-[11px] text-white/40 leading-relaxed mb-5" style={{ fontFamily }}>
                                        {isBn ? 'সেরা ডিল ও কাস্টম প্যাকেজের জন্য আমাদের সাথে যোগাযোগ করুন।' : 'Contact us for best deals and custom hotel packages.'}
                                    </p>
                                    <div className="space-y-2">
                                        <a
                                            href={buildTelUrl(settings.contactPhone)}
                                            className="w-full py-3 rounded-md flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white transition-all hover:opacity-90"
                                            style={{ backgroundColor: 'var(--color-brand-accent)', fontFamily }}
                                        >
                                            <LuPhone size={13} />
                                            {isBn ? 'কল করুন' : 'Call Now'}
                                        </a>
                                        <a
                                            href={buildWhatsAppUrl(settings.whatsappNumber, `Hi, I need help with hotel booking for "${hotel.name}". Please contact me.`)}
                                            target="_blank" rel="noopener noreferrer"
                                            className="w-full py-3 rounded-md flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white border border-white/15 transition-all hover:bg-white/5"
                                            style={{ fontFamily }}
                                        >
                                            <LuMessageCircle size={13} />
                                            {isBn ? 'মেসেজ করুন' : 'Send Message'}
                                        </a>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>

                {/* ===== RELATED HOTELS ===== */}
                {relatedHotels.length > 0 && (
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mt-16"
                    >
                        <h2 className="text-3xl md:text-4xl font-black text-gray-900 uppercase tracking-tight mb-8 leading-none" style={{ fontFamily: headingFont }}>
                            {isBn ? 'আরো হোটেল ' : 'More Hotel '}
                            <span style={{ color: 'var(--color-brand-accent)' }}>{isBn ? 'দেখুন' : 'Options'}</span>
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {relatedHotels.map((h, idx) => {
                                const s = getCurrencySymbol(h.currency);
                                return (
                                    <Link href={`/hotel/${h.slug || h._id}`} key={h._id}>
                                        <motion.div
                                            initial={{ opacity: 0, y: 15 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: idx * 0.08 }}
                                            className="group bg-white rounded-md overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-500"
                                        >
                                            <div className="relative h-44 overflow-hidden">
                                                {h.image ? (
                                                    <img
                                                        loading="lazy"
                                                        decoding="async"
                                                        src={h.image}
                                                        alt={isBn ? (h.nameBn || h.name) : h.name}
                                                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-brand-dark)' }}>
                                                        <LuBed size={30} className="text-white/10" />
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                                                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                                                    <span className="text-white text-[10px] font-bold uppercase tracking-widest drop-shadow" style={{ fontFamily }}>
                                                        {'★'.repeat(h.starRating || 1)}
                                                    </span>
                                                    <span className="text-white/80 text-[9px]" style={{ fontFamily }}>
                                                        {isBn ? (h.cityBn || h.city) : h.city}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="p-4">
                                                <h3 className="text-base font-bold text-gray-900 group-hover:text-[#3590CF] transition-colors mb-1 line-clamp-1" style={{ fontFamily }}>
                                                    {isBn ? (h.nameBn || h.name) : h.name}
                                                </h3>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-baseline gap-2">
                                                        <span className="text-lg font-black" style={{ color: '#3590CF', fontFamily: headingFont }}>
                                                            {s}{h.pricePerNight?.toLocaleString()}
                                                        </span>
                                                        <span className="text-[9px] text-gray-400" style={{ fontFamily }}>{isBn ? '/রাত' : '/night'}</span>
                                                        {h.oldPrice > 0 && (
                                                            <span className="text-[10px] text-gray-300 line-through">{s}{h.oldPrice?.toLocaleString()}</span>
                                                        )}
                                                    </div>
                                                    {h.rating > 0 && (
                                                        <div className="flex items-center gap-1">
                                                            <LuStar size={12} className="text-brand-accent fill-brand-accent" />
                                                            <span className="text-[11px] font-bold text-gray-700">{h.rating}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    </Link>
                                );
                            })}
                        </div>
                    </motion.section>
                )}
            </div>

            {/* ===== BOTTOM CTA ===== */}
            <section className="bg-white border-t border-gray-100 py-12 md:py-20">
                <div className="max-w-3xl mx-auto px-6 text-center">
                    <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-gray-900 uppercase tracking-tight mb-5 leading-none" style={{ fontFamily: headingFont }}>
                        {isBn ? 'আজই হোটেল বুক করুন' : 'Book Your Hotel Today'}
                    </h2>
                    <p className="text-gray-400 text-sm md:text-base max-w-lg mx-auto mb-8 leading-relaxed" style={{ fontFamily }}>
                        {isBn
                            ? 'সেরা দামে পছন্দের হোটেল বুক করুন। আমাদের বিশেষজ্ঞ দল সবকিছু সাজিয়ে দেবে।'
                            : 'Book your preferred hotel at the best price. Our expert team will arrange everything for you.'
                        }
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <a
                            href={buildWhatsAppUrl(settings.whatsappNumber,
                                `🏨 Hotel Booking - Visalink Air\n\n` +
                                `Hotel: ${hotel.name}\n` +
                                `Location: ${hotel.city}\n` +
                                `Price: ${sym}${hotel.pricePerNight?.toLocaleString()} per night\n\n` +
                                `I would like to book this hotel. Please assist me.`
                            )}
                            target="_blank" rel="noopener noreferrer"
                            className="px-10 py-4 rounded-md text-[11px] font-bold uppercase tracking-widest text-white transition-all hover:shadow-lg hover:shadow-whatsapp/20 hover:-translate-y-0.5 flex items-center gap-2"
                            style={{ backgroundColor: 'var(--color-whatsapp)', fontFamily }}
                        >
                            <FaWhatsapp size={16} />
                            {isBn ? 'এখনই বুক করুন' : 'Book Now'}
                        </a>
                        <a
                            href={buildWhatsAppUrl(settings.whatsappNumber, `Hi, I need help with hotel booking. Please contact me.`)}
                            target="_blank" rel="noopener noreferrer"
                            className="px-10 py-4 rounded-md text-[11px] font-bold uppercase tracking-widest text-white transition-all hover:shadow-lg hover:-translate-y-0.5 flex items-center gap-2"
                            style={{ backgroundColor: 'var(--color-brand-dark)', fontFamily }}
                        >
                            <FaWhatsapp size={16} />
                            {isBn ? 'যোগাযোগ করুন' : 'Contact Us'}
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
}
