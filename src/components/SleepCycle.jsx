import Panel from './Panel';

function SleepCycle({ nights, average, target }) {
  return (
    <Panel title="Cycle de sommeil (7 derniers sols)" footer={`Moyenne : ${average} · Cible mission : ${target}`}>
      <div className="sleep-bars">
        {nights.map((pct, i) => (
          <i key={i} style={{ height: `${pct}%` }} />
        ))}
      </div>
    </Panel>
  );
}

export default SleepCycle;
