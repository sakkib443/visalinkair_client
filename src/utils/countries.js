// ===================================================================
// Tourist destinations Bangladeshis commonly apply visas for.
// Used by the home-page "Tourism Visa" hero tab and the /visa inquiry form.
// Match keys: name, region.
// ===================================================================

export const TOURIST_COUNTRIES = [
    // South Asia
    { name: "India",         region: "South Asia",      flag: "🇮🇳" },
    { name: "Nepal",         region: "South Asia",      flag: "🇳🇵" },
    { name: "Sri Lanka",     region: "South Asia",      flag: "🇱🇰" },
    { name: "Bhutan",        region: "South Asia",      flag: "🇧🇹" },
    { name: "Maldives",      region: "South Asia",      flag: "🇲🇻" },

    // Southeast Asia
    { name: "Thailand",      region: "Southeast Asia",  flag: "🇹🇭" },
    { name: "Malaysia",      region: "Southeast Asia",  flag: "🇲🇾" },
    { name: "Singapore",     region: "Southeast Asia",  flag: "🇸🇬" },
    { name: "Indonesia",     region: "Southeast Asia",  flag: "🇮🇩" },
    { name: "Vietnam",       region: "Southeast Asia",  flag: "🇻🇳" },
    { name: "Philippines",   region: "Southeast Asia",  flag: "🇵🇭" },
    { name: "Cambodia",      region: "Southeast Asia",  flag: "🇰🇭" },
    { name: "Laos",          region: "Southeast Asia",  flag: "🇱🇦" },
    { name: "Myanmar",       region: "Southeast Asia",  flag: "🇲🇲" },
    { name: "Brunei",        region: "Southeast Asia",  flag: "🇧🇳" },

    // East Asia
    { name: "China",         region: "East Asia",       flag: "🇨🇳" },
    { name: "Hong Kong",     region: "East Asia",       flag: "🇭🇰" },
    { name: "Macau",         region: "East Asia",       flag: "🇲🇴" },
    { name: "Japan",         region: "East Asia",       flag: "🇯🇵" },
    { name: "South Korea",   region: "East Asia",       flag: "🇰🇷" },
    { name: "Taiwan",        region: "East Asia",       flag: "🇹🇼" },

    // Middle East
    { name: "UAE",           region: "Middle East",     flag: "🇦🇪" },
    { name: "Saudi Arabia",  region: "Middle East",     flag: "🇸🇦" },
    { name: "Qatar",         region: "Middle East",     flag: "🇶🇦" },
    { name: "Oman",          region: "Middle East",     flag: "🇴🇲" },
    { name: "Kuwait",        region: "Middle East",     flag: "🇰🇼" },
    { name: "Bahrain",       region: "Middle East",     flag: "🇧🇭" },
    { name: "Jordan",        region: "Middle East",     flag: "🇯🇴" },
    { name: "Lebanon",       region: "Middle East",     flag: "🇱🇧" },
    { name: "Turkey",        region: "Middle East",     flag: "🇹🇷" },
    { name: "Israel",        region: "Middle East",     flag: "🇮🇱" },

    // Europe (Schengen + others)
    { name: "United Kingdom",region: "Europe",          flag: "🇬🇧" },
    { name: "Ireland",       region: "Europe",          flag: "🇮🇪" },
    { name: "France",        region: "Europe",          flag: "🇫🇷" },
    { name: "Germany",       region: "Europe",          flag: "🇩🇪" },
    { name: "Italy",         region: "Europe",          flag: "🇮🇹" },
    { name: "Spain",         region: "Europe",          flag: "🇪🇸" },
    { name: "Portugal",      region: "Europe",          flag: "🇵🇹" },
    { name: "Netherlands",   region: "Europe",          flag: "🇳🇱" },
    { name: "Belgium",       region: "Europe",          flag: "🇧🇪" },
    { name: "Switzerland",   region: "Europe",          flag: "🇨🇭" },
    { name: "Austria",       region: "Europe",          flag: "🇦🇹" },
    { name: "Greece",        region: "Europe",          flag: "🇬🇷" },
    { name: "Czech Republic",region: "Europe",          flag: "🇨🇿" },
    { name: "Hungary",       region: "Europe",          flag: "🇭🇺" },
    { name: "Poland",        region: "Europe",          flag: "🇵🇱" },
    { name: "Croatia",       region: "Europe",          flag: "🇭🇷" },
    { name: "Denmark",       region: "Europe",          flag: "🇩🇰" },
    { name: "Sweden",        region: "Europe",          flag: "🇸🇪" },
    { name: "Norway",        region: "Europe",          flag: "🇳🇴" },
    { name: "Finland",       region: "Europe",          flag: "🇫🇮" },
    { name: "Iceland",       region: "Europe",          flag: "🇮🇸" },
    { name: "Russia",        region: "Europe",          flag: "🇷🇺" },

    // Europe extra
    { name: "Romania",       region: "Europe",          flag: "🇷🇴" },
    { name: "Bulgaria",      region: "Europe",          flag: "🇧🇬" },
    { name: "Slovakia",      region: "Europe",          flag: "🇸🇰" },
    { name: "Slovenia",      region: "Europe",          flag: "🇸🇮" },
    { name: "Estonia",       region: "Europe",          flag: "🇪🇪" },
    { name: "Latvia",        region: "Europe",          flag: "🇱🇻" },
    { name: "Lithuania",     region: "Europe",          flag: "🇱🇹" },
    { name: "Cyprus",        region: "Europe",          flag: "🇨🇾" },
    { name: "Malta",         region: "Europe",          flag: "🇲🇹" },
    { name: "Luxembourg",    region: "Europe",          flag: "🇱🇺" },
    { name: "Serbia",        region: "Europe",          flag: "🇷🇸" },
    { name: "Ukraine",       region: "Europe",          flag: "🇺🇦" },

    // North America
    { name: "United States", region: "North America",   flag: "🇺🇸" },
    { name: "Canada",        region: "North America",   flag: "🇨🇦" },
    { name: "Mexico",        region: "North America",   flag: "🇲🇽" },
    { name: "Cuba",          region: "North America",   flag: "🇨🇺" },
    { name: "Bahamas",       region: "North America",   flag: "🇧🇸" },
    { name: "Jamaica",       region: "North America",   flag: "🇯🇲" },
    { name: "Costa Rica",    region: "North America",   flag: "🇨🇷" },
    { name: "Panama",        region: "North America",   flag: "🇵🇦" },
    { name: "Dominican Republic", region: "North America", flag: "🇩🇴" },

    // Oceania
    { name: "Australia",     region: "Oceania",         flag: "🇦🇺" },
    { name: "New Zealand",   region: "Oceania",         flag: "🇳🇿" },
    { name: "Fiji",          region: "Oceania",         flag: "🇫🇯" },
    { name: "Papua New Guinea", region: "Oceania",      flag: "🇵🇬" },

    // Africa
    { name: "Egypt",         region: "Africa",          flag: "🇪🇬" },
    { name: "Morocco",       region: "Africa",          flag: "🇲🇦" },
    { name: "South Africa",  region: "Africa",          flag: "🇿🇦" },
    { name: "Kenya",         region: "Africa",          flag: "🇰🇪" },
    { name: "Tanzania",      region: "Africa",          flag: "🇹🇿" },
    { name: "Mauritius",     region: "Africa",          flag: "🇲🇺" },
    { name: "Seychelles",    region: "Africa",          flag: "🇸🇨" },
    { name: "Ethiopia",      region: "Africa",          flag: "🇪🇹" },
    { name: "Nigeria",       region: "Africa",          flag: "🇳🇬" },
    { name: "Ghana",         region: "Africa",          flag: "🇬🇭" },
    { name: "Rwanda",        region: "Africa",          flag: "🇷🇼" },
    { name: "Namibia",       region: "Africa",          flag: "🇳🇦" },
    { name: "Botswana",      region: "Africa",          flag: "🇧🇼" },
    { name: "Zimbabwe",      region: "Africa",          flag: "🇿🇼" },
    { name: "Tunisia",       region: "Africa",          flag: "🇹🇳" },
    { name: "Algeria",       region: "Africa",          flag: "🇩🇿" },

    // South America
    { name: "Brazil",        region: "South America",   flag: "🇧🇷" },
    { name: "Argentina",     region: "South America",   flag: "🇦🇷" },
    { name: "Peru",          region: "South America",   flag: "🇵🇪" },
    { name: "Chile",         region: "South America",   flag: "🇨🇱" },
    { name: "Colombia",      region: "South America",   flag: "🇨🇴" },
    { name: "Ecuador",       region: "South America",   flag: "🇪🇨" },
    { name: "Uruguay",       region: "South America",   flag: "🇺🇾" },
    { name: "Venezuela",     region: "South America",   flag: "🇻🇪" },
    { name: "Bolivia",       region: "South America",   flag: "🇧🇴" },

    // Central Asia
    { name: "Kazakhstan",    region: "Central Asia",    flag: "🇰🇿" },
    { name: "Uzbekistan",    region: "Central Asia",    flag: "🇺🇿" },
    { name: "Kyrgyzstan",    region: "Central Asia",    flag: "🇰🇬" },
    { name: "Azerbaijan",    region: "Central Asia",    flag: "🇦🇿" },
    { name: "Georgia",       region: "Central Asia",    flag: "🇬🇪" },
    { name: "Armenia",       region: "Central Asia",    flag: "🇦🇲" },
];

export function searchCountries(query) {
    if (!query) return TOURIST_COUNTRIES;
    const q = query.toLowerCase().trim();
    return TOURIST_COUNTRIES.filter((c) =>
        c.name.toLowerCase().includes(q) ||
        c.region.toLowerCase().includes(q)
    );
}
