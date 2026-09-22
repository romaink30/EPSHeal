import Panel from './Panel';

function IdentityCard({ name, crewId, cryoBay, departureDate }) {
  return (
    <Panel title="Identifiant">
      <ul className="vitals-list">
        <li>
          <span>Nom</span>
          <strong>{name}</strong>
        </li>
        <li>
          <span>ID équipage</span>
          <strong>{crewId}</strong>
        </li>
        <li>
          <span>Caisson de repos</span>
          <strong>{cryoBay}</strong>
        </li>
        <li>
          <span>Départ Terre</span>
          <strong>{departureDate}</strong>
        </li>
      </ul>
    </Panel>
  );
}

export default IdentityCard;
