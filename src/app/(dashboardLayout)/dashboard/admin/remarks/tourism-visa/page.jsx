"use client";
import { LuMap } from "react-icons/lu";
import RemarksList from "../../_shared/RemarksList";

export default function TourismVisaRemarksPage() {
    return <RemarksList service="tourism-visa" title="Tourism Visa Remarks" Icon={LuMap} accent="var(--color-brand-accent)" />;
}
