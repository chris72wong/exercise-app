"use client";

import { useEffect, useState } from "react";

const THEME_STORAGE_KEY = "gymPartnerTheme:v1";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    if (typeof window === "undefined") {
      return "dark";
    }

    return window.localStorage.getItem(THEME_STORAGE_KEY) === "light" ? "light" : "dark";
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex items-center justify-center rounded-xl border border-neutral-700 bg-neutral-900 p-2 text-neutral-100 transition-colors hover:bg-neutral-800"
      aria-label="Toggle light and dark mode"
      title="Light / Dark"
    >
      {theme === "dark" ? (
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-current">
          <path d="M12 4V1h2v3h-2zm0 19v-3h2v3h-2zM4 13H1v-2h3v2zm19 0h-3v-2h3v2zM5.6 7 3.5 4.9l1.4-1.4L7 5.6 5.6 7zm13.5 13.5L17 18.4l1.4-1.4 2.1 2.1-1.4 1.4zM18.4 7 17 5.6l2.1-2.1 1.4 1.4L18.4 7zM4.9 20.5l-1.4-1.4L5.6 17 7 18.4l-2.1 2.1zM13 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10z" />
        </svg>
      ) : (
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-current">
          <path d="M21 14.4A8.4 8.4 0 0 1 9.6 3 9.2 9.2 0 1 0 21 14.4z" />
        </svg>
      )}
    </button>
  );
}
