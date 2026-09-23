import { useEffect, useState } from 'react';
import IdentityCard from './IdentityCard';
import PatientList from './PatientList';
import PatientFile from './PatientFile';
import EpidemicPanel from './EpidemicPanel';
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

  return (
    <main className="grid doctor-grid">
      <section className="col">
        <IdentityCard
          name={`Dr ${currentUser.prenom} ${currentUser.nom}`}
          fields={[{ label: 'Spécialité', value: currentUser.specialite }]}
        />
        {error ? <div className="login-error">{error}</div> : <PatientList patients={patients} selectedId={selectedId} onSelect={setSelectedId} />}
      </section>

      <section className="col">
        <PatientFile patientId={selectedId} />
      </section>

      <section className="col">
        <EpidemicPanel patients={patients} />
      </section>
    </main>
  );
}

export default DoctorDashboard;
