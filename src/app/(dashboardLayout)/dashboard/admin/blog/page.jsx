"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { selectToken } from "@/redux/features/authSlice";
import {
    FiPlus, FiSearch, FiFileText, FiLoader, FiEdit, FiTrash2, FiEye,
    FiRefreshCw, FiCalendar, FiUser, FiMessageCircle
} from "react-icons/fi";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function AdminBlogPage() {
    const token = useSelector(selectToken);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/blogs?limit=100`);
            const data = await res.json();
            if (data.success && data.data) {
                setPosts(data.data);
            }
        } catch (err) {
            console.error("Failed to fetch blogs:", err);
            toast.error("Failed to fetch blogs");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleDelete = async (id) => {
        if (!confirm("Delete this post?")) return;
        try {
            const res = await fetch(`${API_BASE}/api/blogs/${id}`, {
                method: "DELETE",
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Deleted successfully");
                fetchData();
            } else {
                toast.error(data.message || "Failed to delete");
            }
        } catch { toast.error("Failed to delete"); }
    };

    const filtered = posts.filter(p => {
        const matchSearch = p.title?.toLowerCase().includes(search.toLowerCase());
        const matchFilter = filter === "all" || p.status === filter;
        return matchSearch && matchFilter;
    });

    const getStatusBadge = (status) => ({
        published: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
        draft: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
        archived: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400",
    }[status] || "bg-gray-100 text-gray-600");

    return (
        <div className="p-6 lg:p-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                        <FiFileText className="text-white text-xl" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Blog Posts</h1>
                        <p className="text-sm text-gray-500">{posts.length} posts</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button onClick={fetchData} className="p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer">
                        <FiRefreshCw className={loading ? "animate-spin" : ""} />
                    </button>
                    <Link href="/dashboard/admin/blog/create" className="flex items-center gap-2 px-4 py-2 bg-brand-dark text-white rounded-lg text-sm font-semibold hover:bg-[#032b1e] transition-colors">
                        <FiPlus /> New Post
                    </Link>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        placeholder="Search posts..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm outline-none focus:border-brand-dark focus:ring-1 focus:ring-brand-dark/10"
                    />
                </div>
                <div className="flex gap-2">
                    {["all", "published", "draft"].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase cursor-pointer transition-colors ${filter === f
                                ? "bg-brand-dark text-white"
                                : "bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-gray-200"
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><FiLoader className="animate-spin text-brand-dark" size={32} /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map((post, i) => (
                        <motion.div key={post._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden group">
                            <div className="relative aspect-video bg-gray-100 dark:bg-gray-700 overflow-hidden">
                                <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                <div className="absolute top-3 right-3">
                                    <span className={`px-2 py-1 rounded-lg text-xs font-bold capitalize ${getStatusBadge(post.status)}`}>{post.status}</span>
                                </div>
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <Link href={`/blog/${post.slug}`} target="_blank" className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-blue-500 hover:text-white transition-colors"><FiEye /></Link>
                                    <Link href={`/dashboard/admin/blog/${post._id}/edit`} className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-brand-accent hover:text-white transition-colors"><FiEdit /></Link>
                                    <button onClick={() => handleDelete(post._id)} className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors cursor-pointer"><FiTrash2 /></button>
                                </div>
                            </div>
                            <div className="p-5">
                                <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">{post.title}</h3>
                                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                                    <FiUser size={14} />
                                    <span>{post.author?.firstName || 'Admin'} {post.author?.lastName || ''}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-100 dark:border-gray-700">
                                    <span className="flex items-center gap-1"><FiEye />{post.totalViews || 0}</span>
                                    <span className="flex items-center gap-1"><FiMessageCircle />{post.commentCount || 0}</span>
                                    <span className="flex items-center gap-1"><FiCalendar />{new Date(post.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {!loading && filtered.length === 0 && (
                <div className="text-center py-20">
                    <FiFileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-400 text-sm">No posts found</p>
                </div>
            )}
        </div>
    );
}
