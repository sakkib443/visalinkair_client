"use client";

// ===================================================================
// Add Super Admin
// -------------------------------------------------------------------
// The platform has exactly one role — super_admin. An existing super admin
// creates another one with nothing more than a name, an email and a password.
// No role picker, no designation/joining date, no client mode.
// ===================================================================

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { FiUser, FiArrowLeft, FiSave, FiLoader, FiMail, FiLock, FiEye, FiEyeOff, FiShield } from "react-icons/fi";
import { useSelector } from "react-redux";
import { selectToken } from "@/redux/features/authSlice";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// The DB stores firstName/lastName (every `${firstName} ${lastName}` render
// across the app depends on it), but the form asks for one full name.
const splitName = (full) => {
    const parts = full.trim().split(/\s+/);
    return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
};

export default function CreateSuperAdminPage() {
    const router = useRouter();
    const token = useSelector(selectToken);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [f, setF] = useState({ name: "", email: "", password: "" });
    const set = (k, v) => setF((p) => ({ ...p, [k]: v }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!f.name.trim()) return toast.error("Name is required");
        if (!/^\S+@\S+\.\S+$/.test(f.email)) return toast.error("A valid email is required");
        if (f.password.length < 6) return toast.error("Password must be at least 6 characters");

        const { firstName, lastName } = splitName(f.name);

        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/users/admin/create`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    firstName,
                    lastName,
                    email: f.email.trim().toLowerCase(),
                    password: f.password,
                }),
            });
            const data = await res.json();
            if (!res.ok || data.success === false) {
                throw new Error(data.message || data.errorSources?.[0]?.message || "Failed to create");
            }
            toast.success("Super admin created!");
            router.push("/dashboard/admin/users");
        } catch (err) {
            toast.error(err.message || "Failed to create super admin");
        } finally {
            setLoading(false);
        }
    };

    const label = "text-[13px] font-bold text-gray-500 block mb-1.5";

    return (
        <div className="min-h-[calc(100vh-60px)] flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                {/* Header */}
                <div className="flex flex-col items-center text-center mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg mb-3">
                        <FiShield className="text-white text-2xl" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Add Super Admin</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Full access to the platform. There is only one role.
                    </p>
                </div>

                <form onSubmit={handleSubmit} autoComplete="off">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
                        {/* Name */}
                        <div>
                            <label className={label}>Name *</label>
                            <div className="relative">
                                <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    value={f.name}
                                    onChange={(e) => set("name", e.target.value)}
                                    className="input pl-11"
                                    placeholder="Full name"
                                    required
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className={label}>Email Address *</label>
                            <div className="relative">
                                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="email"
                                    name="account-email"
                                    autoComplete="off"
                                    value={f.email}
                                    onChange={(e) => set("email", e.target.value)}
                                    className="input pl-11"
                                    placeholder="admin@example.com"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className={label}>Password *</label>
                            <div className="relative">
                                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="account-new-password"
                                    autoComplete="new-password"
                                    value={f.password}
                                    onChange={(e) => set("password", e.target.value)}
                                    className="input pl-11 pr-12"
                                    placeholder="Min 6 characters"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex gap-3 mt-5">
                        <Link
                            href="/dashboard/admin/users"
                            className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-gray-50 transition"
                        >
                            <FiArrowLeft size={15} /> Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-3 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60 transition hover:opacity-90"
                            style={{ background: "var(--color-brand-accent)" }}
                        >
                            {loading ? <FiLoader className="animate-spin" /> : <FiSave />} Create Super Admin
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
