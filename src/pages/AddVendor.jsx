import { useState, useEffect } from "react";
import {
  CheckCircle2,
  Check,
  X,
  Store,
  Sparkles,
  MapPin,
  ImagePlus,
  IndianRupee,
  User,
  Phone,
  MessageCircle,
  Tag,
  Briefcase,
  CalendarDays,
  Clock,
  Building2,
  Hash,
  Link2,
  Award,
  ListChecks,
  Menu,
  UploadCloud,
  Contact,
  Layers,
} from "lucide-react";
import api from "../api/client";
import "../Style/AddVendor.css";

const TABS = [
  { key: "service", label: "Service Vendor", icon: Store },
  { key: "activity", label: "Activity Provider", icon: Sparkles },
  { key: "stall", label: "Nearby Stall", icon: MapPin },
];

const ACTIVITY_TYPES = ["Learning & Training", "Sports & Fitness"];

const HERO_COPY = {
  service: {
    title: "Add Service Vendor",
    sub: "Create a service vendor listing on behalf of a business.",
  },
  activity: {
    title: "Add Activity Provider",
    sub: "Create an activity / center listing.",
  },
  stall: {
    title: "Add Nearby Stall",
    sub: "Create a nearby stall listing.",
  },
};

const initialState = {
  type: "service",
  full_name: "",
  business_name: "",
  shop_center_name: "",
  shop_name: "",
  phone_number: "",
  whatsapp_number: "",
  category_id: "",
  subcategory_ids: [],
  subcategory_name: "",
  subcategory_custom_names: [],
  activity_type: "",
  activity_category_id: "",
  activity: "",
  experience: "",
  price: "",
  availability_type: "all_days",
  working_from: "09:00",
  working_to: "18:00",
  address_line1: "",
  address_line2: "",
  city_id: "",
  pincode: "",
  badge: "Verified",
  google_map_link: "",
  profile_photo: null,
  shop_photo: null,
  shop_photo2: null,
  shop_photo3: null,
};

/* ---------------- Small building blocks ---------------- */

const Field = ({ icon: Icon, children }) => (
  <div className="av-field">
    <Icon size={15} className="av-field-icon" />
    {children}
  </div>
);

const SectionHeader = ({ index, icon: Icon, title, hint }) => (
  <div className="av-section-head">
    <span className="av-section-num">{index}</span>
    <span className="av-section-icon">
      <Icon size={15} />
    </span>
    <div>
      <p className="av-section-title">{title}</p>
      {hint && <p className="av-section-hint">{hint}</p>}
    </div>
  </div>
);

const FileField = ({ label, name, file, onChange, required, small }) => (
  <label className={`av-file-field ${small ? "av-file-field-sm" : ""}`}>
    <span className="av-label-text">
      {label} {required && <span className="req">*</span>}
    </span>
    <div className={`av-file-drop ${file ? "has-file" : ""}`}>
      <span className="av-file-drop-icon">
        {file ? <CheckCircle2 size={16} /> : <UploadCloud size={16} />}
      </span>
      <span className="av-file-drop-text">
        {file ? file.name : "Tap to upload — PNG or JPG"}
      </span>
      <input
        type="file"
        name={name}
        accept="image/jpeg,image/png,image/jpg"
        onChange={onChange}
        required={required}
      />
    </div>
  </label>
);

