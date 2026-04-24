import WorkoutProgressWidget from "../_components/workout-progress-widget";

export default function BodybuildingDiagramPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <section className="mx-auto w-full max-w-6xl px-6 py-10">
        <WorkoutProgressWidget title="Muscle Diagram Progress" progressPercent={100} />

        <div className="grid gap-6 md:grid-cols-2">
          <article className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-6 shadow-lg">
            <div className="rounded-2xl bg-neutral-950/80 p-4">
              <svg
                viewBox="0 0 360 620"
                className="mx-auto w-full max-w-[360px]"
                role="img"
                aria-label="Front body muscle diagram"
              >
                <text x="180" y="38" textAnchor="middle" fill="#7dd3fc" fontSize="20" fontWeight="700" opacity="0.9">
                  FRONT
                </text>

                <ellipse cx="180" cy="86" rx="43" ry="46" fill="#fcd5b5" />
                <rect x="138" y="132" width="84" height="138" rx="40" fill="#4b2e1f" opacity="0.65" />
                <rect x="102" y="148" width="36" height="118" rx="20" fill="#3b2619" opacity="0.75" />
                <rect x="222" y="148" width="36" height="118" rx="20" fill="#3b2619" opacity="0.75" />
                <rect x="130" y="270" width="100" height="84" rx="30" fill="#3b2619" opacity="0.7" />
                <rect x="140" y="354" width="34" height="176" rx="16" fill="#3b2619" opacity="0.78" />
                <rect x="186" y="354" width="34" height="176" rx="16" fill="#3b2619" opacity="0.78" />
                <rect x="138" y="530" width="36" height="68" rx="16" fill="#3b2619" opacity="0.78" />
                <rect x="186" y="530" width="36" height="68" rx="16" fill="#3b2619" opacity="0.78" />

                <ellipse cx="148" cy="164" rx="17" ry="18" fill="#f97316" />
                <ellipse cx="212" cy="164" rx="17" ry="18" fill="#f97316" />
                <rect x="104" y="198" width="26" height="56" rx="12" fill="#fb923c" />
                <rect x="230" y="198" width="26" height="56" rx="12" fill="#fb923c" />
                <rect x="157" y="198" width="46" height="70" rx="20" fill="#fb923c" />
                <rect x="158" y="276" width="44" height="66" rx="18" fill="#f97316" />
                <rect x="142" y="378" width="30" height="122" rx="12" fill="#ea580c" />
                <rect x="188" y="378" width="30" height="122" rx="12" fill="#ea580c" />
                <rect x="142" y="530" width="30" height="54" rx="12" fill="#fb923c" />
                <rect x="188" y="530" width="30" height="54" rx="12" fill="#fb923c" />

                <polyline points="148,164 120,156 78,140" fill="none" stroke="#67e8f9" strokeWidth="2" />
                <text x="20" y="142" fill="#a5f3fc" fontSize="14" fontWeight="600">Shoulders</text>

                <polyline points="104,218 84,224 48,234" fill="none" stroke="#67e8f9" strokeWidth="2" />
                <text x="12" y="238" fill="#a5f3fc" fontSize="14" fontWeight="600">Biceps</text>

                <polyline points="180,294 218,300 282,308" fill="none" stroke="#67e8f9" strokeWidth="2" />
                <text x="288" y="312" fill="#a5f3fc" fontSize="14" fontWeight="600">Abs</text>

                <polyline points="142,438 110,442 50,448" fill="none" stroke="#67e8f9" strokeWidth="2" />
                <text x="12" y="452" fill="#a5f3fc" fontSize="14" fontWeight="600">Quads</text>

                <polyline points="142,550 114,560 52,576" fill="none" stroke="#67e8f9" strokeWidth="2" />
                <text x="12" y="584" fill="#a5f3fc" fontSize="14" fontWeight="600">Calves</text>
              </svg>
            </div>
          </article>

          <article className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-6 shadow-lg">
            <div className="rounded-2xl bg-neutral-950/80 p-4">
              <svg
                viewBox="0 0 360 620"
                className="mx-auto w-full max-w-[360px]"
                role="img"
                aria-label="Back body muscle diagram"
              >
                <text x="180" y="38" textAnchor="middle" fill="#7dd3fc" fontSize="20" fontWeight="700" opacity="0.9">
                  BACK
                </text>

                <ellipse cx="180" cy="86" rx="43" ry="46" fill="#fcd5b5" />
                <rect x="138" y="132" width="84" height="156" rx="40" fill="#4b2e1f" opacity="0.65" />
                <rect x="102" y="148" width="36" height="126" rx="20" fill="#3b2619" opacity="0.75" />
                <rect x="222" y="148" width="36" height="126" rx="20" fill="#3b2619" opacity="0.75" />
                <rect x="130" y="286" width="100" height="86" rx="30" fill="#3b2619" opacity="0.72" />
                <rect x="140" y="372" width="34" height="158" rx="16" fill="#3b2619" opacity="0.78" />
                <rect x="186" y="372" width="34" height="158" rx="16" fill="#3b2619" opacity="0.78" />
                <rect x="138" y="530" width="36" height="68" rx="16" fill="#3b2619" opacity="0.78" />
                <rect x="186" y="530" width="36" height="68" rx="16" fill="#3b2619" opacity="0.78" />

                <rect x="160" y="138" width="40" height="30" rx="12" fill="#f97316" />
                <rect x="148" y="172" width="64" height="94" rx="24" fill="#fb923c" />
                <rect x="104" y="206" width="26" height="56" rx="12" fill="#fb923c" />
                <rect x="230" y="206" width="26" height="56" rx="12" fill="#fb923c" />
                <rect x="150" y="286" width="60" height="66" rx="22" fill="#f97316" />
                <rect x="142" y="390" width="30" height="126" rx="12" fill="#ea580c" />
                <rect x="188" y="390" width="30" height="126" rx="12" fill="#ea580c" />
                <rect x="142" y="530" width="30" height="54" rx="12" fill="#fb923c" />
                <rect x="188" y="530" width="30" height="54" rx="12" fill="#fb923c" />

                <polyline points="180,152 132,128 74,114" fill="none" stroke="#67e8f9" strokeWidth="2" />
                <text x="14" y="118" fill="#a5f3fc" fontSize="14" fontWeight="600">Traps</text>

                <polyline points="212,210 248,206 304,198" fill="none" stroke="#67e8f9" strokeWidth="2" />
                <text x="308" y="202" fill="#a5f3fc" fontSize="14" fontWeight="600">Back</text>

                <polyline points="104,222 82,226 40,238" fill="none" stroke="#67e8f9" strokeWidth="2" />
                <text x="10" y="242" fill="#a5f3fc" fontSize="14" fontWeight="600">Triceps</text>

                <polyline points="182,318 226,328 292,340" fill="none" stroke="#67e8f9" strokeWidth="2" />
                <text x="298" y="344" fill="#a5f3fc" fontSize="14" fontWeight="600">Glutes</text>

                <polyline points="218,448 250,452 304,460" fill="none" stroke="#67e8f9" strokeWidth="2" />
                <text x="308" y="464" fill="#a5f3fc" fontSize="14" fontWeight="600">Hamstrings</text>
              </svg>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
