const muscles = [
  "Biceps",
  "Shoulders",
  "Triceps",
  "Quads",
  "Hamstrings",
  "Calves",
  "Glutes",
  "Traps",
  "Abs",
];

export default function BodybuildingDiagramPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <section className="mx-auto w-full max-w-6xl px-6 py-10">
        <header className="mb-8 rounded-3xl border border-neutral-800 bg-neutral-900/80 p-6 shadow-lg">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Body Map</p>
          <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">Bodybuilding Muscle Diagram</h1>
          <p className="mt-3 max-w-2xl text-sm text-neutral-300">
            Front and back views with the key muscle groups you requested.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_250px]">
          <div className="grid gap-6 md:grid-cols-2">
            <article className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-6 shadow-lg">
              <h2 className="mb-4 text-xl font-semibold text-amber-100">Front View</h2>
              <div className="rounded-2xl bg-neutral-950/80 p-4">
                <svg viewBox="0 0 280 520" className="mx-auto w-full max-w-[320px]" role="img" aria-label="Front body diagram with muscle labels">
                  <ellipse cx="140" cy="52" rx="36" ry="38" fill="#fed7aa" opacity="0.95" />
                  <rect x="108" y="92" width="64" height="116" rx="30" fill="#fdba74" opacity="0.9" />
                  <rect x="80" y="104" width="28" height="92" rx="14" fill="#fb923c" opacity="0.85" />
                  <rect x="172" y="104" width="28" height="92" rx="14" fill="#fb923c" opacity="0.85" />
                  <rect x="96" y="208" width="88" height="64" rx="26" fill="#f97316" opacity="0.85" />
                  <rect x="104" y="272" width="30" height="152" rx="14" fill="#ea580c" opacity="0.9" />
                  <rect x="146" y="272" width="30" height="152" rx="14" fill="#ea580c" opacity="0.9" />
                  <rect x="102" y="424" width="32" height="74" rx="14" fill="#fb923c" opacity="0.9" />
                  <rect x="146" y="424" width="32" height="74" rx="14" fill="#fb923c" opacity="0.9" />

                  <line x1="210" y1="132" x2="260" y2="118" stroke="#67e8f9" strokeWidth="2" />
                  <text x="264" y="120" fill="#a5f3fc" fontSize="12">Shoulders</text>

                  <line x1="88" y1="148" x2="22" y2="140" stroke="#67e8f9" strokeWidth="2" />
                  <text x="6" y="142" fill="#a5f3fc" fontSize="12">Biceps</text>

                  <line x1="140" y1="162" x2="220" y2="168" stroke="#67e8f9" strokeWidth="2" />
                  <text x="224" y="171" fill="#a5f3fc" fontSize="12">Abs</text>

                  <line x1="128" y1="322" x2="24" y2="312" stroke="#67e8f9" strokeWidth="2" />
                  <text x="6" y="314" fill="#a5f3fc" fontSize="12">Quads</text>

                  <line x1="102" y1="458" x2="22" y2="474" stroke="#67e8f9" strokeWidth="2" />
                  <text x="6" y="478" fill="#a5f3fc" fontSize="12">Calves</text>
                </svg>
              </div>
            </article>

            <article className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-6 shadow-lg">
              <h2 className="mb-4 text-xl font-semibold text-amber-100">Back View</h2>
              <div className="rounded-2xl bg-neutral-950/80 p-4">
                <svg viewBox="0 0 280 520" className="mx-auto w-full max-w-[320px]" role="img" aria-label="Back body diagram with muscle labels">
                  <ellipse cx="140" cy="52" rx="36" ry="38" fill="#fed7aa" opacity="0.95" />
                  <rect x="108" y="92" width="64" height="126" rx="30" fill="#fdba74" opacity="0.9" />
                  <rect x="80" y="104" width="28" height="102" rx="14" fill="#fb923c" opacity="0.85" />
                  <rect x="172" y="104" width="28" height="102" rx="14" fill="#fb923c" opacity="0.85" />
                  <rect x="96" y="218" width="88" height="74" rx="26" fill="#f97316" opacity="0.88" />
                  <rect x="104" y="292" width="30" height="132" rx="14" fill="#ea580c" opacity="0.9" />
                  <rect x="146" y="292" width="30" height="132" rx="14" fill="#ea580c" opacity="0.9" />
                  <rect x="102" y="424" width="32" height="74" rx="14" fill="#fb923c" opacity="0.9" />
                  <rect x="146" y="424" width="32" height="74" rx="14" fill="#fb923c" opacity="0.9" />

                  <line x1="136" y1="104" x2="24" y2="90" stroke="#67e8f9" strokeWidth="2" />
                  <text x="6" y="92" fill="#a5f3fc" fontSize="12">Traps</text>

                  <line x1="88" y1="168" x2="18" y2="176" stroke="#67e8f9" strokeWidth="2" />
                  <text x="2" y="179" fill="#a5f3fc" fontSize="12">Triceps</text>

                  <line x1="114" y1="182" x2="238" y2="190" stroke="#67e8f9" strokeWidth="2" />
                  <text x="242" y="193" fill="#a5f3fc" fontSize="12">Back</text>

                  <line x1="140" y1="240" x2="240" y2="252" stroke="#67e8f9" strokeWidth="2" />
                  <text x="244" y="255" fill="#a5f3fc" fontSize="12">Glutes</text>

                  <line x1="160" y1="352" x2="236" y2="360" stroke="#67e8f9" strokeWidth="2" />
                  <text x="240" y="363" fill="#a5f3fc" fontSize="12">Hamstrings</text>
                </svg>
              </div>
            </article>
          </div>

          <aside className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-white">Labeled Muscles</h2>
            <ul className="mt-4 space-y-2 text-sm text-neutral-300">
              {muscles.map((muscle) => (
                <li key={muscle} className="rounded-lg bg-neutral-950/70 px-3 py-2">
                  {muscle}
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>
    </main>
  );
}
