import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Trash2,
  ExternalLink,
  IndianRupee,
  Eye,
  Pencil,
  X,
  Phone,
  MessageCircle,
  Clock,
  MapPin,
  BadgeCheck,
  Tag,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import api from "../api/client";
import Topbar from "../components/Topbar";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import { Loader, EmptyState, ErrorBanner, SearchInput, EntityCell } from "../components/Common";
import "../Style/Activities.css";

const ACTIVITY_TYPES = ["Learning & Training", "Sports & Fitness"];

function initials(name) {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

function formatDate(d) {
  if (!d) return "\u2014";
  try {
    return new Date(d).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "\u2014";
  }
}

function formatTime(t) {
  if (!t) return "\u2014";
  const [h, m] = t.split(":");
  const hour = Number(h);
  const suffix = hour >= 12 ? "PM" : "AM";
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12}:${m} ${suffix}`;
}

function waLink(number) {
  if (!number) return null;
  const digits = number.replace(/\D/g, "").replace(/^0+/, "");
  return `https://wa.me/91${digits}`;
}

// "09:00:00" -> "09:00" for <input type="time">
function toTimeInputValue(t) {
  if (!t) return "";
  return t.slice(0, 5);
}

function ActivityDetailModal({ activity, onClose, onEdit }) {
  if (!activity) return null;

  const isActive = Number(activity.status) === 1;
  const wa = waLink(activity.whatsapp_number);

  return (
    <div className="lk-modal-overlay" onClick={onClose}>
      <div className="lk-vdetail" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <button className="lk-vdetail__close" onClick={onClose} title="Close">
          <X size={18} />
        </button>

        <div className="lk-vdetail__header">
          {activity.profile_photo ? (
            <img src={activity.profile_photo} alt={activity.shop_center_name} className="lk-vdetail__photo" />
          ) : (
            <div className="lk-vdetail__photo lk-vdetail__photo--fallback">
              {initials(activity.shop_center_name || activity.full_name)}
            </div>
          )}

          <div className="lk-vdetail__heading">
            <h2>{activity.shop_center_name || activity.full_name}</h2>
            {activity.full_name && activity.full_name !== activity.shop_center_name && (
              <p className="lk-vdetail__subname">{activity.full_name}</p>
            )}
            <div className="lk-vdetail__badges">
              <span className="lk-pill">{activity.category?.name || "Uncategorised"}</span>
              {activity.category?.type && (
                <span className="lk-pill neutral">
                  <Tag size={12} />
                  {activity.category.type}
                </span>
              )}
              <span className={`lk-pill ${isActive ? "success" : "neutral"}`}>
                <BadgeCheck size={12} />
                {isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>

          <button className="lk-icon-btn link lk-vdetail__editbtn" title="Edit activity" onClick={() => onEdit(activity)}>
            <Pencil size={15} />
          </button>
        </div>

        <div className="lk-vdetail__grid">
          <div className="lk-vdetail__card">
            <div className="lk-vdetail__card-label">
              <Phone size={13} /> Phone
            </div>
            <a className="lk-vdetail__card-value link" href={`tel:${activity.phone_number}`}>
              {activity.phone_number || "\u2014"}
            </a>
          </div>

          <div className="lk-vdetail__card">
            <div className="lk-vdetail__card-label">
              <MessageCircle size={13} /> WhatsApp
            </div>
            {wa ? (
              <a className="lk-vdetail__card-value link" href={wa} target="_blank" rel="noreferrer">
                {activity.whatsapp_number}
              </a>
            ) : (
              <span className="lk-vdetail__card-value">\u2014</span>
            )}
          </div>

          <div className="lk-vdetail__card">
            <div className="lk-vdetail__card-label">
              <IndianRupee size={13} /> Price
            </div>
            <span className="lk-vdetail__card-value">
              {activity.price ? `\u20b9${Number(activity.price).toLocaleString("en-IN")}` : "\u2014"}
            </span>
          </div>

          <div className="lk-vdetail__card">
            <div className="lk-vdetail__card-label">
              <Tag size={13} /> Experience
            </div>
            <span className="lk-vdetail__card-value">{activity.experience || "\u2014"}</span>
          </div>

          <div className="lk-vdetail__card">
            <div className="lk-vdetail__card-label">
              <Clock size={13} /> Availability
            </div>
            <span className="lk-vdetail__card-value" style={{ textTransform: "capitalize" }}>
              {activity.availability_type?.replace("_", " ") || "\u2014"}
            </span>
            <span className="lk-vdetail__card-sub">
              {formatTime(activity.working_from)} \u2013 {formatTime(activity.working_to)}
            </span>
          </div>

          <div className="lk-vdetail__card">
            <div className="lk-vdetail__card-label">
              <MapPin size={13} /> City
            </div>
            <span className="lk-vdetail__card-value">
              {activity.city?.name || "\u2014"} {activity.pincode ? `\u2013 ${activity.pincode}` : ""}
            </span>
          </div>
        </div>

        <div className="lk-vdetail__section">
          <div className="lk-vdetail__section-label">Address</div>
          <p className="lk-vdetail__address">
            {activity.address_line1}
            {activity.address_line2 ? `, ${activity.address_line2}` : ""}
          </p>
          {activity.google_map_link && (
            <a className="lk-vdetail__maplink" href={activity.google_map_link} target="_blank" rel="noreferrer">
              <ExternalLink size={13} /> Open in Google Maps
            </a>
          )}
        </div>

        <div className="lk-vdetail__footer">
          <span>Joined {formatDate(activity.created_at)}</span>
          <span>Last updated {formatDate(activity.updated_at)}</span>
        </div>
      </div>
    </div>
  );
}

function ActivityEditModal({ activity, onClose, onSaved }) {
  const [form, setForm] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [allCategories, setAllCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingLookups, setLoadingLookups] = useState(false);

  // Load categories + cities once per activity opened for edit
  useEffect(() => {
    if (!activity) return;
    let cancelled = false;
    setLoadingLookups(true);
    Promise.all([api.allCategories(), api.cities()])
      .then(([catRes, cityRes]) => {
        if (cancelled) return;
        const cats = Array.isArray(catRes) ? catRes : catRes?.data || [];
        const citiesList = Array.isArray(cityRes) ? cityRes : cityRes?.data || [];
        setAllCategories(cats.filter((c) => ACTIVITY_TYPES.includes(c.type)));
        setCities(citiesList);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message || "Couldn't load categories/cities.");
      })
      .finally(() => {
        if (!cancelled) setLoadingLookups(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activity]);

  useEffect(() => {
    if (activity) {
      setForm({
        full_name: activity.full_name || "",
        shop_center_name: activity.shop_center_name || "",
        phone_number: activity.phone_number || "",
        whatsapp_number: activity.whatsapp_number || "",
        activity_type: activity.category?.type || "",
        category_id: activity.category_id ? String(activity.category_id) : "",
        experience: activity.experience || "",
        price: activity.price || "",
        availability_type: activity.availability_type || "all_days",
        working_from: toTimeInputValue(activity.working_from),
        working_to: toTimeInputValue(activity.working_to),
        address_line1: activity.address_line1 || "",
        address_line2: activity.address_line2 || "",
        pincode: activity.pincode || "",
        google_map_link: activity.google_map_link || "",
        city_id: activity.city_id ? String(activity.city_id) : "",
        status: Number(activity.status) === 1 ? "1" : "0",
      });
      setPhotoFile(null);
      setError("");
    }
  }, [activity]);

  if (!activity || !form) return null;

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleTypeChange(type) {
    setForm((prev) => ({
      ...prev,
      activity_type: type,
      // keep the original category selected if the type wasn't actually changed
      category_id: type === (activity.category?.type || "") ? String(activity.category_id || "") : "",
    }));
  }

  const categoryOptions = allCategories.filter((c) => c.type === form.activity_type);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        full_name: form.full_name,
        shop_center_name: form.shop_center_name,
        phone_number: form.phone_number,
        whatsapp_number: form.whatsapp_number,
        category_id: form.category_id,
        experience: form.experience,
        price: form.price,
        availability_type: form.availability_type,
        working_from: form.working_from,   // "09:00" — already H:i from <input type="time">
        working_to: form.working_to,       // "18:00"
        address_line1: form.address_line1,
        address_line2: form.address_line2,
        pincode: form.pincode,
        google_map_link: form.google_map_link,
        city_id: form.city_id,
        status: form.status,
      };
      if (photoFile) payload.profile_photo = photoFile;

      const res = await api.updateActivity(activity.id, payload);

      const cat = allCategories.find((c) => String(c.id) === String(form.category_id));
      const city = cities.find((c) => String(c.id) === String(form.city_id));

      const updated =
        res?.data || {
          ...activity,
          ...form,
          category: cat ? { ...activity.category, id: cat.id, name: cat.name, type: cat.type } : activity.category,
          city: city ? { ...activity.city, id: city.id, name: city.name } : activity.city,
        };
      onSaved(updated);
    } catch (e2) {
      setError(e2.message || "Couldn't save changes.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="lk-modal-overlay" onClick={() => !saving && onClose()}>
      <div className="lk-vdetail lk-vedit" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <button className="lk-vdetail__close" onClick={onClose} title="Close" disabled={saving}>
          <X size={18} />
        </button>

        <div className="lk-vedit__heading">
          <h2>Edit activity</h2>
          <p className="lk-vdetail__subname">{activity.shop_center_name || activity.full_name}</p>
        </div>

        <ErrorBanner message={error} />

        <form className="lk-vedit__form" onSubmit={handleSubmit}>
          <div className="lk-vedit__row">
            <label>
              Full name
              <input
                type="text"
                value={form.full_name}
                onChange={(e) => update("full_name", e.target.value)}
                required
              />
            </label>
            <label>
              Shop / center name
              <input
                type="text"
                value={form.shop_center_name}
                onChange={(e) => update("shop_center_name", e.target.value)}
              />
            </label>
          </div>

          <div className="lk-vedit__row">
            <label>
              Phone number
              <input
                type="tel"
                value={form.phone_number}
                onChange={(e) => update("phone_number", e.target.value)}
                required
              />
            </label>
            <label>
              WhatsApp number
              <input
                type="tel"
                value={form.whatsapp_number}
                onChange={(e) => update("whatsapp_number", e.target.value)}
              />
            </label>
          </div>

          <div className="lk-vedit__row">
            <label>
              Activity type
              <select
                value={form.activity_type}
                onChange={(e) => handleTypeChange(e.target.value)}
                disabled={loadingLookups}
                required
              >
                <option value="" disabled>
                  {loadingLookups ? "Loading\u2026" : "Select activity type"}
                </option>
                {ACTIVITY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Activity
              <select
                value={form.category_id}
                onChange={(e) => update("category_id", e.target.value)}
                disabled={!form.activity_type || loadingLookups}
                required
              >
                <option value="" disabled>
                  {!form.activity_type
                    ? "Select activity type first"
                    : loadingLookups
                      ? "Loading\u2026"
                      : "Select activity"}
                </option>
                {categoryOptions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="lk-vedit__row">
            <label>
              City
              <select
                value={form.city_id}
                onChange={(e) => update("city_id", e.target.value)}
                disabled={loadingLookups}
                required
              >
                <option value="" disabled>
                  {loadingLookups ? "Loading\u2026" : "Select city"}
                </option>
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Status
              <select value={form.status} onChange={(e) => update("status", e.target.value)}>
                <option value="1">Active</option>
                <option value="0">Inactive</option>
              </select>
            </label>
          </div>

          <div className="lk-vedit__row">
            <label>
              Price (\u20b9)
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => update("price", e.target.value)}
                required
              />
            </label>
            <label>
              Experience
              <input
                type="text"
                placeholder="e.g. 3 Years"
                value={form.experience}
                onChange={(e) => update("experience", e.target.value)}
              />
            </label>
          </div>

          <div className="lk-vedit__row">
            <label>
              Availability
              <select
                value={form.availability_type}
                onChange={(e) => update("availability_type", e.target.value)}
              >
                <option value="all_days">All days</option>
                <option value="weekdays">Weekdays only</option>
                <option value="weekends">Weekends only</option>
              </select>
            </label>
            <label>
              &nbsp;
              <span />
            </label>
          </div>

          <div className="lk-vedit__row">
            <label>
              Working from
              <input
                type="time"
                value={form.working_from}
                onChange={(e) => update("working_from", e.target.value)}
              />
            </label>
            <label>
              Working to
              <input
                type="time"
                value={form.working_to}
                onChange={(e) => update("working_to", e.target.value)}
              />
            </label>
          </div>

          <label className="lk-vedit__full">
            Address line 1
            <input
              type="text"
              value={form.address_line1}
              onChange={(e) => update("address_line1", e.target.value)}
              required
            />
          </label>

          {/* <label className="lk-vedit__full">
            Address line 2
            <input
              type="text"
              value={form.address_line2}
              onChange={(e) => update("address_line2", e.target.value)}
            />
          </label> */}

          <div className="lk-vedit__row">
            <label>
              Pincode
              <input
                type="text"
                value={form.pincode}
                onChange={(e) => update("pincode", e.target.value)}
              />
            </label>
            <label>
              Google Maps link
              <input
                type="url"
                value={form.google_map_link}
                onChange={(e) => update("google_map_link", e.target.value)}
              />
            </label>
          </div>

          <label className="lk-vedit__full">
            Profile photo
            <input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files?.[0] || null)} />
          </label>

          <div className="lk-vedit__actions">
            <button type="button" className="lk-btn ghost" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="lk-btn primary" disabled={saving || loadingLookups}>
              {saving ? "Saving\u2026" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Activities({ onMenu }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [target, setTarget] = useState(null);
  const [viewTarget, setViewTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [busy, setBusy] = useState(false);

  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const load = useCallback(async (isRefresh, pageNum = 1) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    setError("");
    try {
      const res = await api.activities({ page: pageNum });
      setRows(res.data || []);
      setPage(res.current_page || pageNum);
      setLastPage(res.last_page || 1);
      setTotal(res.total || 0);
    } catch (e) {
      setError(e.message || "Couldn't load activities.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load(false, 1);
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

  function goToPage(p) {
    if (p < 1 || p > lastPage || p === page) return;
    load(true, p);
  }

  function handleActivitySaved(updated) {
    setRows((prev) => prev.map((r) => (r.id === updated.id ? { ...r, ...updated } : r)));
    setViewTarget((prev) => (prev && prev.id === updated.id ? { ...prev, ...updated } : prev));
    setEditTarget(null);
  }

  return (
    <>
      <Topbar
        title="Activities"
        subtitle="Classes, sports & fitness centres on Lokal"
        onMenu={onMenu}
        onRefresh={() => load(true, page)}
        refreshing={refreshing}
      />
      <div className="lk-content">
        <ErrorBanner message={error} />
        <div className="lk-panel">
          <div className="lk-panel__head">
            <div>
              <h2>All activities</h2>
              <div className="lk-panel__head-sub">{total} total</div>
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
                    <th>Activity / Business Name & Details</th>
                    <th>Category</th>
                    <th>Type</th>
                    <th>City</th>
                    <th>Availability</th>
                    <th>Registered By</th>
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
                      <td>{a.role || "-"}</td>
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
                          <button className="lk-icon-btn link" title="View details" onClick={() => setViewTarget(a)}>
                            <Eye size={15} />
                          </button>
                          <button className="lk-icon-btn link" title="Edit activity" onClick={() => setEditTarget(a)}>
                            <Pencil size={15} />
                          </button>
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

          {!loading && lastPage > 1 && (
            <div className="lk-pagination">
              <button
                className="lk-pagination__btn"
                onClick={() => goToPage(page - 1)}
                disabled={page <= 1 || refreshing}
              >
                <ChevronLeft size={15} />
                Prev
              </button>
              <span className="lk-pagination__info">
                Page {page} of {lastPage}
              </span>
              <button
                className="lk-pagination__btn"
                onClick={() => goToPage(page + 1)}
                disabled={page >= lastPage || refreshing}
              >
                Next
                <ChevronRight size={15} />
              </button>
            </div>
          )}
        </div>
      </div>

      <ActivityDetailModal
        activity={viewTarget}
        onClose={() => setViewTarget(null)}
        onEdit={(a) => {
          setViewTarget(null);
          setEditTarget(a);
        }}
      />

      <ActivityEditModal activity={editTarget} onClose={() => setEditTarget(null)} onSaved={handleActivitySaved} />

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