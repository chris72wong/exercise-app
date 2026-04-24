import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto flex w-full max-w-5xl flex-col px-6 py-8">
        <header className="mb-12 flex items-center justify-end">
          <details className="relative">
            <summary className="cursor-pointer list-none rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-semibold hover:bg-neutral-800">
              Menu
            </summary>

            <nav className="absolute right-0 z-20 mt-2 w-72 rounded-xl border border-neutral-700 bg-neutral-900 p-3 shadow-xl">
              <p className="mb-2 px-2 text-xs uppercase tracking-wide text-neutral-400">Pages</p>
              <ul className="space-y-1">
                <li>
                  <Link
                    href="/upper-body-workout-generator"
                    className="block rounded-lg px-3 py-2 text-sm text-neutral-100 transition-colors hover:bg-neutral-800"
                  >
                    Upper Body Workout Generator
                  </Link>
                </li>
              </ul>
            </nav>
          </details>
        </header>

        <section className="rounded-3xl border border-neutral-800 bg-neutral-900/70 p-8 shadow-lg">
          <h1 className="text-4xl font-bold tracking-tight">Gym Partner</h1>
          <p className="mt-4 max-w-2xl text-neutral-300">
            Welcome to your workout app. Use the menu at the top to open pages and tools.
          </p>
        </section>
      </div>
    </main>
  );
}
