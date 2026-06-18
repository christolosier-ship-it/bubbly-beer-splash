import { BeerBackground } from "./beer-background/BeerBackground";
import { getBeerPalette } from "./beer-background/palette";
import { ControlsPanel } from "./prototype/ControlsPanel";
import { usePrototypeSettings } from "./prototype/usePrototypeSettings";

export default function App() {
  const {
    beerT,
    setBeerT,
    bubbleDensity,
    setBubbleDensity,
    foamIntensity,
    setFoamIntensity,
    panelOpen,
    setPanelOpen,
  } = usePrototypeSettings();

  return (
    <>
      <BeerBackground
        beerT={beerT}
        bubbleDensity={bubbleDensity}
        foamIntensity={foamIntensity}
      />

      <ControlsPanel
        beerName={getBeerPalette(beerT).name}
        beerT={beerT}
        bubbleDensity={bubbleDensity}
        foamIntensity={foamIntensity}
        panelOpen={panelOpen}
        onBeerTChange={setBeerT}
        onBubbleDensityChange={setBubbleDensity}
        onFoamIntensityChange={setFoamIntensity}
        onToggle={() => setPanelOpen((open) => !open)}
      />
    </>
  );
}
