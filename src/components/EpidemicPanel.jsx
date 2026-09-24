import Panel from './Panel';

function EpidemicPanel({ patients = [] }) {
  const total = patients.length;

  const quarantinedPatients = patients.filter((p) => p.etat === 'quarantaine');
  const quarantineCount = quarantinedPatients.length;
  const percent = total > 0 ? Math.round((quarantineCount / total) * 100) : 0;
  const isCrisis = percent >= 15;
  const criticalCases = patients.filter((p) => p.statut === 'critical');

  return (
    <>
      {/* 1. Carte Risque Épidémique : uniquement les cas en quarantaine */}
      <Panel
        title="Risque épidémique"
        badge={isCrisis ? 'Critique' : percent > 0 ? 'À surveiller' : 'Nominal'}
        badgeType={isCrisis ? 'danger' : percent > 0 ? 'warn' : 'ok'}
      >
        <div className="epidemic-stat">
          <span
            className="epidemic-percent"
            style={{ color: isCrisis ? '#ff3366' : percent > 0 ? '#faad14' : '#52c41a' }}
          >
            {percent}%
          </span>
          <span className="epidemic-label">de l'équipage placé en quarantaine</span>
        </div>
        <div className="panel-foot">
          {quarantineCount} sur {total} membres d'équipage concernés
        </div>
      </Panel>

      {/* 2. Carte Cas spéciaux */}
      <Panel
        title="Cas spéciaux"
        badge={String(criticalCases.length)}
        badgeType={criticalCases.length > 0 ? 'warn' : 'ok'}
      >
        {criticalCases.length === 0 ? (
          <div className="skeleton-detail-hint">Aucun cas critique signalé.</div>
        ) : (
          <ul className="special-case-list">
            {criticalCases.map((p) => (
              <li key={p.id}>
                <div className="special-case-name">
                  {p.prenom} {p.nom}
                </div>
                <div className="special-case-note">
                  {p.maladie}
                  {p.derniereMesure &&
                    ` — dernière mesure : ${p.derniereMesure.frequenceCardiaque} bpm, SpO₂ ${p.derniereMesure.spo2}%`}
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Liste des patients en isolement caisson */}
        {quarantineCount > 0 && (
          <div
            style={{
              marginTop: '14px',
              background: 'rgba(255, 51, 102, 0.08)',
              border: '1px solid #ff3366',
              borderRadius: '4px',
              padding: '10px 12px',
              boxShadow: '0 0 10px rgba(255, 51, 102, 0.15)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid rgba(255, 51, 102, 0.3)',
                paddingBottom: '6px',
                marginBottom: '8px',
              }}
            >
              <span
                style={{
                  color: '#ff3366',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  letterSpacing: '0.8px',
                  textTransform: 'uppercase',
                }}
              >
                ⚠️ Confinement caisson
              </span>
              <span
                style={{
                  background: '#ff3366',
                  color: '#fff',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  padding: '1px 6px',
                  borderRadius: '3px',
                  fontFamily: 'monospace',
                }}
              >
                {quarantineCount} CAS
              </span>
            </div>

            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {quarantinedPatients.map((p) => (
                <li
                  key={p.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '4px 0',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                  }}
                >
                  <span style={{ color: '#fff' }}>
                    {p.prenom} {p.nom}
                  </span>
                  <span style={{ color: 'rgba(255, 51, 102, 0.85)', fontSize: '11px' }}>
                    #{p.id} · SAS VERROUILLÉ
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Panel>
    </>
  );
}

export default EpidemicPanel;