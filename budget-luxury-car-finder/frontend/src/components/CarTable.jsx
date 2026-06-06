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

export default function CarTable({ cars }) {
  if (!cars.length) {
    return null;
  }

  return (
    <div className="table-wrap">
      <table className="car-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Car</th>
            <th>Score</th>
            <th>Price</th>
            <th>Mileage</th>
            <th>Tax</th>
            <th>Gearbox</th>
            <th>Insurance</th>
            <th>Verdict</th>
          </tr>
        </thead>
        <tbody>
          {cars.map((car, index) => (
            <tr key={car.id}>
              <td>{index + 1}</td>
              <td>
                <strong>{car.title}</strong>
                <span>
                  {car.make} {car.model} {car.year || ""}
                </span>
              </td>
              <td className="score-cell">{car.score}</td>
              <td>{money(car.price)}</td>
              <td>{number(car.mileage)}</td>
              <td>{money(car.road_tax)}</td>
              <td>{car.gearbox || "Unknown"}</td>
              <td>{car.insurance_group ? `Group ${car.insurance_group}` : "Unknown"}</td>
              <td>
                <span className={`badge ${car.verdict_class}`}>{car.verdict}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
