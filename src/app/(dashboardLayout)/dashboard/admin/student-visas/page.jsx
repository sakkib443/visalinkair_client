"use client";

import { LuGraduationCap } from "react-icons/lu";
import VisaGuideList from "../_shared/VisaGuideList";

export default function StudentVisasPage() {
    return (
        <VisaGuideList
            category="student"
            title="All Student Visas"
            Icon={LuGraduationCap}
            accent="#1D4ED8"
        />
    );
}
