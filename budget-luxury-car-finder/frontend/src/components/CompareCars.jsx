import { useEffect, useMemo, useState } from "react";
import { getRankedCars } from "../api.js";

const currencyFormatter = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("en-GB");

function money(value) {
  return value === null || value === undefined ? "Unknown" : currencyFormatter.format(value);
}

function number(value) {
  return value === null || value === undefined ? "Unknown" : numberFormatter.format(value);
}

export default function CompareCars({ refreshKey }) {
  const [cars, setCars] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let active = true;
    getRankedCars()
      .then((data) => {
        if (active) {
          setCars(data);
          setSelectedIds(data.slice(0, 3).map((car) => String(car.id)));
          setStatus("ready");
        }
      })
      .catch(() => {
        if (active) {
          setStatus("error");
        }
      });

    return () => {
      active = false;
    };
  }, [refreshKey]);

  const selectedCars = useMemo(
    () => cars.filter((car) => selectedIds.includes(String(car.id))).slice(0, 4),
    [cars, selectedIds]
  );

  const bestCar = selectedCars.reduce((best, car) => (!best || car.score > best.score ? car : best), null);

  function toggleCar(id) {
    setSelectedIds((current) => {
      const idText = String(id);
      if (current.includes(idText)) {
        return current.filter((value) => value !== idText);
      }
      if (current.length >= 4) {
        return current;
      }
      return [...current, idText];
    });
  }

  return (
    <div className="page-stack">
      <section className="section-heading">
        <p className="eyebrow">Side-by-side</p>
        <h2>Compare 2 to 4 saved cars</h2>
      </section>

      {status === "loading" && <p className="state-text">Loading cars...</p>}
      {status === "error" && <p className="state-text error">Could not load saved cars.</p>}

      {status === "ready" && (
        <>
          <section className="selector-panel">
            {cars.map((car) => (
              <label key={car.id} className="check-row">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(String(car.id))}
                  onChange={() => toggleCar(car.id)}
                  disabled={!selectedIds.includes(String(car.id)) && selectedIds.length >= 4}
                />
                <span>{car.title}</span>
                <strong>{car.score}</strong>
              </label>
            ))}
          </section>

          {selectedCars.length < 2 && <p className="state-text">Select at least two cars to compare.</p>}

          {selectedCars.length >= 2 && (
            <>
              <section className="best-choice">
                <span>Best overall choice</span>
                <strong>{bestCar.title}</strong>
                <em>{bestCar.score}/100</em>
              </section>

              <div className="compare-grid" style={{ "--compare-cols": selectedCars.length }}>
                {selectedCars.map((car) => (
                  <article className={`compare-card ${car.verdict_class}`} key={car.id}>
                    <div className="compare-head">
                      <h3>{car.make} {car.model}</h3>
                      <span className={`badge ${car.verdict_class}`}>{car.verdict}</span>
                    </div>
                    <div className="compare-score">{car.score}/100</div>
                    <dl className="compare-list">
                      <div>
                        <dt>Price</dt>
                        <dd>{money(car.price)}</dd>
                      </div>
                      <div>
                        <dt>Mileage</dt>
                        <dd>{number(car.mileage)}</dd>
                      </div>
                      <div>
                        <dt>Tax</dt>
                        <dd>{money(car.road_tax)}</dd>
                      </div>
                      <div>
                        <dt>Insurance</dt>
                        <dd>{car.insurance_group ? `Group ${car.insurance_group}` : "Unknown"}</dd>
                      </div>
                      <div>
                        <dt>Comfort</dt>
                        <dd>{car.comfort_estimate ? `${car.comfort_estimate}/10` : "Unknown"}</dd>
                      </div>
                      <div>
                        <dt>Reliability</dt>
                        <dd>{car.reliability_estimate ? `${car.reliability_estimate}/10` : "Unknown"}</dd>
                      </div>
                    </dl>
                    <div className="risk-list">
                      <strong>Main risks</strong>
                      {car.main_risks?.length ? (
                        car.main_risks.slice(0, 4).map((risk) => <span key={risk}>{risk}</span>)
                      ) : (
                        <span>No major risk flags.</span>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
