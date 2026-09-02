"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from "react-icons/fi";
import { setCredentials } from "@/redux/features/authSlice";
import { authService } from "@/services/api";
import Logo from "@/components/shared/Logo";

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const dispatch = useDispatch();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            const response = await authService.login(data);

            if (response.success) {
                // Check role BEFORE dispatching credentials or showing success —
                // otherwise a valid non-admin login flashes "Login successful"
                // and "This site is admin-only" at the same time.
                const role = response.data.user.role;
                if (role !== "super_admin") {
                    toast.error("This site is admin-only.");
                    return;
                }
                dispatch(setCredentials({
                    user: response.data.user,
                    token: response.data.tokens.accessToken,
                }));
                toast.success("Login successful!");
                router.push("/dashboard/admin");
            }
        } catch (error) {
            toast.error(error.message || "Login failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex-1 flex items-center justify-center px-4 py-14 md:py-20 bg-[#F8FAFC]" style={{ fontFamily: 'Poppins, sans-serif' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-[420px] bg-white rounded-2xl border border-gray-100 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.15)] p-7 md:p-10"
            >
                {/* Logo */}
                <Link href="/" className="flex items-center justify-center mb-6">
                    <Logo className="h-16 w-auto" />
                </Link>

                {/* Header */}
                <div className="mb-7 text-center">
                    <h1 className="text-3xl font-black uppercase tracking-tight mb-2" style={{ fontFamily: 'Teko, sans-serif', color: 'var(--color-brand-dark)' }}>
                        Admin Sign In
                    </h1>
                    <p className="text-sm text-gray-500 font-normal">
                        Restricted to authorized administrators.
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    {/* Email */}
                    <div>
                        <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-2">
                            Email Address
                        </label>
                        <div className="relative">
                            <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                            <input
                                type="email"
                                {...register("email", {
                                    required: "Email is required",
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: "Invalid email address",
                                    },
                                })}
                                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15 transition-all"
                                placeholder="you@example.com"
                            />
                        </div>
                        {errors.email && (
                            <p className="text-red-500 text-[11px] mt-1.5">{errors.email.message}</p>
                        )}
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-2">
                            Password
                        </label>
                        <div className="relative">
                            <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                            <input
                                type={showPassword ? "text" : "password"}
                                {...register("password", {
                                    required: "Password is required",
                                    minLength: {
                                        value: 6,
                                        message: "Password must be at least 6 characters",
                                    },
                                })}
                                className="w-full pl-11 pr-11 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15 transition-all"
                                placeholder="Enter your password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
                            >
                                {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-red-500 text-[11px] mt-1.5">{errors.password.message}</p>
                        )}
                    </div>

                    {/* Remember & Forgot */}
                    <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" className="w-3.5 h-3.5 rounded border-gray-300 accent-brand-dark" />
                            <span className="text-[12px] text-gray-500">Remember me</span>
                        </label>
                        <Link href="/contact" className="text-[12px] font-semibold hover:underline" style={{ color: 'var(--color-brand-blue)' }}>
                            Forgot password?
                        </Link>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3.5 rounded-xl text-[11px] font-bold uppercase tracking-widest text-white transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                        style={{ background: 'linear-gradient(135deg, var(--color-brand-dark) 0%, var(--color-brand-dark-hover) 100%)' }}
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Signing in...
                            </>
                        ) : (
                            <>
                                Sign In
                                <FiArrowRight size={14} />
                            </>
                        )}
                    </button>
                </form>

                {/* Fine print */}
                <p className="text-center text-[10px] text-gray-400 mt-6">
                    By signing in, you agree to our{" "}
                    <Link href="/privacy-policy" className="underline hover:text-gray-600">Terms</Link>
                    {" "}and{" "}
                    <Link href="/privacy-policy" className="underline hover:text-gray-600">Privacy Policy</Link>
                </p>
            </motion.div>
        </div>
    );
}
