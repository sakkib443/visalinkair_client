// ===================================================================
// Airport data — all Bangladeshi origins + every destination we
// fly to from Bangladesh. Used by the home-page hero flight search
// and the /flight inquiry form (both share the same picker).
// Match keys: city, country, code (IATA).
// ===================================================================

export const BD_AIRPORTS = [
    { code: "DAC", city: "Dhaka",       country: "Bangladesh", airport: "Hazrat Shahjalal International", flag: "🇧🇩" },
    { code: "CGP", city: "Chattogram",  country: "Bangladesh", airport: "Shah Amanat International",       flag: "🇧🇩" },
    { code: "ZYL", city: "Sylhet",      country: "Bangladesh", airport: "Osmani International",            flag: "🇧🇩" },
    { code: "CXB", city: "Cox's Bazar", country: "Bangladesh", airport: "Cox's Bazar Airport",             flag: "🇧🇩" },
    { code: "JSR", city: "Jashore",     country: "Bangladesh", airport: "Jashore Airport",                 flag: "🇧🇩" },
    { code: "SPD", city: "Saidpur",     country: "Bangladesh", airport: "Saidpur Airport",                 flag: "🇧🇩" },
    { code: "BZL", city: "Barishal",    country: "Bangladesh", airport: "Barishal Airport",                flag: "🇧🇩" },
    { code: "RJH", city: "Rajshahi",    country: "Bangladesh", airport: "Shah Makhdum Airport",            flag: "🇧🇩" },
];

