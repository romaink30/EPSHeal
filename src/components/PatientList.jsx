import Panel from './Panel';

function PatientList({ patients, selectedId, onSelect }) {
  // Calcul de crise sanitaire (seuil des 15%)
  const totalCount = patients.length;
  const quarantineCount = patients.filter((p) => p.etat === 'quarantaine').length;
  const quarantineRate = totalCount > 0 ? (quarantineCount / totalCount) * 100 : 0;
  const isCrisisActive = quarantineRate >= 15;

  // Tri : Quarantaine en premier, puis le reste
  const sortedPatients = [...patients].sort((a, b) => {
    const aIsQ = a.etat === 'quarantaine';
    const bIsQ = b.etat === 'quarantaine';
    if (aIsQ && !bIsQ) return -1;
    if (!aIsQ && bIsQ) return 1;
    return 0;
  });

  return (
    <Panel title="Liste patient">
      {/* Conteneur scrollable propre pour la liste */}
      <div style={{ maxHeight: '380px', overflowY: 'auto', paddingRight: '4px' }}>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {sortedPatients.map((p) => {
            const isQ = p.etat === 'quarantaine';
            const isSelected = p.id === selectedId;
            // "critique" reste basé sur les vraies mesures vitales : un
            // médecin ne doit pas pouvoir masquer une urgence réelle juste
            // en repassant le statut manuel à RAS.
            const isCriticalAuto = !isQ && p.statut === 'critical';
            // "à surveiller" et "R.A.S" suivent désormais uniquement le
            // choix manuel du médecin (etat), pour qu'il puisse effectivement
            // remettre un patient à RAS même si ses dernières mesures le
            // classaient "watch" automatiquement.
            const isWatch = !isQ && !isCriticalAuto && p.etat === 'a_surveiller';
            const isRas = !isQ && !isCriticalAuto && !isWatch && p.etat === 'normal';

            return (
              <li key={p.id} style={{ marginBottom: '6px' }}>
                <button
                  type="button"
                  onClick={() => onSelect(p.id)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: isSelected
                      ? 'rgba(0, 229, 255, 0.15)'
                      : isQ
                      ? 'rgba(255, 51, 102, 0.08)'
                      : 'rgba(255, 255, 255, 0.03)',
                    border: isSelected
                      ? '1px solid #00e5ff'
                      : isQ
                      ? '1px solid rgba(255, 51, 102, 0.4)'
                      : '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '4px',
                    padding: '8px 10px',
                    color: '#fff',
                    fontFamily: 'monospace',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: isQ ? '#ff3366' : 'var(--cyan-dim, #00e5ff)' }}>
                      #{p.id}
                    </span>
                    <span style={{ fontWeight: isSelected ? 'bold' : 'normal' }}>
                      {p.prenom} {p.nom}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    {isQ && (
                      <span
                        style={{
                          background: '#ff3366',
                          color: '#fff',
                          fontSize: '10px',
                          fontWeight: 'bold',
                          padding: '2px 6px',
                          borderRadius: '3px',
                          letterSpacing: '0.5px',
                          textTransform: 'uppercase',
                        }}
                      >
                        quarantaine
                      </span>
                    )}
                    {isCriticalAuto && (
                      <span
                        style={{
                          background: 'rgba(255, 77, 79, 0.2)',
                          color: '#ff4d4f',
                          border: '1px solid #ff4d4f',
                          fontSize: '10px',
                          padding: '2px 6px',
                          borderRadius: '3px',
                        }}
                      >
                        critique
                      </span>
                    )}
                    {isWatch && (
                      <span
                        style={{
                          background: 'rgba(250, 173, 20, 0.15)',
                          color: '#faad14',
                          border: '1px solid #faad14',
                          fontSize: '10px',
                          padding: '2px 6px',
                          borderRadius: '3px',
                        }}
                      >
                        à surveiller
                      </span>
                    )}
                    {isRas && (
                      <span
                        style={{
                          background: 'rgba(82, 196, 26, 0.15)',
                          color: '#52c41a',
                          border: '1px solid #52c41a',
                          fontSize: '10px',
                          fontWeight: 'bold',
                          padding: '2px 6px',
                          borderRadius: '3px',
                          letterSpacing: '0.5px',
                        }}
                      >
                        R.A.S
                      </span>
                    )}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Card alerte de crise intégrée en dessous de la liste */}
      {isCrisisActive && (
        <div
          style={{
            marginTop: '12px',
            padding: '10px 12px',
            background: 'rgba(255, 51, 102, 0.12)',
            border: '1px solid #ff3366',
            borderRadius: '4px',
            boxShadow: '0 0 12px rgba(255, 51, 102, 0.2)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '4px',
            }}
          >
            <span
              style={{
                color: '#ff3366',
                fontWeight: 'bold',
                fontSize: '11px',
                letterSpacing: '1px',
                textTransform: 'uppercase',
              }}
            >
              ⚠️ Protocole Quarantaine Actif
            </span>
            <span
              style={{
                color: '#ff3366',
                fontFamily: 'monospace',
                fontWeight: 'bold',
                fontSize: '11px',
              }}
            >
              {Math.round(quarantineRate)}%
            </span>
          </div>
          <p
            style={{
              margin: 0,
              fontSize: '11.5px',
              color: 'rgba(255, 255, 255, 0.8)',
              lineHeight: '1.4',
            }}
          >
            Seuil critique de 15 % dépassé : <strong>{quarantineCount}</strong> membres d'équipage placés en confinement caisson[cite: 3]. Sas communs verrouillés.
          </p>
        </div>
      )}
    </Panel>
  );
}

export default PatientList;