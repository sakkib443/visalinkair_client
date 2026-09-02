"use client";
import { FaKaaba } from "react-icons/fa6";
import RemarksList from "../../_shared/RemarksList";

export default function HajjPackageRemarksPage() {
    return <RemarksList service="hajj-package" title="Hajj Package Remarks" Icon={FaKaaba} accent="#059669" />;
}