export const INTL_AIRPORTS = [
    // Middle East
    { code: "DXB", city: "Dubai",       country: "UAE",           airport: "Dubai International",         flag: "🇦🇪" },
    { code: "AUH", city: "Abu Dhabi",   country: "UAE",           airport: "Zayed International",         flag: "🇦🇪" },
    { code: "SHJ", city: "Sharjah",     country: "UAE",           airport: "Sharjah International",       flag: "🇦🇪" },
    { code: "DOH", city: "Doha",        country: "Qatar",         airport: "Hamad International",         flag: "🇶🇦" },
    { code: "JED", city: "Jeddah",      country: "Saudi Arabia",  airport: "King Abdulaziz International", flag: "🇸🇦" },
    { code: "RUH", city: "Riyadh",      country: "Saudi Arabia",  airport: "King Khalid International",   flag: "🇸🇦" },
    { code: "MED", city: "Medina",      country: "Saudi Arabia",  airport: "Prince Mohammad Airport",     flag: "🇸🇦" },
    { code: "MCT", city: "Muscat",      country: "Oman",          airport: "Muscat International",        flag: "🇴🇲" },
    { code: "KWI", city: "Kuwait City", country: "Kuwait",        airport: "Kuwait International",        flag: "🇰🇼" },
    { code: "BAH", city: "Manama",      country: "Bahrain",       airport: "Bahrain International",       flag: "🇧🇭" },
    { code: "IST", city: "Istanbul",    country: "Turkey",        airport: "Istanbul Airport",            flag: "🇹🇷" },

    // South Asia
    { code: "DEL", city: "New Delhi",   country: "India",         airport: "Indira Gandhi International", flag: "🇮🇳" },
    { code: "BOM", city: "Mumbai",      country: "India",         airport: "Chhatrapati Shivaji",         flag: "🇮🇳" },
    { code: "CCU", city: "Kolkata",     country: "India",         airport: "Netaji Subhas Chandra Bose",  flag: "🇮🇳" },
    { code: "MAA", city: "Chennai",     country: "India",         airport: "Chennai International",       flag: "🇮🇳" },
    { code: "BLR", city: "Bangalore",   country: "India",         airport: "Kempegowda International",    flag: "🇮🇳" },
    { code: "KTM", city: "Kathmandu",   country: "Nepal",         airport: "Tribhuvan International",     flag: "🇳🇵" },
    { code: "CMB", city: "Colombo",     country: "Sri Lanka",     airport: "Bandaranaike International",  flag: "🇱🇰" },
    { code: "MLE", city: "Malé",        country: "Maldives",      airport: "Velana International",        flag: "🇲🇻" },

    // Southeast Asia
    { code: "KUL", city: "Kuala Lumpur", country: "Malaysia",     airport: "KLIA",                        flag: "🇲🇾" },
    { code: "SIN", city: "Singapore",    country: "Singapore",    airport: "Changi Airport",              flag: "🇸🇬" },
    { code: "BKK", city: "Bangkok",      country: "Thailand",     airport: "Suvarnabhumi Airport",        flag: "🇹🇭" },
    { code: "HKT", city: "Phuket",       country: "Thailand",     airport: "Phuket International",        flag: "🇹🇭" },
    { code: "CGK", city: "Jakarta",      country: "Indonesia",    airport: "Soekarno–Hatta International", flag: "🇮🇩" },
    { code: "DPS", city: "Bali",         country: "Indonesia",    airport: "Ngurah Rai International",    flag: "🇮🇩" },
    { code: "MNL", city: "Manila",       country: "Philippines",  airport: "Ninoy Aquino International",  flag: "🇵🇭" },
    { code: "HAN", city: "Hanoi",        country: "Vietnam",      airport: "Noi Bai International",       flag: "🇻🇳" },
    { code: "SGN", city: "Ho Chi Minh",  country: "Vietnam",      airport: "Tan Son Nhat International",  flag: "🇻🇳" },

    // East Asia
    { code: "NRT", city: "Tokyo",        country: "Japan",        airport: "Narita International",        flag: "🇯🇵" },
    { code: "HND", city: "Tokyo",        country: "Japan",        airport: "Haneda Airport",              flag: "🇯🇵" },
    { code: "ICN", city: "Seoul",        country: "South Korea",  airport: "Incheon International",       flag: "🇰🇷" },
    { code: "PEK", city: "Beijing",      country: "China",        airport: "Capital International",       flag: "🇨🇳" },
    { code: "PVG", city: "Shanghai",     country: "China",        airport: "Pudong International",        flag: "🇨🇳" },
    { code: "CAN", city: "Guangzhou",    country: "China",        airport: "Baiyun International",        flag: "🇨🇳" },
    { code: "HKG", city: "Hong Kong",    country: "Hong Kong",    airport: "Hong Kong International",     flag: "🇭🇰" },

    // Europe
    { code: "LHR", city: "London",       country: "United Kingdom", airport: "Heathrow",                  flag: "🇬🇧" },
    { code: "LGW", city: "London",       country: "United Kingdom", airport: "Gatwick",                   flag: "🇬🇧" },
    { code: "MAN", city: "Manchester",   country: "United Kingdom", airport: "Manchester Airport",        flag: "🇬🇧" },
    { code: "CDG", city: "Paris",        country: "France",       airport: "Charles de Gaulle",           flag: "🇫🇷" },
    { code: "FRA", city: "Frankfurt",    country: "Germany",      airport: "Frankfurt Airport",           flag: "🇩🇪" },
    { code: "MUC", city: "Munich",       country: "Germany",      airport: "Munich Airport",              flag: "🇩🇪" },
    { code: "AMS", city: "Amsterdam",    country: "Netherlands",  airport: "Schiphol",                    flag: "🇳🇱" },
    { code: "FCO", city: "Rome",         country: "Italy",        airport: "Leonardo da Vinci",           flag: "🇮🇹" },
    { code: "MAD", city: "Madrid",       country: "Spain",        airport: "Barajas Airport",             flag: "🇪🇸" },
    { code: "ZRH", city: "Zurich",       country: "Switzerland",  airport: "Zurich Airport",              flag: "🇨🇭" },

    // North America
    { code: "JFK", city: "New York",     country: "USA",          airport: "John F. Kennedy",             flag: "🇺🇸" },
    { code: "EWR", city: "Newark",       country: "USA",          airport: "Newark Liberty",              flag: "🇺🇸" },
    { code: "LAX", city: "Los Angeles",  country: "USA",          airport: "Los Angeles International",   flag: "🇺🇸" },
    { code: "ORD", city: "Chicago",      country: "USA",          airport: "O'Hare International",        flag: "🇺🇸" },
    { code: "YYZ", city: "Toronto",      country: "Canada",       airport: "Pearson International",       flag: "🇨🇦" },
    { code: "YVR", city: "Vancouver",    country: "Canada",       airport: "Vancouver International",     flag: "🇨🇦" },
    { code: "YUL", city: "Montreal",     country: "Canada",       airport: "Pierre Elliott Trudeau",      flag: "🇨🇦" },

    // Oceania
    { code: "SYD", city: "Sydney",       country: "Australia",    airport: "Kingsford Smith",             flag: "🇦🇺" },
    { code: "MEL", city: "Melbourne",    country: "Australia",    airport: "Melbourne Airport",           flag: "🇦🇺" },
    { code: "AKL", city: "Auckland",     country: "New Zealand",  airport: "Auckland Airport",            flag: "🇳🇿" },

    // Africa
    { code: "CAI", city: "Cairo",        country: "Egypt",        airport: "Cairo International",         flag: "🇪🇬" },
    { code: "ADD", city: "Addis Ababa",  country: "Ethiopia",     airport: "Bole International",          flag: "🇪🇹" },
    { code: "JNB", city: "Johannesburg", country: "South Africa", airport: "O. R. Tambo",                 flag: "🇿🇦" },
];

export const ALL_AIRPORTS = [...BD_AIRPORTS, ...INTL_AIRPORTS];

// Filter helper — matches city, country, code, or airport name.
export function searchAirports(list, query) {
    if (!query) return list;
    const q = query.toLowerCase().trim();
    return list.filter((a) =>
        a.code.toLowerCase().includes(q) ||
        a.city.toLowerCase().includes(q) ||
        a.country.toLowerCase().includes(q) ||
        (a.airport || "").toLowerCase().includes(q)
    );
}
