import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
<<<<<<< HEAD
import { loginByCode } from '../lib/api';

// La caméra ne s'active qu'après un clic sur "Commencer le scan de la
// puce". Le texte décodé du QR (le "login" du patient ou du médecin en
// base) est envoyé à l'API, qui renvoie l'identité correspondante.
=======

const CREW_DIRECTORY = {
  '7714-B': { firstName: 'Léa', lastName: 'Cassini' },
};

// Profil utilisé pour le contournement en phase de dev
const DEV_USER = { firstName: 'Léa', lastName: 'Cassini' };

>>>>>>> bec2727cdc3a0c71f1685d8fcd74d365ea8d0d9e
function Login({ onLogin }) {
  const containerId = 'qr-scanner-view';
  const scannerRef = useRef(null);
  const hasScannedRef = useRef(false);
  const [scanning, setScanning] = useState(false);
  const [checking, setChecking] = useState(false);
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
        async (decodedText) => {
          if (hasScannedRef.current) return;
          hasScannedRef.current = true;
          setChecking(true);

          try {
            const identity = await loginByCode(decodedText.trim());
            setError('');
            onLogin(identity);
          } catch (err) {
            setError(err.message || 'Badge non reconnu.');
            hasScannedRef.current = false;
            setChecking(false);
          }
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

<<<<<<< HEAD
        {checking && <div className="qr-hint">Vérification du badge…</div>}
=======
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

>>>>>>> bec2727cdc3a0c71f1685d8fcd74d365ea8d0d9e
        {error && <div className="login-error">{error}</div>}

        {scanning && !checking && <div className="qr-hint">Place le QR code du badge dans le cadre.</div>}
      </div>
    </div>
  );
}

export default Login;
