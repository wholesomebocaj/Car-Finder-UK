export default function Navbar({ pages, activePage, onNavigate }) {
  return (
    <header className="topbar">
      <div className="brand-block">
        <span className="brand-mark">BL</span>
        <div>
          <h1>Budget Luxury Car Finder UK</h1>
          <p>Manual Auto Trader shortlist scoring</p>
        </div>
      </div>
      <nav className="nav-tabs" aria-label="Main navigation">
        {Object.entries(pages).map(([key, label]) => (
          <button
            key={key}
            className={activePage === key ? "nav-tab active" : "nav-tab"}
            onClick={() => onNavigate(key)}
            type="button"
          >
            {label}
          </button>
        ))}
      </nav>
    </header>
  );
}
