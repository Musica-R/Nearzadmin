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
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Store,
  ShieldCheck,
  Flame,
} from "lucide-react";
import api from "../api/client";
import Topbar from "../components/Topbar";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import { Loader, EmptyState, ErrorBanner, SearchInput, EntityCell } from "../components/Common";
import "../Style/NearStalls.css";

const BADGES = ["Verified", "Popular", "New"];

const SORT_OPTIONS = [
  { value: "recent", label: "Recent" },
  { value: "name", label: "Name (A-Z)" },
  { value: "price_high", label: "Price: High to Low" },
  { value: "price_low", label: "Price: Low to High" },
];

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

function StatCard({ icon, tone, value, label, sub }) {
  return (
    <div className={`lk-stat-cards lk-stat-cards--${tone}`}>
      <div className="lk-stat-cards__icon">{icon}</div>
      <div className="lk-stat-cards__body">
        <div className="lk-stat-cards__label">{label}</div>
        <div className="lk-stat-cards__value">{value}</div>
        <div className="lk-stat-cards__sub">{sub}</div>
      </div>
      <div className="lk-stat-cards__wave" aria-hidden="true" />
    </div>
  );
}

function SortDropdown({ value, onChange }) {
  const current = SORT_OPTIONS.find((o) => o.value === value)?.label || "Recent";
  return (
    <label className="lk-sort">
      <span className="lk-sort__label">Sort by:</span>
      <span className="lk-sort__select-wrap">
        <select className="lk-sort__select" value={value} onChange={(e) => onChange(e.target.value)}>
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <span className="lk-sort__value">
          {current}
          <ChevronDown size={14} />
        </span>
      </span>
    </label>
  );
}

