import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { loginByCode } from '../lib/api';

function Login({ onLogin }) {
  const containerId = 'qr-scanner-view';
  const scannerRef = useRef(null);
  const hasScannedRef = useRef(false);
  const [scanning, setScanning] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch {
        // Scanner déjà inactif
      }
    }
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

          // On envoie le code exact du QR ("P001", "P002", etc.)
          const code = decodedText.trim();

          try {
            const identity = await loginByCode(code);
            await stopScanner();
            setError('');
            
            // On renvoie les vraies données de la BDD (nom, prenom, login...)
            onLogin({
              ...identity,
              id: identity.login || identity.id || code,
              firstName: identity.prenom || identity.firstName || 'Patient',
              lastName: identity.nom || identity.lastName || code,
            });
          } catch (apiErr) {
            console.error('Échec authentification BDD :', apiErr);
            setError(apiErr.message || `Badge "${code}" non reconnu.`);
            hasScannedRef.current = false;
            setChecking(false);
          }
        },
        () => {}
      )
      .catch((err) => {
        console.error('Impossible d’accéder à la caméra :', err);
        setError("Impossible d'accéder à la caméra. Vérifie les autorisations.");
        setScanning(false);
      });

    return () => {
      stopScanner();
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
          <div id={containerId} className="qr-video-box" style={{ width: '100%', minHeight: '240px' }} />
        ) : (
          <button type="button" className="login-submit" onClick={() => setScanning(true)}>
            Commencer le scan de la puce
          </button>
        )}

        {checking && (
          <div className="qr-hint" style={{ color: '#00ebff', marginTop: '10px' }}>
            Interrogation de la base de données…
          </div>
        )}

        {error && (
          <div className="login-error" style={{ color: '#ff3366', marginTop: '10px' }}>
            {error}
          </div>
        )}

        {scanning && !checking && (
          <div className="qr-hint" style={{ marginTop: '10px' }}>
            Place le QR code du badge dans le cadre.
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;