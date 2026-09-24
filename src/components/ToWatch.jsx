import Panel from './Panel';

function ToWatch({ alerts = [], logEntries = [], etat }) {
  const isQuarantine = etat === 'quarantaine';

  return (
    <Panel title="À voir">
      {/* Alerte rouge prioritaire si le patient est placé en quarantaine */}
      {isQuarantine && (
        <div
          style={{
            backgroundColor: 'rgba(255, 77, 79, 0.15)',
            borderLeft: '3px solid #ff4d4f',
            borderTop: '1px solid rgba(255, 77, 79, 0.3)',
            borderRight: '1px solid rgba(255, 77, 79, 0.3)',
            borderBottom: '1px solid rgba(255, 77, 79, 0.3)',
            borderRadius: '4px',
            padding: '10px 12px',
            marginBottom: '12px',
            color: '#fff',
            fontSize: '12.5px',
            lineHeight: '1.4',
            boxShadow: '0 0 10px rgba(255, 77, 79, 0.25)',
          }}
        >
          <div style={{ color: '#ff4d4f', fontWeight: 'bold', marginBottom: '3px', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.8px' }}>
            ⚠️ Mesure d'urgence sanitaire
          </div>
          <div>
            <strong>PROTOCOLE QUARANTAINE ACTIF :</strong> Confinement obligatoire au caisson de repos. Accès aux sas communs désactivé.
          </div>
        </div>
      )}

      <ul style={{ listStyle: 'none', margin: '0 0 10px', padding: 0 }}>
        {alerts.map((item, i) => (
          <li
            key={i}
            className={`alert-${item.level}`}
            style={{
              padding: '8px 10px',
              borderRadius: '3px',
              fontSize: '12.5px',
              marginBottom: '6px',
              borderLeft: '2px solid var(--text-dim)',
            }}
          >
            {item.text}
          </li>
        ))}
      </ul>

      <ul className="log-list" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {/* Entrée de journal d'urgence automatique si quarantaine */}
        {isQuarantine && (
          <li
            style={{
              display: 'flex',
              gap: '10px',
              padding: '6px 0',
              borderTop: '1px solid rgba(255, 77, 79, 0.3)',
              fontSize: '12px',
              color: '#ff7875',
            }}
          >
            <time style={{ flexShrink: 0, fontFamily: 'var(--font-mono)', fontSize: '10.5px', color: '#ff4d4f', width: '90px' }}>
              SOL ACTUEL
            </time>
            <span>Verrouillage préventif caisson — protocole de contagion.</span>
          </li>
        )}

        {logEntries.map((entry, i) => (
          <li
            key={i}
            style={{
              display: 'flex',
              gap: '10px',
              padding: '6px 0',
              borderTop: '1px solid rgba(0,229,255,0.08)',
              fontSize: '12px',
            }}
          >
            <time style={{ flexShrink: 0, fontFamily: 'var(--font-mono)', fontSize: '10.5px', color: 'var(--cyan-dim)', width: '90px' }}>
              {entry.time}
            </time>
            {entry.text}
          </li>
        ))}
      </ul>
    </Panel>
  );
}

export default ToWatch;