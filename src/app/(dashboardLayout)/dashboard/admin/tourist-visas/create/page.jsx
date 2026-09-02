"use client";

// Add / Edit a Tourist Visa page. Same route serves both — `?edit=<id>`
// switches it into edit mode.

import VisaGuideEditor from "../../_shared/VisaGuideEditor";

export default function CreateTouristVisaPage() {
    return <VisaGuideEditor category="tourist" accent="var(--color-brand-accent)" />;
}
