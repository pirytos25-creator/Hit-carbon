import { StrictMode, lazy, Suspense, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

// Atlas układów to osobny tryb pod adresem #atlas (bez sceny 3D i 12 aktów).
const AtlasApp = lazy(() => import('./atlas/AtlasApp'));

const isAtlas = () => window.location.hash.startsWith('#atlas');

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
