"use client";

import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

// Comprehensive Translations for Visalink Air home page sections
const translations = {
    en: {
        // Top Info Bar
        topEmail: "info@visalinkair.com",
        topAddress: "Marul Badda, Dhaka",
        topHours: "Sat - Thu: 9:30 AM - 8:30 PM",

        // Navbar
        home: "Home",
        visa: "Visa",
        tour: "Tour",
        hajjUmrah: "Hajj & Umrah",
        studyAbroad: "Study Abroad",
        blog: "Blog",
        contact: "Contact",
        login: "Login",
        register: "Register",
        getStarted: "Get Started",
        dashboard: "Dashboard",
        accountSettings: "Account Settings",
        signOut: "Sign Out",
        languageLabel: "Language",

        // Visa Dropdown
        touristVisa: "Tourist Visa",
        workingVisa: "Working Visa",
        studentVisa: "Student Visa",
        businessVisa: "Business Visa",
        medicalVisa: "Medical Visa",
        transitVisa: "Transit Visa",
        consultancyMigration: "Consultancy & Migration",

        // Hero Section
        openingHour: "Opening Hour: 9.30 AM To 8.30 PM",
        heroTitle: "YOUR JOURNEY STARTS WITH VISALINK AIR",
        bookAppointment: "Book Appointment",
        askQuestion: "Ask Question",
        hotline247: "Hotline 24/7",

        // Hero Search Tabs
        tabVisa: "Visa",
        tabHotel: "Hotel",
        tabTour: "Tour",
        tabFlight: "Flight",
        selectLabel: "Select",
        destination: "Destination",
        tourTypes: "Tour Types",
        search: "SEARCH",

        // Services Section
        servicesTag: "✦ Our Expertise",
        servicesTitle: "OUR",
        servicesTitleHighlight: "SERVICES",
        servicesDesc: "Comprehensive travel & immigration solutions tailored to your needs.",
        viewAll: "View All",
        exploreService: "Explore",

        // Service Items
        visaProcessing: "Visa Processing",
        visaProcessingSub: "WORLDWIDE",
        visaProcessingDesc: "Expert assistance for tourist, business, and study visas worldwide with a proven track record of success.",
        visaProcessingStats: "50+ Countries",

        flightBooking: "Flight Booking",
        flightBookingSub: "BEST DEALS",
        flightBookingDesc: "Get the best deals on domestic and international flights with our vast airline network.",
        flightBookingStats: "100+ Airlines",

        hotelReservation: "Hotel Reservation",
        hotelReservationSub: "PREMIUM STAYS",
        hotelReservationDesc: "Book premium hotels and resorts worldwide at competitive prices for a comfortable stay.",
        hotelReservationStats: "5000+ Hotels",

        tourPackages: "Tour Packages",
        tourPackagesSub: "CUSTOM PLANNING",
        tourPackagesDesc: "Customized holiday packages tailored to your preferences, budget, and dreams.",
        tourPackagesStats: "200+ Packages",

        hajjUmrahService: "Hajj & Umrah",
        hajjUmrahSub: "HOLY JOURNEY",
        hajjUmrahDesc: "Complete Hajj and Umrah packages with experienced guides and premium accommodations.",
        hajjUmrahStats: "1000+ Pilgrims",

        studyAbroadService: "Study Abroad",
        studyAbroadSub: "GLOBAL EDUCATION",
        studyAbroadDesc: "Complete guidance for studying abroad including university selection & visa assistance.",
        studyAbroadStats: "30+ Universities",

        // Trusted Partners
        trustedPartners: "Trusted Partners",

        // Benefits Section
        whyUs: "✦ Why Us",
        ourBenefits: "Our",
        benefitsHighlight: "Benefits",
        benefitsDesc: "Why thousands of travelers choose Visalink Air for their journey.",

        oneClickBooking: "ONE CLICK BOOKING.",
        oneClickBookingDesc: "You can hassle-free and fast tour & travel package booking by Visalink Air.",
        learnMore: "Learn More",

        discountOffer: "DISCOUNT & OFFER.",
        discountOfferDesc: "Agencies have special discounts on flights, hotels, & packages.",
        viewOffers: "View Offers",

        localExpertise: "LOCAL EXPERTISE.",
        localExpertiseDesc: "You can hassle-free and fast tour & travel package booking by Visalink Air.",
        meetExperts: "Meet Experts",

        customizeNote: "You've Customize Your Travel Package by One Click.",
        customizePackage: "Customize Package",

        // Consultation Section
        consultTag: "✦ We Make A Difference",
        consultTitle: "Welcome to Immigration",
        consultTitleHighlight: "Advisory",
        consultTitleEnd: "Services",
        consultDesc: "We help investors and entrepreneurs secure citizenship in major nations with our top immigration programs. We have a decade of experience assisting requirements.",
        experienceTitle: "10+ Years of Experience in Visa & Immigration Services",
        experienceDesc: "Our global expertise, advanced technology & customized immigration solutions will help you achieve your goals.",
        exploreMore: "Explore More",
        realAgents: "Real Agents",

        // Why Choose Us Section
        whyVisaPro: "✦ Why Visalink Air",
        whyChoose: "WHY CHOOSE",
        us: "US",
        whyChooseDesc: "With years of experience in visa consultancy and travel services, we provide accurate guidance and expert support to make your dreams come true.",

        expertGuidance: "Expert Guidance",
        expertGuidanceDesc: "Skilled professionals with deep knowledge of immigration laws and procedures.",
        fastProcessing: "Fast Processing",
        fastProcessingDesc: "Quick and efficient visa processing with high success rate and minimal delays.",
        support247: "24/7 Support",
        support247Desc: "Round-the-clock customer support for all your queries and concerns.",
        affordablePrices: "Affordable Prices",
        affordablePricesDesc: "Competitive pricing without compromising on service quality or support.",
        fiftyCountries: "50+ Countries",
        fiftyCountriesDesc: "We process visas for destinations across the globe with local expertise.",
        successRate: "98% Success Rate",
        successRateDesc: "Proven track record of successful visa approvals for our clients.",

        // Stats
        yearsExperience: "Years Experience",
        visasProcessed: "Visas Processed",
        statSuccessRate: "Success Rate",
        countriesCovered: "Countries Covered",
        customerSupport: "Customer Support",

        // Testimonials
        testimonials: "✦ Testimonials",
        voicesOfOur: "VOICES OF OUR",
        clients: "CLIENTS",
        verifiedClient: "Verified Client",

        // Footer CTA
        readyToStart: "Ready to Start Your Journey?",
        footerCTADesc: "Let our experts help you with visa processing, flight booking & more",
        callNow: "Call Now",
        freeConsultation: "Free Consultation",

        // Footer Brand
        footerBrandDesc: "Your trusted partner for visa processing, flight booking, hotel reservation, Hajj & Umrah packages, and tour planning in Bangladesh.",
        hotlineTime: "Hotline (9:30 AM - 8:30 PM)",

        // Footer Column Headings
        ourServices: "Our Services",
        visaTypes: "Visa Types",
        quickLinks: "Quick Links",

        // Footer Service Links
        footerVisaProcessing: "Visa Processing",
        footerFlightBooking: "Flight Booking",
        footerHotelReservation: "Hotel Reservation",
        footerTourPackages: "Tour Packages",
        footerHajjUmrah: "Hajj & Umrah",
        footerStudyAbroad: "Study Abroad",

        // Footer Visa Types
        footerTouristVisa: "Tourist Visa",
        footerWorkingVisa: "Working Visa",
        footerStudentVisa: "Student Visa",
        footerBusinessVisa: "Business Visa",
        footerMedicalVisa: "Medical Visa",
        footerTransitVisa: "Transit Visa",

        // Footer Quick Links
        aboutUs: "About Us",
        footerBlog: "Blog",
        contactUs: "Contact Us",
        privacyPolicy: "Privacy Policy",
        termsOfService: "Terms of Service",
        faq: "FAQ",

        // Footer Newsletter
        newsletter: "Newsletter",
        yourEmail: "Your email",

        // Footer Bottom
        acceptedPayment: "Accepted Payment Methods",
        allRightsReserved: "All rights reserved.",
        terms: "Terms",
        privacy: "Privacy",
    },
    bn: {
        // Top Info Bar
        topEmail: "info@visalinkair.com",
        topAddress: "মেরুল বাড্ডা, ঢাকা",
        topHours: "শনি - বৃহঃ: সকাল ৯:৩০ - রাত ৮:৩০",

        // Navbar
        home: "হোম",
        visa: "ভিসা",
        tour: "ট্যুর",
        hajjUmrah: "হজ্জ ও ওমরাহ",
        studyAbroad: "বিদেশে পড়াশোনা",
        blog: "ব্লগ",
        contact: "যোগাযোগ",
        login: "লগইন",
        register: "রেজিস্টার",
        getStarted: "শুরু করুন",
        dashboard: "ড্যাশবোর্ড",
        accountSettings: "একাউন্ট সেটিংস",
        signOut: "লগ আউট",
        languageLabel: "ভাষা",

        // Visa Dropdown
        touristVisa: "ট্যুরিস্ট ভিসা",
        workingVisa: "ওয়ার্কিং ভিসা",
        studentVisa: "স্টুডেন্ট ভিসা",
        businessVisa: "বিজনেস ভিসা",
        medicalVisa: "মেডিকেল ভিসা",
        transitVisa: "ট্রানজিট ভিসা",
        consultancyMigration: "কনসালটেন্সি ও মাইগ্রেশন",

        // Hero Section
        openingHour: "কার্যকরী সময়: সকাল ৯.৩০ থেকে রাত ৮.৩০",
        heroTitle: "আপনার যাত্রা শুরু হোক Visalink Air দিয়ে",
        bookAppointment: "অ্যাপয়েন্টমেন্ট বুক",
        askQuestion: "প্রশ্ন করুন",
        hotline247: "হটলাইন ২৪/৭",

        // Hero Search Tabs
        tabVisa: "ভিসা",
        tabHotel: "হোটেল",
        tabTour: "ট্যুর",
        tabFlight: "ফ্লাইট",
        selectLabel: "নির্বাচন",
        destination: "গন্তব্য",
        tourTypes: "ট্যুরের ধরন",
        search: "সার্চ",

        // Services Section
        servicesTag: "✦ আমাদের দক্ষতা",
        servicesTitle: "আমাদের",
        servicesTitleHighlight: "সেবাসমূহ",
        servicesDesc: "আপনার প্রয়োজন অনুযায়ী সম্পূর্ণ ভ্রমণ ও অভিবাসন সমাধান।",
        viewAll: "সব দেখুন",
        exploreService: "দেখুন",

        // Service Items
        visaProcessing: "ভিসা প্রসেসিং",
        visaProcessingSub: "বিশ্বব্যাপী",
        visaProcessingDesc: "বিশ্বব্যাপী ট্যুরিস্ট, ব্যবসায়িক এবং স্টুডেন্ট ভিসার জন্য বিশেষজ্ঞ সহায়তা ও প্রমাণিত সাফল্যের ইতিহাস।",
        visaProcessingStats: "৫০+ দেশ",

        flightBooking: "ফ্লাইট বুকিং",
        flightBookingSub: "সেরা ডিল",
        flightBookingDesc: "আমাদের বিশাল এয়ারলাইন নেটওয়ার্কের মাধ্যমে দেশীয় ও আন্তর্জাতিক ফ্লাইটে সেরা ডিল পান।",
        flightBookingStats: "১০০+ এয়ারলাইন",

        hotelReservation: "হোটেল রিজার্ভেশন",
        hotelReservationSub: "প্রিমিয়াম থাকা",
        hotelReservationDesc: "আরামদায়ক থাকার জন্য প্রতিযোগিতামূলক মূল্যে বিশ্বব্যাপী প্রিমিয়াম হোটেল ও রিসোর্ট বুক করুন।",
        hotelReservationStats: "৫০০০+ হোটেল",

        tourPackages: "ট্যুর প্যাকেজ",
        tourPackagesSub: "কাস্টম পরিকল্পনা",
        tourPackagesDesc: "আপনার পছন্দ, বাজেট এবং স্বপ্ন অনুযায়ী কাস্টমাইজড ছুটির প্যাকেজ।",
        tourPackagesStats: "২০০+ প্যাকেজ",

        hajjUmrahService: "হজ্জ ও ওমরাহ",
        hajjUmrahSub: "পবিত্র যাত্রা",
        hajjUmrahDesc: "অভিজ্ঞ গাইড এবং প্রিমিয়াম আবাসন সহ সম্পূর্ণ হজ্জ ও ওমরাহ প্যাকেজ।",
        hajjUmrahStats: "১০০০+ হাজী",

        studyAbroadService: "বিদেশে পড়াশোনা",
        studyAbroadSub: "বৈশ্বিক শিক্ষা",
        studyAbroadDesc: "বিশ্ববিদ্যালয় নির্বাচন ও ভিসা সহায়তা সহ বিদেশে পড়াশোনার সম্পূর্ণ গাইডেন্স।",
        studyAbroadStats: "৩০+ বিশ্ববিদ্যালয়",

        // Trusted Partners
        trustedPartners: "বিশ্বস্ত পার্টনার",

        // Benefits Section
        whyUs: "✦ কেন আমরা",
        ourBenefits: "আমাদের",
        benefitsHighlight: "সুবিধাসমূহ",
        benefitsDesc: "কেন হাজার হাজার ভ্রমণকারী তাদের যাত্রার জন্য Visalink Air বেছে নেন।",

        oneClickBooking: "ওয়ান ক্লিক বুকিং।",
        oneClickBookingDesc: "Visalink Air-র মাধ্যমে ঝামেলামুক্ত ও দ্রুত ট্যুর ও ট্রাভেল প্যাকেজ বুকিং করুন।",
        learnMore: "আরো জানুন",

        discountOffer: "ডিসকাউন্ট ও অফার।",
        discountOfferDesc: "ফ্লাইট, হোটেল এবং প্যাকেজে বিশেষ ছাড় পাওয়া যায়।",
        viewOffers: "অফার দেখুন",

        localExpertise: "স্থানীয় দক্ষতা।",
        localExpertiseDesc: "Visalink Air-র মাধ্যমে ঝামেলামুক্ত ও দ্রুত ট্যুর ও ট্রাভেল প্যাকেজ বুকিং করুন।",
        meetExperts: "বিশেষজ্ঞদের সাথে দেখা করুন",

        customizeNote: "এক ক্লিকে আপনার ট্রাভেল প্যাকেজ কাস্টমাইজ করুন।",
        customizePackage: "প্যাকেজ কাস্টমাইজ",

        // Consultation Section
        consultTag: "✦ আমরা পার্থক্য তৈরি করি",
        consultTitle: "ইমিগ্রেশন পরামর্শ",
        consultTitleHighlight: "সেবায়",
        consultTitleEnd: "স্বাগতম",
        consultDesc: "আমরা বিনিয়োগকারী ও উদ্যোক্তাদের আমাদের শীর্ষ ইমিগ্রেশন প্রোগ্রামের মাধ্যমে প্রধান দেশগুলোতে নাগরিকত্ব অর্জনে সাহায্য করি। এ ক্ষেত্রে আমাদের এক দশকের অভিজ্ঞতা রয়েছে।",
        experienceTitle: "ভিসা ও ইমিগ্রেশন সেবায় ১০+ বছরের অভিজ্ঞতা",
        experienceDesc: "আমাদের বৈশ্বিক দক্ষতা, উন্নত প্রযুক্তি ও কাস্টমাইজড ইমিগ্রেশন সমাধান আপনাকে আপনার লক্ষ্য অর্জনে সাহায্য করবে।",
        exploreMore: "আরো দেখুন",
        realAgents: "প্রকৃত এজেন্ট",

        // Why Choose Us Section
        whyVisaPro: "✦ কেন Visalink Air",
        whyChoose: "কেন বেছে নেবেন",
        us: "আমাদের",
        whyChooseDesc: "ভিসা পরামর্শ ও ভ্রমণ সেবায় বছরের পর বছরের অভিজ্ঞতা নিয়ে, আমরা আপনার স্বপ্ন পূরণে সঠিক নির্দেশনা ও বিশেষজ্ঞ সহায়তা প্রদান করি।",

        expertGuidance: "বিশেষজ্ঞ গাইডেন্স",
        expertGuidanceDesc: "অভিবাসন আইন ও পদ্ধতি সম্পর্কে গভীর জ্ঞানসম্পন্ন দক্ষ পেশাদার।",
        fastProcessing: "দ্রুত প্রসেসিং",
        fastProcessingDesc: "উচ্চ সাফল্যের হার এবং ন্যূনতম বিলম্বে দ্রুত ও দক্ষ ভিসা প্রসেসিং।",
        support247: "২৪/৭ সাপোর্ট",
        support247Desc: "আপনার সকল প্রশ্ন ও উদ্বেগের জন্য সার্বক্ষণিক গ্রাহক সেবা।",
        affordablePrices: "সাশ্রয়ী মূল্য",
        affordablePricesDesc: "সেবার মান বা সাপোর্টে আপোষ না করে প্রতিযোগিতামূলক মূল্য।",
        fiftyCountries: "৫০+ দেশ",
        fiftyCountriesDesc: "আমরা স্থানীয় দক্ষতার সাথে বিশ্বজুড়ে গন্তব্যের জন্য ভিসা প্রসেস করি।",
        successRate: "৯৮% সাফল্যের হার",
        successRateDesc: "আমাদের ক্লায়েন্টদের জন্য সফল ভিসা অনুমোদনের প্রমাণিত ট্র্যাক রেকর্ড।",

        // Stats
        yearsExperience: "বছরের অভিজ্ঞতা",
        visasProcessed: "ভিসা প্রসেস",
        statSuccessRate: "সাফল্যের হার",
        countriesCovered: "দেশ কভার",
        customerSupport: "গ্রাহক সেবা",

        // Testimonials
        testimonials: "✦ প্রশংসাপত্র",
        voicesOfOur: "আমাদের ক্লায়েন্টদের",
        clients: "মতামত",
        verifiedClient: "যাচাইকৃত ক্লায়েন্ট",

        // Footer CTA
        readyToStart: "আপনার যাত্রা শুরু করতে প্রস্তুত?",
        footerCTADesc: "ভিসা প্রসেসিং, ফ্লাইট বুকিং এবং আরো অনেক কিছুতে আমাদের বিশেষজ্ঞরা আপনাকে সাহায্য করুন",
        callNow: "এখনই কল করুন",
        freeConsultation: "বিনামূল্যে পরামর্শ",

        // Footer Brand
        footerBrandDesc: "বাংলাদেশে ভিসা প্রসেসিং, ফ্লাইট বুকিং, হোটেল রিজার্ভেশন, হজ্জ ও ওমরাহ প্যাকেজ এবং ট্যুর পরিকল্পনায় আপনার বিশ্বস্ত সঙ্গী।",
        hotlineTime: "হটলাইন (সকাল ৯:৩০ - রাত ৮:৩০)",

        // Footer Column Headings
        ourServices: "আমাদের সেবাসমূহ",
        visaTypes: "ভিসার ধরন",
        quickLinks: "দ্রুত লিঙ্ক",

        // Footer Service Links
        footerVisaProcessing: "ভিসা প্রসেসিং",
        footerFlightBooking: "ফ্লাইট বুকিং",
        footerHotelReservation: "হোটেল রিজার্ভেশন",
        footerTourPackages: "ট্যুর প্যাকেজ",
        footerHajjUmrah: "হজ্জ ও ওমরাহ",
        footerStudyAbroad: "বিদেশে পড়াশোনা",

        // Footer Visa Types
        footerTouristVisa: "ট্যুরিস্ট ভিসা",
        footerWorkingVisa: "ওয়ার্কিং ভিসা",
        footerStudentVisa: "স্টুডেন্ট ভিসা",
        footerBusinessVisa: "বিজনেস ভিসা",
        footerMedicalVisa: "মেডিকেল ভিসা",
        footerTransitVisa: "ট্রানজিট ভিসা",

        // Footer Quick Links
        aboutUs: "আমাদের সম্পর্কে",
        footerBlog: "ব্লগ",
        contactUs: "যোগাযোগ করুন",
        privacyPolicy: "গোপনীয়তা নীতি",
        termsOfService: "সেবার শর্তাবলী",
        faq: "সাধারণ জিজ্ঞাসা",

        // Footer Newsletter
        newsletter: "নিউজলেটার",
        yourEmail: "আপনার ইমেইল",

        // Footer Bottom
        acceptedPayment: "গৃহীত পেমেন্ট পদ্ধতি",
        allRightsReserved: "সর্বস্বত্ব সংরক্ষিত।",
        terms: "শর্তাবলী",
        privacy: "গোপনীয়তা",
    }
};

export function LanguageProvider({ children }) {
    // English-only mode — Bengali fully removed per client requirement.
    // Kept context surface for backwards compatibility; setters are no-ops.
    const language = 'en';
    const setLanguage = () => {};
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        document.documentElement.lang = 'en';
    }, []);

    const toggleLanguage = () => {};
    const setLanguageDirectly = () => {};

    const t = (key) => {
        return translations[language][key] || key;
    };

    if (!mounted) {
        return <>{children}</>;
    }

    return (
        <LanguageContext.Provider value={{ language, toggleLanguage, setLanguage: setLanguageDirectly, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);

    // Return safe defaults if context is not available (SSR or outside provider)
    if (!context) {
        return {
            language: 'en',
            toggleLanguage: () => { },
            setLanguage: () => { },
            t: (key) => key,
        };
    }

    return context;
}

export default LanguageProvider;
