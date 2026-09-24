import { useState } from 'react';

const BODY_PARTS = [
  {
    id: 'head',
    label: 'Tête / cerveau',
    cx: 110,
    cy: 42,
    detail: 'Activité cérébrale nominale · onde dominante alpha · vigilance : éveillé.',
  },
  {
    id: 'heart',
    label: 'Cœur',
    cx: 118,
    cy: 118,
    detail: 'Rythme sinusal · 72 bpm · variabilité 42 ms · aucun épisode irrégulier.',
  },
  {
    id: 'lungs',
    label: 'Poumons',
    cx: 96,
    cy: 116,
    detail: 'Fréquence respiratoire : 14/min · saturation O₂ : 98 %.',
  },
  {
    id: 'abdomen',
    label: 'Système digestif',
    cx: 110,
    cy: 172,
    detail: 'Aucune anomalie détectée depuis le dernier contrôle (sol 212).',
  },
];

function Skeleton() {
  const [selectedId, setSelectedId] = useState(null);
  const selected = BODY_PARTS.find((p) => p.id === selectedId);

  return (
    <div className="figure-panel">
      <div className="figure-wrap" style={{ position: 'relative', overflow: 'hidden' }}>
        <svg viewBox="0 0 220 400" style={{ width: '100%', height: '100%' }}>
          <defs>
            {/* Dégradé du scanner laser vertical */}
            <linearGradient id="scanBeam" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="var(--cyan, #00e5ff)" stopOpacity="0" />
              <stop offset="50%" stopColor="var(--cyan, #00e5ff)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="var(--cyan, #00e5ff)" stopOpacity="0" />
            </linearGradient>

            {/* Rétro-éclairage néon sur les contours */}
            <filter id="holoGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            <style>{`
              @keyframes scanMotion {
                0% { transform: translateY(-40px); }
                100% { transform: translateY(390px); }
              }
              .holo-scan {
                animation: scanMotion 3.5s linear infinite;
              }
            `}</style>
          </defs>

          {/* Grille et cercles de visée spatiale */}
          <circle cx="110" cy="180" r="110" fill="none" stroke="var(--cyan, #00e5ff)" strokeWidth="0.5" strokeDasharray="3 6" opacity="0.25" />
          <circle cx="110" cy="180" r="120" fill="none" stroke="var(--cyan, #00e5ff)" strokeWidth="0.5" opacity="0.1" />

          {/* Faisceau du scanner */}
          <rect x="20" y="0" width="180" height="40" fill="url(#scanBeam)" className="holo-scan" />

          {/* ======================================================== */}
          {/* SQUELETTE WIREFRAME / 3D VOLUMÉTRIQUE                   */}
          {/* ======================================================== */}
          <g filter="url(#holoGlow)" stroke="var(--cyan, #00e5ff)" fill="rgba(0, 229, 255, 0.03)">
            {/* --- CRÂNE & FACES 3D --- */}
            {/* Boîte crânienne supérieure */}
            <path d="M96,36 C96,20 124,20 124,36 C124,46 118,52 110,54 C102,52 96,46 96,36 Z" strokeWidth="1.2" />
            {/* Arête frontale et pommettes (profondeur) */}
            <path d="M100,34 L110,40 L120,34 M110,40 L110,54" strokeWidth="0.8" fill="none" opacity="0.6" />
            <polygon points="103,46 117,46 114,56 106,56" strokeWidth="0.8" opacity="0.7" />
            {/* Cou volumique / Vertèbres cervicales */}
            <path d="M106,58 L105,74 M114,58 L115,74" strokeWidth="1" opacity="0.8" fill="none" />
            <line x1="105" y1="66" x2="115" y2="66" strokeWidth="0.8" opacity="0.5" />

            {/* --- CAGE THORACIQUE ET RACHIS --- */}
            {/* Clavicules 3D */}
            <polygon points="76,82 110,74 144,82 110,80" strokeWidth="1.2" fill="rgba(0, 229, 255, 0.08)" />

            {/* Colonne vertébrale (anneaux segmentés) */}
            <line x1="110" y1="74" x2="110" y2="194" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.7" />

            {/* Côtes et gril costal volumétrique (anneaux courbés en perspective) */}
            <ellipse cx="110" cy="98" rx="24" ry="7" strokeWidth="1" opacity="0.5" />
            <ellipse cx="110" cy="114" rx="27" ry="8" strokeWidth="1.1" opacity="0.6" />
            <ellipse cx="110" cy="130" rx="28" ry="9" strokeWidth="1.1" opacity="0.65" />
            <ellipse cx="110" cy="146" rx="24" ry="8" strokeWidth="1" opacity="0.55" />
            <ellipse cx="110" cy="162" rx="19" ry="6" strokeWidth="0.9" opacity="0.45" />

            {/* Sternum central */}
            <path d="M108,86 L112,86 L111,142 L109,142 Z" strokeWidth="1" fill="rgba(0, 229, 255, 0.15)" />

            {/* --- MEMBRES SUPÉRIEURS (TUBULAIRES 3D) --- */}
            {/* Bras gauche (vue observateur) : épaule, humérus tubulaire, avant-bras */}
            <polygon points="76,82 71,126 65,124 72,82" strokeWidth="1" opacity="0.8" />
            <ellipse cx="68" cy="125" rx="3.5" ry="2.5" strokeWidth="0.8" />
            <polygon points="69,127 59,180 54,178 64,127" strokeWidth="1" opacity="0.8" />
            
            {/* Bras droit : épaule, humérus tubulaire, avant-bras */}
            <polygon points="144,82 149,126 155,124 148,82" strokeWidth="1" opacity="0.8" />
            <ellipse cx="152" cy="125" rx="3.5" ry="2.5" strokeWidth="0.8" />
            <polygon points="151,127 161,180 166,178 156,127" strokeWidth="1" opacity="0.8" />

            {/* --- BASSIN & CEINTURE PELVIENNE (VOLUME 3D) --- */}
            {/* Ailes iliaques facettées */}
            <polygon points="90,184 130,184 136,196 122,212 98,212 84,196" strokeWidth="1.3" fill="rgba(0, 229, 255, 0.08)" />
            <line x1="110" y1="184" x2="110" y2="212" strokeWidth="0.8" opacity="0.5" />
            <ellipse cx="110" cy="198" rx="8" ry="4" strokeWidth="0.8" opacity="0.6" />

            {/* --- MEMBRES INFÉRIEURS (CUISSES ET JAMBES EN TUBES) --- */}
            {/* Fémur gauche (tubulaire) */}
            <polygon points="98,212 102,212 96,280 91,280" strokeWidth="1.1" opacity="0.8" />
            {/* Genou gauche (rotule facettée) */}
            <polygon points="91,280 96,280 95,290 90,290" strokeWidth="1" fill="rgba(0, 229, 255, 0.15)" />
            {/* Tibia / Péroné gauche */}
            <polygon points="91,290 95,290 90,364 85,364" strokeWidth="1.1" opacity="0.8" />

            {/* Fémur droit (tubulaire) */}
            <polygon points="122,212 118,212 124,280 129,280" strokeWidth="1.1" opacity="0.8" />
            {/* Genou droit (rotule facettée) */}
            <polygon points="124,280 129,280 130,290 125,290" strokeWidth="1" fill="rgba(0, 229, 255, 0.15)" />
            {/* Tibia / Péroné droit */}
            <polygon points="125,290 130,290 135,364 130,364" strokeWidth="1.1" opacity="0.8" />
          </g>

          {/* ======================================================== */}
          {/* ZONES D'INTERACTION & NODES BIOMÉTRIQUES                */}
          {/* ======================================================== */}
          {BODY_PARTS.map((part) => {
            const isSelected = selectedId === part.id;
            return (
              <g key={part.id}>
                {/* Zone de clic élargie invisible */}
                <circle
                  cx={part.cx}
                  cy={part.cy}
                  r="20"
                  fill="transparent"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelectedId(isSelected ? null : part.id)}
                  role="button"
                  tabIndex={0}
                  aria-label={part.label}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setSelectedId(isSelected ? null : part.id);
                    }
                  }}
                />

                {/* Anneau réticulaire en cas de sélection */}
                {isSelected && (
                  <>
                    <circle
                      cx={part.cx}
                      cy={part.cy}
                      r="12"
                      fill="none"
                      stroke="var(--warn, #faad14)"
                      strokeWidth="1"
                      strokeDasharray="2 3"
                      style={{ pointerEvents: 'none' }}
                    />
                    <circle
                      cx={part.cx}
                      cy={part.cy}
                      r="17"
                      fill="none"
                      stroke="var(--warn, #faad14)"
                      strokeWidth="0.5"
                      opacity="0.4"
                      style={{ pointerEvents: 'none' }}
                    />
                  </>
                )}

                {/* Point nodal (orange si cliqué, cyan par défaut) */}
                <circle
                  className="figure-node"
                  cx={part.cx}
                  cy={part.cy}
                  r={isSelected ? 5.5 : 3.8}
                  style={{
                    pointerEvents: 'none',
                    fill: isSelected ? 'var(--warn, #faad14)' : 'var(--cyan, #00e5ff)',
                    transition: 'all 0.2s ease',
                    filter: isSelected
                      ? 'drop-shadow(0 0 6px var(--warn, #faad14))'
                      : 'drop-shadow(0 0 4px var(--cyan, #00e5ff))',
                  }}
                />
              </g>
            );
          })}
        </svg>
      </div>

      <div className="skeleton-detail">
        {selected ? (
          <>
            <div className="skeleton-detail-label">{selected.label}</div>
            <div className="skeleton-detail-text">{selected.detail}</div>
          </>
        ) : (
          <div className="skeleton-detail-hint">Sélectionnez une zone du corps pour afficher son détail.</div>
        )}
      </div>
    </div>
  );
}

export default Skeleton;