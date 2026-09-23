import { useState, useEffect, useRef } from 'react';
import Panel from './Panel';

// Chat fonctionnel côté interface : les messages s'accumulent dans l'état
// local. L'appel réel à l'API IA sera branché plus tard, en remplaçant
// handleSend par un fetch/stream vers le backend au lieu du echo actuel.
function LlmPsy() {
  const [messages, setMessages] = useState([
    {
      from: 'ia',
      text: getInitialGreeting(),
      isUrgent: false,
    },
  ]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAlertActive, setIsAlertActive] = useState(patientActuel?.statut === 'urgence');
  const threadEndRef = useRef(null);

  useEffect(() => {
    if (patientActuel) {
      setMessages([
        {
          from: 'ia',
          text: getInitialGreeting(),
          isUrgent: patientActuel.statut === 'urgence',
        },
      ]);
      setIsAlertActive(patientActuel.statut === 'urgence');
    }
  }, [patientActuel?.id]);

  // Défilement automatique dans la modale
  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || loading) return;

    // 1. Ajout immédiat du message utilisateur
    const nouveauMessageUser = { from: 'user', text };
    setMessages((prev) => [...prev, nouveauMessageUser]);
    setDraft('');
    setLoading(true);


    let contexteBiomedical = '';
    if (patientActuel) {
      contexteBiomedical = `
[DOSSIER DU PATIENT ACTIF]
- Identité : ${patientActuel.grade || ''} ${patientActuel.prenom} ${patientActuel.nom} (#${patientActuel.id}, Poste: ${patientActuel.role})
- Statut : ${patientActuel.statut || 'INCONNU'}
- Constantes : Pouls ${patientActuel.constantes?.pouls || '--'} bpm, SpO2 ${patientActuel.constantes?.spo2 || 'N/A'}, Tension ${patientActuel.constantes?.tension || 'N/A'}
- Antécédents : ${patientActuel.antecedents || 'Néant'} | Allergies : ${patientActuel.allergies || 'Aucune'}
- Observations : ${patientActuel.observations || 'Aucune'}
- Notes psychologiques : ${patientActuel.notesPsy || 'Non renseigné'}`;
    }

    const conversationOllama = [
      { role: 'system', content: `${systemPromptActif}\n${contexteBiomedical}` },
      ...messages.map((m) => ({
        role: m.from === 'ia' ? 'assistant' : 'user',
        content: m.text,
      })),
      { role: 'user', content: text },
    ];


    try {
      const response = await fetch(`${OLLAMA_HOST}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: OLLAMA_MODEL,
          messages: conversationOllama,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`Code HTTP ${response.status}`);
      }

      const data = await response.json();
      const rawText = data?.message?.content || "Réponse vide de l'unité médicale.";
      const estUrgent = rawText.includes('[URGENCE_CRITIQUE]');
      const cleanText = rawText.replace(/\[URGENCE_CRITIQUE\]/g, '').trim();


      if (estUrgent) {
        setIsAlertActive(true);
        if (onUrgenceDeclenchee) onUrgenceDeclenchee(cleanText);
      }


      setMessages((prev) => [
        ...prev,
        { from: 'ia', text: cleanText, isUrgent: estUrgent },
      ]);
    } catch (err) {
      console.error('Erreur Ollama :', err);
      setMessages((prev) => [
        ...prev,
        {
          from: 'ia',
          text: `[ERREUR SYSTÈME] Impossible de joindre l'agent Ollama (${OLLAMA_HOST}).`,
          isUrgent: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
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
