import { useEffect, useState } from "react";
import { getRecommendations } from "../api.js";

export default function Recommendations() {
  const [models, setModels] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    getRecommendations()
      .then((data) => {
        setModels(data);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, []);

  return (
    <div className="page-stack">
      <section className="section-heading">
        <p className="eyebrow">Built-in intelligence</p>
        <h2>Recommended budget luxury models</h2>
      </section>

      {status === "loading" && <p className="state-text">Loading recommendations...</p>}
      {status === "error" && <p className="state-text error">Could not load recommendations.</p>}

      {status === "ready" && (
        <section className="model-grid">
          {models.map((model, index) => (
            <article className="model-card" key={`${model.make}-${model.model}`}>
              <div className="model-rank">{index + 1}</div>
              <div>
                <h3>{model.make} {model.model}</h3>
                <p>{model.years[0]}-{model.years[1]} - {model.engine}</p>
              </div>
              <dl className="model-metrics">
                <div>
                  <dt>Comfort</dt>
                  <dd>{model.comfortScore}/10</dd>
                </div>
                <div>
                  <dt>Reliability</dt>
                  <dd>{model.reliabilityScore}/10</dd>
                </div>
                <div>
                  <dt>Insurance</dt>
                  <dd>{model.insuranceRisk}</dd>
                </div>
                <div>
                  <dt>Gearbox</dt>
                  <dd>{model.gearboxRisk}</dd>
                </div>
              </dl>
              <ul className="note-list">
                {model.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
