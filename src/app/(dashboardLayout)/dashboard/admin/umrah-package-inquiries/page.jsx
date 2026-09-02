"use client";

import { FaMosque } from "react-icons/fa6";
import PackageInquiries from "../_shared/PackageInquiries";

export default function UmrahPackageInquiriesPage() {
    return (
        <PackageInquiries
            service="umrah-package"
            title="Umrah Package Inquiry"
            prefix="UMR"
            IconComponent={FaMosque}
        />
    );
}
