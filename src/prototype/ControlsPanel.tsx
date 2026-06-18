import "./prototype-controls.css";

type ControlsPanelProps = {
  beerName: string;
  beerT: number;
  bubbleDensity: number;
  foamIntensity: number;
  panelOpen: boolean;
  onBeerTChange: (value: number) => void;
  onBubbleDensityChange: (value: number) => void;
  onFoamIntensityChange: (value: number) => void;
  onToggle: () => void;
};

export function ControlsPanel({
  beerName,
  beerT,
  bubbleDensity,
  foamIntensity,
  panelOpen,
  onBeerTChange,
  onBubbleDensityChange,
  onFoamIntensityChange,
  onToggle,
}: ControlsPanelProps) {
  return (
    <>
      <button
        type="button"
        className="beer-toggle"
        onClick={onToggle}
        aria-expanded={panelOpen}
        aria-controls="beer-controls"
      >
        {panelOpen ? "Masquer" : "Réglages"}
      </button>

      {panelOpen && (
        <section
          id="beer-controls"
          className="beer-controls"
          aria-label="Réglages de la bière"
        >
          <header>
            <h1>Réglages</h1>
          </header>

          <label>
            <span>Couleur du liquide</span>
            <input
              type="range"
              min={0}
              max={100}
              value={beerT}
              onChange={(event) => onBeerTChange(Number(event.target.value))}
              aria-label="Couleur du liquide"
            />
            <small>{beerName}</small>
          </label>

          <label>
            <span>Densité des bulles</span>
            <input
              type="range"
              min={0}
              max={100}
              value={bubbleDensity}
              onChange={(event) =>
                onBubbleDensityChange(Number(event.target.value))
              }
              aria-label="Densité des bulles"
            />
            <small>{bubbleDensity}%</small>
          </label>

          <label>
            <span>Intensité de la mousse</span>
            <input
              type="range"
              min={0}
              max={100}
              value={foamIntensity}
              onChange={(event) =>
                onFoamIntensityChange(Number(event.target.value))
              }
              aria-label="Intensité de la mousse"
            />
            <small>{foamIntensity}%</small>
          </label>
        </section>
      )}
    </>
  );
}
