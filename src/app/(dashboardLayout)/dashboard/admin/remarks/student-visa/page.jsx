"use client";
import { LuGraduationCap } from "react-icons/lu";
import RemarksList from "../../_shared/RemarksList";

export default function StudentVisaRemarksPage() {
    return <RemarksList service="student-visa" title="Student Visa Remarks" Icon={LuGraduationCap} accent="#7C3AED" />;
}
