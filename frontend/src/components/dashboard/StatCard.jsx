/**
 * StatCard — reusable metric card for dashboard
 * Used by: DashboardPage.jsx, ImpactPage.jsx
 * Data: static mock data (swap with API in Month 3)
 *
 * Props:
 *   icon     — Material Symbol name
 *   label    — card label
 *   value    — main metric value
 *   sub      — optional sub-text (e.g. "+120 today")
 *   variant  — 'green' | 'default' (controls background)
 */
export default function StatCard({ icon, label, value, sub, variant = 'default' }) {
  return (
    <div className={`stat-card stat-card--${variant}`}>
      <span className="material-symbols-outlined stat-card-icon">{icon}</span>
      <div className="stat-card-content">
        <h3 className="stat-card-label">{label}</h3>
        <div className="stat-card-row">
          <span className="stat-card-value">{value}</span>
          {sub && <span className="stat-card-sub">{sub}</span>}
        </div>
      </div>
    </div>
  );
}
