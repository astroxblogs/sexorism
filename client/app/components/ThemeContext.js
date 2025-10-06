import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
     // Initialize with light theme by default to prevent hydration mismatch
     const [theme, setTheme] = useState("light");
     const [mounted, setMounted] = useState(false);

     useEffect(() => {
         // Check if we're in the browser environment
         if (typeof window !== 'undefined') {
             // Only access localStorage on the client side
             const savedTheme = localStorage.getItem("theme") || "light";
             setTheme(savedTheme);
             setMounted(true);

             // Apply the theme class immediately
             const root = document.documentElement;
             if (savedTheme === "dark") {
                 root.classList.add("dark");
             } else {
                 root.classList.remove("dark");
             }
         }
     }, []);

     useEffect(() => {
         if (!mounted || typeof window === 'undefined') return;

         const root = document.documentElement;
         if (theme === "dark") {
             root.classList.add("dark");
             // Apply CSS custom properties for better dark mode support
             root.style.setProperty('--color-bg-primary', '#0f0f23');
             root.style.setProperty('--color-bg-secondary', '#1a1a2e');
             root.style.setProperty('--color-text-primary', '#f8fafc');
             root.style.setProperty('--color-text-secondary', '#cbd5e1');
             root.style.setProperty('--color-accent', '#a855f7');
             root.style.setProperty('--color-border', '#374151');
         } else {
             root.classList.remove("dark");
             // Reset to light mode colors
             root.style.setProperty('--color-bg-primary', '#ffffff');
             root.style.setProperty('--color-bg-secondary', '#f8fafc');
             root.style.setProperty('--color-text-primary', '#1f2937');
             root.style.setProperty('--color-text-secondary', '#6b7280');
             root.style.setProperty('--color-accent', '#7c3aed');
             root.style.setProperty('--color-border', '#e5e7eb');
         }
         localStorage.setItem("theme", theme);
     }, [theme, mounted]);

     const toggleTheme = () => setTheme((prev) => (prev === "light" ? "dark" : "light"));

     return (
         <ThemeContext.Provider value={{ theme, toggleTheme }}>
             {children}
         </ThemeContext.Provider>
     );
};