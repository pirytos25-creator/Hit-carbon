import { StrictMode, lazy, Suspense, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

// Atlas układów to osobny tryb pod adresem #atlas (bez sceny 3D i 12 aktów).
const AtlasApp = lazy(() => import('./atlas/AtlasApp'));

const isAtlas = () => window.location.hash.startsWith('#atlas');

// Film: wczesne wczytanie modelu siłowni i manifestu narracji (dawniej <link rel="preload"> w index.html, które
// wczytywało je także w #atlas i dawało ostrzeżenia w konsoli). Atlas ich nie potrzebuje.
if (!isAtlas()) {
  for (const href of ['/models/athlete_gym.glb', '/audio/narration/manifest.json']) {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'fetch';
    link.href = href;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  }
}

function Root() {
  const [atlas] = useState(isAtlas);
  useEffect(() => {
    const onHash = () => {
      // Zmiana trybu (scena 3D <-> atlas): pełne przeładowanie, żeby oba tryby startowały czysto.
      if (isAtlas() !== atlas) window.location.reload();
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, [atlas]);

  return atlas ? (
    <Suspense fallback={null}>
      <AtlasApp />
    </Suspense>
  ) : (
    <App />
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>
);
