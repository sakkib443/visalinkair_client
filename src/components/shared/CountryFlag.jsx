"use client";

import { useState, useEffect, memo } from "react";

/**
 * CountryFlag — renders a country flag using inline SVG data from flagcdn.com
 * Uses SVG format (~1KB each) for instant loading with in-memory caching.
 * Once a flag is fetched, it's cached globally so it never loads again.
 *
 * Usage:
 *   <CountryFlag name="Bangladesh" size={24} />
 *   <CountryFlag name="Singapore" size={20} className="rounded-sm" />
 */

// Country name → ISO 3166-1 alpha-2 code mapping
const COUNTRY_ISO = {
    // Asia
    'bangladesh': 'bd',
    'singapore': 'sg',
    'malaysia': 'my',
    'thailand': 'th',
    'india': 'in',
    'japan': 'jp',
    'south korea': 'kr',
    'china': 'cn',
    'vietnam': 'vn',
    'indonesia': 'id',
    'sri lanka': 'lk',
    'maldives': 'mv',
    'nepal': 'np',
    'philippines': 'ph',
    'cambodia': 'kh',
    'myanmar': 'mm',
    'pakistan': 'pk',
    'taiwan': 'tw',
    'hong kong': 'hk',
    'brunei': 'bn',
    'laos': 'la',
    'mongolia': 'mn',
    'uzbekistan': 'uz',

    // Middle East
    'united arab emirates': 'ae',
    'saudi arabia': 'sa',
    'qatar': 'qa',
    'oman': 'om',
    'kuwait': 'kw',
    'bahrain': 'bh',
    'jordan': 'jo',
    'lebanon': 'lb',
    'iraq': 'iq',
    'iran': 'ir',

    // Europe
    'turkey': 'tr',
    'united kingdom': 'gb',
    'france': 'fr',
    'germany': 'de',
    'italy': 'it',
    'spain': 'es',
    'switzerland': 'ch',
    'netherlands': 'nl',
    'belgium': 'be',
    'austria': 'at',
    'sweden': 'se',
    'norway': 'no',
    'denmark': 'dk',
    'finland': 'fi',
    'portugal': 'pt',
    'greece': 'gr',
    'poland': 'pl',
    'czech republic': 'cz',
    'hungary': 'hu',
    'ireland': 'ie',
    'russia': 'ru',
    'ukraine': 'ua',

    // North America
    'united states': 'us',
    'canada': 'ca',
    'mexico': 'mx',

    // Oceania
    'australia': 'au',
    'new zealand': 'nz',

    // Africa
    'egypt': 'eg',
    'south africa': 'za',
    'morocco': 'ma',
    'kenya': 'ke',
    'nigeria': 'ng',
    'ethiopia': 'et',
    'tanzania': 'tz',
    'ghana': 'gh',

    // South America
    'brazil': 'br',
    'argentina': 'ar',
    'chile': 'cl',
    'colombia': 'co',
    'peru': 'pe',
};

/**
 * Get ISO code from country name
 */
export function getCountryISOCode(name) {
    if (!name) return null;
    return COUNTRY_ISO[name.toLowerCase().trim()] || null;
}

// ============================================================
// Global in-memory SVG cache — persists across re-renders
// Once a flag is loaded, it NEVER loads again in the session
// ============================================================
const svgCache = {};
const fetchPromises = {};

/**
 * Fetch and cache an SVG flag. Returns the SVG data URL.
 * Uses deduplication so the same flag is only fetched once.
 */
function fetchFlag(iso) {
    if (svgCache[iso]) return Promise.resolve(svgCache[iso]);

    // Deduplicate concurrent requests for same flag
    if (fetchPromises[iso]) return fetchPromises[iso];

    fetchPromises[iso] = fetch(`https://flagcdn.com/${iso}.svg`)
        .then(res => {
            if (!res.ok) throw new Error('Flag not found');
            return res.text();
        })
        .then(svgText => {
            // Convert SVG text to a data URL for instant rendering
            const dataUrl = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgText)))}`;
            svgCache[iso] = dataUrl;
            delete fetchPromises[iso];
            return dataUrl;
        })
        .catch(() => {
            delete fetchPromises[iso];
            svgCache[iso] = null; // Mark as failed, don't retry
            return null;
        });

    return fetchPromises[iso];
}

/**
 * Preload flags for an array of country names.
 * Call this early (e.g., after fetching countries list) for zero-delay rendering.
 */
export function preloadFlags(countryNames) {
    if (!countryNames || !Array.isArray(countryNames)) return;
    countryNames.forEach(name => {
        const iso = getCountryISOCode(name);
        if (iso && !svgCache[iso]) fetchFlag(iso);
    });
}

/**
 * Get flag URL (sync) — returns cached URL or null
 */
export function getFlagUrl(name) {
    const iso = getCountryISOCode(name);
    if (!iso) return null;
    return svgCache[iso] || `https://flagcdn.com/${iso}.svg`;
}

/**
 * CountryFlag component — memoized for performance
 * @param {string} name - Country name in English (required)
 * @param {string} flag - Emoji flag (optional fallback)
 * @param {number} size - Width in pixels (default: 24)
 * @param {string} className - Additional CSS classes
 * @param {boolean} rounded - Whether to apply rounded corners (default: true)
 */
const CountryFlag = memo(function CountryFlag({ name, flag, size = 24, className = '', rounded = true }) {
    const iso = getCountryISOCode(name);
    const [src, setSrc] = useState(iso ? (svgCache[iso] || null) : null);
    const height = Math.round(size * 0.67);

    useEffect(() => {
        if (!iso) return;

        // Already cached — use immediately
        if (svgCache[iso]) {
            setSrc(svgCache[iso]);
            return;
        }

        // Fetch and cache
        let cancelled = false;
        fetchFlag(iso).then(url => {
            if (!cancelled && url) setSrc(url);
        });
        return () => { cancelled = true; };
    }, [iso]);

    // Shared styles for consistent sizing
    const sizeStyle = {
        width: `${size}px`,
        height: `${height}px`,
        minWidth: `${size}px`,
    };

    if (iso) {
        // Show the flag image (either cached SVG data URL or direct SVG URL)
        return (
            <img
                src={src || `https://flagcdn.com/${iso}.svg`}
                alt={`${name} flag`}
                width={size}
                height={height}
                decoding="async"
                className={`object-cover inline-block flex-shrink-0 ${rounded ? 'rounded-[3px]' : ''} ${className}`}
                style={{
                    ...sizeStyle,
                    boxShadow: '0 0 0 1px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.08)',
                    backgroundColor: '#f0f0f0',
                }}
            />
        );
    }

    // Fallback: emoji flag
    if (flag) {
        return <span className={`text-base flex-shrink-0 ${className}`} style={{ fontSize: `${size * 0.8}px`, lineHeight: 1 }}>{flag}</span>;
    }

    // Last resort: country initial placeholder
    const initial = name ? name.charAt(0).toUpperCase() : '?';
    return (
        <span
            className={`inline-flex items-center justify-center flex-shrink-0 bg-gray-200 text-gray-500 font-bold text-[10px] ${rounded ? 'rounded-[3px]' : 'rounded-full'} ${className}`}
            style={sizeStyle}
        >
            {initial}
        </span>
    );
});

export default CountryFlag;
