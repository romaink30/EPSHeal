import { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

// Ouvre la caméra du navigateur (nécessite HTTPS ou localhost, et
// l'autorisation de l'utilisateur) et décode en continu ce qu'elle voit.
// Dès qu'un QR code est reconnu, onScan(texte) est appelé une seule fois.
function QrScanner({ onScan, onClose }) {
  const containerId = 'qr-scanner-view';
  const scannerRef = useRef(null);
  const hasScannedRef = useRef(false);

  useEffect(() => {
    const scanner = new Html5Qrcode(containerId);
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (decodedText) => {
          if (hasScannedRef.current) return;
          hasScannedRef.current = true;
          onScan(decodedText);
        },
        () => {
          // erreurs de décodage image par image, ignorées (normal tant
          // qu'aucun QR code n'est dans le cadre)
        }
      )
      .catch((err) => {
        console.error('Impossible d’accéder à la caméra :', err);
      });

    return () => {
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .then(() => scannerRef.current.clear())
          .catch(() => {});
      }
    };
  }, [onScan]);

  return (
    <div className="qr-overlay">
      <div className="qr-modal">
        <div className="qr-modal-head">
          <span>Scanner le badge équipage</span>
          <button className="psy-icon-btn" onClick={onClose} title="Fermer">
            ×
          </button>
        </div>
        <div id={containerId} className="qr-video-box" />
        <div className="qr-hint">Place le QR code du badge dans le cadre.</div>
      </div>
    </div>
  );
}

export default QrScanner;
