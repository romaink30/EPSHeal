import Panel from './Panel';

// bpm (battements/minute) pilote deux animations :
// - le point qui pulse (un battement = 60 / bpm secondes)
// - le défilement de la courbe ECG. Le tracé contient 5 battements sur
//   300px de large ; on le fait défiler de 300px en 5 * (60 / bpm)
//   secondes pour que la vitesse de défilement corresponde au bpm réel.
const ECG_PATH =
  'M0,28 L30,28 L38,28 L44,8 L50,48 L56,28 L64,28 L90,28 L98,28 L104,8 L110,48 L116,28 L124,28 L150,28 L158,28 L164,8 L170,48 L176,28 L184,28 L210,28 L218,28 L224,8 L230,48 L236,28 L244,28 L270,28 L278,28 L284,8 L290,48 L296,28 L300,28';

function HeartActivity({ rhythmStatus, variability, lastIrregularEpisode, bpm }) {
  const pulseDuration = bpm ? 60 / bpm : null;
  const scrollDuration = bpm ? (60 / bpm) * 5 : null;

  return (
    <Panel
      title="Moniteur cardiaque"
      badge={rhythmStatus}
      badgeType="ok"
      footer={`Variabilité : ${variability} · Dernier épisode irrégulier : ${lastIrregularEpisode}`}
    >
      <div className="heart-pulse-row">
        <span
          className={`heart-pulse-dot ${pulseDuration ? 'active' : ''}`}
          style={pulseDuration ? { animationDuration: `${pulseDuration}s` } : undefined}
        />
        <span className="heart-pulse-value">{bpm ? `${bpm} bpm` : '—'}</span>
      </div>
      <svg className="wave" viewBox="0 0 300 56" preserveAspectRatio="none">
        <g
          className={scrollDuration ? 'wave-scroll' : ''}
          style={scrollDuration ? { animationDuration: `${scrollDuration}s` } : undefined}
        >
          <path d={ECG_PATH} />
          <path d={ECG_PATH} transform="translate(300, 0)" />
        </g>
      </svg>
    </Panel>
  );
}

export default HeartActivity;