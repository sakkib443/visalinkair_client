// ===================================================================
// Visalink Air - API Service Layer
// সব API calls এখান থেকে হবে
// ===================================================================

// API Base URL
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Get auth token
const getToken = () => {
    if (typeof window !== "undefined") {
        const auth = localStorage.getItem("visapro-auth");
        if (auth) {
            try {
                return JSON.parse(auth).token;
            } catch {
                return null;
            }
        }
    }
    return null;
};

// Fetch wrapper with auth
export const apiFetch = async (endpoint, options = {}) => {
    const token = getToken();

    const config = {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,
        },
    };

    const response = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
        // Auto-logout + redirect ONLY when an authenticated request's token
        // expired/invalidated (i.e. a token was actually sent). A failed LOGIN
        // also returns 401 but has no token — that must surface as an error
        // (toast), not a full-page redirect that swallows the message.
        if (response.status === 401 && token && typeof window !== "undefined") {
            localStorage.removeItem("visapro-auth");
            window.location.href = "/login";
            return;
        }
        const error = new Error(data.message || "Something went wrong");
        error.errorSources = data.errorSources;
        error.data = data;
        throw error;
    }

    return data;
};

// ==================== AUTH SERVICE ====================
// Admin-only site: no public registration. New admins are created by
// super_admin via the user service below.
export const authService = {
    login: (credentials) => apiFetch('/api/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),

    getMe: () => apiFetch('/api/users/me'),

    updateProfile: (data) => apiFetch('/api/users/me', { method: 'PATCH', body: JSON.stringify(data) }),

    changePassword: (data) => apiFetch('/api/users/change-password', { method: 'PATCH', body: JSON.stringify(data) }),
};

// ==================== SERVICE CMS (Admin) ====================
export const servicesApi = {
    listPublic: (params = '') => {
        const qs = typeof params === 'object' ? '?' + new URLSearchParams(params).toString() : params;
        return apiFetch(`/api/services${qs}`);
    },
    listAll: () => apiFetch('/api/services?all=1'),
    getBySlug: (slug) => apiFetch(`/api/services/${slug}`),
    getById: (id) => apiFetch(`/api/services/id/${id}`),
    create: (data) => apiFetch('/api/services', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiFetch(`/api/services/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    remove: (id) => apiFetch(`/api/services/${id}`, { method: 'DELETE' }),
};

// ==================== INQUIRIES ====================
export const inquiriesApi = {
    // Public — the only unauthenticated call here. Every public form
    // (flight, package, course…) posts through this one endpoint and is
    // told apart later by its `service` field.
    create: (data) => apiFetch('/api/inquiries', { method: 'POST', body: JSON.stringify(data) }),

    list: (params = {}) => {
        const qs = '?' + new URLSearchParams(params).toString();
        return apiFetch(`/api/inquiries${qs}`);
    },
    stats: () => apiFetch('/api/inquiries/stats'),
    getById: (id) => apiFetch(`/api/inquiries/${id}`),
    update: (id, data) => apiFetch(`/api/inquiries/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    remove: (id) => apiFetch(`/api/inquiries/${id}`, { method: 'DELETE' }),
};

// ==================== COURSES ====================
// `listActive` / `getBySlug` / `listCategories` are public and return only
// active rows — they are what the public /courses pages read. Create,
// update and delete live in the admin dashboard and are super_admin-only.
export const coursesApi = {
    listActive: () => apiFetch('/api/courses/active'),
    listFeatured: () => apiFetch('/api/courses/featured'),
    listCategories: () => apiFetch('/api/courses/categories'),
    getBySlug: (slug) => apiFetch(`/api/courses/slug/${slug}`),
    getById: (id) => apiFetch(`/api/courses/${id}`),
};

// ==================== VISA GUIDES (Tourist / Student visa pages) ====================
// `listPublic` / `getPublic` hit unauthenticated endpoints and return only
// active guides — they are what the public site's country search and
// details page read. Everything else is super_admin-only.
export const visaGuideService = {
    // Public
    listPublic: (category) =>
        apiFetch(`/api/visa-guides/public/countries${category ? `?category=${category}` : ''}`),
    getPublic: (category, countrySlug) =>
        apiFetch(`/api/visa-guides/public/${category}/${countrySlug}`),

    // Admin
    getAll: (params = {}) => {
        const qs = '?' + new URLSearchParams(params).toString();
        return apiFetch(`/api/visa-guides${qs}`);
    },
    getById: (id) => apiFetch(`/api/visa-guides/${id}`),
    create: (data) => apiFetch('/api/visa-guides', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiFetch(`/api/visa-guides/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    toggle: (id) => apiFetch(`/api/visa-guides/${id}/toggle`, { method: 'PATCH' }),
    remove: (id) => apiFetch(`/api/visa-guides/${id}`, { method: 'DELETE' }),
};

// ==================== USER SERVICE (Admin) ====================
export const userService = {
    getAll: (params = "") => {
        const queryString = typeof params === 'object'
            ? '?' + new URLSearchParams(params).toString()
            : params;
        return apiFetch(`/api/users/admin/all${queryString}`);
    },

    getById: (id) => apiFetch(`/api/users/admin/${id}`),

    create: (data) => apiFetch('/api/users/admin/create', { method: 'POST', body: JSON.stringify(data) }),

    delete: (id) => apiFetch(`/api/users/admin/${id}`, { method: 'DELETE' }),

    getStats: () => apiFetch('/api/users/admin/stats'),
};

// ==================== BLOG SERVICE ====================
export const blogService = {
    getAll: (params = "") => {
        const queryString = typeof params === 'object'
            ? '?' + new URLSearchParams(params).toString()
            : params;
        return apiFetch(`/api/blogs${queryString}`);
    },

    getById: (id) => apiFetch(`/api/blogs/${id}`),

    getBySlug: (slug) => apiFetch(`/api/blogs/slug/${slug}`),

    create: (data) => apiFetch("/api/blogs", { method: "POST", body: JSON.stringify(data) }),

    update: (id, data) => apiFetch(`/api/blogs/${id}`, { method: "PATCH", body: JSON.stringify(data) }),

    delete: (id) => apiFetch(`/api/blogs/${id}`, { method: "DELETE" }),
};

// ==================== REMARK SERVICE ====================
// One remark record per inquiry. `create` opens the first remark;
// PATCH keeps editing it or appends follow-ups. `getByInquiry` is a
// 200-with-null probe used by the modal to switch to edit mode.
export const remarkService = {
    list: (params = {}) => {
        const qs = '?' + new URLSearchParams(params).toString();
        return apiFetch(`/api/remarks${qs}`);
    },
    stats: (params = {}) => {
        const qs = '?' + new URLSearchParams(params).toString();
        return apiFetch(`/api/remarks/stats${qs}`);
    },
    getByInquiry: (inquiryId) => apiFetch(`/api/remarks/by-inquiry/${inquiryId}`),
    getById: (id) => apiFetch(`/api/remarks/${id}`),
    create: (data) => apiFetch('/api/remarks', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiFetch(`/api/remarks/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    remove: (id) => apiFetch(`/api/remarks/${id}`, { method: 'DELETE' }),
};

// ==================== UPLOAD SERVICE ====================
export const uploadService = {
    uploadImage: async (file) => {
        const token = getToken();
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch(`${API_BASE}/api/upload/single`, {
            method: 'POST',
            headers: {
                ...(token && { Authorization: `Bearer ${token}` }),
            },
            body: formData,
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Upload failed');
        return data;
    },
};

// (visaCategoryService removed with the Visa Categories feature.
//  Countries no longer reference a category collection — the categorySlug
//  field on a Country's visa type is now a free-form string.)

// (countryService removed with the Countries feature.
//  Country pickers now consume the visa-guide public country list
//  via GET /api/visa-guides/public/countries — see VisaSearchLanding.)

// ==================== HOTEL SERVICE ====================
export const hotelService = {
    getAll: (params = "") => {
        const queryString = typeof params === 'object'
            ? '?' + new URLSearchParams(params).toString()
            : params;
        return apiFetch(`/api/hotels${queryString}`);
    },

    getActive: () => apiFetch('/api/hotels/active'),

    getFeatured: () => apiFetch('/api/hotels/featured'),

    getById: (id) => apiFetch(`/api/hotels/${id}`),

    getBySlug: (slug) => apiFetch(`/api/hotels/slug/${slug}`),

    create: (data) => apiFetch('/api/hotels', { method: 'POST', body: JSON.stringify(data) }),

    update: (id, data) => apiFetch(`/api/hotels/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

    delete: (id) => apiFetch(`/api/hotels/${id}`, { method: 'DELETE' }),
};

// (visaDocumentService removed with the Documents feature.)

// ==================== ANALYTICS SERVICE ====================
export const analyticsService = {
    getDashboard: () => apiFetch('/api/analytics/dashboard'),
};

// ==================== HOME CONTENT SERVICE ====================
export const homeContentService = {
    getAll: () => apiFetch('/api/home-content'),
    getSection: (section) => apiFetch(`/api/home-content/${section}`),
    updateSection: (section, data) => apiFetch(`/api/home-content/${section}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),
    seed: () => apiFetch('/api/home-content/seed', { method: 'POST' }),
};

// ==================== LEGAL POLICY SERVICE ====================
// Privacy Policy & Refund/Cancellation Policy (type: 'privacy' | 'refund')
export const legalPolicyService = {
    getAll: () => apiFetch('/api/legal-policies'),
    getOne: (type) => apiFetch(`/api/legal-policies/${type}`),
    update: (type, data) => apiFetch(`/api/legal-policies/${type}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),
    seed: () => apiFetch('/api/legal-policies/seed', { method: 'POST' }),
};
