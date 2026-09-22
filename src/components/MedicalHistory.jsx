import Panel from './Panel';

function MedicalHistory({ entries }) {
  return (
    <Panel title="Résumé / antécédents médicaux">
      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {entries.map((entry, i) => (
          <li
            key={i}
            style={{
              fontSize: '12.5px',
              padding: '6px 0',
              borderBottom: i < entries.length - 1 ? '1px solid rgba(0,229,255,0.08)' : 'none',
              color: 'var(--text)',
            }}
          >
            {entry}
          </li>
        ))}
      </ul>
    </Panel>
  );
}

export default MedicalHistory;
