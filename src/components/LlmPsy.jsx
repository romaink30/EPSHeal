import { useState } from 'react';

function LlmPsy() {
  const [view, setView] = useState('open'); // 'open' | 'minimized' | 'closed'
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

  if (view === 'closed') {
    return (
      <button className="psy-launcher" onClick={() => setView('open')}>
        PSYCHO3000
      </button>
    );
  }

  return (
    <div className="psy-window">
      <div className="psy-window-head">
        <span className="psy-window-title">PSYCHO3000</span>
        <span className="badge ok">Veille</span>
        <div className="psy-window-actions">
          <button
            className="psy-icon-btn"
            title={view === 'minimized' ? 'Agrandir' : 'Réduire'}
            onClick={() => setView(view === 'minimized' ? 'open' : 'minimized')}
          >
            {view === 'minimized' ? '▢' : '–'}
          </button>
          <button className="psy-icon-btn" title="Fermer" onClick={() => setView('closed')}>
            ×
          </button>
        </div>
      </div>

      {view === 'open' && (
        <>
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
        </>
      )}
    </div>
  );
}

export default LlmPsy;