import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";

const renderStartupError = (message: string, error?: unknown) => {
  console.error(message, error);

  document.body.innerHTML = `
    <main style="font-family: system-ui, sans-serif; max-width: 42rem; margin: 4rem auto; padding: 1.5rem; line-height: 1.5; color: #2a1604;">
      <h1 style="margin-top: 0;">Impossible de démarrer l’application</h1>
      <p>${message}</p>
      <p>Ouvrez la console du navigateur pour consulter le détail de l’erreur.</p>
    </main>
  `;
};

try {
  const rootElement = document.getElementById("root");

  if (!rootElement) {
    throw new Error('Élément racine "#root" introuvable.');
  }

  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch((error: unknown) => {
        console.error("Échec de l’enregistrement du service worker.", error);
      });
    });
  }
} catch (error) {
  renderStartupError("Une erreur JavaScript empêche l’affichage de l’application.", error);
}
