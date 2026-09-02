"use client";

import { createContext, useContext, useState, useEffect } from "react";

/**
 * Module Context - Global state for enabled/disabled modules
 * This allows entire app to know which features are active
 */

const ModuleContext = createContext(undefined);

const DEFAULT_MODULES = {
    lms: {
        courses: true,
        modules: true,
        lessons: true,
        enrollments: true,
        certificates: true,
        liveClasses: true,
        webinars: true,
        quizResults: true,
    },
    marketplace: {
        graphics: true,
        videoTemplates: true,
        uiKits: true,
        appTemplates: true,
        audio: true,
        photos: true,
        fonts: true,
    },
    products: {
        websites: true,
        software: true,
    },
};

export function ModuleProvider({ children }) {
    const [enabledModules, setEnabledModules] = useState(DEFAULT_MODULES);
    const [loading, setLoading] = useState(true);

    // Load enabled modules from API
    useEffect(() => {
        const loadModules = async () => {
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/platforms/settings/modules`
                );

                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.data) {
                        setEnabledModules(data.data);
                    }
                }
            } catch (error) {
                console.log("Using default modules - API not available");
            } finally {
                setLoading(false);
            }
        };

        loadModules();
    }, []);

    // Check if a specific module is enabled
    const isModuleEnabled = (category, moduleKey) => {
        return enabledModules?.[category]?.[moduleKey] === true;
    };

    // Refresh modules (call after admin updates settings)
    const refreshModules = async () => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/platforms/settings/modules`
            );

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.data) {
                    setEnabledModules(data.data);
                }
            }
        } catch (error) {
            console.error("Failed to refresh modules");
        }
    };

    return (
        <ModuleContext.Provider
            value={{
                enabledModules,
                isModuleEnabled,
                loading,
                refreshModules,
            }}
        >
            {children}
        </ModuleContext.Provider>
    );
}

export function useModules() {
    const context = useContext(ModuleContext);
    if (context === undefined) {
        throw new Error("useModules must be used within a ModuleProvider");
    }
    return context;
}
