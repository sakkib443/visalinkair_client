"use client";

// ===================================================================
// Study Abroad (Student Visa) landing — search bar only. Overrides the
// dynamic /services/[slug] route so CMS content is bypassed for this
// service. The country list is whatever super admin has published under
// Dashboard → Student Visa. Search routes to /visa/details/student/[slug].
// ===================================================================

import VisaSearchLanding from "@/components/shared/VisaSearchLanding";

export default function StudyAbroadPage() {
    return <VisaSearchLanding variant="student" />;
}
