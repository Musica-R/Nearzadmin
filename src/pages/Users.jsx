import { useEffect, useState, useCallback, useMemo } from "react";
import { MapPin } from "lucide-react";
import api from "../api/client";
import Topbar from "../components/Topbar";
import { Loader, EmptyState, ErrorBanner, StatusBadge, SearchInput, EntityCell } from "../components/Common";

export default function Users({ onMenu }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  const load = useCallback(async (isRefresh) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    setError("");
    try {
      const res = await api.users();
      setRows(res.data || []);
    } catch (e) {
      setError(e.message || "Couldn't load users.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load(false);
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.mobile_number?.toLowerCase().includes(q) ||
        u.location?.toLowerCase().includes(q)
    );
  }, [rows, query]);

  return (
    <>
      <Topbar
        title="Users"
        subtitle="Everyone registered on the Lokal app"
        onMenu={onMenu}
        onRefresh={() => load(true)}
        refreshing={refreshing}
      />
      <div className="lk-content">
        <ErrorBanner message={error} />
        <div className="lk-panel">
          <div className="lk-panel__head">
            <div>
              <h2>All users</h2>
              <div className="lk-panel__head-sub">{rows.length} total</div>
            </div>
            <SearchInput value={query} onChange={setQuery} placeholder="Search name, email, phone\u2026" />
          </div>

          {loading ? (
            <Loader />
          ) : filtered.length === 0 ? (
            <EmptyState message="No users match your search." />
          ) : (
            <div className="lk-table-wrap">
              <table className="lk-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Phone</th>
                    <th>Location</th>
                    <th>Joined</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <EntityCell photo={u.profile_image} name={u.name} sub={u.email} />
                      </td>
                      <td>{u.mobile_number || "\u2014"}</td>
                      <td>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                          <MapPin size={13} color="var(--lk-slate-light)" />
                          {u.location || "\u2014"}
                        </span>
                      </td>
                      <td>{formatDate(u.created_at)}</td>
                      <td>
                        <StatusBadge status={u.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function formatDate(d) {
  if (!d) return "\u2014";
  try {
    return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return d;
  }
}
