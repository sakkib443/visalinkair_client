"use client";
import { LuPlane } from "react-icons/lu";
import RemarksList from "../../_shared/RemarksList";

export default function FlightRemarksPage() {
    return <RemarksList service="flight-booking" title="Flight Remarks" Icon={LuPlane} accent="var(--color-brand-blue)" />;
}
