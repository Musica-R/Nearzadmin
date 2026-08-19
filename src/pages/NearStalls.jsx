import { useEffect, useState, useCallback, useMemo } from "react";
import { Trash2, ExternalLink, IndianRupee } from "lucide-react";
import api from "../api/client";
import Topbar from "../components/Topbar";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import { Loader, EmptyState, ErrorBanner, SearchInput, EntityCell } from "../components/Common";

export default function NearStalls({ onMenu }) {
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
      const res = await api.nearStalls();
      setRows(res.data || []);
    } catch (e) {
      setError(e.message || "Couldn't load near stalls.");
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
      (s) => s.shop_name?.toLowerCase().includes(q) || s.city?.name?.toLowerCase().includes(q) || s.address_line1?.toLowerCase().includes(q)
    );
  }, [rows, query]);

  async function confirmDelete() {
    if (!target) return;
    setBusy(true);
    try {
      await api.deleteNearStall(target.id);
      setRows((prev) => prev.filter((r) => r.id !== target.id));
      setTarget(null);
    } catch (e) {
      setError(e.message || "Couldn't delete this stall.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Topbar
        title="Near Stalls"
        subtitle="Neighbourhood shops & stalls listed near users"
        onMenu={onMenu}
        onRefresh={() => load(true)}
        refreshing={refreshing}
      />
      <div className="lk-content">
        <ErrorBanner message={error} />
        <div className="lk-panel">
          <div className="lk-panel__head">
            <div>
              <h2>All near stalls</h2>
              <div className="lk-panel__head-sub">{rows.length} total</div>
            </div>
            <SearchInput value={query} onChange={setQuery} placeholder="Search shop, city, address\u2026" />
          </div>

          {loading ? (
            <Loader />
          ) : filtered.length === 0 ? (
            <EmptyState message="No stalls match your search." />
          ) : (
            <div className="lk-table-wrap">
              <table className="lk-table">
                <thead>
                  <tr>
                    <th>Shop</th>
                    <th>Badge</th>
                    <th>City</th>
                    <th>Price</th>
                    <th>Map</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s) => (
                    <tr key={s.id}>
                      <td>
                        <EntityCell photo={s.shop_photo} name={s.shop_name} sub={s.address_line1} />
                      </td>
                      <td>
                        {s.badge ? <span className="lk-pill">{s.badge}</span> : <span className="lk-pill neutral">\u2014</span>}
                      </td>
                      <td>{s.city?.name || "\u2014"}</td>
                      <td>
                        {s.price ? (
                          <span style={{ display: "inline-flex", alignItems: "center" }}>
                            <IndianRupee size={12} style={{ marginRight: 2 }} />
                            {Number(s.price).toLocaleString("en-IN")}
                          </span>
                        ) : (
                          "\u2014"
                        )}
                      </td>
                      <td>
                        {s.google_map_link ? (
                          <a href={s.google_map_link} target="_blank" rel="noreferrer" className="lk-icon-btn link" title="Open in Maps">
                            <ExternalLink size={14} />
                          </a>
                        ) : (
                          "\u2014"
                        )}
                      </td>
                      <td>
                        <div className="lk-row-actions" style={{ justifyContent: "flex-end" }}>
                          <button className="lk-icon-btn" title="Delete stall" onClick={() => setTarget(s)}>
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
        title="Delete this stall?"
        description={target ? `"${target.shop_name}" will be permanently removed from Lokal. This can't be undone.` : ""}
        onCancel={() => !busy && setTarget(null)}
        onConfirm={confirmDelete}
      />
    </>
  );
}
