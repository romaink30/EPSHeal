import Panel from './Panel';

function HeartActivity({ rhythmStatus, variability, lastIrregularEpisode }) {
  return (
    <Panel
      title="Moniteur cardiaque"
      badge={rhythmStatus}
      badgeType="ok"
      footer={`Variabilité : ${variability} · Dernier épisode irrégulier : ${lastIrregularEpisode}`}
    >
      <svg className="wave" viewBox="0 0 300 56" preserveAspectRatio="none">
        <path d="M0,28 L30,28 L38,28 L44,8 L50,48 L56,28 L64,28 L90,28 L98,28 L104,8 L110,48 L116,28 L124,28 L150,28 L158,28 L164,8 L170,48 L176,28 L184,28 L210,28 L218,28 L224,8 L230,48 L236,28 L244,28 L270,28 L278,28 L284,8 L290,48 L296,28 L300,28" />
      </svg>
    </Panel>
  );
}

export default HeartActivity;