export default function AddVendor({ onMenu }) {
  const [form, setForm] = useState(initialState);
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [activityCategories, setActivityCategories] = useState([]);
  const [activityCategoriesLoading, setActivityCategoriesLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .allCategories()
      .then((res) => setCategories(Array.isArray(res?.data) ? res.data : res || []))
      .catch(() => setCategories([]));
    api
      .cities()
      .then((res) => setCities(Array.isArray(res?.data) ? res.data : res || []))
      .catch(() => setCities([]));
  }, []);

  const homeServiceCategories = categories.filter((c) => c.type === "Home Services");

  const resetAll = () => {
    setForm(initialState);
    setActivityCategories([]);
    setSuccess(false);
    setError(null);
  };

  const handleTypeChange = (type) => {
    setForm((prev) => ({ ...initialState, type, city_id: prev.city_id }));
    setActivityCategories([]);
    setSuccess(false);
    setError(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "category_id") {
      setForm((prev) => ({ ...prev, category_id: value, subcategory_ids: [] }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubcategoryToggle = (id) => {
    setForm((prev) => ({
      ...prev,
      subcategory_ids: prev.subcategory_ids.includes(id)
        ? prev.subcategory_ids.filter((i) => i !== id)
        : [...prev.subcategory_ids, id],
    }));
  };

  const handleAddCustomSubcategory = () => {
    const name = form.subcategory_name.trim();
    if (!name) return;
    setForm((prev) => ({
      ...prev,
      subcategory_custom_names: prev.subcategory_custom_names.includes(name)
        ? prev.subcategory_custom_names
        : [...prev.subcategory_custom_names, name],
      subcategory_name: "",
    }));
  };

  const handleCustomSubcategoryKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddCustomSubcategory();
    }
  };

  const handleRemoveCustomSubcategory = (name) => {
    setForm((prev) => ({
      ...prev,
      subcategory_custom_names: prev.subcategory_custom_names.filter((n) => n !== name),
    }));
  };

  const handleActivityTypeChange = (e) => {
    const type = e.target.value;
    setForm((prev) => ({ ...prev, activity_type: type, activity_category_id: "", activity: "" }));
    setActivityCategories([]);
    if (!type) return;
    setActivityCategoriesLoading(true);
    api
      .categoriesByType(type)
      .then((res) => setActivityCategories(Array.isArray(res?.data) ? res.data : res || []))
      .catch(() => setActivityCategories([]))
      .finally(() => setActivityCategoriesLoading(false));
  };

  const handleActivityCategoryChange = (e) => {
    const id = e.target.value;
    const selected = activityCategories.find((c) => String(c.id) === String(id));
    setForm((prev) => ({
      ...prev,
      activity_category_id: id,
      activity: selected ? selected.name : "",
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setForm((prev) => ({ ...prev, [name]: files?.[0] || null }));
  };

  const buildFormData = () => {
    const fd = new FormData();
    // Admin-created listings are always tagged role="admin" (backend accepts vendor|admin).
    fd.append("role", "admin");

    if (form.type === "service") {
      fd.append("full_name", form.full_name);
      fd.append("business_name", form.business_name);
      fd.append("phone_number", form.phone_number);
      fd.append("whatsapp_number", form.whatsapp_number);
      fd.append("category_id", form.category_id);
      form.subcategory_ids.forEach((id) => fd.append("subcategory_id[]", id));
      form.subcategory_custom_names.forEach((name) => fd.append("subcategory_name[]", name));
      fd.append("experience", form.experience);
      fd.append("price", form.price);
      fd.append("availability_type", form.availability_type);
      fd.append("working_from", `${form.working_from}:00`);
      fd.append("working_to", `${form.working_to}:00`);
      fd.append("address_line1", form.address_line1);
      fd.append("address_line2", form.address_line2);
      fd.append("city_id", form.city_id);
      fd.append("pincode", form.pincode);
      fd.append("google_map_link", form.google_map_link);
      if (form.profile_photo) fd.append("profile_photo", form.profile_photo);
    }

    if (form.type === "activity") {
      fd.append("full_name", form.full_name);
      fd.append("shop_center_name", form.shop_center_name);
      fd.append("phone_number", form.phone_number);
      fd.append("whatsapp_number", form.whatsapp_number);
      fd.append("category_id", form.activity_category_id);
      fd.append("experience", form.experience);
      fd.append("price", form.price);
      fd.append("availability_type", form.availability_type);
      fd.append("working_from", form.working_from);
      fd.append("working_to", form.working_to);
      fd.append("address_line1", form.address_line1);
      fd.append("address_line2", form.address_line2);
      fd.append("city_id", form.city_id);
      fd.append("pincode", form.pincode);
      fd.append("google_map_link", form.google_map_link);
      if (form.profile_photo) fd.append("profile_photo", form.profile_photo);
    }

    if (form.type === "stall") {
      fd.append("shop_name", form.shop_name);
      fd.append("phone_number", form.phone_number);
      fd.append("whatsapp_number", form.whatsapp_number);
      fd.append("badge", form.badge);
      fd.append("price", form.price);
      fd.append("address_line1", form.address_line1);
      fd.append("address_line2", form.address_line2);
      fd.append("city_id", form.city_id);
      fd.append("pincode", form.pincode);
      fd.append("google_map_link", form.google_map_link);
      fd.append("working_from", form.working_from);
      fd.append("working_to", form.working_to);
      if (form.shop_photo) fd.append("shop_photo", form.shop_photo);
      if (form.shop_photo2) fd.append("shop_photo2", form.shop_photo2);
      if (form.shop_photo3) fd.append("shop_photo3", form.shop_photo3);
    }

    return fd;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.registerVendor(form.type, buildFormData());
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const hero = HERO_COPY[form.type];
  const selectedCategory = homeServiceCategories.find(
    (c) => String(c.id) === String(form.category_id)
  );

  return (
    <div className="av-page">
      <div className="av-topbar">
        {onMenu && (
          <button type="button" className="av-menu-btn" onClick={onMenu} aria-label="Open menu">
            <Menu size={20} />
          </button>
        )}
        <div>
          <h1 className="av-title">{hero.title}</h1>
          <p className="av-subtitle text-muted">{hero.sub}</p>
        </div>
      </div>

      <div className="av-tabs" role="tablist">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={form.type === key}
            className={`av-tab ${form.type === key ? "active" : ""}`}
            onClick={() => handleTypeChange(key)}
          >
            <Icon size={16} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {success ? (
        <div className="av-card av-success">
          <div className="av-success-icon">
            <CheckCircle2 size={34} />
          </div>
          <h3>Listing created</h3>
          <p className="text-muted">The listing has been added successfully.</p>
          <button type="button" className="btn btn-primary" onClick={resetAll}>
            Add another
          </button>
        </div>
      ) : (
        <form className="av-card av-form" onSubmit={handleSubmit}>
          <div className="av-form-body">
            {/* -------- 01 Basic details -------- */}
            <section className="av-section">
              <SectionHeader
                index="01"
                icon={Contact}
                title="Basic details"
                hint="Who the customer will be contacting"
              />
              <div className="av-grid">
                {form.type !== "stall" && (
                  <label>
                    <span className="av-label-text">
                      Full Name <span className="req">*</span>
                    </span>
                    <Field icon={User}>
                      <input
                        name="full_name"
                        value={form.full_name}
                        onChange={handleChange}
                        required
                        placeholder="e.g. Kavin"
                      />
                    </Field>
                  </label>
                )}

                <label>
                  <span className="av-label-text">
                    Phone Number <span className="req">*</span>
                  </span>
                  <Field icon={Phone}>
                    <input
                      name="phone_number"
                      value={form.phone_number}
                      onChange={handleChange}
                      required
                      placeholder="9876543210"
                      inputMode="numeric"
                    />
                  </Field>
                </label>

                {form.type === "service" && (
                  <label>
                    <span className="av-label-text">Business Name</span>
                    <Field icon={Store}>
                      <input
                        name="business_name"
                        value={form.business_name}
                        onChange={handleChange}
                        placeholder="e.g. Kavin Electronics"
                      />
                    </Field>
                  </label>
                )}

                {form.type === "activity" && (
                  <label>
                    <span className="av-label-text">Shop / Center Name</span>
                    <Field icon={Store}>
                      <input
                        name="shop_center_name"
                        value={form.shop_center_name}
                        onChange={handleChange}
                        placeholder="e.g. Sunrise Play Zone"
                      />
                    </Field>
                  </label>
                )}

                {form.type === "stall" && (
                  <label>
                    <span className="av-label-text">
                      Shop Name <span className="req">*</span>
                    </span>
                    <Field icon={Store}>
                      <input
                        name="shop_name"
                        value={form.shop_name}
                        onChange={handleChange}
                        required
                        placeholder="e.g. Amma's Snacks Corner"
                      />
                    </Field>
                  </label>
                )}

                <label>
                  <span className="av-label-text">WhatsApp Number</span>
                  <Field icon={MessageCircle}>
                    <input
                      name="whatsapp_number"
                      value={form.whatsapp_number}
                      onChange={handleChange}
                      placeholder="9876543210"
                      inputMode="numeric"
                    />
                  </Field>
                </label>
              </div>
            </section>

            {/* -------- 02 Category / classification -------- */}
            <section className="av-section">
              <SectionHeader
                index="02"
                icon={Layers}
                title={
                  form.type === "service"
                    ? "Category"
                    : form.type === "activity"
                    ? "Activity"
                    : "Badge"
                }
                hint={
                  form.type === "service"
                    ? "What this vendor offers, and any specialities"
                    : form.type === "activity"
                    ? "The type and specific activity offered"
                    : "How this stall appears to shoppers"
                }
              />
              <div className="av-grid">
                {form.type === "service" && (
                  <>
                    <label>
                      <span className="av-label-text">
                        Category <span className="req">*</span>
                      </span>
                      <Field icon={Tag}>
                        <select name="category_id" value={form.category_id} onChange={handleChange} required>
                          <option value="">Select category</option>
                          {homeServiceCategories.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </Field>
                    </label>

                    <label className="av-span-2">
                      <span className="av-label-text">Sub-category</span>
                      {!form.category_id && <p className="av-hint">Select a category first</p>}
                      {selectedCategory?.sub_categories?.length > 0 && (
                        <div className="av-subcat-rows">
                          {selectedCategory.sub_categories.map((sub) => {
                            const active = form.subcategory_ids.includes(sub.id);
                            return (
                              <label key={sub.id} className={`av-subcat-row ${active ? "active" : ""}`}>
                                <input
                                  type="checkbox"
                                  checked={active}
                                  onChange={() => handleSubcategoryToggle(sub.id)}
                                />
                                <span className="av-subcat-tick">{active && <Check size={12} />}</span>
                                <span className="av-subcat-row-label">{sub.name}</span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </label>

                    <label className="av-span-2">
                      <span className="av-label-text">Sub-category not listed? Type it here</span>
                      <Field icon={Tag}>
                        <input
                          name="subcategory_name"
                          value={form.subcategory_name}
                          onChange={handleChange}
                          onKeyDown={handleCustomSubcategoryKeyDown}
                          placeholder="e.g. Aquarium Cleaning — press Enter to add"
                        />
                        <button type="button" className="av-tag-add-btn" onClick={handleAddCustomSubcategory}>
                          Add
                        </button>
                      </Field>
                      {form.subcategory_custom_names.length > 0 && (
                        <div className="av-tag-list">
                          {form.subcategory_custom_names.map((name) => (
                            <span key={name} className="av-tag">
                              {name}
                              <button
                                type="button"
                                onClick={() => handleRemoveCustomSubcategory(name)}
                                aria-label={`Remove ${name}`}
                              >
                                <X size={12} />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </label>
                  </>
                )}

                {form.type === "activity" && (
                  <>
                    <label>
                      <span className="av-label-text">
                        Activity Type <span className="req">*</span>
                      </span>
                      <Field icon={Sparkles}>
                        <select name="activity_type" value={form.activity_type} onChange={handleActivityTypeChange} required>
                          <option value="">Select activity type</option>
                          {ACTIVITY_TYPES.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </Field>
                    </label>
                    <label>
                      <span className="av-label-text">
                        Activity <span className="req">*</span>
                      </span>
                      <Field icon={ListChecks}>
                        <select
                          name="activity_category_id"
                          value={form.activity_category_id}
                          onChange={handleActivityCategoryChange}
                          required
                          disabled={!form.activity_type || activityCategoriesLoading}
                        >
                          <option value="">
                            {!form.activity_type
                              ? "Select activity type first"
                              : activityCategoriesLoading
                              ? "Loading..."
                              : "Select activity"}
                          </option>
                          {activityCategories.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </Field>
                    </label>
                  </>
                )}

                {form.type === "stall" && (
                  <label>
                    <span className="av-label-text">Badge</span>
                    <Field icon={Award}>
                      <select name="badge" value={form.badge} onChange={handleChange}>
                        <option value="Verified">Verified</option>
                        <option value="Popular">Popular</option>
                        <option value="New">New</option>
                      </select>
                    </Field>
                  </label>
                )}
              </div>
            </section>

            {/* -------- 03 Pricing, experience & availability -------- */}
            <section className="av-section">
              <SectionHeader
                index="03"
                icon={CalendarDays}
                title="Pricing & availability"
                hint="Starting price and when customers can reach them"
              />
              <div className="av-grid">
                {form.type !== "stall" && (
                  <label>
                    <span className="av-label-text">Experience</span>
                    <Field icon={Briefcase}>
                      <input
                        name="experience"
                        value={form.experience}
                        onChange={handleChange}
                        placeholder={form.type === "service" ? "e.g. 5 Years" : "e.g. 3 Years"}
                      />
                    </Field>
                  </label>
                )}
                <label>
                  <span className="av-label-text">
                    Price (starting from) <span className="req">*</span>
                  </span>
                  <Field icon={IndianRupee}>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      name="price"
                      value={form.price}
                      onChange={handleChange}
                      required
                      placeholder={form.type === "stall" ? "e.g. 49" : "e.g. 299"}
                    />
                  </Field>
                </label>

                {form.type !== "stall" && (
                  <label>
                    <span className="av-label-text">Availability</span>
                    <Field icon={CalendarDays}>
                      <select name="availability_type" value={form.availability_type} onChange={handleChange}>
                        <option value="all_days">All Days</option>
                        <option value="weekdays">Weekdays Only</option>
                        <option value="weekends">Weekends Only</option>
                      </select>
                    </Field>
                  </label>
                )}

                <label>
                  <span className="av-label-text">Working From</span>
                  <Field icon={Clock}>
                    <input type="time" name="working_from" value={form.working_from} onChange={handleChange} />
                  </Field>
                </label>
                <label>
                  <span className="av-label-text">Working To</span>
                  <Field icon={Clock}>
                    <input type="time" name="working_to" value={form.working_to} onChange={handleChange} />
                  </Field>
                </label>
              </div>
            </section>

            {/* -------- 04 Location -------- */}
            <section className="av-section">
              <SectionHeader
                index="04"
                icon={MapPin}
                title="Location"
                hint="Where customers will find or visit this listing"
              />
              <div className="av-grid">
                <label className="av-span-2">
                  <span className="av-label-text">
                    Address Line <span className="req">*</span>
                  </span>
                  <Field icon={MapPin}>
                    <input
                      name="address_line1"
                      value={form.address_line1}
                      onChange={handleChange}
                      required
                      placeholder="Address"
                    />
                  </Field>
                </label>

                <label>
                  <span className="av-label-text">
                    City <span className="req">*</span>
                  </span>
                  <Field icon={Building2}>
                    <select name="city_id" value={form.city_id} onChange={handleChange} required>
                      <option value="">Select city</option>
                      {cities.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                </label>
                <label>
                  <span className="av-label-text">
                    Pincode <span className="req">*</span>
                  </span>
                  <Field icon={Hash}>
                    <input
                      name="pincode"
                      value={form.pincode}
                      onChange={handleChange}
                      required
                      placeholder="637102"
                      inputMode="numeric"
                    />
                  </Field>
                </label>

                <label className="av-span-2">
                  <span className="av-label-text">Google Map Link</span>
                  <Field icon={Link2}>
                    <input
                      name="google_map_link"
                      value={form.google_map_link}
                      onChange={handleChange}
                      placeholder="https://maps.google.com/..."
                    />
                  </Field>
                </label>
              </div>
            </section>

            {/* -------- 05 Media -------- */}
            <section className="av-section av-section-last">
              <SectionHeader
                index="05"
                icon={ImagePlus}
                title="Photos"
                hint={form.type === "stall" ? "At least one clear photo of the stall" : "Optional, but builds customer trust"}
              />
              <div className="av-grid">
                {form.type !== "stall" && (
                  <div className="av-span-2">
                    <FileField
                      label="Profile Photo (optional)"
                      name="profile_photo"
                      file={form.profile_photo}
                      onChange={handleFileChange}
                    />
                  </div>
                )}

                {form.type === "stall" && (
                  <>
                    <FileField
                      label="Shop Photo"
                      name="shop_photo"
                      file={form.shop_photo}
                      onChange={handleFileChange}
                      required
                      small
                    />
                    <FileField
                      label="Shop Photo 2 (optional)"
                      name="shop_photo2"
                      file={form.shop_photo2}
                      onChange={handleFileChange}
                      small
                    />
                    <div className="av-span-2">
                      <FileField
                        label="Shop Photo 3 (optional)"
                        name="shop_photo3"
                        file={form.shop_photo3}
                        onChange={handleFileChange}
                        small
                      />
                    </div>
                  </>
                )}
              </div>
            </section>

            {error && <p className="av-error">{error}</p>}

            <div className="av-actions">
              <button type="button" className="btn btn-ghost" onClick={resetAll} disabled={loading}>
                Reset
              </button>
              <button type="submit" className="btn btn-primary av-submit" disabled={loading}>
                {loading ? "Submitting…" : "Create Listing"}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}