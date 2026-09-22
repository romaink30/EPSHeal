import { useState } from 'react';

const BODY_PARTS = [
  {
    id: 'head',
    label: 'Tête / cerveau',
    cx: 110,
    cy: 36,
    detail: 'Activité cérébrale nominale · onde dominante alpha · vigilance : éveillé.',
  },
  {
    id: 'heart',
    label: 'Cœur',
    cx: 110,
    cy: 118,
    detail: 'Rythme sinusal · 72 bpm · variabilité 42 ms · aucun épisode irrégulier.',
  },
  {
    id: 'lungs',
    label: 'Poumons',
    cx: 118,
    cy: 140,
    detail: 'Fréquence respiratoire : 14/min · saturation O₂ : 98 %.',
  },
  {
    id: 'abdomen',
    label: 'Système digestif',
    cx: 96,
    cy: 160,
    detail: 'Aucune anomalie détectée depuis le dernier contrôle (sol 212).',
  },
];

function Skeleton() {
  const [selectedId, setSelectedId] = useState(null);
  const selected = BODY_PARTS.find((p) => p.id === selectedId);

  return (
    <div className="figure-panel">
      <div className="figure-wrap">
        <svg viewBox="0 0 220 400">
          <circle className="figure-body" cx="110" cy="36" r="26" />
          <path
            className="figure-body"
            d="M110,62 L110,150 M110,80 L60,130 M110,80 L160,130 M60,130 L48,210 M160,130 L172,210 M110,150 L80,260 M110,150 L140,260 M80,260 L74,360 M140,260 L146,360"
          />
          <path className="figure-body" d="M85,95 Q110,105 135,95 L138,175 Q110,190 82,175 Z" />

          {BODY_PARTS.map((part) => (
            <g key={part.id}>
              {/* zone de clic élargie, invisible */}
              <circle
                cx={part.cx}
                cy={part.cy}
                r="16"
                fill="transparent"
                style={{ cursor: 'pointer' }}
                onClick={() => setSelectedId(part.id === selectedId ? null : part.id)}
                role="button"
                tabIndex={0}
                aria-label={part.label}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') setSelectedId(part.id === selectedId ? null : part.id);
                }}
              />
              <circle
                className="figure-node"
                cx={part.cx}
                cy={part.cy}
                r={selectedId === part.id ? 5 : 3.2}
                style={{
                  pointerEvents: 'none',
                  fill: selectedId === part.id ? 'var(--warn)' : 'var(--cyan)',
                  transition: 'r 0.15s ease, fill 0.15s ease',
                }}
              />
            </g>
          ))}
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
