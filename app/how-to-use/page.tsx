const guideSections = [
  {
    title: "Home Tracker",
    items: [
      "Pick any calendar date to log cardio or weights.",
      "Use Cardio and Weights to toggle that day's activity.",
      "Today's date has a green outline. Holidays use green markers.",
    ],
  },
  {
    title: "Exercises",
    items: [
      "Generate new push or pull days from the exercise page.",
      "Check off individual exercises or the whole workout card.",
      "Use the three-dot menu to swap an exercise with another one for the same muscle group.",
      "Drag exercises within a card to reorder the workout.",
    ],
  },
  {
    title: "Full Body Generator",
    items: [
      "Generate a full body workout when you want a mixed session.",
      "Check off workout exercises and stretches as you finish them.",
      "Open a stretch name to see the reference illustration.",
    ],
  },
  {
    title: "Muscle Diagrams",
    items: [
      "Open the stick-figure icon to view the front and back muscle diagrams.",
      "Click a muscle group label to see matching exercises.",
      "Use the return-arrow Back option at the top of the list to close it.",
    ],
  },
];

export default function HowToUsePage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <section className="mx-auto w-full max-w-5xl px-6 py-10">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-300">
            Site Guide
          </p>
          <h1 className="mt-2 text-3xl font-semibold">How to use Gym Partner</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-400">
            The site tracks workout activity, generates training days, provides a full body option,
            and connects muscle groups with exercises from the diagram page.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {guideSections.map((section) => (
            <article
              key={section.title}
              className="rounded-3xl border border-neutral-800 bg-neutral-900/80 p-6 shadow-lg"
            >
              <h2 className="text-xl font-semibold">{section.title}</h2>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-neutral-300">
                {section.items.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-300" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
