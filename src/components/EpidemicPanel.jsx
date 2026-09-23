import Panel from './Panel';

function EpidemicPanel({ patients }) {
  const total = patients.length;
  const atRiskCount = patients.filter((p) => p.statut !== 'normal').length;
  const percent = total > 0 ? Math.round((atRiskCount / total) * 100) : 0;
  const criticalCases = patients.filter((p) => p.statut === 'critical');

  return (
    <>
      <Panel
        title="Risque épidémique"
        badge={percent >= 30 ? 'À surveiller' : 'Faible'}
        badgeType={percent >= 30 ? 'warn' : 'ok'}
      >
        <div className="epidemic-stat">
          <span className="epidemic-percent">{percent}%</span>
          <span className="epidemic-label">de l'équipage avec des constantes anormales</span>
        </div>
        <div className="panel-foot">
          {atRiskCount} sur {total} membres d'équipage concernés
        </div>
      </Panel>

      <Panel title="Cas spéciaux" badge={String(criticalCases.length)} badgeType={criticalCases.length > 0 ? 'warn' : 'ok'}>
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
      </Panel>
    </>
  );
}

export default EpidemicPanel;
