import { useEffect, useState } from "react";
import { getAvoidList } from "../api.js";

export default function AvoidList() {
  const [models, setModels] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    getAvoidList()
      .then((data) => {
        setModels(data);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, []);

  return (
    <div className="page-stack">
      <section className="section-heading">
        <p className="eyebrow">Risk watchlist</p>
        <h2>Cars to treat carefully</h2>
      </section>

      {status === "loading" && <p className="state-text">Loading avoid list...</p>}
      {status === "error" && <p className="state-text error">Could not load avoid list.</p>}

      {status === "ready" && (
        <section className="avoid-grid">
          {models.map((model) => (
            <article className="avoid-card" key={model.name}>
              <div className="avoid-card-header">
                <h3>{model.name}</h3>
                <span className="badge avoid">Avoid</span>
              </div>
              <ul className="note-list">
                {model.reason.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
