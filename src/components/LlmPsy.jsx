import { useState, useEffect, useRef } from 'react';
import Panel from './Panel';


// Données fictives de secours
const MOCK_PATIENT = {
  id: '7714-B',
  prenom: 'Léa',
  nom: 'Cassini',
  grade: 'Dr.',
  role: 'Spécialiste de mission',
  statut: 'stable',
  constantes: {
    pouls: 72,
    rythme: 'Sinusal',
    spo2: '98%',
    tension: '12/8',
    cerveau: 'Alpha (Calme)',
  },
  antecedents: 'Appendicectomie (2071)',
  allergies: 'Aucune allergie connue',
  observations: 'Paramètres biométriques nominaux.',
  notesPsy: 'État émotionnel stable.',
};


const OLLAMA_HOST = 'http://localhost:11434';
const OLLAMA_MODEL = 'gemma3:4b';


// Prompt adapté selon le rôle
const getSystemPrompt = (role = '') => {
  const normalizedRole = role.toLowerCase();
  const isMedecin = normalizedRole.includes('medecin') || normalizedRole.includes('docteur');


  if (isMedecin) {
    return `Tu es EPSHEAL-CORE, console d'analyse clinique pour le médecin de bord.
Directives :
- Réponds en français, ton sobre, concis et purement médical (1 à 3 phrases max).
- Ne récite pas le dossier sans question précise.
- Sur une salutation simple, réponds poliment sans diagnostic.
- Utilise la balise [URGENCE_CRITIQUE] uniquement en cas d'anomalie létale.`;
  }


  return `Tu es EPSHEAL-PSY, module de soutien psychologique pour l'équipage spatial.
Directives :
- Réponds en français, ton bienveillant, calme et concis.
- Si l'utilisateur salue ("bonjour", "salut"), réponds simplement et demande de ses nouvelles, SANS aborder le stress ou les données médicales.
- Garde les données médicales en contexte passif sans les citer spontanément.
- Utilise [URGENCE_CRITIQUE] uniquement en cas de risque suicidaire ou mise en péril de la mission.`;
};


function LlmPsy({ patientActuel = MOCK_PATIENT, onUrgenceDeclenchee }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isMedecin = (patientActuel?.role || '').toLowerCase().includes('medecin') ||
                    (patientActuel?.role || '').toLowerCase().includes('docteur');


  const getInitialGreeting = () => {
    if (!patientActuel) return 'Système EPSHEAL en ligne. Comment puis-je vous assister ?';
    return isMedecin
      ? `Console EPSHEAL-CORE active. Prêt pour l'évaluation clinique du dossier #${patientActuel.id}.`
      : `EPSHEAL en ligne. Bonjour ${patientActuel.grade || ''} ${patientActuel.prenom} ${patientActuel.nom}. Comment vous sentez-vous ?`;
  };


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


  // Synchronisation avec les changements de profil
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
  }, [patientActuel?.id, patientActuel?.role]);


  // Défilement automatique dans la modale
  useEffect(() => {
    if (isModalOpen) {
      threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading, isModalOpen]);


  // Fermeture via la touche Échap
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsModalOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);


  const handleSend = async () => {
    const text = draft.trim();
    if (!text || loading) return;


    setMessages((prev) => [...prev, { from: 'user', text }]);
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


    const systemPromptActif = getSystemPrompt(patientActuel?.role);


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


      if (!response.ok) throw new Error(`Code HTTP ${response.status}`);


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


  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };


  return (
    <>
      <Panel
        title={isMedecin ? 'ASSISTANCE CLINIQUE' : 'LLM PSY'}
        badge={isAlertActive ? 'Urgence' : 'Veille'}
        badgeType={isAlertActive ? 'danger' : 'ok'}
      >
        <div className="psy-card-preview">
          <p className="psy-preview-text">
            {messages[messages.length - 1]?.text || 'Canal sécurisé prêt.'}
          </p>
          <button
            type="button"
            className="psy-open-btn"
            onClick={() => setIsModalOpen(true)}
          >
            Accéder au terminal &rarr;
          </button>
        </div>
      </Panel>


      {/* Fenêtre modale de conversation */}
      {isModalOpen && (
        <div className="psy-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="psy-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="psy-modal-header">
              <div className="header-status">
                <span className={`status-orb ${isAlertActive ? 'danger' : 'ok'}`} />
                <span className="header-title">
                  {isMedecin ? 'EPSHEAL-CORE // ANALYSE CLINIQUE' : 'EPSHEAL-PSY // SUIVI ÉQUIPAGE'}
                </span>
              </div>
              <button
                type="button"
                className="psy-modal-close"
                onClick={() => setIsModalOpen(false)}
              >
                ✕
              </button>
            </div>


            <div className="psy-modal-thread">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`psy-bubble psy-bubble-${m.from} ${m.isUrgent ? 'psy-bubble-urgent' : ''}`}
                >
                  <span className="bubble-author">{m.from === 'ia' ? 'EPSHEAL' : 'VOUS'}</span>
                  <div className="bubble-content">{m.text}</div>
                </div>
              ))}
              {loading && <div className="psy-bubble psy-bubble-ia loading">Analyse en cours…</div>}
              <div ref={threadEndRef} />
            </div>


            <div className="psy-modal-footer">
              <textarea
                className="psy-modal-input"
                placeholder={isMedecin ? 'Poser une question clinique…' : 'Écrire un message…'}
                rows={2}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={handleInputKeyDown}
                disabled={loading}
              />
              <button
                type="button"
                className="psy-modal-send"
                onClick={handleSend}
                disabled={!draft.trim() || loading}
              >
                Envoyer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


export default LlmPsy;
