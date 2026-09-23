function Panel({ title, badge, badgeType = 'ok', footer, children }) {
  return (
    <div className="panel">
      <div className="panel-head">
        <h2>{title}</h2>
        {badge && <span className={`badge ${badgeType}`}>{badge}</span>}
      </div>
      <div className="panel-body">{children}</div>
      {footer && <div className="panel-foot">{footer}</div>}
    </div>
  );
}


export default Panel;
