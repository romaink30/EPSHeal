import { useState, useRef, useEffect } from 'react';
import Panel from './Panel';

const OLLAMA_HOST = '/ollama';
const OLLAMA_MODEL = 'gemma3:4b';

function LocalMarkdown({ content = '' }) {
  if (!content) return null;

  const parseInline = (text) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={idx}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const lines = content.split('\n');
  const elements = [];
  let currentList = [];

  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} style={{ margin: '4px 0', paddingLeft: '18px' }}>
          {currentList.map((item, idx) => (
            <li key={idx} style={{ marginBottom: '2px' }}>{parseInline(item)}</li>
          ))}
        </ul>
      );
      currentList = [];
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushList();
      return;
    }

    if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      currentList.push(trimmed.slice(2));
      return;
    }

    flushList();

    const isSectionHeader =
      /^[0-9]+\.\s+/.test(trimmed) ||
      (trimmed.startsWith('**') && trimmed.endsWith('**') && trimmed.length < 80);

    if (isSectionHeader) {
      const cleanHeader = trimmed.replace(/^\*\*/, '').replace(/\*\*$/, '');
      elements.push(
        <h4 key={`header-${index}`} style={{ margin: '8px 0 4px 0', fontSize: '0.95rem' }}>
          {cleanHeader}
        </h4>
      );
    } else {
      elements.push(
        <p key={`p-${index}`} style={{ margin: '3px 0' }}>
          {parseInline(trimmed)}
        </p>
      );
    }
  });

  flushList();

  return <div className="psy-md-content">{elements}</div>;
}

const SYSTEM_PROMPT = `Tu es EPSHEAL-PSY, l'IA médicale et de soutien psychologique embarquée à bord du vaisseau spatial Arès-Voyageur.
Règles :
- Tu veilles sur la santé mentale, cognitive et physique de l'équipage.
- Sois concis, calme, empathique et médicalement rigoureux.
- Tu disposes des données télémétriques et antécédents du membre d'équipage qui te consulte.
- PROTOCOLE D'URGENCE ABSOLUE : Si l'astronaute présente ou décrit un risque vital imminent (infarctus, AVC, détresse psychologique aiguë/psychose, hypoxie, hémorragie, perte de connaissance), commence IMPÉRATIVEMENT ta réponse par la balise exacte : [URGENCE_CRITIQUE]. Donne ensuite l'action de premier secours immédiate.`;

function LlmPsy({ patientActuel = null, onUrgenceDeclenchee }) {
  const [messages, setMessages] = useState([
    {
      from: 'ia',
      text: patientActuel 
        ? `EPSHEAL en ligne. Bonjour ${patientActuel.grade || ''} ${patientActuel.prenom} ${patientActuel.nom}. Comment vous sentez-vous ?`
        : "Système EPSHEAL-PSY en ligne. Suivi biomédical de bord actif. Comment puis-je vous assister ?",
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
          text: `Dossier #${patientActuel.id} chargé. Bonjour ${patientActuel.grade || ''} ${patientActuel.prenom} ${patientActuel.nom}. Comment vous sentez-vous en ce sol ?`,
          isUrgent: patientActuel.statut === 'urgence',
        },
      ]);
      setIsAlertActive(patientActuel.statut === 'urgence');
    }
  }, [patientActuel?.id]);

  // Défilement automatique vers le bas
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
[DONNÉES DU PATIENT ACTIF]
- Identité : ${patientActuel.grade || ''} ${patientActuel.prenom} ${patientActuel.nom} (Matricule ${patientActuel.id}, Poste: ${patientActuel.role})
- Statut de santé : ${patientActuel.statut ? patientActuel.statut.toUpperCase() : 'INCONNU'}
- Constantes : Pouls ${patientActuel.constantes?.pouls || '--'} bpm (${patientActuel.constantes?.rythme || 'N/A'}), SpO2 ${patientActuel.constantes?.spo2 || 'N/A'}, Tension ${patientActuel.constantes?.tension || 'N/A'}, Cerveau : ${patientActuel.constantes?.cerveau || 'N/A'}
- Antécédents / Allergies : ${patientActuel.antecedents || 'Néant'} | Allergies : ${patientActuel.allergies || 'Aucune'}
- Observations cliniques : ${patientActuel.observations || 'Aucune anomalie'}
- Notes psychologiques : ${patientActuel.notesPsy || 'Non renseigné'}`;
    }

    const conversationOllama = [
      { role: 'system', content: SYSTEM_PROMPT + contexteBiomedical },
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

      // 4. Détection et extraction de l'urgence
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
      console.error('Erreur de liaison Ollama locale :', err);
      setMessages((prev) => [
        ...prev,
        {
          from: 'ia',
          text: `[ERREUR SYSTÈME] Impossible de joindre Ollama via le proxy (${OLLAMA_HOST}). Vérifiez qu'Ollama est démarré et que le modèle ${OLLAMA_MODEL} est prêt.`,
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

  return (
    <Panel
      title="LLM PSY"
      badge={isAlertActive ? 'URGENCE' : 'Veille'}
      badgeType={isAlertActive ? 'danger' : 'ok'}
    >
      <div className="psy-thread">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`psy-bubble psy-bubble-${m.from} ${
              m.isUrgent ? 'psy-bubble-urgent' : ''
            }`}
          >
            {/* Rendu Markdown autonome local */}
            <LocalMarkdown content={m.text} />
          </div>
        ))}
        {loading && (
          <div className="psy-bubble psy-bubble-ia psy-typing">
            EPSHEAL analyse les constantes...
          </div>
        )}
        <div ref={threadEndRef} />
      </div>

      <div className="psy-input-row">
        <textarea
          className="psy-input"
          placeholder="Rapporter un état, un symptôme ou une alerte..."
          rows={2}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />
        <button
          className="psy-send"
          onClick={handleSend}
          disabled={!draft.trim() || loading}
        >
          {loading ? '...' : 'Envoyer'}
        </button>
      </div>
    </Panel>
  );
}

export default LlmPsy;