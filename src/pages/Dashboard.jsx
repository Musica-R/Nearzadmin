import { useEffect, useState, useCallback } from "react";
import { Users, UserCheck, UserX, Wrench, Dumbbell, Store, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../api/client";
import { StatCard, Loader, ErrorBanner } from "../components/Common";
import Topbar from "../components/Topbar";

export default function Dashboard({ onMenu }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    setError("");
    try {
      const res = await api.dashboardCounts();
      setData(res.data);
    } catch (e) {
      setError(e.message || "Couldn't load dashboard counts.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load(false);
  }, [load]);

  const cards = data
    ? [
        { icon: Users, value: data.total_users, label: "Total users" },
        { icon: UserCheck, value: data.active_users, label: "Active users" },
        { icon: UserX, value: data.inactive_users, label: "Inactive users" },
        { icon: Wrench, value: data.total_vendors, label: "Home service vendors" },
        { icon: Dumbbell, value: data.total_activities, label: "Activities & classes" },
        { icon: Store, value: data.total_near_stalls, label: "Near stalls" },
      ]
    : [];

  const shortcuts = [
    { to: "/users", label: "Manage users", desc: "View registered users and their status" },
    { to: "/vendors", label: "Manage home services", desc: "Review and moderate service vendors" },
    { to: "/activities", label: "Manage activities", desc: "Review classes, gyms & instructors" },
    { to: "/near-stalls", label: "Manage near stalls", desc: "Review neighbourhood stalls" },
  ];

  return (
    <>
      <Topbar
        title="Dashboard"
        subtitle="A live snapshot of everything happening on Lokal"
        onMenu={onMenu}
        onRefresh={() => load(true)}
        refreshing={refreshing}
      />
      <div className="lk-content">
        <ErrorBanner message={error} />
        {loading ? (
          <Loader label="Loading dashboard\u2026" />
        ) : (
          <>
            <div className="lk-stats-grid">
              {cards.map((c) => (
                <StatCard key={c.label} {...c} />
              ))}
            </div>

            <div className="lk-panel">
              <div className="lk-panel__head">
                <div>
                  <h2>Quick access</h2>
                  <div className="lk-panel__head-sub">Jump straight into a listing type</div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, padding: 20 }}>
                {shortcuts.map((s) => (
                  <Link
                    key={s.to}
                    to={s.to}
                    style={{
                      border: "1px solid var(--lk-border)",
                      borderRadius: "var(--lk-radius-md)",
                      padding: "16px 18px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                      transition: "box-shadow .15s ease, border-color .15s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "var(--lk-shadow-md)")}
                    onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <strong style={{ fontSize: 14 }}>{s.label}</strong>
                      <ArrowUpRight size={15} color="var(--lk-primary)" />
                    </div>
                    <span style={{ fontSize: 12.5, color: "var(--lk-slate)" }}>{s.desc}</span>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
