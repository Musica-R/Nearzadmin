import { useEffect, useState, useCallback } from "react";
import {
  Users,
  UserCheck,
  UserX,
  Wrench,
  Dumbbell,
  Store,
  Tag,
  ArrowUpRight,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../api/client";
import { Loader, ErrorBanner } from "../components/Common";
import Topbar from "../components/Topbar";

/* Small inline sparkline — no charting lib needed */
function Sparkline({ points, color }) {
  const path = points
    .map((p, i) => `${(i / (points.length - 1)) * 160},${34 - p * 30}`)
    .join(" ");
  return (
    <svg className="lk-stat-spark" width="100%" height="34" viewBox="0 0 160 34" preserveAspectRatio="none">
      <polyline points={path} fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StatCard({ icon: Icon, value, label, tint, iconColor, trend, points }) {
  const up = trend >= 0;
  return (
    <div className="lk-stat-card">
      <div className="lk-stat-card__top">
        <div className="lk-stat-card__icon" style={{ background: tint, color: iconColor }}>
          <Icon size={19} />
        </div>
        <span className={`lk-stat-badge ${up ? "up" : "down"}`}>
          {up ? "↑" : "↓"} {Math.abs(trend)}%
        </span>
      </div>
      <div className="lk-stat-card__value">{value}</div>
      <div className="lk-stat-card__label">{label}</div>
      <Sparkline points={points} color={iconColor} />
    </div>
  );
}

/* Quick access card with a photo, matching client's illustrated style */
function QuickAccessCard({ to, icon: Icon, iconBg, image, title, desc }) {
  return (
    <Link to={to} className="lk-quick-card">
      <div className="lk-quick-card__img">
        <img src={image} alt={title} loading="lazy" />
        <div className="lk-quick-card__icon" style={{ background: iconBg }}>
          <Icon size={16} color="#fff" />
        </div>
      </div>
      <div className="lk-quick-card__body">
        <h3>{title}</h3>
        <p>{desc}</p>
      </div>
      <div className="lk-quick-card__foot">
        <ArrowUpRight size={15} color="var(--lk-primary)" />
      </div>
    </Link>
  );
}

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
        {
          icon: Users,
          value: data.total_users,
          label: "Registered users",
          tint: "var(--lk-primary-tint)",
          iconColor: "var(--lk-primary-dark)",
          trend: 8,
          points: [0.6, 0.5, 0.7, 0.3, 0.45, 0.15, 0.4, 0.1, 0.25],
        },
        {
          icon: UserCheck,
          value: data.active_users,
          label: "Currently active",
          tint: "var(--lk-success-tint)",
          iconColor: "var(--lk-success)",
          trend: 12,
          points: [0.65, 0.55, 0.6, 0.25, 0.5, 0.2, 0.4, 0.15, 0.2],
        },
        {
          icon: UserX,
          value: data.inactive_users,
          label: "Not active",
          tint: "#fdf1de",
          iconColor: "#b8720c",
          trend: 0,
          points: [0.25, 0.35, 0.2, 0.45, 0.3, 0.5, 0.4, 0.55, 0.48],
        },
        {
          icon: Wrench,
          value: data.total_vendors,
          label: "Home service providers",
          tint: "#e8f0fe",
          iconColor: "#2563d4",
          trend: 5,
          points: [0.55, 0.5, 0.65, 0.55, 0.75, 0.6, 0.8, 0.65, 0.85],
        },
        {
          icon: Dumbbell,
          value: data.total_activities,
          label: "Total listed",
          tint: "#fdeaf1",
          iconColor: "#d3266e",
          trend: 3,
          points: [0.45, 0.35, 0.6, 0.3, 0.7, 0.4, 0.75, 0.55, 0.8],
        },
      ]
    : [];

  const shortcuts = [
    {
      to: "/users",
      label: "Manage Users",
      desc: "View, edit and manage registered users",
      icon: Users,
      iconBg: "var(--lk-gradient)",
      image:
        "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=400&q=80",
    },
    {
      to: "/vendors",
      label: "Home Services",
      desc: "Review and manage service vendors",
      icon: Wrench,
      iconBg: "#178a53",
      image:
        "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=400&q=80",
    },
    {
      to: "/activities",
      label: "Activities",
      desc: "Manage classes, gyms & instructors",
      icon: Dumbbell,
      iconBg: "#2563d4",
      image:
        "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=400&q=80",
    },
    {
      to: "/near-stalls",
      label: "Near Stalls",
      desc: "Review nearby stalls and shops",
      icon: Store,
      iconBg: "#d3266e",
      image:
        "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=400&q=80",
    },
    {
      to: "/categories",
      label: "Categories",
      desc: "Manage service categories",
      icon: Tag,
      iconBg: "#e08a1c",
      image:
        "https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=400&q=80",
    },
  ];

  return (
    <>
      <Topbar
        title="Dashboard"
        subtitle="A live snapshot of everything happening on Thozhaa"
        onMenu={onMenu}
        onRefresh={() => load(true)}
        refreshing={refreshing}
      />
      <div className="lk-content">
        <ErrorBanner message={error} />
        {loading ? (
          <Loader label="Loading dashboard…" />
        ) : (
          <>
            <div className="lk-stats-grid">
              {cards.map((c) => (
                <StatCard key={c.label} {...c} />
              ))}
            </div>

            {/* Hero banner */}
            <div className="lk-hero">
              <div className="lk-hero__text">
                <h2>
                  Empowering Local Services Connecting <span>Communities</span>
                </h2>
                <p>
                  Thozhaa helps you discover trusted local services, activities,
                  and nearby stalls — all in one place.
                </p>
                <Link to="/vendors" className="lk-hero__btn">
                  Explore Services <ArrowRight size={15} />
                </Link>
              </div>
              <div className="lk-hero__art">
                <img
                  src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=700&q=80"
                  alt="Local navigation and services"
                />
              </div>
            </div>

            <div className="lk-panel-plain">
              <div className="lk-panel__head-plain">
                <h2>Quick Access</h2>
                <div className="lk-panel__head-sub">
                  Manage and monitor your platform with ease
                </div>
              </div>
              <div className="lk-quick-grid">
                {shortcuts.map((s) => (
                  <QuickAccessCard
                    key={s.to}
                    to={s.to}
                    icon={s.icon}
                    iconBg={s.iconBg}
                    image={s.image}
                    title={s.label}
                    desc={s.desc}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}