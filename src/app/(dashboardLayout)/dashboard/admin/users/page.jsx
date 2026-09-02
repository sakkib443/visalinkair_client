"use client";

// ===================================================================
// Super Admins
// -------------------------------------------------------------------
// One role in the whole system. A super admin can create more super admins,
// view their details and delete them — nothing else. There is deliberately
// no edit action, so this page never PATCHes a user.
// ===================================================================

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
    FiSearch, FiUsers, FiTrash2, FiCalendar, FiLoader, FiX, FiShield,
    FiRefreshCw, FiMail, FiPhone, FiEye, FiUser, FiPlus, FiBook,
} from "react-icons/fi";
import { useSelector } from "react-redux";
import { selectToken, selectCurrentUser } from "@/redux/features/authSlice";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const fullName = (u) => `${u.firstName || ""} ${u.lastName || ""}`.trim();
const initials = (u) =>
    `${u.firstName?.[0] || ""}${u.lastName?.[0] || ""}`.toUpperCase() || "?";
const formatDate = (value, month = "short") =>
    value
        ? new Date(value).toLocaleDateString("en-GB", { day: "2-digit", month, year: "numeric" })
        : "N/A";

// ==================== VIEW MODAL ====================
function ViewUserModal({ user, onClose }) {
    if (!user) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header with avatar */}
                <div className="relative bg-gradient-to-br from-rose-500 to-pink-600 p-6 rounded-t-2xl">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors"
                    >
                        <FiX size={18} />
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-white text-3xl font-bold border-4 border-white/30">
                            {user.avatar ? (
                                <img src={user.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                            ) : (
                                initials(user)
                            )}
                        </div>
                        <div className="text-white">
                            <h2 className="text-2xl font-bold">{fullName(user)}</h2>
                            <p className="text-white/80">{user.email}</p>
                            <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold bg-white/20">
                                SUPER ADMIN
                            </span>
                        </div>
                    </div>
                </div>

                {/* Details */}
                <div className="p-6 space-y-4">
                    <div className="space-y-3">
                        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <FiUser className="text-primary" /> Contact Information
                        </h3>
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 space-y-3">
                            <div className="flex items-center gap-3 text-sm">
                                <FiMail className="text-gray-400" />
                                <span className="text-gray-600 dark:text-gray-300">{user.email}</span>
                            </div>
                            {user.phone && (
                                <div className="flex items-center gap-3 text-sm">
                                    <FiPhone className="text-gray-400" />
                                    <span className="text-gray-600 dark:text-gray-300">{user.phone}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <FiShield className="text-primary" /> Account Details
                        </h3>
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Member Since</span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                    {formatDate(user.createdAt, "long")}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">User ID</span>
                                <span className="font-mono text-xs text-gray-400">{user._id}</span>
                            </div>
                        </div>
                    </div>

                    {user.bio && (
                        <div className="space-y-3">
                            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <FiBook className="text-primary" /> Bio
                            </h3>
                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                                <p className="text-sm text-gray-600 dark:text-gray-300">{user.bio}</p>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}

// ==================== PAGE ====================
export default function SuperAdminsPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [viewingUser, setViewingUser] = useState(null);
    const token = useSelector(selectToken);
    const currentUser = useSelector(selectCurrentUser);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE}/api/users/admin/all?limit=100`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            const data = await res.json();

            if (data.success && data.data) {
                // Paginated response — the users array sits at data.data.data.
                setUsers(Array.isArray(data.data) ? data.data : (data.data.data || []));
            }
        } catch (err) {
            console.error("Fetch error:", err);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchUsers();
    }, [token]);

    const handleDelete = async (user) => {
        if (!confirm(`Delete ${fullName(user) || user.email}? This action cannot be undone.`)) return;
        try {
            const res = await fetch(`${API_BASE}/api/users/admin/${user._id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Super admin deleted");
                fetchUsers();
            } else {
                toast.error(data.message || "Failed to delete");
            }
        } catch {
            toast.error("Error deleting super admin");
        }
    };

    const filtered = users.filter((u) => {
        const q = search.toLowerCase();
        return u.email?.toLowerCase().includes(q) || fullName(u).toLowerCase().includes(q);
    });

    return (
        <div className="p-6 lg:p-8 space-y-6">
            <AnimatePresence>
                {viewingUser && <ViewUserModal user={viewingUser} onClose={() => setViewingUser(null)} />}
            </AnimatePresence>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg">
                        <FiShield className="text-white text-xl" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tight" style={{ fontFamily: 'Teko, sans-serif', color: 'var(--color-brand-dark)' }}>
                            Super Admins
                        </h1>
                        <p className="text-[12px] text-gray-400 mt-0.5">
                            {loading ? "Loading…" : `${users.length} account${users.length === 1 ? "" : "s"} with full platform access`}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Link href="/dashboard/admin/users/create"
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition hover:opacity-90 shadow-sm"
                        style={{ background: "var(--color-brand-accent)" }}>
                        <FiPlus size={16} /> Add Super Admin
                    </Link>
                    <button onClick={fetchUsers} className="p-2.5 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition">
                        <FiRefreshCw className={loading ? "animate-spin" : ""} />
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="card p-4">
                <div className="relative">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="input pl-12 w-full"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="card overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <FiLoader className="animate-spin text-primary" size={32} />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">
                        <FiUsers size={48} className="mx-auto mb-4 opacity-50" />
                        <p className="font-medium">No super admins found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                                    <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase">Name</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase">Email</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase">Joined</th>
                                    <th className="text-center px-6 py-4 text-xs font-bold text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {filtered.map((user) => {
                                    const isSelf = currentUser?._id === user._id;
                                    return (
                                        <motion.tr
                                            key={user._id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-sm">
                                                        {user.avatar ? (
                                                            <img src={user.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                                                        ) : (
                                                            initials(user)
                                                        )}
                                                    </div>
                                                    <div>
                                                        <button
                                                            onClick={() => setViewingUser(user)}
                                                            className="font-semibold text-gray-900 dark:text-white hover:text-primary transition-colors text-left"
                                                        >
                                                            {fullName(user) || "—"}
                                                        </button>
                                                        {isSelf && <p className="text-[11px] text-gray-400">You</p>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                                    <FiMail className="text-gray-400" size={14} />
                                                    {user.email}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                                    <FiCalendar size={14} />
                                                    {formatDate(user.createdAt)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-1">
                                                    <button
                                                        onClick={() => setViewingUser(user)}
                                                        className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors"
                                                        title="View Details"
                                                    >
                                                        <FiEye size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(user)}
                                                        disabled={isSelf}
                                                        className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 flex items-center justify-center hover:bg-red-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-red-100"
                                                        title={isSelf ? "You cannot delete your own account" : "Delete"}
                                                    >
                                                        <FiTrash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
