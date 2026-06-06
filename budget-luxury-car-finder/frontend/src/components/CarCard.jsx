import ScoreBreakdown from "./ScoreBreakdown.jsx";

const currencyFormatter = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("en-GB");

function formatCurrency(value) {
  return value === null || value === undefined ? "Unknown" : currencyFormatter.format(value);
}

function formatNumber(value, suffix = "") {
  return value === null || value === undefined ? "Unknown" : `${numberFormatter.format(value)}${suffix}`;
}

function badgeClass(car) {
  if (car.hard_flags?.includes("Avoid") || car.verdict_class === "avoid") {
    return "avoid";
  }
  if (car.hard_flags?.length || car.verdict_class === "risky") {
    return "risky";
  }
  if (car.verdict_class === "maybe") {
    return "maybe";
  }
  return "strong";
}

export default function CarCard({ car, onDelete }) {
  const mainWarnings = car.hard_flags?.length ? car.hard_flags : car.warnings?.slice(0, 3) || [];

  return (
    <article className={`car-card ${car.verdict_class}`}>
      <div className="car-card-main">
        <div>
          <div className="card-title-row">
            <h3>{car.title}</h3>
            <span className={`badge ${badgeClass(car)}`}>{car.verdict}</span>
          </div>
          <p className="muted">
            {car.make} {car.model} {car.year || ""}
          </p>
        </div>
        <div className="score-ring" aria-label={`Score ${car.score} out of 100`}>
          <span>{car.score}</span>
          <small>/100</small>
        </div>
      </div>

      <dl className="metric-grid">
        <div>
          <dt>Price</dt>
          <dd>{formatCurrency(car.price)}</dd>
        </div>
        <div>
          <dt>Mileage</dt>
          <dd>{formatNumber(car.mileage, " mi")}</dd>
        </div>
        <div>
          <dt>Tax</dt>
          <dd>{formatCurrency(car.road_tax)}</dd>
        </div>
        <div>
          <dt>Gearbox</dt>
          <dd>{car.gearbox || "Unknown"}</dd>
        </div>
        <div>
          <dt>Insurance</dt>
          <dd>{car.insurance_group ? `Group ${car.insurance_group}` : "Unknown"}</dd>
        </div>
        <div>
          <dt>History</dt>
          <dd>{car.service_history || "Unknown"}</dd>
        </div>
      </dl>

      {mainWarnings.length > 0 && (
        <div className="badge-row">
          {mainWarnings.map((warning) => (
            <span className={`risk-pill ${car.hard_flags?.includes(warning) ? "red" : "amber"}`} key={warning}>
              {warning}
            </span>
          ))}
        </div>
      )}

      <details className="details-panel">
        <summary>View score details</summary>
        <ScoreBreakdown car={car} />
      </details>

      <div className="card-actions">
        {car.listing_url && (
          <a href={car.listing_url} target="_blank" rel="noreferrer" className="text-link">
            Open listing
          </a>
        )}
        <button type="button" className="text-danger" onClick={() => onDelete(car.id)}>
          Delete
        </button>
      </div>
    </article>
  );
}
