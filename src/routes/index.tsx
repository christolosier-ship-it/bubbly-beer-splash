import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Bière – Animation" },
      { name: "description", content: "Fond animé de bière avec bulles et mousse." },
      { property: "og:title", content: "Bière – Animation" },
      { property: "og:description", content: "Fond animé de bière avec bulles et mousse." },
    ],
  }),
  component: Index,
});

function Index() {
  const bubbles = Array.from({ length: 40 }, (_, i) => {
    const size = 6 + Math.random() * 22;
    const left = Math.random() * 100;
    const duration = 4 + Math.random() * 8;
    const delay = Math.random() * 10;
    const drift = (Math.random() - 0.5) * 40;
    return { i, size, left, duration, delay, drift };
  });

  return (
    <main className="beer-stage">
      <div className="beer-liquid" aria-hidden />
      <div className="beer-bubbles" aria-hidden>
        {bubbles.map((b) => (
          <span
            key={b.i}
            className="bubble"
            style={{
              width: `${b.size}px`,
              height: `${b.size}px`,
              left: `${b.left}%`,
              animationDuration: `${b.duration}s`,
              animationDelay: `-${b.delay}s`,
              ["--drift" as never]: `${b.drift}px`,
            }}
          />
        ))}
      </div>
      <div className="beer-foam" aria-hidden>
        <div className="foam-base" />
        <div className="foam-bubbles">
          {Array.from({ length: 60 }).map((_, i) => {
            const size = 14 + Math.random() * 46;
            return (
              <span
                key={i}
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  opacity: 0.55 + Math.random() * 0.45,
                }}
              />
            );
          })}
        </div>
      </div>
    </main>
  );
}
