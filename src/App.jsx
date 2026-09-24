import { useState } from 'react';
import './styles/dashboard.css';
import Login from './components/Login';
import TopBar from './components/TopBar';
import IdentityCard from './components/IdentityCard';
import MedicalHistory from './components/MedicalHistory';
import HeartActivity from './components/HeartActivity';
import Skeleton from './components/Skeleton';
import LlmPsy from './components/LlmPsy';
import ToWatch from './components/ToWatch';
import SleepCycle from './components/SleepCycle';
import DoctorDashboard from './components/DoctorDashboard';

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  const [mission] = useState({
    name: 'ARES-VOYAGEUR',
    destination: 'PROXIMA b',
    sol: 214,
    online: true,
  });

  const [crew] = useState({
    crewId: '7714-B',
    cryoBay: 3,
    departureDate: '11 mars 2080',
  });

  const [medicalHistory] = useState([
    'Aucune allergie connue.',
    'Appendicectomie (2071).',
    'Vaccination de mission à jour (dernier rappel : sol 4).',
  ]);

  const [sleepNights] = useState([62, 78, 55, 88, 70, 82, 75]);

  const [alerts] = useState([
    { level: 'warn', text: 'Densité osseuse en légère baisse — programme renforcé recommandé.' },
    { level: 'ok', text: 'Aucune alerte critique active.' },
  ]);

  const [logEntries] = useState([
    { time: 'Sol 214 · 06:12', text: 'Contrôle de routine — aucune anomalie détectée.' },
    { time: 'Sol 213 · 22:40', text: "Séance d'exercice compensatoire complétée (45 min, résistance)." },
    { time: 'Sol 212 · 09:05', text: 'Prélèvement sanguin — analyse en cours au laboratoire de bord.' },
    { time: 'Sol 210 · 14:30', text: 'Ajustement du programme de contre-mesure osseuse.' },
  ]);

  const handleLogout = () => {
    setCurrentUser(null);
  };

  if (!currentUser) {
    return <Login onLogin={setCurrentUser} />;
  }

  // Vue Médecin
  if (currentUser.role === 'doctor' || currentUser.role === 'medecin') {
    return (
      <div className="app">
        <TopBar
          missionName={mission.name}
          destination={mission.destination}
          sol={mission.sol}
          online={mission.online}
          onLogout={handleLogout}
        />
        <DoctorDashboard currentUser={currentUser} />
      </div>
    );
  }

  // Vue Patient
  const activeId = currentUser.id || currentUser.crewId || crew.crewId;
  const firstName = currentUser.firstName || currentUser.prenom || 'Équipage';
  const lastName = currentUser.lastName || currentUser.nom || activeId;
  const cryoBay = currentUser.cryoBay ?? crew.cryoBay;
  const departureDate = currentUser.departureDate || crew.departureDate;
  const role = currentUser.role || 'Spécialiste de mission';
  const grade = currentUser.grade || '';
  const etat = currentUser.etat || 'normal';

  const patientData = {
    id: activeId,
    prenom: firstName,
    nom: lastName,
    grade: grade,
    role: role,
    etat: etat,
    statut: etat === 'quarantaine' ? 'quarantaine' : 'stable',
    constantes: {
      pouls: 72,
      rythme: 'Sinusal',
      spo2: '98%',
      tension: '12/8',
      cerveau: 'Alpha (Calme)',
    },
    antecedents: medicalHistory.join(' '),
    allergies: 'Aucune allergie connue.',
    observations: etat === 'quarantaine' ? 'Isolement d’urgence actif.' : 'Densité osseuse en légère baisse.',
    notesPsy: etat === 'quarantaine' ? 'Stress élevé — soutien d’isolement requis.' : 'Paramètres psychologiques stables.',
  };

  return (
    <div className="app">
      <TopBar
        missionName={mission.name}
        destination={mission.destination}
        sol={mission.sol}
        online={mission.online}
        onLogout={handleLogout}
        etat={etat}
      />

      <main className="grid">
        {/* Colonne gauche */}
        <section className="col">
          <IdentityCard
            name={`${grade ? `${grade} ` : ''}${firstName} ${lastName}`}
            crewId={activeId}
            cryoBay={cryoBay}
            departureDate={departureDate}
            role={role}
          />
          <MedicalHistory entries={medicalHistory} />
          <HeartActivity
            rhythmStatus="Rythme sinusal"
            variability="42 ms"
            lastIrregularEpisode="aucun"
            bpm={patientData.constantes.pouls}
          />
        </section>

        {/* Colonne centrale */}
        <section className="col" style={{ display: 'flex' }}>
          <Skeleton />
        </section>

        {/* Colonne droite */}
        <section className="col">
          <LlmPsy patientActuel={patientData} />
          <ToWatch alerts={alerts} logEntries={logEntries} etat={etat} />
          <SleepCycle nights={sleepNights} average="6h48" target="7h00" />
        </section>
      </main>
    </div>
  );
}

export default App;