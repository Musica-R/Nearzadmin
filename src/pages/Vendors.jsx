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
  Layers,
} from "lucide-react";
import api from "../api/client";
import Topbar from "../components/Topbar";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import { Loader, EmptyState, ErrorBanner, SearchInput, EntityCell } from "../components/Common";
import "../Style/Vendors.css";

const VENDOR_CATEGORY_TYPE = "Home Services";

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

// Safely turn subcategory_json / subcategories into an array of ids
function initialSubcategoryIds(vendor) {
  if (Array.isArray(vendor.subcategories) && vendor.subcategories.length) {
    return vendor.subcategories.map((s) => Number(s.id));
  }
  if (vendor.subcategory_json) {
    try {
      const parsed = JSON.parse(vendor.subcategory_json);
      if (Array.isArray(parsed)) return parsed.map(Number);
    } catch {
      /* ignore malformed json */
    }
  }
  return [];
}

function VendorDetailModal({ vendor, onClose, onEdit }) {
  if (!vendor) return null;

  const isActive = Number(vendor.status) === 1;
  const wa = waLink(vendor.whatsapp_number);

  return (
    <div className="lk-modal-overlay" onClick={onClose}>
      <div
        className="lk-vdetail"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="lk-vdetail__close" onClick={onClose} title="Close">
          <X size={18} />
        </button>

        <div className="lk-vdetail__header">
          {vendor.profile_photo ? (
            <img src={vendor.profile_photo} alt={vendor.business_name} className="lk-vdetail__photo" />
          ) : (
            <div className="lk-vdetail__photo lk-vdetail__photo--fallback">
              {initials(vendor.business_name || vendor.full_name)}
            </div>
          )}

          <div className="lk-vdetail__heading">
            <h2>{vendor.business_name || vendor.full_name}</h2>
            {vendor.full_name && vendor.full_name !== vendor.business_name && (
              <p className="lk-vdetail__subname">{vendor.full_name}</p>
            )}
            <div className="lk-vdetail__badges">
              <span className="lk-pill">{vendor.category_name || "Uncategorised"}</span>
              <span className={`lk-pill ${isActive ? "success" : "neutral"}`}>
                <BadgeCheck size={12} />
                {isActive ? "Active" : "Inactive"}
              </span>
              {vendor.badge && <span className="lk-pill warning">{vendor.badge}</span>}
            </div>
          </div>

          <button className="lk-icon-btn link lk-vdetail__editbtn" title="Edit vendor" onClick={() => onEdit(vendor)}>
            <Pencil size={15} />
          </button>
        </div>

        <div className="lk-vdetail__grid">
          <div className="lk-vdetail__card">
            <div className="lk-vdetail__card-label">
              <Phone size={13} /> Phone
            </div>
            <a className="lk-vdetail__card-value link" href={`tel:${vendor.phone_number}`}>
              {vendor.phone_number || "\u2014"}
            </a>
          </div>

          <div className="lk-vdetail__card">
            <div className="lk-vdetail__card-label">
              <MessageCircle size={13} /> WhatsApp
            </div>
            {wa ? (
              <a className="lk-vdetail__card-value link" href={wa} target="_blank" rel="noreferrer">
                {vendor.whatsapp_number}
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
              {vendor.price ? `\u20b9${Number(vendor.price).toLocaleString("en-IN")}` : "\u2014"}
            </span>
          </div>

          <div className="lk-vdetail__card">
            <div className="lk-vdetail__card-label">
              <Layers size={13} /> Experience
            </div>
            <span className="lk-vdetail__card-value">{vendor.experience || "\u2014"}</span>
          </div>

          <div className="lk-vdetail__card">
            <div className="lk-vdetail__card-label">
              <Clock size={13} /> Availability
            </div>
            <span className="lk-vdetail__card-value" style={{ textTransform: "capitalize" }}>
              {vendor.availability_type?.replace("_", " ") || "\u2014"}
            </span>
            <span className="lk-vdetail__card-sub">
              {formatTime(vendor.working_from)} {formatTime(vendor.working_to)}
            </span>
          </div>

          <div className="lk-vdetail__card">
            <div className="lk-vdetail__card-label">
              <MapPin size={13} /> City
            </div>
            <span className="lk-vdetail__card-value">
              {vendor.city_name || "\u2014"} {vendor.pincode ? `\u2013 ${vendor.pincode}` : ""}
            </span>
          </div>
        </div>

        <div className="lk-vdetail__section">
          <div className="lk-vdetail__section-label">Address</div>
          <p className="lk-vdetail__address">
            {vendor.address_line1}
            {vendor.address_line2 ? `, ${vendor.address_line2}` : ""}
          </p>
          {vendor.google_map_link && (
            <a
              className="lk-vdetail__maplink"
              href={vendor.google_map_link}
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink size={13} /> Open in Google Maps
            </a>
          )}
        </div>

        {vendor.subcategory_names?.length > 0 && (
          <div className="lk-vdetail__section">
            <div className="lk-vdetail__section-label">Subcategories</div>
            <div className="lk-vdetail__pills">
              {vendor.subcategory_names.map((s) => (
                <span className="lk-pill vendor" key={s}>
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="lk-vdetail__footer">
          <span>Joined {formatDate(vendor.created_at)}</span>
          <span>Last updated {formatDate(vendor.updated_at)}</span>
        </div>
      </div>
    </div>
  );
}

function VendorEditModal({ vendor, onClose, onSaved }) {
  const [form, setForm] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingLookups, setLoadingLookups] = useState(false);

  // Load categories (with nested subcategories) + cities once, whenever a vendor is opened for edit
  useEffect(() => {
    if (!vendor) return;
    let cancelled = false;
    setLoadingLookups(true);
    Promise.all([api.allCategories(), api.cities()])
      .then(([catRes, cityRes]) => {
        if (cancelled) return;
        const cats = Array.isArray(catRes) ? catRes : catRes?.data || [];
        const citiesList = Array.isArray(cityRes) ? cityRes : cityRes?.data || [];
        setCategories(cats.filter((c) => c.type === VENDOR_CATEGORY_TYPE));
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
  }, [vendor]);

  useEffect(() => {
    if (vendor) {
      setForm({
        business_name: vendor.business_name || "",
        full_name: vendor.full_name || "",
        phone_number: vendor.phone_number || "",
        whatsapp_number: vendor.whatsapp_number || "",
        experience: vendor.experience || "",
        price: vendor.price || "",
        availability_type: vendor.availability_type || "all_days",
        working_from: toTimeInputValue(vendor.working_from),
        working_to: toTimeInputValue(vendor.working_to),
        address_line1: vendor.address_line1 || "",
        address_line2: vendor.address_line2 || "",
        pincode: vendor.pincode || "",
        google_map_link: vendor.google_map_link || "",
        status: Number(vendor.status) === 1 ? "1" : "0",
        category_id: vendor.category_id ? String(vendor.category_id) : "",
        city_id: vendor.city_id ? String(vendor.city_id) : "",
        subcategory_ids: initialSubcategoryIds(vendor),
      });
      setPhotoFile(null);
      setError("");
    }
  }, [vendor]);

  if (!vendor || !form) return null;

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleCategoryChange(newCategoryId) {
    setForm((prev) => ({
      ...prev,
      category_id: newCategoryId,
      // subcategories belong to a specific category, so reset selection when it changes
      subcategory_ids: newCategoryId === String(vendor.category_id) ? initialSubcategoryIds(vendor) : [],
    }));
  }

  function toggleSubcategory(id) {
    setForm((prev) => {
      const exists = prev.subcategory_ids.includes(id);
      return {
        ...prev,
        subcategory_ids: exists
          ? prev.subcategory_ids.filter((x) => x !== id)
          : [...prev.subcategory_ids, id],
      };
    });
  }

  const activeCategory = categories.find((c) => String(c.id) === String(form.category_id));
  const subcategoryOptions = activeCategory?.sub_categories || [];

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        business_name: form.business_name,
        full_name: form.full_name,
        phone_number: form.phone_number,
        whatsapp_number: form.whatsapp_number,
        experience: form.experience,
        price: form.price,
        availability_type: form.availability_type,
        working_from: form.working_from ? `${form.working_from}:00` : "",
        working_to: form.working_to ? `${form.working_to}:00` : "",
        address_line1: form.address_line1,
        address_line2: form.address_line2,
        pincode: form.pincode,
        google_map_link: form.google_map_link,
        status: form.status,
        category_id: form.category_id,
        city_id: form.city_id,
        subcategory_json: JSON.stringify(form.subcategory_ids),
      };
      if (photoFile) payload.profile_photo = photoFile;

      const res = await api.updateVendor(vendor.id, payload);

      const cat = categories.find((c) => String(c.id) === String(form.category_id));
      const city = cities.find((c) => String(c.id) === String(form.city_id));
      const chosenSubs = subcategoryOptions.filter((s) => form.subcategory_ids.includes(Number(s.id)));

      const updated =
        res?.data || {
          ...vendor,
          ...form,
          category_name: cat?.name || vendor.category_name,
          city_name: city?.name || vendor.city_name,
          subcategory_names: chosenSubs.map((s) => s.name),
          subcategories: chosenSubs,
          working_from: payload.working_from,
          working_to: payload.working_to,
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
      <div
        className="lk-vdetail lk-vedit"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="lk-vdetail__close" onClick={onClose} title="Close" disabled={saving}>
          <X size={18} />
        </button>

        <div className="lk-vedit__heading">
          <h2>Edit vendor</h2>
          <p className="lk-vdetail__subname">{vendor.business_name || vendor.full_name}</p>
        </div>

        <ErrorBanner message={error} />

        <form className="lk-vedit__form" onSubmit={handleSubmit}>
          <div className="lk-vedit__row">
            <label>
              Business name
              <input
                type="text"
                value={form.business_name}
                onChange={(e) => update("business_name", e.target.value)}
                required
              />
            </label>
            <label>
              Owner name
              <input
                type="text"
                value={form.full_name}
                onChange={(e) => update("full_name", e.target.value)}
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
              Category
              <select
                value={form.category_id}
                onChange={(e) => handleCategoryChange(e.target.value)}
                disabled={loadingLookups}
                required
              >
                <option value="" disabled>
                  {loadingLookups ? "Loading\u2026" : "Select category"}
                </option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
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
          </div>

          {form.category_id && (
            <label className="lk-vedit__full">
              Subcategories
              <div className="lk-vedit__subcats">
                {subcategoryOptions.length === 0 ? (
                  <span className="lk-vedit__subcats-empty">No subcategories for this category</span>
                ) : (
                  subcategoryOptions.map((s) => {
                    const id = Number(s.id);
                    const checked = form.subcategory_ids.includes(id);
                    return (
                      <button
                        type="button"
                        key={s.id}
                        className={`lk-chip ${checked ? "lk-chip--active" : ""}`}
                        onClick={() => toggleSubcategory(id)}
                      >
                        {s.name}
                      </button>
                    );
                  })
                )}
              </div>
            </label>
          )}

          <div className="lk-vedit__row">
            <label>
              Price (\u20b9)
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => update("price", e.target.value)}
              />
            </label>
            <label>
              Experience
              <input
                type="text"
                placeholder="e.g. 7 Years"
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
                <option value="custom">Custom</option>
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
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
            />
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

export default function Vendors({ onMenu }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [target, setTarget] = useState(null);
  const [viewTarget, setViewTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
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

  function handleVendorSaved(updated) {
    setRows((prev) => prev.map((r) => (r.id === updated.id ? { ...r, ...updated } : r)));
    setViewTarget((prev) => (prev && prev.id === updated.id ? { ...prev, ...updated } : prev));
    setEditTarget(null);
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
                    <th>Vendor / Business Name</th>
                    <th>Category</th>
                    <th>City</th>
                    <th>Price</th>
                    <th>Availability</th>
                    <th>Registered By</th>
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
                      <td>{v.role || "-"}</td>
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
                          <button className="lk-icon-btn link" title="View details" onClick={() => setViewTarget(v)}>
                            <Eye size={15} />
                          </button>
                          <button className="lk-icon-btn link" title="Edit vendor" onClick={() => setEditTarget(v)}>
                            <Pencil size={15} />
                          </button>
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

      <VendorDetailModal
        vendor={viewTarget}
        onClose={() => setViewTarget(null)}
        onEdit={(v) => {
          setViewTarget(null);
          setEditTarget(v);
        }}
      />

      <VendorEditModal
        vendor={editTarget}
        onClose={() => setEditTarget(null)}
        onSaved={handleVendorSaved}
      />

      <ConfirmDeleteModal
        open={!!target}
        busy={busy}
        title="Delete this vendor?"
        description={
          target
            ? `"${target.business_name || target.full_name}" will be permanently removed from Thozhaa. This can't be undone.`
            : ""
        }
        onCancel={() => !busy && setTarget(null)}
        onConfirm={confirmDelete}
      />
    </>
  );
}