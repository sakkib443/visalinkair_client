"use client";
import { FaMosque } from "react-icons/fa6";
import RemarksList from "../../_shared/RemarksList";

export default function UmrahPackageRemarksPage() {
    return <RemarksList service="umrah-package" title="Umrah Package Remarks" Icon={FaMosque} accent="#0891B2" />;
}
