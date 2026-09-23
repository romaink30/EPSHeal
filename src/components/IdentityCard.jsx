import Panel from './Panel';

function IdentityCard({
  name,
  fields,
  crewId,
  cryoBay,
  departureDate,
  role,
}) {
  // Si `fields` n'est pas fourni, on le reconstruit automatiquement
  // à partir des props unitaires envoyées par App.jsx
  const displayFields =
    fields && Array.isArray(fields)
      ? fields
      : [
          crewId && { label: 'ID équipage', value: crewId },
          cryoBay !== undefined && { label: 'Caisson de repos', value: cryoBay },
          departureDate && { label: 'Départ Terre', value: departureDate },
          role && { label: 'Poste', value: role },
        ].filter(Boolean);

  return (
    <Panel title="Identifiant">
      <ul className="vitals-list">
        <li>
          <span>Nom</span>
          <strong>{name}</strong>
        </li>
        {displayFields.map((f) => (
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