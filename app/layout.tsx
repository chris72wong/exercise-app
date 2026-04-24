import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="sticky top-0 z-40 border-b border-neutral-800/80 bg-neutral-950/95 backdrop-blur">
          <nav
            className="mx-auto flex w-full max-w-6xl items-center justify-center gap-3 px-6 py-4"
            aria-label="Primary"
          >
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-xl border border-neutral-700 bg-neutral-900 p-2 text-neutral-100 transition-colors hover:bg-neutral-800"
              aria-label="Go to home page"
              title="Home"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                <path d="M12 3.8L3 11.2V21h6.5v-6.3h5V21H21v-9.8L12 3.8zm0-2.6L23 10v13h-11v-6.3h-1V23H1V10L12 1.2z" />
              </svg>
            </Link>

            <Link
              href="/upper-body-workout-generator"
              className="inline-flex items-center justify-center rounded-xl border border-neutral-700 bg-neutral-900 p-2 text-neutral-100 transition-colors hover:bg-neutral-800"
              aria-label="Go to exercises page"
              title="Exercises"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                <path d="M1 9h3v6H1V9zm4-2h2v10H5V7zm4 3h6v4H9v-4zm8-3h2v10h-2V7zm3 2h3v6h-3V9z" />
              </svg>
            </Link>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
