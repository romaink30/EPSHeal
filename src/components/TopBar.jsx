function TopBar({ missionName, destination, sol, online, onLogout, etat }) {
  const isQuarantine = etat === 'quarantaine';

  return (
    <header className="topbar">
      <div className="brand">
        EPS<span>HEAL</span>
      </div>
      <div className="mission-info">
        MISSION {missionName} · CAP {destination} · SOL {sol}
      </div>
      <div className="status" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div>
          <span
            className="dot"
            style={
              isQuarantine
                ? { backgroundColor: '#ff4d4f', boxShadow: '0 0 8px #ff4d4f' }
                : undefined
            }
          />
          {isQuarantine ? (
            <span style={{ color: '#ff4d4f', fontWeight: 'bold', letterSpacing: '0.5px' }}>
              ⚠️ PROTOCOLE QUARANTAINE ACTIF
            </span>
          ) : online ? (
            'Liaison biomédicale active'
          ) : (
            'Liaison biomédicale coupée'
          )}
        </div>

        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            style={{
              background: 'rgba(255, 51, 102, 0.12)',
              border: '1px solid #ff3366',
              color: '#ff3366',
              padding: '4px 10px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontWeight: '600',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#ff3366';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 51, 102, 0.12)';
              e.currentTarget.style.color = '#ff3366';
            }}
          >
            Déconnexion
          </button>
        )}
      </div>
    </header>
  );
}

export default TopBar;