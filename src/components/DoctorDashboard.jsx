import { useEffect, useState } from 'react';
import IdentityCard from './IdentityCard';
import PatientList from './PatientList';
import PatientFile from './PatientFile';
import EpidemicPanel from './EpidemicPanel';
import LlmPsy from './LlmPsy';
import { fetchPatients } from '../lib/api';

function DoctorDashboard({ currentUser }) {
  const [patients, setPatients] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPatients()
      .then((data) => {
        setPatients(data);
        if (data.length > 0) setSelectedId(data[0].id);
      })
      .catch((err) => setError(err.message));
  }, []);

  // Recherche du patient actuellement sélectionné
  const currentSelectedPatient = patients.find((p) => p.id === selectedId);

  // Formatage des données envoyées à l'IA avec le contexte du patient ciblé
  const patientContextForLlm = currentSelectedPatient
    ? {
        id: currentSelectedPatient.login || currentSelectedPatient.id,
        prenom: currentSelectedPatient.prenom,
        nom: currentSelectedPatient.nom,
        role: 'Patient',
        statut: 'Dossier sous revue médicale',
        observations: currentSelectedPatient.maladie_rythme_cardiaque || 'Aucune observation enregistrée.',
        dateDiagnostic: currentSelectedPatient.date_diagnostic || 'N/A',
        notesPsy: 'Consultation dossier par médecin référent.',
      }
    : null;

  return (
    <main className="grid doctor-grid">
      {/* Colonne 1 : Profil médecin & Liste des patients */}
      <section className="col">
        <IdentityCard
          name={`Dr ${currentUser.prenom || currentUser.firstName || ''} ${currentUser.nom || currentUser.lastName || ''}`}
          fields={[
            { label: 'Rôle', value: 'Médecin de bord' },
            { label: 'Spécialité', value: currentUser.specialite || 'Médecine générale spatiale' },
          ]}
        />
        {error ? (
          <div className="login-error">{error}</div>
        ) : (
          <PatientList patients={patients} selectedId={selectedId} onSelect={setSelectedId} />
        )}
      </section>

      {/* Colonne 2 : Dossier détaillé du patient sélectionné */}
      <section className="col">
        <PatientFile patientId={selectedId} />
      </section>

      {/* Colonne 3 : Surveillance épidémique & Assistant IA */}
      <section className="col">
        <LlmPsy patientActuel={patientContextForLlm} isDoctor={true} />
        <EpidemicPanel patients={patients} />
      </section>
    </main>
  );
}

export default DoctorDashboard;