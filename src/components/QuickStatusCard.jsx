import { useEffect, useState } from 'react';
import Panel from './Panel';
import { updatePatientStatus } from '../lib/api';

const OPTIONS = [
  { value: 'normal', label: 'RAS' },
  { value: 'a_surveiller', label: 'À surveiller' },
  { value: 'quarantaine', label: 'En quarantaine' },
];

// Carte liée au patient actuellement sélectionné dans la liste (celui
// affiché au centre) : le nom s'affiche pour confirmation, et le
// changement de statut s'applique à CE patient précis.
function QuickStatusCard({ patient, onStatusChange }) {
  const [statut, setStatut] = useState('ras');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Quand le patient sélectionné change, on réaffiche son statut actuel.
  useEffect(() => {
    setStatut(patient?.etat || 'normal');
    setSuccess(false);
    setError('');
  }, [patient?.id]);

  if (!patient) {
    return (
      <Panel title="Changer l'état du patient">
        <div className="skeleton-detail-hint">Sélectionne un patient dans la liste.</div>
      </Panel>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      await updatePatientStatus(patient.id, statut);
      setSuccess(true);
      onStatusChange?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Panel title="Changer l'état du patient">
      <div className="quick-status-name">
        {patient.prenom} {patient.nom} <span className="patient-list-id">#{patient.id}</span>
      </div>

      <form onSubmit={handleSubmit} className="quick-status-form">
        <select
          className="status-select"
          value={statut}
          onChange={(e) => {
            setStatut(e.target.value);
            setSuccess(false);
          }}
        >
          {OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <button type="submit" className="login-submit" disabled={saving}>
          {saving ? 'Mise à jour…' : 'Valider'}
        </button>
      </form>

      {success && <div className="panel-foot quick-status-success">Statut mis à jour.</div>}
      {error && <div className="login-error">{error}</div>}
    </Panel>
  );
}

export default QuickStatusCard;