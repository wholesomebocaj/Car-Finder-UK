import { useEffect, useMemo, useState } from "react";
import { deleteCar, getRankedCars } from "../api.js";
import CarCard from "./CarCard.jsx";
import CarTable from "./CarTable.jsx";

const defaultFilters = {
  search: "",
  maxPrice: "6000",
  maxMileage: "",
  maxTax: "250",
  minScore: "",
  sort: "score-desc",
};

function includesSearch(car, search) {
  if (!search.trim()) {
    return true;
  }

  const text = [
    car.title,
    car.make,
    car.model,
    car.year,
    car.engine,
    car.trim,
    car.fuel_type,
    car.gearbox,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return text.includes(search.toLowerCase());
}

function passesNumberFilter(value, max) {
  if (max === "") {
    return true;
  }
  if (value === null || value === undefined) {
    return false;
  }
  return Number(value) <= Number(max);
}

function sortCars(cars, sort) {
  return [...cars].sort((a, b) => {
    if (sort === "price-asc") {
      return (a.price ?? Infinity) - (b.price ?? Infinity);
    }
    if (sort === "mileage-asc") {
      return (a.mileage ?? Infinity) - (b.mileage ?? Infinity);
    }
    if (sort === "newest") {
      return new Date(b.created_at) - new Date(a.created_at);
    }
    return b.score - a.score;
  });
}

export default function Dashboard({ refreshKey, onAddCar }) {
  const [cars, setCars] = useState([]);
  const [filters, setFilters] = useState(defaultFilters);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setStatus("loading");
    getRankedCars()
      .then((data) => {
        if (active) {
          setCars(data);
          setStatus("ready");
        }
      })
      .catch((err) => {
        if (active) {
          setError(err.message);
          setStatus("error");
        }
      });

    return () => {
      active = false;
    };
  }, [refreshKey]);

  const filteredCars = useMemo(() => {
    const visible = cars.filter((car) => {
      const scoreOk = filters.minScore === "" || car.score >= Number(filters.minScore);
      return (
        includesSearch(car, filters.search) &&
        passesNumberFilter(car.price, filters.maxPrice) &&
        passesNumberFilter(car.mileage, filters.maxMileage) &&
        passesNumberFilter(car.road_tax, filters.maxTax) &&
        scoreOk
      );
    });

    return sortCars(visible, filters.sort);
  }, [cars, filters]);

  const bestCar = filteredCars[0];
  const excellentCount = cars.filter((car) => car.score >= 85).length;

  async function handleDelete(id) {
    await deleteCar(id);
    setCars((current) => current.filter((car) => car.id !== id));
  }

  function updateFilter(event) {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  }

  return (
    <div className="page-stack">
      <section className="dashboard-hero">
        <div>
          <p className="eyebrow">GBP 6,000 automatic comfort shortlist</p>
          <h2>Rank saved cars from best to worst.</h2>
        </div>
        <div className="hero-stats">
          <div>
            <span>{cars.length}</span>
            <small>saved cars</small>
          </div>
          <div>
            <span>{excellentCount}</span>
            <small>excellent</small>
          </div>
          <div>
            <span>{bestCar ? bestCar.score : "-"}</span>
            <small>top score</small>
          </div>
        </div>
      </section>

      <section className="toolbar-section">
        <div className="filter-grid">
          <label>
            Search make/model
            <input
              name="search"
              value={filters.search}
              onChange={updateFilter}
              placeholder="Lexus, Avensis, DSG"
            />
          </label>
          <label>
            Max price
            <input name="maxPrice" type="number" value={filters.maxPrice} onChange={updateFilter} />
          </label>
          <label>
            Max mileage
            <input name="maxMileage" type="number" value={filters.maxMileage} onChange={updateFilter} />
          </label>
          <label>
            Max tax
            <input name="maxTax" type="number" value={filters.maxTax} onChange={updateFilter} />
          </label>
          <label>
            Min score
            <input name="minScore" type="number" value={filters.minScore} onChange={updateFilter} />
          </label>
          <label>
            Sort
            <select name="sort" value={filters.sort} onChange={updateFilter}>
              <option value="score-desc">Score high to low</option>
              <option value="price-asc">Price low to high</option>
              <option value="mileage-asc">Mileage low to high</option>
              <option value="newest">Newest first</option>
            </select>
          </label>
        </div>
        <div className="toolbar-actions">
          <button type="button" className="secondary-button" onClick={() => setFilters(defaultFilters)}>
            Reset filters
          </button>
          <button type="button" className="primary-button" onClick={onAddCar}>
            Add car
          </button>
        </div>
      </section>

      {status === "loading" && <p className="state-text">Loading cars...</p>}
      {status === "error" && <p className="state-text error">Could not load cars: {error}</p>}
      {status === "ready" && filteredCars.length === 0 && (
        <p className="state-text">No cars match the current filters.</p>
      )}

      {status === "ready" && filteredCars.length > 0 && (
        <>
          <CarTable cars={filteredCars} />
          <section className="card-grid">
            {filteredCars.map((car) => (
              <CarCard key={car.id} car={car} onDelete={handleDelete} />
            ))}
          </section>
        </>
      )}
    </div>
  );
}
