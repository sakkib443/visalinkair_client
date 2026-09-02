"use client";

// Add / Edit a Student Visa page. Same route serves both — `?edit=<id>`
// switches it into edit mode.

import VisaGuideEditor from "../../_shared/VisaGuideEditor";

export default function CreateStudentVisaPage() {
    return <VisaGuideEditor category="student" accent="#1D4ED8" />;
}
