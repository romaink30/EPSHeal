import { useEffect, useState } from 'react';
import IdentityCard from './IdentityCard';
import MedicalHistory from './MedicalHistory';
import HeartActivity from './HeartActivity';
import Skeleton from './Skeleton';
import { fetchPatientDetail } from '../lib/api';

function PatientFile({ patientId }) {
  const [patient, setPatient] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!patientId) return;
    setPatient(null);
    setError('');

    fetchPatientDetail(patientId)
      .then(setPatient)
      .catch((err) => setError(err.message));
  }, [patientId]);

  if (!patientId) {
    return (
      <div className="figure-panel">
        <div className="skeleton-detail-hint">Sélectionne un patient dans la liste.</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="figure-panel">
        <div className="login-error">{error}</div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="figure-panel">
        <div className="skeleton-detail-hint">Chargement du dossier…</div>
      </div>
    );
  }

  const lastMeasure = patient.mesures[patient.mesures.length - 1] ?? null;

  return (
    <div className="patient-file">
      <IdentityCard
        name={`${patient.prenom} ${patient.nom}`}
        fields={[
          { label: 'Date de naissance', value: patient.dateNaissance },
          { label: 'Sexe', value: patient.sexe },
        ]}
      />
      <MedicalHistory
        entries={[`Trouble diagnostiqué : ${patient.maladie}`, `Date du diagnostic : ${patient.dateDiagnostic}`]}
      />
      <HeartActivity
        rhythmStatus={patient.maladie}
        variability={lastMeasure ? `SpO₂ ${lastMeasure.spo2}%` : '—'}
        lastIrregularEpisode={
          lastMeasure
            ? `${lastMeasure.frequenceCardiaque} bpm · ${lastMeasure.tensionSystolique}/${lastMeasure.tensionDiastolique} mmHg (${lastMeasure.date})`
            : 'aucune mesure'
        }
      />
      <Skeleton />
    </div>
  );
}

export default PatientFile;
