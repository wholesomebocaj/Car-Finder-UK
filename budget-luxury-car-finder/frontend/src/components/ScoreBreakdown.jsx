export default function ScoreBreakdown({ car }) {
  if (!car?.score_breakdown?.length) {
    return null;
  }

  const bonuses = car.score_breakdown.filter((item) => item.points > 0 && item.category !== "Base");
  const penalties = car.score_breakdown.filter((item) => item.points < 0);

  return (
    <section className="score-breakdown">
      <div className="breakdown-header">
        <strong>Score breakdown</strong>
        <span className={`badge ${car.verdict_class}`}>{car.verdict}</span>
      </div>
      <div className="breakdown-grid">
        <div>
          <h4>Added points</h4>
          <ul className="breakdown-list">
            {bonuses.length ? (
              bonuses.map((item, index) => (
                <li key={`${item.label}-${index}`}>
                  <span className="point positive">+{item.points}</span>
                  {item.label}
                </li>
              ))
            ) : (
              <li>No score bonuses yet.</li>
            )}
          </ul>
        </div>
        <div>
          <h4>Removed points</h4>
          <ul className="breakdown-list">
            {penalties.length ? (
              penalties.map((item, index) => (
                <li key={`${item.label}-${index}`}>
                  <span className="point negative">{item.points}</span>
                  {item.label}
                </li>
              ))
            ) : (
              <li>No score penalties yet.</li>
            )}
          </ul>
        </div>
      </div>
      {car.warnings?.length > 0 && (
        <div className="warning-strip">
          {car.warnings.slice(0, 4).map((warning) => (
            <span key={warning}>{warning}</span>
          ))}
        </div>
      )}
    </section>
  );
}
