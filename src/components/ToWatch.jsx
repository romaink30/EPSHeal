import Panel from './Panel';

function ToWatch({ alerts, logEntries }) {
  return (
    <Panel title="À voir">
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
