import Panel from './Panel';

// `fields` est une liste libre de { label, value } — permet de réutiliser
// ce panneau aussi bien pour la fiction (ID équipage, caisson...) que pour
// les vraies données patient/médecin venant de la base (login, sexe...).
function IdentityCard({ name, fields }) {
  return (
    <Panel title="Identifiant">
      <ul className="vitals-list">
        <li>
          <span>Nom</span>
          <strong>{name}</strong>
        </li>
        {fields.map((f) => (
          <li key={f.label}>
            <span>{f.label}</span>
            <strong>{f.value}</strong>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

export default IdentityCard;
