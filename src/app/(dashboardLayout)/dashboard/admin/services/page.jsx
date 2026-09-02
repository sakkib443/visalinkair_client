"use client";

// ===================================================================
// Admin — Services list
// View / toggle active / delete / open editor for every CMS service.
// ===================================================================

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
    FiPlus, FiEdit2, FiTrash2, FiLoader, FiEye, FiEyeOff, FiExternalLink, FiRefreshCw,
} from "react-icons/fi";
import { servicesApi } from "@/services/api";

const TYPE_LABEL = {
    study_abroad: "Study Abroad",
    passport: "Passport",
    banking: "Banking",
    career: "Career",
    course: "Course",
    other: "Other",
};

export default function ServicesListPage() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState(null);

    const load = async () => {
        setLoading(true);
        try {
            const res = await servicesApi.listAll();
            setItems(res.data || []);
        } catch (err) {
            toast.error(err.message || "Failed to load services");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const toggleActive = async (svc) => {
        setBusyId(svc._id);
        try {
            await servicesApi.update(svc._id, { isActive: !svc.isActive });
            toast.success(svc.isActive ? "Hidden" : "Published");
            load();
        } catch (err) {
            toast.error(err.message || "Failed to update");
        } finally {
            setBusyId(null);
        }
    };

    const remove = async (svc) => {
        if (!confirm(`Delete "${svc.title?.en || svc.slug}"? This cannot be undone.`)) return;
        setBusyId(svc._id);
        try {
            await servicesApi.remove(svc._id);
            toast.success("Deleted");
            load();
        } catch (err) {
            toast.error(err.message || "Failed to delete");
        } finally {
            setBusyId(null);
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-black text-brand-dark" style={{ fontFamily: "Teko, sans-serif" }}>
                        SERVICE PAGES
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        CMS-driven landing pages — edit content, sections, SEO, and visibility.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={load}
                        className="p-2.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                        aria-label="Refresh"
                    >
                        <FiRefreshCw className="w-4 h-4" />
                    </button>
                    <Link
                        href="/dashboard/admin/services/create"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand-blue hover:bg-brand-blue-hover text-white text-sm font-semibold"
                    >
                        <FiPlus className="w-4 h-4" /> New Service
                    </Link>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="py-24 flex items-center justify-center">
                    <FiLoader className="w-6 h-6 text-brand-blue animate-spin" />
                </div>
            ) : items.length === 0 ? (
                <div className="py-24 text-center border border-dashed border-gray-200 rounded-2xl">
                    <p className="text-gray-500 mb-3">No services yet.</p>
                    <Link
                        href="/dashboard/admin/services/create"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand-blue text-white text-sm font-semibold"
                    >
                        <FiPlus className="w-4 h-4" /> Create the first one
                    </Link>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr className="text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">
                                <th className="px-5 py-3">Service</th>
                                <th className="px-5 py-3">Type</th>
                                <th className="px-5 py-3">Slug</th>
                                <th className="px-5 py-3">Order</th>
                                <th className="px-5 py-3">Status</th>
                                <th className="px-5 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {items.map((s) => (
                                <tr key={s._id} className="hover:bg-gray-50/60">
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            {s.icon ? (
                                                <span className="w-9 h-9 rounded-lg bg-brand-blue/10 text-lg flex items-center justify-center">
                                                    {s.icon}
                                                </span>
                                            ) : (
                                                <span className="w-9 h-9 rounded-lg bg-gray-100" />
                                            )}
                                            <div>
                                                <p className="font-semibold text-brand-dark">{s.title?.en || "(untitled)"}</p>
                                                {s.title?.bn && (
                                                    <p className="text-xs text-gray-500" style={{ fontFamily: "Hind Siliguri, sans-serif" }}>
                                                        {s.title.bn}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-sm text-gray-600">
                                        {TYPE_LABEL[s.type] || s.type}
                                    </td>
                                    <td className="px-5 py-4 text-sm">
                                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">{s.slug}</code>
                                    </td>
                                    <td className="px-5 py-4 text-sm text-gray-600">{s.order ?? 0}</td>
                                    <td className="px-5 py-4">
                                        <button
                                            onClick={() => toggleActive(s)}
                                            disabled={busyId === s._id}
                                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                                s.isActive
                                                    ? "bg-green-50 text-green-700 border border-green-200"
                                                    : "bg-gray-100 text-gray-500 border border-gray-200"
                                            }`}
                                        >
                                            {s.isActive ? <><FiEye size={11} /> Live</> : <><FiEyeOff size={11} /> Hidden</>}
                                        </button>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center justify-end gap-1.5">
                                            <a
                                                href={`/services/${s.slug}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-brand-blue"
                                                title="View public page"
                                            >
                                                <FiExternalLink size={15} />
                                            </a>
                                            <Link
                                                href={`/dashboard/admin/services/${s._id}`}
                                                className="p-2 rounded-lg text-gray-500 hover:bg-blue-50 hover:text-blue-600"
                                                title="Edit"
                                            >
                                                <FiEdit2 size={15} />
                                            </Link>
                                            <button
                                                onClick={() => remove(s)}
                                                disabled={busyId === s._id}
                                                className="p-2 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                                                title="Delete"
                                            >
                                                <FiTrash2 size={15} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
