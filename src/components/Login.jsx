import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

const CREW_DIRECTORY = {
  '7714-B': { firstName: 'Léa', lastName: 'Cassini' },
};

// Profil utilisé pour le contournement en phase de dev
const DEV_USER = { firstName: 'Léa', lastName: 'Cassini' };

function Login({ onLogin }) {
  const containerId = 'qr-scanner-view';
  const scannerRef = useRef(null);
  const hasScannedRef = useRef(false);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');

  // Gestion du bypass dev
  const handleBypass = () => {
    if (scannerRef.current && scanning) {
      scannerRef.current.stop().catch(() => {});
    }
    onLogin(DEV_USER);
  };

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
        () => {}
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

        {/* Bouton de bypass temporaire */}
        <button
          type="button"
          onClick={handleBypass}
          style={{
            marginTop: '1rem',
            background: 'none',
            border: '1px dashed #666',
            color: '#aaa',
            padding: '8px 14px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.85rem'
          }}
        >
          Connexion rapide (Dev Bypass)
        </button>

        {error && <div className="login-error">{error}</div>}

        {scanning && <div className="qr-hint">Place le QR code du badge dans le cadre.</div>}
      </div>
    </div>
  );
}

export default Login;