function StallDetailModal({ stall, onClose, onEdit }) {
  const [activePhoto, setActivePhoto] = useState(0);

  useEffect(() => {
    setActivePhoto(0);
  }, [stall]);

  if (!stall) return null;

  const isActive = Number(stall.status) === 1;
  const wa = waLink(stall.whatsapp_number);
  const photos = [stall.shop_photo, stall.shop_photo2, stall.shop_photo3].filter(Boolean);

  return (
    <div className="lk-modal-overlay" onClick={onClose}>
      <div className="lk-vdetail" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <button className="lk-vdetail__close" onClick={onClose} title="Close">
          <X size={18} />
        </button>

        <button
          className="lk-icon-btn link lk-vdetail__editbtn lk-vdetail__editbtn--gallery"
          title="Edit stall"
          onClick={() => onEdit(stall)}
        >
          <Pencil size={15} />
        </button>

        {photos.length > 0 ? (
          <div className="lk-vdetail__gallery">
            <img src={photos[activePhoto]} alt={stall.shop_name} className="lk-vdetail__gallery-main" />
            {photos.length > 1 && (
              <div className="lk-vdetail__gallery-thumbs">
                {photos.map((p, i) => (
                  <button
                    key={p}
                    className={`lk-vdetail__gallery-thumb ${i === activePhoto ? "active" : ""}`}
                    onClick={() => setActivePhoto(i)}
                  >
                    <img src={p} alt={`${stall.shop_name} ${i + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="lk-vdetail__header" style={{ marginTop: 4 }}>
            <div className="lk-vdetail__photo lk-vdetail__photo--fallback">{initials(stall.shop_name)}</div>
          </div>
        )}

        <div className="lk-vdetail__heading" style={{ marginTop: photos.length > 0 ? 18 : 0 }}>
          <h2>{stall.shop_name}</h2>
          <div className="lk-vdetail__badges">
            {stall.badge && <span className="lk-pill">{stall.badge}</span>}
            <span className={`lk-pill ${isActive ? "success" : "neutral"}`}>
              <BadgeCheck size={12} />
              {isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>

        <div className="lk-vdetail__grid">
          <div className="lk-vdetail__card">
            <div className="lk-vdetail__card-label">
              <Phone size={13} /> Phone
            </div>
            <a className="lk-vdetail__card-value link" href={`tel:${stall.phone_number}`}>
              {stall.phone_number || "\u2014"}
            </a>
          </div>

          <div className="lk-vdetail__card">
            <div className="lk-vdetail__card-label">
              <MessageCircle size={13} /> WhatsApp
            </div>
            {wa ? (
              <a className="lk-vdetail__card-value link" href={wa} target="_blank" rel="noreferrer">
                {stall.whatsapp_number}
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
              {stall.price ? `\u20b9${Number(stall.price).toLocaleString("en-IN")}` : "\u2014"}
            </span>
          </div>

          <div className="lk-vdetail__card">
            <div className="lk-vdetail__card-label">
              <Clock size={13} /> Working hours
            </div>
            <span className="lk-vdetail__card-value">
              {formatTime(stall.working_from)} \u2013 {formatTime(stall.working_to)}
            </span>
          </div>

          <div className="lk-vdetail__card" style={{ gridColumn: "span 2" }}>
            <div className="lk-vdetail__card-label">
              <MapPin size={13} /> City
            </div>
            <span className="lk-vdetail__card-value">
              {stall.city?.name || "\u2014"} {stall.pincode ? `\u2013 ${stall.pincode}` : ""}
            </span>
          </div>
        </div>

        <div className="lk-vdetail__section">
          <div className="lk-vdetail__section-label">Address</div>
          <p className="lk-vdetail__address">
            {stall.address_line1}
            {stall.address_line2 ? `, ${stall.address_line2}` : ""}
          </p>
          {stall.google_map_link && (
            <a className="lk-vdetail__maplink" href={stall.google_map_link} target="_blank" rel="noreferrer">
              <ExternalLink size={13} /> Open in Google Maps
            </a>
          )}
        </div>

        <div className="lk-vdetail__footer">
          <span>Joined {formatDate(stall.created_at)}</span>
          <span>Last updated {formatDate(stall.updated_at)}</span>
        </div>
      </div>
    </div>
  );
}

function StallEditModal({ stall, onClose, onSaved }) {
  const [form, setForm] = useState(null);
  const [photoFiles, setPhotoFiles] = useState({ shop_photo: null, shop_photo2: null, shop_photo3: null });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [cities, setCities] = useState([]);
  const [loadingLookups, setLoadingLookups] = useState(false);

  useEffect(() => {
    if (!stall) return;
    let cancelled = false;
    setLoadingLookups(true);
    api
      .cities()
      .then((res) => {
        if (cancelled) return;
        setCities(Array.isArray(res) ? res : res?.data || []);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message || "Couldn't load cities.");
      })
      .finally(() => {
        if (!cancelled) setLoadingLookups(false);
      });
    return () => {
      cancelled = true;
    };
  }, [stall]);

  useEffect(() => {
    if (stall) {
      setForm({
        shop_name: stall.shop_name || "",
        phone_number: stall.phone_number || "",
        whatsapp_number: stall.whatsapp_number || "",
        badge: stall.badge || "Verified",
        price: stall.price || "",
        working_from: toTimeInputValue(stall.working_from),
        working_to: toTimeInputValue(stall.working_to),
        address_line1: stall.address_line1 || "",
        address_line2: stall.address_line2 || "",
        pincode: stall.pincode || "",
        google_map_link: stall.google_map_link || "",
        city_id: stall.city_id ? String(stall.city_id) : "",
        status: Number(stall.status) === 1 ? "1" : "0",
      });
      setPhotoFiles({ shop_photo: null, shop_photo2: null, shop_photo3: null });
      setError("");
    }
  }, [stall]);

  if (!stall || !form) return null;

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handlePhotoChange(field, file) {
    setPhotoFiles((prev) => ({ ...prev, [field]: file || null }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        shop_name: form.shop_name,
        phone_number: form.phone_number,
        whatsapp_number: form.whatsapp_number,
        badge: form.badge,
        price: form.price,
        working_from: form.working_from, // "09:00" — H:i, matches <input type="time">
        working_to: form.working_to,
        address_line1: form.address_line1,
        address_line2: form.address_line2,
        pincode: form.pincode,
        google_map_link: form.google_map_link,
        city_id: form.city_id,
        status: form.status,
      };
      if (photoFiles.shop_photo) payload.shop_photo = photoFiles.shop_photo;
      if (photoFiles.shop_photo2) payload.shop_photo2 = photoFiles.shop_photo2;
      if (photoFiles.shop_photo3) payload.shop_photo3 = photoFiles.shop_photo3;

      const res = await api.updateNearStall(stall.id, payload);

      const city = cities.find((c) => String(c.id) === String(form.city_id));

      const updated =
        res?.data || {
          ...stall,
          ...form,
          city: city ? { ...stall.city, id: city.id, name: city.name } : stall.city,
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
          <h2>Edit stall</h2>
          <p className="lk-vdetail__subname">{stall.shop_name}</p>
        </div>

        <ErrorBanner message={error} />

        <form className="lk-vedit__form" onSubmit={handleSubmit}>
          <div className="lk-vedit__row">
            <label>
              Shop name
              <input
                type="text"
                value={form.shop_name}
                onChange={(e) => update("shop_name", e.target.value)}
                required
              />
            </label>
            <label>
              Badge
              <select value={form.badge} onChange={(e) => update("badge", e.target.value)}>
                {BADGES.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
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
              Price
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
              Status
              <select value={form.status} onChange={(e) => update("status", e.target.value)}>
                <option value="1">Active</option>
                <option value="0">Inactive</option>
              </select>
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
              Pincode
              <input
                type="text"
                value={form.pincode}
                onChange={(e) => update("pincode", e.target.value)}
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

          <label className="lk-vedit__full">
            Google Maps link
            <input
              type="url"
              value={form.google_map_link}
              onChange={(e) => update("google_map_link", e.target.value)}
            />
          </label>

          <div className="lk-vedit__row lk-vedit__row--3">
            <label>
              Shop photo
              {stall.shop_photo && <span className="lk-vedit__current-hint">Replaces existing</span>}
              <input type="file" accept="image/*" onChange={(e) => handlePhotoChange("shop_photo", e.target.files?.[0])} />
            </label>
            <label>
              Shop photo 2
              {stall.shop_photo2 && <span className="lk-vedit__current-hint">Replaces existing</span>}
              <input type="file" accept="image/*" onChange={(e) => handlePhotoChange("shop_photo2", e.target.files?.[0])} />
            </label>
            <label>
              Shop photo 3
              {stall.shop_photo3 && <span className="lk-vedit__current-hint">Replaces existing</span>}
              <input type="file" accept="image/*" onChange={(e) => handlePhotoChange("shop_photo3", e.target.files?.[0])} />
            </label>
          </div>

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

export default function NearStalls({ onMenu }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [target, setTarget] = useState(null);
  const [viewTarget, setViewTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [busy, setBusy] = useState(false);

  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [rangeFrom, setRangeFrom] = useState(0);
  const [rangeTo, setRangeTo] = useState(0);

  const load = useCallback(async (isRefresh, pageNum = 1) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    setError("");
    try {
      const res = await api.nearStalls({ page: pageNum });
      setRows(res.data || []);
      setPage(res.current_page || pageNum);
      setLastPage(res.last_page || 1);
      setTotal(res.total || 0);
      setRangeFrom(res.from || 0);
      setRangeTo(res.to || 0);
    } catch (e) {
      setError(e.message || "Couldn't load near stalls.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load(false, 1);
  }, [load]);

  const stats = useMemo(() => {
    const verified = rows.filter((s) => s.badge === "Verified").length;
    const popular = rows.filter((s) => s.badge === "Popular").length;
    const cities = new Set(rows.map((s) => s.city?.name).filter(Boolean));
    return { verified, popular, cityCount: cities.size };
  }, [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (s) => s.shop_name?.toLowerCase().includes(q) || s.city?.name?.toLowerCase().includes(q) || s.address_line1?.toLowerCase().includes(q)
    );
  }, [rows, query]);

  const sortedFiltered = useMemo(() => {
    const arr = [...filtered];
    switch (sortBy) {
      case "name":
        arr.sort((a, b) => (a.shop_name || "").localeCompare(b.shop_name || ""));
        break;
      case "price_high":
        arr.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
        break;
      case "price_low":
        arr.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
        break;
      default:
        arr.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    }
    return arr;
  }, [filtered, sortBy]);

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

  function goToPage(p) {
    if (p < 1 || p > lastPage || p === page) return;
    load(true, p);
  }

  function handleStallSaved(updated) {
    setRows((prev) => prev.map((r) => (r.id === updated.id ? { ...r, ...updated } : r)));
    setViewTarget((prev) => (prev && prev.id === updated.id ? { ...prev, ...updated } : prev));
    setEditTarget(null);
  }

  return (
    <>
      <Topbar
        title="Near Stalls"
        subtitle="Neighbourhood shops & stalls listed near users"
        onMenu={onMenu}
        onRefresh={() => load(true, page)}
        refreshing={refreshing}
      />
      <div className="lk-content">
        <ErrorBanner message={error} />

        <div className="lk-stats-grid">
          <StatCard
            tone="violet"
            icon={<Store size={20} />}
            label="Total Stalls"
            value={total}
            sub="All listed stalls"
          />
          <StatCard
            tone="indigo"
            icon={<ShieldCheck size={20} />}
            label="Verified Stalls"
            value={stats.verified}
            sub="Trusted & verified"
          />
          <StatCard
            tone="rose"
            icon={<Flame size={20} />}
            label="Popular Stalls"
            value={stats.popular}
            sub="High demand stalls"
          />
          <StatCard
            tone="violet"
            icon={<MapPin size={20} />}
            label="Cities Covered"
            value={stats.cityCount}
            sub={rows[0]?.city?.name || "\u2014"}
          />
        </div>

        <div className="lk-panel">
          <div className="lk-panel__head">
            <div>
              <h2>All near stalls</h2>
              <div className="lk-panel__head-sub">{total} total</div>
            </div>
            <div className="lk-panel__head-actions">
              <SearchInput value={query} onChange={setQuery} placeholder="Search shop, city, address\u2026" />
              <SortDropdown value={sortBy} onChange={setSortBy} />
            </div>
          </div>

          {loading ? (
            <Loader />
          ) : sortedFiltered.length === 0 ? (
            <EmptyState message="No stalls match your search." />
          ) : (
            <div className="lk-table-wrap">
              <table className="lk-table">
                <thead>
                  <tr>
                    <th className="shop-column">Shop / Business Name & Details</th>
                    <th>Badge</th>
                    <th>City</th>
                    <th>Price</th>
                    <th>Location</th>
                    <th>Registered By</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedFiltered.map((s) => (
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
                          <a href={s.google_map_link} target="_blank" rel="noreferrer" className="lk-maplink-btn">
                            <MapPin size={13} />
                            View on Map
                          </a>
                        ) : (
                          "\u2014"
                        )}
                      </td>
                      <td>
                        {s.role|| "-"}
                      </td>
                      <td>
                        <div className="lk-row-actions" style={{ justifyContent: "flex-end" }}>
                          <button className="lk-icon-btn link" title="View details" onClick={() => setViewTarget(s)}>
                            <Eye size={15} />
                          </button>
                          <button className="lk-icon-btn link" title="Edit stall" onClick={() => setEditTarget(s)}>
                            <Pencil size={15} />
                          </button>
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

          {!loading && (
            <div className="lk-pagination">
              <span className="lk-pagination__showing">
                Showing {rangeFrom} to {rangeTo} of {total} stalls
              </span>
              <div className="lk-pagination__controls">
                <button className="lk-pagination__arrow" onClick={() => goToPage(page - 1)} disabled={page <= 1 || refreshing}>
                  <ChevronLeft size={16} />
                </button>
                <span className="lk-pagination__pagebtn">{page}</span>
                <button className="lk-pagination__arrow" onClick={() => goToPage(page + 1)} disabled={page >= lastPage || refreshing}>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <StallDetailModal
        stall={viewTarget}
        onClose={() => setViewTarget(null)}
        onEdit={(s) => {
          setViewTarget(null);
          setEditTarget(s);
        }}
      />

      <StallEditModal stall={editTarget} onClose={() => setEditTarget(null)} onSaved={handleStallSaved} />

      <ConfirmDeleteModal
        open={!!target}
        busy={busy}
        title="Delete this stall?"
        description={target ? `"${target.shop_name}" will be permanently removed from Thozhaa. This can't be undone.` : ""}
        onCancel={() => !busy && setTarget(null)}
        onConfirm={confirmDelete}
      />
    </>
  );
}