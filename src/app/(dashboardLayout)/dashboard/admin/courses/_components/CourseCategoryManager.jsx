"use client";

// ===================================================================
// CourseCategoryManager
//
// কোর্স ফর্মের একদম উপরে বসে। এখান থেকেই অ্যাডমিন —
//   • সেভ করা ক্যাটাগরি থেকে একটা বেছে নিতে পারে
//   • নতুন ক্যাটাগরি সাথে সাথে তৈরি করে নিতে পারে (ফর্ম ছেড়ে যেতে হয় না)
//   • ভুল করে বানানো ক্যাটাগরি রিনেম বা ডিলিট করতে পারে
//
// নতুন ক্যাটাগরি বানানোর পরপরই সেটা সিলেক্ট হয়ে যায়, কারণ ইউজার ওটাতেই
// কোর্সটা রাখতে চেয়ে ক্যাটাগরিটা বানিয়েছে।
// ===================================================================

import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
    FiCheck, FiEdit2, FiFolder, FiLoader, FiPlus, FiTrash2, FiX,
} from "react-icons/fi";
import { selectToken } from "@/redux/features/authSlice";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function CourseCategoryManager({ value, onChange, inputClass }) {
    const token = useSelector(selectToken);

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [busyId, setBusyId] = useState(null);

    // নতুন ক্যাটাগরির ইনপুট প্যানেল
    const [showAdd, setShowAdd] = useState(false);
    const [newName, setNewName] = useState("");

    // ইনলাইন রিনেম
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState("");

    const authHeaders = useCallback(
        (json = false) => ({
            ...(json && { "Content-Type": "application/json" }),
            ...(token && { Authorization: `Bearer ${token}` }),
        }),
        [token]
    );

    const fetchCategories = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/courses/categories`, {
                headers: authHeaders(),
            });
            const data = await res.json();
            setCategories(data.success && Array.isArray(data.data) ? data.data : []);
        } catch {
            toast.error("Failed to load categories");
            setCategories([]);
        } finally {
            setLoading(false);
        }
    }, [authHeaders]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    // ==================== Create ====================
    const handleCreate = async (e) => {
        // প্যানেলটা কোর্স ফর্মের ভেতরে বসে, তাই Enter/ক্লিকে বাইরের ফর্মটা
        // যেন সাবমিট হয়ে না যায় — এখানেই ইভেন্টটা থামিয়ে দেওয়া হচ্ছে।
        e.preventDefault();
        e.stopPropagation();

        const name = newName.trim();
        if (name.length < 2) {
            toast.error("Category name must be at least 2 characters");
            return;
        }

        setCreating(true);
        try {
            const res = await fetch(`${API_BASE}/api/courses/categories`, {
                method: "POST",
                headers: authHeaders(true),
                body: JSON.stringify({ name }),
            });
            const data = await res.json();

            if (data.success && data.data) {
                setCategories((prev) => [...prev, data.data]);
                onChange(data.data._id); // যেটা বানালো সেটাই সিলেক্ট হয়ে যাক
                setNewName("");
                setShowAdd(false);
                toast.success("Category created");
            } else {
                toast.error(data.message || "Failed to create category");
            }
        } catch {
            toast.error("Something went wrong");
        } finally {
            setCreating(false);
        }
    };

    // ==================== Rename ====================
    const handleRename = async (id) => {
        const name = editName.trim();
        if (name.length < 2) {
            toast.error("Category name must be at least 2 characters");
            return;
        }

        setBusyId(id);
        try {
            const res = await fetch(`${API_BASE}/api/courses/categories/${id}`, {
                method: "PATCH",
                headers: authHeaders(true),
                body: JSON.stringify({ name }),
            });
            const data = await res.json();

            if (data.success && data.data) {
                setCategories((prev) => prev.map((c) => (c._id === id ? data.data : c)));
                setEditingId(null);
                toast.success("Category updated");
            } else {
                toast.error(data.message || "Failed to update category");
            }
        } catch {
            toast.error("Something went wrong");
        } finally {
            setBusyId(null);
        }
    };

    // ==================== Delete ====================
    const handleDelete = async (cat) => {
        if (!confirm(`Delete the category "${cat.name}"?`)) return;

        setBusyId(cat._id);
        try {
            const res = await fetch(`${API_BASE}/api/courses/categories/${cat._id}`, {
                method: "DELETE",
                headers: authHeaders(),
            });
            const data = await res.json();

            if (data.success) {
                setCategories((prev) => prev.filter((c) => c._id !== cat._id));
                // মুছে ফেলা ক্যাটাগরি সিলেক্ট করা থাকলে সিলেকশনটাও ছেড়ে দিতে হবে,
                // নাহলে ফর্ম এমন একটা আইডি পাঠাত যা আর ডাটাবেজে নেই।
                if (value === cat._id) onChange("");
                toast.success("Category deleted");
            } else {
                // সার্ভার বলে দেয় কয়টা কোর্স এই ক্যাটাগরিতে আছে
                toast.error(data.message || "Failed to delete category");
            }
        } catch {
            toast.error("Something went wrong");
        } finally {
            setBusyId(null);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700/50 p-5">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <FiFolder size={14} style={{ color: "var(--color-brand-accent)" }} />
                    <h2 className="text-[13px] font-bold uppercase tracking-wider text-gray-500">
                        Course Category *
                    </h2>
                </div>
                <button
                    type="button"
                    onClick={() => setShowAdd((s) => !s)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white"
                    style={{ backgroundColor: "var(--color-brand-dark)" }}
                >
                    {showAdd ? <FiX size={12} /> : <FiPlus size={12} />}
                    {showAdd ? "Cancel" : "New Category"}
                </button>
            </div>

            {/* ==================== নতুন ক্যাটাগরি প্যানেল ==================== */}
            {showAdd && (
                <div className="mb-4 p-4 rounded-lg bg-[#F8FAFC] dark:bg-gray-700/30 border border-dashed border-gray-200 dark:border-gray-600">
                    <label className="text-[11px] font-bold uppercase text-gray-400 mb-1.5 block">
                        Category Name *
                    </label>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <input
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleCreate(e);
                            }}
                            className={`${inputClass} sm:flex-1`}
                            placeholder="e.g. IELTS Preparation"
                        />
                        <button
                            type="button"
                            onClick={handleCreate}
                            disabled={creating}
                            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-[11px] font-semibold text-white bg-brand-blue hover:bg-brand-blue-hover disabled:opacity-50 whitespace-nowrap"
                        >
                            {creating ? <FiLoader size={12} className="animate-spin" /> : <FiCheck size={12} />}
                            Create Category
                        </button>
                    </div>
                </div>
            )}

            {/* ==================== ক্যাটাগরি লিস্ট ==================== */}
            {loading ? (
                <div className="flex items-center gap-2 py-6 justify-center text-gray-400">
                    <FiLoader size={16} className="animate-spin" />
                    <span className="text-[12px]">Loading categories...</span>
                </div>
            ) : categories.length === 0 ? (
                <div className="py-8 text-center">
                    <FiFolder size={28} className="text-gray-200 mx-auto mb-2" />
                    <p className="text-[12px] text-gray-400">
                        No categories yet — click{" "}
                        <span className="font-semibold text-gray-500">New Category</span> above to create the first one
                    </p>
                </div>
            ) : (
                <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => {
                        const selected = value === cat._id;
                        const busy = busyId === cat._id;

                        if (editingId === cat._id) {
                            return (
                                <div
                                    key={cat._id}
                                    className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg border border-brand-blue bg-white dark:bg-gray-700"
                                >
                                    <input
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                handleRename(cat._id);
                                            }
                                            if (e.key === "Escape") setEditingId(null);
                                        }}
                                        autoFocus
                                        className="w-40 px-2 py-1 text-[12px] bg-transparent outline-none text-gray-700 dark:text-gray-200"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleRename(cat._id)}
                                        disabled={busy}
                                        className="w-6 h-6 rounded flex items-center justify-center text-green-600 hover:bg-green-50"
                                    >
                                        {busy ? <FiLoader size={12} className="animate-spin" /> : <FiCheck size={12} />}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setEditingId(null)}
                                        className="w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:bg-gray-100"
                                    >
                                        <FiX size={12} />
                                    </button>
                                </div>
                            );
                        }

                        return (
                            <div
                                key={cat._id}
                                className={`group flex items-center gap-1 rounded-lg border transition-all ${
                                    selected
                                        ? "border-brand-blue bg-brand-blue-soft dark:bg-brand-blue/10"
                                        : "border-gray-200 dark:border-gray-600 hover:border-gray-300"
                                }`}
                            >
                                <button
                                    type="button"
                                    onClick={() => onChange(cat._id)}
                                    className={`pl-3 pr-1.5 py-2 text-[12px] font-semibold ${
                                        selected
                                            ? "text-brand-blue"
                                            : "text-gray-600 dark:text-gray-300"
                                    }`}
                                >
                                    {selected && <FiCheck size={11} className="inline mr-1 -mt-0.5" />}
                                    {cat.name}
                                </button>

                                <span className="flex items-center pr-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditingId(cat._id);
                                            setEditName(cat.name);
                                        }}
                                        className="w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                                        title="Rename"
                                    >
                                        <FiEdit2 size={11} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(cat)}
                                        disabled={busy}
                                        className="w-6 h-6 rounded flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-50"
                                        title="Delete"
                                    >
                                        {busy ? <FiLoader size={11} className="animate-spin" /> : <FiTrash2 size={11} />}
                                    </button>
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}

            <p className="mt-3 text-[11px] text-gray-400">
                Pick the category this course belongs to, or click
                <span className="font-semibold text-gray-500"> New Category</span> to add one.
            </p>
        </div>
    );
}
