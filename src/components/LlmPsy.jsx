import { useState } from 'react';
import Panel from './Panel';

// Chat fonctionnel côté interface : les messages s'accumulent dans l'état
// local. L'appel réel à l'API IA sera branché plus tard, en remplaçant
// handleSend par un fetch/stream vers le backend au lieu du echo actuel.
function LlmPsy() {
  const [messages, setMessages] = useState([
    { from: 'ia', text: "Bonjour Léa. Comment te sens-tu aujourd'hui ?" },
  ]);
  const [draft, setDraft] = useState('');

  const handleSend = () => {
    const text = draft.trim();
    if (!text) return;

    setMessages((prev) => [...prev, { from: 'user', text }]);
    setDraft('');

    // Réponse temporaire, à remplacer par l'appel API réel.
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { from: 'ia', text: 'Message bien reçu. (réponse IA à connecter)' },
      ]);
    }, 400);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

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
        <textarea
          className="psy-input"
          placeholder="Écrire un message…"
          rows={2}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className="psy-send" onClick={handleSend} disabled={!draft.trim()}>
          Envoyer
        </button>
      </div>
    </Panel>
  );
}

export default LlmPsy;