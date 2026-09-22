import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

// Base de correspondance de démonstration : ID de badge -> identité.
// À remplacer plus tard par une vraie recherche en base de données /
// API backend.
const CREW_DIRECTORY = {
  '7714-B': { firstName: 'Léa', lastName: 'Cassini' },
};

// La caméra ne s'active qu'après un clic sur "Commencer le scan de la
// puce" (le navigateur ne peut de toute façon pas démarrer la caméra
// sans un premier geste de l'utilisateur, mais c'est aussi plus clair
// niveau UX). Dès qu'un QR code reconnu est scanné, onLogin est appelé
// directement avec l'identité correspondante.
function Login({ onLogin }) {
  const containerId = 'qr-scanner-view';
  const scannerRef = useRef(null);
  const hasScannedRef = useRef(false);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!scanning) return;

    const scanner = new Html5Qrcode(containerId);
    scannerRef.current = scanner;
    hasScannedRef.current = false;

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (decodedText) => {
          if (hasScannedRef.current) return;
          hasScannedRef.current = true;

          const match = CREW_DIRECTORY[decodedText.trim()];
          if (!match) {
            setError('Badge non reconnu.');
            hasScannedRef.current = false;
            return;
          }

          setError('');
          onLogin(match);
        },
        () => {
          // erreurs de décodage image par image, ignorées (normal tant
          // qu'aucun QR code n'est dans le cadre)
        }
      )
      .catch((err) => {
        console.error('Impossible d’accéder à la caméra :', err);
        setError("Impossible d'accéder à la caméra. Vérifie les autorisations du navigateur.");
        setScanning(false);
      });

    return () => {
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .then(() => scannerRef.current.clear())
          .catch(() => {});
      }
    };
  }, [scanning, onLogin]);

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-brand">
          EPS<span>HEAL</span>
        </div>
        <div className="login-subtitle">Authentification équipage requise</div>

        {scanning ? (
          <div id={containerId} className="qr-video-box" />
        ) : (
          <button type="button" className="login-submit" onClick={() => setScanning(true)}>
            Commencer le scan de la puce
          </button>
        )}

        {error && <div className="login-error">{error}</div>}

        {scanning && <div className="qr-hint">Place le QR code du badge dans le cadre.</div>}
      </div>
    </div>
  );
}

export default Login;