"use client";

import { ThemeProvider } from "@/context/ThemeContext";
import { ModuleProvider } from "@/context/ModuleContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { SiteSettingsProvider } from "@/context/SiteSettingsContext";
import { Toaster } from "react-hot-toast";
import ReduxProvider from "@/redux/ReduxProvider";

export default function ClientProviders({ children }) {
    return (
        <ReduxProvider>
            <ThemeProvider>
                <ModuleProvider>
                    <LanguageProvider>
                        <SiteSettingsProvider>
                        <Toaster
                            position="top-center"
                            toastOptions={{
                                duration: 4000,
                                style: {
                                    background: "var(--color-gray-900)",
                                    color: "#fff",
                                    borderRadius: "var(--radius-lg)",
                                },
                                success: {
                                    iconTheme: {
                                        primary: "var(--color-accent)",
                                        secondary: "#fff",
                                    },
                                },
                                error: {
                                    iconTheme: {
                                        primary: "#ef4444",
                                        secondary: "#fff",
                                    },
                                },
                            }}
                        />
                        {children}
                        </SiteSettingsProvider>
                    </LanguageProvider>
                </ModuleProvider>
            </ThemeProvider>
        </ReduxProvider>
    );
}
