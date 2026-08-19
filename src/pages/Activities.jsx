import { useEffect, useState, useCallback, useMemo } from "react";
import { Trash2, ExternalLink } from "lucide-react";
import api from "../api/client";
import Topbar from "../components/Topbar";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import { Loader, EmptyState, ErrorBanner, SearchInput, EntityCell } from "../components/Common";

export default function Activities({ onMenu }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [target, setTarget] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async (isRefresh) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    setError("");
    try {
      const res = await api.activities();
      setRows(res.data || []);
    } catch (e) {
      setError(e.message || "Couldn't load activities.");
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
      (a) =>
        a.shop_center_name?.toLowerCase().includes(q) ||
        a.full_name?.toLowerCase().includes(q) ||
        a.category?.name?.toLowerCase().includes(q) ||
        a.city?.name?.toLowerCase().includes(q)
    );
  }, [rows, query]);

  async function confirmDelete() {
    if (!target) return;
    setBusy(true);
    try {
      await api.deleteActivity(target.id);
      setRows((prev) => prev.filter((r) => r.id !== target.id));
      setTarget(null);
    } catch (e) {
      setError(e.message || "Couldn't delete this activity.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Topbar
        title="Activities"
        subtitle="Classes, sports & fitness centres on Lokal"
        onMenu={onMenu}
        onRefresh={() => load(true)}
        refreshing={refreshing}
      />
      <div className="lk-content">
        <ErrorBanner message={error} />
        <div className="lk-panel">
          <div className="lk-panel__head">
            <div>
              <h2>All activities</h2>
              <div className="lk-panel__head-sub">{rows.length} total</div>
            </div>
            <SearchInput value={query} onChange={setQuery} placeholder="Search activity, category, city\u2026" />
          </div>

          {loading ? (
            <Loader />
          ) : filtered.length === 0 ? (
            <EmptyState message="No activities match your search." />
          ) : (
            <div className="lk-table-wrap">
              <table className="lk-table">
                <thead>
                  <tr>
                    <th>Activity</th>
                    <th>Category</th>
                    <th>Type</th>
                    <th>City</th>
                    <th>Availability</th>
                    <th>Map</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a) => (
                    <tr key={a.id}>
                      <td>
                        <EntityCell photo={a.profile_photo} name={a.shop_center_name} sub={a.full_name} />
                      </td>
                      <td>
                        {a.category?.name ? (
                          <span className="lk-pill">{a.category.name}</span>
                        ) : (
                          <span className="lk-pill neutral">Uncategorised</span>
                        )}
                      </td>
                      <td>{a.category?.type || "\u2014"}</td>
                      <td>{a.city?.name || "\u2014"}</td>
                      <td style={{ textTransform: "capitalize" }}>{a.availability_type?.replace("_", " ") || "\u2014"}</td>
                      <td>
                        {a.google_map_link ? (
                          <a href={a.google_map_link} target="_blank" rel="noreferrer" className="lk-icon-btn link" title="Open in Maps">
                            <ExternalLink size={14} />
                          </a>
                        ) : (
                          "\u2014"
                        )}
                      </td>
                      <td>
                        <div className="lk-row-actions" style={{ justifyContent: "flex-end" }}>
                          <button className="lk-icon-btn" title="Delete activity" onClick={() => setTarget(a)}>
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <ConfirmDeleteModal
        open={!!target}
        busy={busy}
        title="Delete this activity?"
        description={target ? `"${target.shop_center_name}" will be permanently removed from Lokal. This can't be undone.` : ""}
        onCancel={() => !busy && setTarget(null)}
        onConfirm={confirmDelete}
      />
    </>
  );
}
