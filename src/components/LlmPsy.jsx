import { useState, useEffect, useRef } from 'react';
import Panel from './Panel';

const OLLAMA_HOST = 'http://localhost:11434';
const OLLAMA_MODEL = 'gemma3:4b';

// Prompt adapté selon la posture (Médecin vs Patient)
const getSystemPrompt = (isMedecin = false, nomPatient = '') => {
  if (isMedecin) {
    return `Tu es EPSHEAL-CORE, console d'analyse clinique pour le médecin de bord.
Tu t'adresses au MÉDECIN qui consulte le dossier de son patient (${nomPatient}).
Directives :
- Ne t'adresse JAMAIS au patient, mais au médecin traitant.
- Réponds en français, ton sobre, concis et purement médical (2 à 4 phrases max).
- Quand le médecin demande le dossier, synthétise clairement les points clés (pathologie, antécédents, constantes) sans faire de copié-collé brut du contexte.
- Ne récite pas les balises techniques.
- Utilise la balise [URGENCE_CRITIQUE] uniquement en cas d'anomalie létale immédiate.`;
  }

  return `Tu es EPSHEAL-PSY, module de soutien psychologique pour l'équipage spatial.
Tu t'adresses directement au patient (${nomPatient}) avec écoute et empathie.
Directives :
- Réponds en français, ton bienveillant, calme et concis.
- Si l'utilisateur salue ("bonjour", "salut"), réponds simplement et demande de ses nouvelles, SANS aborder le stress ou les données médicales.
- Garde les données médicales en contexte passif sans les citer spontanément.
- Utilise [URGENCE_CRITIQUE] uniquement en cas de risque suicidaire ou mise en péril de la mission.`;
};

function LlmPsy({ patientActuel = null, isDoctor = false, onUrgenceDeclenchee, allPatients = [] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Détection du mode praticien via la prop ou le rôle
  const isMedecinMode = Boolean(
    isDoctor ||
    (patientActuel?.role || '').toLowerCase().includes('medecin') ||
    (patientActuel?.role || '').toLowerCase().includes('docteur')
  );

  const getPatientFullName = () => {
    if (!patientActuel) return 'Inconnu';
    return `${patientActuel.grade ? `${patientActuel.grade} ` : ''}${patientActuel.prenom || ''} ${patientActuel.nom || ''}`.trim();
  };

  // Message d'ouverture adapté au rôle connecté
  const getInitialGreeting = () => {
    if (!patientActuel) return 'EPSHEAL en ligne. Aucun dossier actif sélectionné.';
    const nomPatient = getPatientFullName();
    return isMedecinMode
      ? `EPSHEAL en ligne. Vous êtes bien sur le profil de ${nomPatient}.`
      : `EPSHEAL en ligne. Bonjour ${nomPatient}. Comment vous sentez-vous ?`;
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

  // Mise à jour automatique de l'accueil au changement de patient ou de mode
  useEffect(() => {
    setMessages([
      {
        from: 'ia',
        text: getInitialGreeting(),
        isUrgent: patientActuel?.statut === 'urgence',
      },
    ]);
    setIsAlertActive(patientActuel?.statut === 'urgence');
  }, [patientActuel?.id, isDoctor]);

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
- Identité : ${getPatientFullName()} (#${patientActuel.id || patientActuel.login || 'N/A'}, Poste: ${patientActuel.role || 'Patient'})
- Pathologie / Rythme cardiaque : ${patientActuel.maladie_rythme_cardiaque || patientActuel.observations || 'Aucune observation enregistrée'}
- Date diagnostic : ${patientActuel.date_diagnostic || patientActuel.dateDiagnostic || 'N/A'}
- Constantes : Pouls ${patientActuel.constantes?.pouls || '--'} bpm, SpO2 ${patientActuel.constantes?.spo2 || 'N/A'}, Tension ${patientActuel.constantes?.tension || 'N/A'}
- Antécédents : ${patientActuel.antecedents || 'Néant'} | Allergies : ${patientActuel.allergies || 'Aucune'}
- Notes psychologiques : ${patientActuel.notesPsy || 'Non renseigné'}`;
    }

          let contexteEquipage = '';
      if (isMedecinMode && allPatients.length > 0) {
        contexteEquipage = `

  [VUE D'ENSEMBLE ÉQUIPAGE — ${allPatients.length} patients]
  ${allPatients
    .map((p) => {
      const m = p.derniereMesure;
      return `- ${p.prenom} ${p.nom} (#${p.id}) — ${p.maladie || 'aucun antécédent'} — statut: ${p.statut}${
        m ? ` — FC ${m.frequenceCardiaque} bpm, SpO2 ${m.spo2}%` : ''
      }`;
    })
    .join('\n')}`;
      }

    const systemPromptActif = getSystemPrompt(isMedecinMode, getPatientFullName());

    const conversationOllama = [
      { role: 'system', content: `${systemPromptActif}\n${contexteBiomedical}${contexteEquipage}` },
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
        title={isMedecinMode ? 'ASSISTANCE CLINIQUE' : 'LLM PSY'}
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
                  {isMedecinMode ? 'EPSHEAL-CORE // ANALYSE CLINIQUE' : 'EPSHEAL-PSY // SUIVI ÉQUIPAGE'}
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
                placeholder={isMedecinMode ? 'Poser une question clinique sur le dossier…' : 'Écrire un message…'}
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