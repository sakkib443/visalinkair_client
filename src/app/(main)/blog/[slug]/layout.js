// ===================================================================
// Blog post — SEO layout wrapper.
//
// The post page itself is a client component ("use client"), and
// client components CANNOT export `generateMetadata`. This server-side
// layout sits between the route and the client page purely to emit
// per-post <title>, description, keywords, canonical URL and Open
// Graph / Twitter card tags before the client shell hydrates.
//
// Reads from the same /api/blogs/slug/:slug endpoint the page uses.
// Falls back to a generic title if the fetch fails — the page still
// renders normally either way.
// ===================================================================

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export async function generateMetadata({ params }) {
    const { slug } = await params;

    let blog = null;
    try {
        const res = await fetch(`${API_BASE}/api/blogs/slug/${slug}`, {
            // Revalidate at most every 5 min — an SEO-relevant edit
            // (title/description) shows up in shared links within that window.
            next: { revalidate: 300 },
        });
        if (res.ok) {
            const data = await res.json();
            if (data?.success && data.data) blog = data.data;
        }
    } catch {
        // Ignore — fall through to the default title below.
    }

    if (!blog) {
        return {
            title: "Blog Post — Visalink Air",
            description: "Visalink Air travel & visa blog.",
        };
    }

    const title = blog.metaTitle || blog.title;
    const description = blog.metaDescription || blog.excerpt || "";
    const keywords = Array.isArray(blog.metaKeywords) && blog.metaKeywords.length
        ? blog.metaKeywords
        : (blog.tags || []);
    const url = `${SITE_URL}/blog/${blog.slug}`;
    const image = blog.thumbnail || undefined;

    return {
        title,
        description,
        keywords,
        alternates: { canonical: url },
        openGraph: {
            type: "article",
            url,
            title,
            description,
            siteName: "Visalink Air",
            images: image ? [{ url: image }] : undefined,
            publishedTime: blog.publishedAt || blog.createdAt || undefined,
            tags: blog.tags || undefined,
        },
        twitter: {
            card: image ? "summary_large_image" : "summary",
            title,
            description,
            images: image ? [image] : undefined,
        },
        robots: blog.status === "published"
            ? { index: true, follow: true }
            : { index: false, follow: false },
    };
}

// Pure pass-through — the client page handles rendering.
export default function BlogPostLayout({ children }) {
    return children;
}
