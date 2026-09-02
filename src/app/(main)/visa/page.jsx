"use client";

// ===================================================================
// Tourism Visa landing — search bar only. The country list is whatever
// super admin has published under Dashboard → Tourist Visa. Search routes
// to /visa/details/tourist/[slug], where the requirements and the
// "Request Visa Assistance" form live.
// ===================================================================

import VisaSearchLanding from "@/components/shared/VisaSearchLanding";

export default function VisaPage() {
    return <VisaSearchLanding variant="tourist" />;
}
