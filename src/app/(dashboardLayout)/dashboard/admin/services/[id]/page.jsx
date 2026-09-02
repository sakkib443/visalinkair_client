"use client";

import { use, useEffect, useState } from "react";
import { FiLoader } from "react-icons/fi";
import { servicesApi } from "@/services/api";
import ServiceEditor from "../_components/ServiceEditor";

export default function EditServicePage({ params }) {
    const { id } = use(params);
    const [doc, setDoc] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const res = await servicesApi.getById(id);
                setDoc(res.data);
            } catch {
                setDoc(null);
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <FiLoader className="w-6 h-6 text-brand-blue animate-spin" />
            </div>
        );
    }
    if (!doc) {
        return <div className="p-6 text-gray-500">Service not found.</div>;
    }
    return <ServiceEditor initial={doc} id={id} />;
}
