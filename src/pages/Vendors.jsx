import { useEffect, useState, useCallback, useMemo } from "react";
import { Trash2, ExternalLink, IndianRupee } from "lucide-react";
import api from "../api/client";
import Topbar from "../components/Topbar";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import { Loader, EmptyState, ErrorBanner, SearchInput, EntityCell } from "../components/Common";

export default function Vendors({ onMenu }) {
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
      const res = await api.vendors();
      setRows(res.data || []);
    } catch (e) {
      setError(e.message || "Couldn't load vendors.");
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
      (v) =>
        v.business_name?.toLowerCase().includes(q) ||
        v.full_name?.toLowerCase().includes(q) ||
        v.category_name?.toLowerCase().includes(q) ||
        v.city_name?.toLowerCase().includes(q)
    );
  }, [rows, query]);

  async function confirmDelete() {
    if (!target) return;
    setBusy(true);
    try {
      await api.deleteVendor(target.id);
      setRows((prev) => prev.filter((r) => r.id !== target.id));
      setTarget(null);
    } catch (e) {
      setError(e.message || "Couldn't delete this vendor.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Topbar
        title="Home Services"
        subtitle="Vendors offering services across Tamil Nadu"
        onMenu={onMenu}
        onRefresh={() => load(true)}
        refreshing={refreshing}
      />
      <div className="lk-content">
        <ErrorBanner message={error} />
        <div className="lk-panel">
          <div className="lk-panel__head">
            <div>
              <h2>All vendors</h2>
              <div className="lk-panel__head-sub">{rows.length} total</div>
            </div>
            <SearchInput value={query} onChange={setQuery} placeholder="Search vendor, category, city\u2026" />
          </div>

          {loading ? (
            <Loader />
          ) : filtered.length === 0 ? (
            <EmptyState message="No vendors match your search." />
          ) : (
            <div className="lk-table-wrap">
              <table className="lk-table">
                <thead>
                  <tr>
                    <th>Vendor</th>
                    <th>Category</th>
                    <th>City</th>
                    <th>Price</th>
                    <th>Availability</th>
                    <th>Map</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((v) => (
                    <tr key={v.id}>
                      <td>
                        <EntityCell photo={v.profile_photo} name={v.business_name || v.full_name} sub={v.full_name} />
                      </td>
                      <td>
                        <span className="lk-pill">{v.category_name || "Uncategorised"}</span>
                      </td>
                      <td>{v.city_name || "\u2014"}</td>
                      <td>
                        {v.price ? (
                          <span style={{ display: "inline-flex", alignItems: "center" }}>
                            <IndianRupee size={12} style={{ marginRight: 2 }} />
                            {Number(v.price).toLocaleString("en-IN")}
                          </span>
                        ) : (
                          "\u2014"
                        )}
                      </td>
                      <td style={{ textTransform: "capitalize" }}>{v.availability_type?.replace("_", " ") || "\u2014"}</td>
                      <td>
                        {v.google_map_link ? (
                          <a href={v.google_map_link} target="_blank" rel="noreferrer" className="lk-icon-btn link" title="Open in Maps">
                            <ExternalLink size={14} />
                          </a>
                        ) : (
                          "\u2014"
                        )}
                      </td>
                      <td>
                        <div className="lk-row-actions" style={{ justifyContent: "flex-end" }}>
                          <button className="lk-icon-btn" title="Delete vendor" onClick={() => setTarget(v)}>
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
        title="Delete this vendor?"
        description={
          target
            ? `"${target.business_name || target.full_name}" will be permanently removed from Lokal. This can't be undone.`
            : ""
        }
        onCancel={() => !busy && setTarget(null)}
        onConfirm={confirmDelete}
      />
    </>
  );
}
