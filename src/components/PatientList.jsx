import Panel from './Panel';

function PatientList({ patients, selectedId, onSelect }) {
  return (
    <Panel title="Liste patient">
      <ul className="patient-list">
        {patients.map((p) => (
          <li key={p.id}>
            <button
              type="button"
              className={`patient-list-item ${p.id === selectedId ? 'active' : ''}`}
              onClick={() => onSelect(p.id)}
            >
              <span className="patient-list-name">
                {p.prenom} {p.nom}
              </span>
              <span className="patient-list-id">#{p.id}</span>
              {p.statut === 'critical' && <span className="patient-list-flag">critique</span>}
              {p.statut === 'watch' && <span className="patient-list-flag warn">à surveiller</span>}
            </button>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

export default PatientList;
