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

  if (!currentUser) {
    return <Login onLogin={setCurrentUser} />;
  }

  // Résolution prioritaire des données selon l'utilisateur scanné (P001, 7714-B, etc.)
  const activeId = currentUser.id || currentUser.crewId || crew.crewId;
  const firstName = currentUser.firstName || currentUser.prenom || 'Équipage';
  const lastName = currentUser.lastName || currentUser.nom || activeId;
  const cryoBay = currentUser.cryoBay ?? crew.cryoBay;
  const departureDate = currentUser.departureDate || crew.departureDate;
  const role = currentUser.role || 'Spécialiste de mission';
  const grade = currentUser.grade || '';

  // Objet transmis au module LLM
  const patientData = {
    id: activeId,
    prenom: firstName,
    nom: lastName,
    grade: grade,
    role: role,
    statut: 'stable',
    constantes: {
      pouls: 72,
      rythme: 'Sinusal',
      spo2: '98%',
      tension: '12/8',
      cerveau: 'Alpha (Calme)',
    },
    antecedents: medicalHistory.join(' '),
    allergies: 'Aucune allergie connue.',
    observations: 'Densité osseuse en légère baisse.',
    notesPsy: 'Paramètres psychologiques stables.',
  };

  return (
    <div className="app">
      <TopBar
        missionName={mission.name}
        destination={mission.destination}
        sol={mission.sol}
        online={mission.online}
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
          />
        </section>

        {/* Colonne centrale */}
        <section className="col" style={{ display: 'flex' }}>
          <Skeleton />
        </section>

        {/* Colonne droite */}
        <section className="col">
          <LlmPsy patientActuel={patientData} />
          <ToWatch alerts={alerts} logEntries={logEntries} />
          <SleepCycle nights={sleepNights} average="6h48" target="7h00" />
        </section>
      </main>
    </div>
  );
}

export default App;