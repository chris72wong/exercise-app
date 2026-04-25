import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { DEFAULT_THEME, THEME_COLORS, THEME_STORAGE_KEY } from "@/lib/theme";
import SyncStatusBanner from "./_components/sync-status-banner";
import ThemeToggle from "./_components/theme-toggle";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gym Partner",
  description: "A good app for the gym",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: THEME_COLORS.light },
    { media: "(prefers-color-scheme: dark)", color: THEME_COLORS.dark },
    { color: THEME_COLORS.dark },
  ],
  colorScheme: "dark light",
};

const themeInitializerScript = `
(() => {
  const storageKey = ${JSON.stringify(THEME_STORAGE_KEY)};
  const defaultTheme = ${JSON.stringify(DEFAULT_THEME)};
  const colors = ${JSON.stringify(THEME_COLORS)};

  function applyBrowserTheme(theme) {
    const themeColor = colors[theme] || colors[defaultTheme];
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;

    const themeColorMetas = document.querySelectorAll('meta[name="theme-color"]');
    if (themeColorMetas.length === 0) {
      const themeColorMeta = document.createElement("meta");
      themeColorMeta.name = "theme-color";
      themeColorMeta.content = themeColor;
      document.head.appendChild(themeColorMeta);
    } else {
      themeColorMetas.forEach((themeColorMeta) => {
        themeColorMeta.setAttribute("content", themeColor);
      });
    }

    let colorSchemeMeta = document.querySelector('meta[name="color-scheme"]');
    if (!colorSchemeMeta) {
      colorSchemeMeta = document.createElement("meta");
      colorSchemeMeta.name = "color-scheme";
      document.head.appendChild(colorSchemeMeta);
    }
    colorSchemeMeta.setAttribute("content", theme);
  }

  try {
    const storedTheme = window.localStorage.getItem(storageKey);
    applyBrowserTheme(storedTheme === "light" ? "light" : defaultTheme);
  } catch {
    applyBrowserTheme(defaultTheme);
  }
})();
`;

type NavigationItem = {
  href: string;
  ariaLabel: string;
  title: string;
  icon: React.ReactNode;
};

const navigationItems: NavigationItem[] = [
  {
    href: "/",
    ariaLabel: "Go to home page",
    title: "Home",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-current">
        <path d="M12 3.8L3 11.2V21h6.5v-6.3h5V21H21v-9.8L12 3.8zm0-2.6L23 10v13h-11v-6.3h-1V23H1V10L12 1.2z" />
      </svg>
    ),
  },
  {
    href: "/upper-body-workout-generator",
    ariaLabel: "Go to exercises page",
    title: "Exercises",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-current">
        <path d="M1 9h3v6H1V9zm4-2h2v10H5V7zm4 3h6v4H9v-4zm8-3h2v10h-2V7zm3 2h3v6h-3V9z" />
      </svg>
    ),
  },
  {
    href: "/help-tools",
    ariaLabel: "Go to full body generator page",
    title: "Full Body Generator",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-current">
        <path d="M4 2h11a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm0 2v16h11V4H4zm15 1.2 3 1.1v13.4l-3 1.1V5.2z" />
      </svg>
    ),
  },
  {
    href: "/bodybuilding-diagram",
    ariaLabel: "Go to muscle diagram page",
    title: "Muscle Diagram",
    icon: (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      >
        <circle cx="12" cy="5" r="2.5" />
        <path d="M12 7.5v6M7.5 10.5h9M12 13.5l-4 6M12 13.5l4 6" />
      </svg>
    ),
  },
  {
    href: "/how-to-use",
    ariaLabel: "Go to how to use page",
    title: "How to Use",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-current">
        <path d="M12 2C6.5 2 2 6.2 2 11.4 2 16.7 6.4 21 12 21s10-4.3 10-9.6C22 6.2 17.5 2 12 2zm0 16.7c-1 0-1.8-.8-1.8-1.8s.8-1.8 1.8-1.8 1.8.8 1.8 1.8-.8 1.8-1.8 1.8zm2.1-7.4-.7.4c-.9.5-1.3 1.1-1.3 2h-2.2c0-1.8.9-3.1 2.5-4l1-.6c.7-.4 1.1-.9 1.1-1.6 0-1-.8-1.7-2-1.7-1.2 0-2.1.8-2.2 2H8.1c.1-2.4 1.9-4 4.4-4 2.7 0 4.4 1.6 4.4 4 0 1.5-.8 2.7-2.3 3.5z" />
      </svg>
    ),
  },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme={DEFAULT_THEME}
      suppressHydrationWarning
      style={{ colorScheme: DEFAULT_THEME }}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="sticky top-0 z-40 border-b border-neutral-800/80 bg-neutral-950/95 backdrop-blur">
          <nav
            className="mx-auto flex w-full max-w-6xl items-center justify-center gap-3 px-6 py-4"
            aria-label="Primary"
          >
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex items-center justify-center rounded-xl border border-neutral-700 bg-neutral-900 p-2 text-neutral-100 transition-colors hover:bg-neutral-800"
                aria-label={item.ariaLabel}
                title={item.title}
              >
                {item.icon}
              </Link>
            ))}
            <ThemeToggle />
          </nav>
        </header>
        <SyncStatusBanner />
        {children}
        <Script
          id="theme-initializer"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeInitializerScript }}
        />
      </body>
    </html>
  );
}
