function TopBar({ missionName, destination, sol, online }) {
  return (
    <header className="topbar">
      <div className="brand">
        EPS<span>HEAL</span>
      </div>
      <div className="mission-info">
        MISSION {missionName} · CAP {destination} · SOL {sol}
      </div>
      <div className="status">
        <span className="dot" />
        {online ? 'Liaison biomédicale active' : 'Liaison biomédicale coupée'}
      </div>
    </header>
  );
}

export default TopBar;
