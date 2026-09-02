"use client";

import { FaKaaba } from "react-icons/fa6";
import PackageInquiries from "../_shared/PackageInquiries";

export default function HajjPackageInquiriesPage() {
    return (
        <PackageInquiries
            service="hajj-package"
            title="Hajj Package Inquiry"
            prefix="HAJ"
            IconComponent={FaKaaba}
        />
    );
}
