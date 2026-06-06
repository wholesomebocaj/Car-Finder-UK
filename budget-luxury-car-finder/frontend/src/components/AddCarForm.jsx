import { useState } from "react";
import { createCar, lookupVehicleData } from "../api.js";

const emptyForm = {
  title: "",
  make: "",
  model: "",
  registration_number: "",
  year: "",
  price: "",
  mileage: "",
  fuel_type: "",
  gearbox: "Automatic",
  engine: "",
  trim: "",
  road_tax: "",
  insurance_group: "",
  service_history: "Unknown",
  mot_notes: "",
  listing_url: "",
  seller_type: "Unknown",
  comfort_score_manual: "",
  reliability_score_manual: "",
  gearbox_risk_manual: "Unknown",
  notes: "",
};

const numericFields = [
  "year",
  "price",
  "mileage",
  "road_tax",
  "insurance_group",
  "comfort_score_manual",
  "reliability_score_manual",
];

function buildPayload(form) {
  return Object.fromEntries(
    Object.entries(form).map(([key, value]) => {
      if (numericFields.includes(key)) {
        return [key, value === "" ? null : Number(value)];
      }
      return [key, value === "" ? null : value];
    })
  );
}

export default function AddCarForm({ onSaved }) {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [lookingUp, setLookingUp] = useState(false);
  const [lookupMessage, setLookupMessage] = useState("");
  const [error, setError] = useState("");

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      await createCar(buildPayload(form));
      setForm(emptyForm);
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleLookup() {
    setLookupMessage("");
    setError("");

    if (!form.registration_number.trim()) {
      setLookupMessage("Enter a registration number first. Manual entry is still the main way to add cars.");
      return;
    }

    setLookingUp(true);
    try {
      const result = await lookupVehicleData(form.registration_number);
      setLookupMessage(result.message);
    } catch (err) {
      setLookupMessage("Vehicle lookup is not connected yet. Manual entry still works.");
    } finally {
      setLookingUp(false);
    }
  }

  return (
    <div className="form-page">
      <section className="section-heading">
        <p className="eyebrow">Manual entry</p>
        <h2>Add a used car listing</h2>
      </section>

      <form className="car-form" onSubmit={handleSubmit}>
        <section className="lookup-panel">
          <div>
            <p className="eyebrow">Reg lookup ready</p>
            <h3>Optional vehicle data lookup</h3>
          </div>
          <div className="lookup-controls">
            <label>
              Registration number
              <input
                name="registration_number"
                value={form.registration_number}
                onChange={updateField}
                placeholder="AB12 CDE"
              />
            </label>
            <button type="button" className="secondary-button" onClick={handleLookup} disabled={lookingUp}>
              {lookingUp ? "Checking..." : "Lookup vehicle data"}
            </button>
          </div>
          {lookupMessage && <p className="lookup-message">{lookupMessage}</p>}
        </section>

        <div className="form-grid">
          <label className="span-2">
            Title
            <input name="title" value={form.title} onChange={updateField} required />
          </label>
          <label>
            Make
            <input name="make" value={form.make} onChange={updateField} required />
          </label>
          <label>
            Model
            <input name="model" value={form.model} onChange={updateField} required />
          </label>
          <label>
            Year
            <input name="year" type="number" value={form.year} onChange={updateField} />
          </label>
          <label>
            Price
            <input name="price" type="number" value={form.price} onChange={updateField} required />
          </label>
          <label>
            Mileage
            <input name="mileage" type="number" value={form.mileage} onChange={updateField} />
          </label>
          <label>
            Fuel type
            <input name="fuel_type" value={form.fuel_type} onChange={updateField} />
          </label>
          <label>
            Gearbox
            <select name="gearbox" value={form.gearbox} onChange={updateField}>
              <option>Automatic</option>
              <option>Automatic DSG</option>
              <option>Automatic CVT</option>
              <option>Automatic e-CVT</option>
              <option>Automatic Geartronic</option>
              <option>Manual</option>
              <option>Unknown</option>
            </select>
          </label>
          <label>
            Engine
            <input name="engine" value={form.engine} onChange={updateField} />
          </label>
          <label>
            Trim
            <input name="trim" value={form.trim} onChange={updateField} />
          </label>
          <label>
            Road tax
            <input name="road_tax" type="number" value={form.road_tax} onChange={updateField} />
          </label>
          <label>
            Insurance group
            <input
              name="insurance_group"
              type="number"
              min="1"
              max="50"
              value={form.insurance_group}
              onChange={updateField}
            />
          </label>
          <label>
            Service history
            <select name="service_history" value={form.service_history} onChange={updateField}>
              <option>Full</option>
              <option>Partial</option>
              <option>Unknown</option>
              <option>None</option>
            </select>
          </label>
          <label>
            Seller type
            <select name="seller_type" value={form.seller_type} onChange={updateField}>
              <option>Dealer</option>
              <option>Private</option>
              <option>Unknown</option>
            </select>
          </label>
          <label>
            Comfort score
            <input
              name="comfort_score_manual"
              type="number"
              min="1"
              max="10"
              value={form.comfort_score_manual}
              onChange={updateField}
            />
          </label>
          <label>
            Reliability score
            <input
              name="reliability_score_manual"
              type="number"
              min="1"
              max="10"
              value={form.reliability_score_manual}
              onChange={updateField}
            />
          </label>
          <label>
            Gearbox risk
            <select name="gearbox_risk_manual" value={form.gearbox_risk_manual} onChange={updateField}>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
              <option>Unknown</option>
            </select>
          </label>
          <label className="span-2">
            Listing URL
            <input name="listing_url" value={form.listing_url} onChange={updateField} />
          </label>
          <label className="span-2">
            MOT notes
            <textarea name="mot_notes" rows="5" value={form.mot_notes} onChange={updateField} />
          </label>
          <label className="span-2">
            Notes
            <textarea name="notes" rows="5" value={form.notes} onChange={updateField} />
          </label>
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="form-actions">
          <button type="submit" className="primary-button" disabled={saving}>
            {saving ? "Saving..." : "Save listing"}
          </button>
        </div>
      </form>
    </div>
  );
}
