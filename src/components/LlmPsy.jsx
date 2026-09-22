import Panel from './Panel';

// Interface pour l'instant statique : l'appel à l'API IA sera branché
// ici plus tard (remplacer les messages par un état + un fetch/stream).
function LlmPsy() {
  const messages = [
    { from: 'ia', text: "Bonjour Léa. Comment te sens-tu aujourd'hui ?" },
  ];

  return (
    <Panel title="LLM PSY" badge="Veille" badgeType="ok">
      <div className="psy-thread">
        {messages.map((m, i) => (
          <div key={i} className={`psy-bubble psy-bubble-${m.from}`}>
            {m.text}
          </div>
        ))}
      </div>
      <div className="psy-input-row">
        <input className="psy-input" type="text" placeholder="Écrire un message…" disabled />
        <button className="psy-send" disabled>
          Envoyer
        </button>
      </div>
    </Panel>
  );
}

export default LlmPsy;
