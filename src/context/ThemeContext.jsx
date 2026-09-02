"use client";

import { createContext, useContext, useState, useEffect } from "react";

// Default Theme Configuration
const defaultTheme = {
    // Primary Colors
    primaryColor: "#6366f1",     // Indigo
    primaryDark: "#4f46e5",
    primaryLight: "#818cf8",

    // Secondary Colors  
    secondaryColor: "#f97316",   // Orange
    secondaryDark: "#ea580c",
    secondaryLight: "#fb923c",

    // Accent Colors
    accentColor: "#10b981",      // Emerald

    // Fonts
    headingFont: "Poppins",
    bodyFont: "Poppins",

    // Logo
    logoText: "Visalink Air",
    logoImage: "",

    // Dark Mode
    darkMode: false,
};

// Font Options (Available in Admin)
export const fontOptions = [
    { name: "Poppins", value: "Poppins" },
    { name: "Inter", value: "Inter" },
    { name: "Outfit", value: "Outfit" },
    { name: "Teko", value: "Teko" }, // Display font
    { name: "Roboto", value: "Roboto" },
    { name: "Open Sans", value: "Open Sans" },
    { name: "Montserrat", value: "Montserrat" },
    { name: "Lato", value: "Lato" },
    { name: "Nunito", value: "Nunito" },
    { name: "Hind Siliguri", value: "Hind Siliguri" }, // Bengali
];

// Color Presets (Available in Admin)
export const colorPresets = [
    { name: "Indigo", primary: "#6366f1", secondary: "#f97316" },
    { name: "Blue", primary: "#3b82f6", secondary: "#ec4899" },
    { name: "Teal", primary: "#14b8a6", secondary: "#f59e0b" },
    { name: "Purple", primary: "#8b5cf6", secondary: "#10b981" },
    { name: "Rose", primary: "#f43f5e", secondary: "#6366f1" },
    { name: "Emerald", primary: "#10b981", secondary: "#f97316" },
    { name: "Amber", primary: "#f59e0b", secondary: "#3b82f6" },
    { name: "Cyan", primary: "#06b6d4", secondary: "#ec4899" },
];

const ThemeContext = createContext(undefined);

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(defaultTheme);
    const [isLoading, setIsLoading] = useState(true);

    // Load theme from API on mount
    useEffect(() => {
        const loadTheme = async () => {
            try {
                // Fetch from API - database is the ONLY source of truth
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/design/theme`
                );

                if (response.ok) {
                    const data = await response.json();
                    // API returns { success, data: { section, themeContent: {...}, isActive } }
                    const themeData = data.data?.themeContent;
                    if (data.success && themeData) {
                        const apiTheme = {
                            primaryColor: themeData.colors?.primary || defaultTheme.primaryColor,
                            primaryDark: themeData.colors?.primaryDark || defaultTheme.primaryDark,
                            primaryLight: themeData.colors?.primaryLight || defaultTheme.primaryLight,
                            secondaryColor: themeData.colors?.secondary || defaultTheme.secondaryColor,
                            secondaryDark: themeData.colors?.secondaryDark || defaultTheme.secondaryDark,
                            secondaryLight: themeData.colors?.secondaryLight || defaultTheme.secondaryLight,
                            accentColor: themeData.colors?.accent || defaultTheme.accentColor,
                            headingFont: themeData.fonts?.heading || defaultTheme.headingFont,
                            bodyFont: themeData.fonts?.body || defaultTheme.bodyFont,
                            logoText: themeData.branding?.name || defaultTheme.logoText,
                            logoImage: themeData.branding?.logo || defaultTheme.logoImage,
                            darkMode: defaultTheme.darkMode,
                        };
                        setTheme(apiTheme);
                    }
                }
            } catch (error) {
                console.log("Using default theme - API not available");
            } finally {
                setIsLoading(false);
            }
        };

        loadTheme();
    }, []);

    // Apply CSS Variables when theme changes
    useEffect(() => {
        if (typeof window !== "undefined") {
            const root = document.documentElement;

            // Colors
            root.style.setProperty("--color-primary", theme.primaryColor);
            root.style.setProperty("--color-primary-dark", theme.primaryDark);
            root.style.setProperty("--color-primary-light", theme.primaryLight);
            root.style.setProperty("--color-secondary", theme.secondaryColor);
            root.style.setProperty("--color-secondary-dark", theme.secondaryDark);
            root.style.setProperty("--color-secondary-light", theme.secondaryLight);
            root.style.setProperty("--color-accent", theme.accentColor);

            // Fonts
            root.style.setProperty("--font-heading", `"${theme.headingFont}", sans-serif`);
            root.style.setProperty("--font-body", `"${theme.bodyFont}", sans-serif`);

            // Dark Mode
            if (theme.darkMode) {
                document.body.classList.add("dark");
            } else {
                document.body.classList.remove("dark");
            }
        }
    }, [theme]);

    // Update theme (Used by Admin for live preview ONLY)
    // Actual save to database happens via admin page API call
    const updateTheme = (newTheme) => {
        const updated = { ...theme, ...newTheme };
        setTheme(updated);
        // No localStorage! Admin saves via PATCH /api/design/theme
    };

    // Toggle dark mode
    const toggleDarkMode = () => {
        updateTheme({ darkMode: !theme.darkMode });
    };

    // Reset to default
    const resetTheme = () => {
        setTheme(defaultTheme);
    };

    return (
        <ThemeContext.Provider
            value={{
                theme,
                setTheme: updateTheme,
                toggleDarkMode,
                resetTheme,
                isLoading,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}
