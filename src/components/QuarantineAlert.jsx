import { useState } from 'react';

// S'affiche une fois à l'arrivée sur le hub si le patient connecté est
// marqué en quarantaine (currentUser.etat === 'quarantaine'). Le patient
// doit cliquer pour la fermer — elle ne se ferme pas toute seule.
function QuarantineAlert({ patientName }) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="quarantine-overlay">
      <div className="quarantine-modal">
        <div className="quarantine-icon">⚠</div>
        <div className="quarantine-title">Protocole de quarantaine actif</div>
        <p className="quarantine-text">
          {patientName ? `${patientName}, tu` : 'Tu'} as été placé(e) en isolement par l'équipe médicale de bord.
          Merci de rester dans ton caisson de repos et d'attendre les instructions du médecin.
        </p>
        <button type="button" className="quarantine-ack-btn" onClick={() => setDismissed(true)}>
          J'ai compris
        </button>
      </div>
    </div>
  );
}

export default QuarantineAlert;