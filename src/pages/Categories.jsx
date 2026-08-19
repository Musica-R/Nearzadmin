import { useEffect, useState, useCallback, useMemo } from "react";
import api, { CATEGORY_TYPES } from "../api/client";
import Topbar from "../components/Topbar";
import { Loader, EmptyState, ErrorBanner } from "../components/Common";

const emptyCatForm = { id: null, name: "", type: CATEGORY_TYPES[0], image: null, status: 1 };
const emptySubForm = { id: null, category_id: null, name: "", image: null, status: 1 };

export default function Categories({ onMenu }) {
  const [type, setType] = useState(CATEGORY_TYPES[0]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [selectedId, setSelectedId] = useState(null);

  const [catForm, setCatForm] = useState(null);
  const [savingCat, setSavingCat] = useState(false);

  const [subForm, setSubForm] = useState(null);
  const [savingSub, setSavingSub] = useState(false);

  const [confirmTarget, setConfirmTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async (activeType, isRefresh) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    setError("");
    try {
      const res = await api.categoriesByType(activeType);
      setRows(res.data || []);
    } catch (e) {
      setError(e.message || "Couldn't load categories.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    setSelectedId(null);
    load(type, false);
  }, [type, load]);

  const selected = useMemo(() => rows.find((c) => c.id === selectedId) || null, [rows, selectedId]);

  function selectCategory(cat) {
    setSelectedId((prev) => (prev === cat.id ? null : cat.id));
  }

  function openAddCategory() {
    setCatForm({ ...emptyCatForm, type });
  }
  function openEditCategory(cat) {
    setCatForm({ id: cat.id, name: cat.name, type: cat.type, image: null, status: cat.status });
  }

  async function saveCategory(e) {
    e.preventDefault();
    if (!catForm) return;
    setSavingCat(true);
    setError("");
    try {
      if (catForm.id) {
        await api.updateCategory(catForm.id, {
          name: catForm.name,
          type: catForm.type,
          image: catForm.image || undefined,
          status: catForm.status,
        });
      } else {
        await api.addCategory({ name: catForm.name, type: catForm.type, image: catForm.image });
      }
      setCatForm(null);
      await load(type, true);
    } catch (e2) {
      setError(e2.message || "Couldn't save category.");
    } finally {
      setSavingCat(false);
    }
  }

  function openAddSubcategory(cat) {
    setSubForm({ ...emptySubForm, category_id: cat.id });
  }
  function openEditSubcategory(sub) {
    setSubForm({ id: sub.id, category_id: sub.category_id, name: sub.name, image: null, status: sub.status });
  }

  async function saveSubcategory(e) {
    e.preventDefault();
    if (!subForm) return;
    setSavingSub(true);
    setError("");
    try {
      if (subForm.id) {
        await api.updateSubcategory(subForm.id, {
          category_id: subForm.category_id,
          name: subForm.name,
          image: subForm.image || undefined,
          status: subForm.status,
        });
      } else {
        await api.addSubcategory({
          category_id: subForm.category_id,
          name: subForm.name,
          image: subForm.image,
        });
      }
      setSubForm(null);
      await load(type, true);
    } catch (e2) {
      setError(e2.message || "Couldn't save subcategory.");
    } finally {
      setSavingSub(false);
    }
  }

  async function confirmDelete() {
    if (!confirmTarget) return;
    setDeleting(true);
    setError("");
    try {
      if (confirmTarget.kind === "category") {
        await api.deleteCategory(confirmTarget.id);
        if (selectedId === confirmTarget.id) setSelectedId(null);
      } else {
        await api.deleteSubcategory(confirmTarget.id);
      }
      setConfirmTarget(null);
      await load(type, true);
    } catch (e) {
      setError(e.message || "Couldn't delete.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <Topbar
        title="Categories"
        subtitle="Service categories shown to users, by type"
        onMenu={onMenu}
        onRefresh={() => load(type, true)}
        refreshing={refreshing}
      />
      <div className="lk-content">
        <ErrorBanner message={error} />
        <div className="lk-panel">
          <div className="lk-panel__head">
            <div>
              <h2>Categories</h2>
              <div className="lk-panel__head-sub">Click a category to view its subcategories</div>
            </div>
            <button className="lk-btn lk-btn--primary" onClick={openAddCategory}>
              + Add category
            </button>
          </div>

          <div className="lk-tabs">
            {CATEGORY_TYPES.map((t) => (
              <button key={t} className={`lk-tab ${t === type ? "active" : ""}`} onClick={() => setType(t)}>
                {t}
              </button>
            ))}
          </div>

          {loading ? (
            <Loader />
          ) : rows.length === 0 ? (
            <EmptyState message="No categories found for this type." />
          ) : (
            <div className="lk-cat-grid">
              {rows.map((c) => (
                <div className={`lk-cat-card ${selectedId === c.id ? "selected" : ""}`} key={c.id}>
                  <div className="lk-cat-card__hit" onClick={() => selectCategory(c)}>
                    <img src={c.image} alt={c.name} onError={(e) => (e.target.style.opacity = 0.2)} />
                    <div className="lk-cat-card__label">
                      {c.name}
                      {c.sub_categories?.length > 0 && (
                        <span className="lk-pill neutral lk-cat-card__count">{c.sub_categories.length}</span>
                      )}
                    </div>
                  </div>
                  <div className="lk-cat-card__actions">
                    <button className="lk-icon-btn link" title="Edit" onClick={() => openEditCategory(c)}>
                      ✎
                    </button>
                    <button
                      className="lk-icon-btn"
                      title="Delete"
                      onClick={() => setConfirmTarget({ kind: "category", id: c.id, name: c.name })}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selected && (
            <div className="lk-subpanel">
              <div className="lk-panel__head">
                <div>
                  <h2>{selected.name} — subcategories</h2>
                  <div className="lk-panel__head-sub">{selected.sub_categories?.length || 0} total</div>
                </div>
                <button className="lk-btn ghost" onClick={() => openAddSubcategory(selected)}>
                  + Add subcategory
                </button>
              </div>

              {!selected.sub_categories || selected.sub_categories.length === 0 ? (
                <EmptyState message="No subcategories yet." />
              ) : (
                <div className="lk-table-wrap">
                  <table className="lk-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Status</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {selected.sub_categories.map((s) => (
                        <tr key={s.id}>
                          <td>
                            <div className="lk-cell-entity">
                              {s.image ? (
                                <img className="lk-thumb" src={s.image} alt={s.name} />
                              ) : (
                                <div className="lk-thumb-fallback">{s.name?.[0] || "?"}</div>
                              )}
                              <strong>{s.name}</strong>
                            </div>
                          </td>
                          <td>
                            <span className={`lk-pill ${s.status ? "success" : "neutral"}`}>
                              {s.status ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td>
                            <div className="lk-row-actions">
                              <button className="lk-icon-btn link" title="Edit" onClick={() => openEditSubcategory(s)}>
                                ✎
                              </button>
                              <button
                                className="lk-icon-btn"
                                title="Delete"
                                onClick={() => setConfirmTarget({ kind: "subcategory", id: s.id, name: s.name })}
                              >
                                ✕
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
          )}
        </div>
      </div>

      {catForm && (
        <div className="lk-modal-overlay" onClick={() => setCatForm(null)}>
          <form className="lk-modal" onClick={(e) => e.stopPropagation()} onSubmit={saveCategory}>
            <h3>{catForm.id ? "Edit category" : "Add category"}</h3>
            <div className="lk-form">
              <label className="lk-form-group">
                <span className="lk-form-label">Name</span>
                <input
                  required
                  className="lk-input"
                  value={catForm.name}
                  onChange={(e) => setCatForm((p) => ({ ...p, name: e.target.value }))}
                />
              </label>
              <label className="lk-form-group">
                <span className="lk-form-label">Type</span>
                <select
                  className="lk-input lk-select"
                  value={catForm.type}
                  onChange={(e) => setCatForm((p) => ({ ...p, type: e.target.value }))}
                >
                  {CATEGORY_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>
              <label className="lk-form-group">
                <span className="lk-form-label">Image {catForm.id && <em>(leave blank to keep current)</em>}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="lk-file-input"
                  onChange={(e) => setCatForm((p) => ({ ...p, image: e.target.files[0] || null }))}
                />
              </label>
            </div>
            <div className="lk-modal__actions">
              <button type="button" className="lk-btn ghost" onClick={() => setCatForm(null)}>
                Cancel
              </button>
              <button type="submit" className="lk-btn lk-btn--primary" disabled={savingCat}>
                {savingCat ? "Saving…" : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}

      {subForm && (
        <div className="lk-modal-overlay" onClick={() => setSubForm(null)}>
          <form className="lk-modal" onClick={(e) => e.stopPropagation()} onSubmit={saveSubcategory}>
            <h3>{subForm.id ? "Edit subcategory" : "Add subcategory"}</h3>
            <div className="lk-form">
              <label className="lk-form-group">
                <span className="lk-form-label">Name</span>
                <input
                  required
                  className="lk-input"
                  value={subForm.name}
                  onChange={(e) => setSubForm((p) => ({ ...p, name: e.target.value }))}
                />
              </label>
              <label className="lk-form-group">
                <span className="lk-form-label">Image {subForm.id && <em>(leave blank to keep current)</em>}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="lk-file-input"
                  onChange={(e) => setSubForm((p) => ({ ...p, image: e.target.files[0] || null }))}
                />
              </label>
            </div>
            <div className="lk-modal__actions">
              <button type="button" className="lk-btn ghost" onClick={() => setSubForm(null)}>
                Cancel
              </button>
              <button type="submit" className="lk-btn lk-btn--primary" disabled={savingSub}>
                {savingSub ? "Saving…" : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}

      {confirmTarget && (
        <div className="lk-modal-overlay" onClick={() => !deleting && setConfirmTarget(null)}>
          <div className="lk-modal" onClick={(e) => e.stopPropagation()}>
            <div className="lk-modal__icon">✕</div>
            <h3>Delete {confirmTarget.kind}?</h3>
            <p>
              Are you sure you want to delete <strong>{confirmTarget.name}</strong>? This can't be undone.
              {confirmTarget.kind === "category" && " Its subcategories will be removed too."}
            </p>
            <div className="lk-modal__actions">
              <button className="lk-btn ghost" onClick={() => setConfirmTarget(null)} disabled={deleting}>
                Cancel
              </button>
              <button className="lk-btn danger" onClick={confirmDelete} disabled={deleting}>
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}