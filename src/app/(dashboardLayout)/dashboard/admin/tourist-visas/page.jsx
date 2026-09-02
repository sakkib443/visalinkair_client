"use client";

import { LuMap } from "react-icons/lu";
import VisaGuideList from "../_shared/VisaGuideList";

export default function TouristVisasPage() {
    return (
        <VisaGuideList
            category="tourist"
            title="All Tourist Visas"
            Icon={LuMap}
            accent="var(--color-brand-accent)"
        />
    );
}
