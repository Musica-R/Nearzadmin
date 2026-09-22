import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Trash2,
  ExternalLink,
  IndianRupee,
  Eye,
  Pencil,
  X,
  Phone,
  Mail,
  Clock,
  MapPin,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Briefcase,
  Building2,
  Users,
  GraduationCap,
  CalendarDays,
  Tag,
} from "lucide-react";
import api from "../api/client";
import Topbar from "../components/Topbar";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import { Loader, EmptyState, ErrorBanner, SearchInput, EntityCell } from "../components/Common";
// Reuses the same "lk-" component classes as NearStalls / Activities — no new stylesheet needed.
import "../Style/NearStalls.css";

const JOB_TYPES = ["Full-time", "Part-time", "Internship", "Contract", "Freelance"];
const WORK_MODES = ["On-site", "Remote", "Hybrid"];
const SHIFTS = ["Day", "Night", "Rotational"];

const SORT_OPTIONS = [
  { value: "recent", label: "Recent" },
  { value: "company", label: "Company (A-Z)" },
  { value: "salary_high", label: "Salary: High to Low" },
  { value: "salary_low", label: "Salary: Low to High" },
  { value: "deadline", label: "Deadline: Soonest" },
];

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

// "2026-09-29T18:30:00.000000Z" -> "2026-09-30" for <input type="date">
function toDateInputValue(d) {
  if (!d) return "";
  try {
    return new Date(d).toISOString().slice(0, 10);
  } catch {
    return "";
  }
}

function formatSalary(job) {
  const min = job.salary_min ? Number(job.salary_min) : null;
  const max = job.salary_max ? Number(job.salary_max) : null;
  if (!min && !max) return "\u2014";
  const fmt = (n) => `\u20b9${n.toLocaleString("en-IN")}`;
  const range = min && max ? `${fmt(min)} \u2013 ${fmt(max)}` : fmt(min || max);
  return job.salary_type ? `${range} / ${job.salary_type}` : range;
}

function formatExperience(job) {
  const min = job.experience_min;
  const max = job.experience_max;
  if (min == null && max == null) return "\u2014";
  if (min != null && max != null) return `${Number(min)} \u2013 ${Number(max)} yrs`;
  return `${Number(min ?? max)} yrs`;
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

function JobDetailModal({ job, onClose, onEdit }) {
  if (!job) return null;

  const isActive = Number(job.status) === 1;

  return (
    <div className="lk-modal-overlay" onClick={onClose}>
      <div className="lk-vdetail" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <button className="lk-vdetail__close" onClick={onClose} title="Close">
          <X size={18} />
        </button>
        <button
          className="lk-icon-btn link lk-vdetail__editbtn"
          title="Edit job"
          onClick={() => onEdit(job)}
        >
          <Pencil size={15} />
        </button>

        <div className="lk-vdetail__header">
          {job.logo ? (
            <img src={job.logo} alt={job.company_name} className="lk-vdetail__photo" />
          ) : (
            <div className="lk-vdetail__photo lk-vdetail__photo--fallback">
              {(job.company_name || "?").charAt(0).toUpperCase()}
            </div>
          )}
          <div className="lk-vdetail__heading">
            <h2>{job.job_title}</h2>
            <p className="lk-vdetail__subname">{job.company_name}</p>
            <div className="lk-vdetail__badges">
              {job.job_type && <span className="lk-pill">{job.job_type}</span>}
              {job.work_mode && <span className="lk-pill">{job.work_mode}</span>}
              <span className={`lk-pill ${isActive ? "success" : "neutral"}`}>
                <BadgeCheck size={12} />
                {isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </div>

        <div className="lk-vdetail__grid">
          <div className="lk-vdetail__card">
            <div className="lk-vdetail__card-label">
              <Mail size={13} /> Email
            </div>
            {job.email ? (
              <a className="lk-vdetail__card-value link" href={`mailto:${job.email}`}>
                {job.email}
              </a>
            ) : (
              <span className="lk-vdetail__card-value">\u2014</span>
            )}
          </div>

          <div className="lk-vdetail__card">
            <div className="lk-vdetail__card-label">
              <Phone size={13} /> Mobile
            </div>
            {job.mobile ? (
              <a className="lk-vdetail__card-value link" href={`tel:${job.mobile}`}>
                {job.mobile}
              </a>
            ) : (
              <span className="lk-vdetail__card-value">\u2014</span>
            )}
          </div>

          <div className="lk-vdetail__card">
            <div className="lk-vdetail__card-label">
              <IndianRupee size={13} /> Salary
            </div>
            <span className="lk-vdetail__card-value">{formatSalary(job)}</span>
          </div>

          <div className="lk-vdetail__card">
            <div className="lk-vdetail__card-label">
              <Briefcase size={13} /> Experience
            </div>
            <span className="lk-vdetail__card-value">{formatExperience(job)}</span>
          </div>

          <div className="lk-vdetail__card">
            <div className="lk-vdetail__card-label">
              <Users size={13} /> Vacancies
            </div>
            <span className="lk-vdetail__card-value">{job.vacancies ?? "\u2014"}</span>
          </div>

          <div className="lk-vdetail__card">
            <div className="lk-vdetail__card-label">
              <CalendarDays size={13} /> Deadline
            </div>
            <span className="lk-vdetail__card-value">{formatDate(job.application_deadline)}</span>
          </div>

          <div className="lk-vdetail__card">
            <div className="lk-vdetail__card-label">
              <Clock size={13} /> Shift
            </div>
            <span className="lk-vdetail__card-value">{job.shift || "\u2014"}</span>
          </div>

          <div className="lk-vdetail__card">
            <div className="lk-vdetail__card-label">
              <GraduationCap size={13} /> Qualification
            </div>
            <span className="lk-vdetail__card-value">{job.qualification || "\u2014"}</span>
          </div>

          <div className="lk-vdetail__card" style={{ gridColumn: "span 2" }}>
            <div className="lk-vdetail__card-label">
              <MapPin size={13} /> Location
            </div>
            <span className="lk-vdetail__card-value">
              {job.location || "\u2014"} {job.city_name ? `\u2013 ${job.city_name}` : ""}
            </span>
          </div>
        </div>

        {job.skills && (
          <div className="lk-vdetail__section">
            <div className="lk-vdetail__section-label">Skills</div>
            <p className="lk-vdetail__address">{job.skills}</p>
          </div>
        )}

        {job.job_description && (
          <div className="lk-vdetail__section">
            <div className="lk-vdetail__section-label">Description</div>
            <p className="lk-vdetail__address">{job.job_description}</p>
          </div>
        )}

        {job.responsibilities && (
          <div className="lk-vdetail__section">
            <div className="lk-vdetail__section-label">Responsibilities</div>
            <p className="lk-vdetail__address">{job.responsibilities}</p>
          </div>
        )}

        {job.requirements && (
          <div className="lk-vdetail__section">
            <div className="lk-vdetail__section-label">Requirements</div>
            <p className="lk-vdetail__address">{job.requirements}</p>
          </div>
        )}

        {job.benefits && (
          <div className="lk-vdetail__section">
            <div className="lk-vdetail__section-label">Benefits</div>
            <p className="lk-vdetail__address">{job.benefits}</p>
          </div>
        )}

        {job.google_map_link && (
          <div className="lk-vdetail__section">
            <a className="lk-vdetail__maplink" href={job.google_map_link} target="_blank" rel="noreferrer">
              <ExternalLink size={13} /> Open in Google Maps
            </a>
          </div>
        )}

        <div className="lk-vdetail__footer">
          <span>Posted {formatDate(job.created_at)}</span>
          <span>Last updated {formatDate(job.updated_at)}</span>
        </div>
      </div>
    </div>
  );
}

function JobEditModal({ job, onClose, onSaved }) {
  const [form, setForm] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [cities, setCities] = useState([]);
  const [loadingLookups, setLoadingLookups] = useState(false);

  useEffect(() => {
    if (!job) return;
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
  }, [job]);

  useEffect(() => {
    if (job) {
      setForm({
        company_name: job.company_name || "",
        job_title: job.job_title || "",
        email: job.email || "",
        mobile: job.mobile || "",
        job_type: job.job_type || "",
        work_mode: job.work_mode || "",
        experience_min: job.experience_min ?? "",
        experience_max: job.experience_max ?? "",
        salary_min: job.salary_min ?? "",
        salary_max: job.salary_max ?? "",
        salary_type: job.salary_type || "",
        qualification: job.qualification || "",
        skills: job.skills || "",
        vacancies: job.vacancies ?? "",
        application_deadline: toDateInputValue(job.application_deadline),
        gender: job.gender || "",
        shift: job.shift || "",
        location: job.location || "",
        city_id: job.city_id ? String(job.city_id) : "",
        google_map_link: job.google_map_link || "",
        job_description: job.job_description || "",
        benefits: job.benefits || "",
        responsibilities: job.responsibilities || "",
        requirements: job.requirements || "",
        status: Number(job.status) === 1 ? "1" : "0",
      });
      setLogoFile(null);
      setError("");
    }
  }, [job]);

  if (!job || !form) return null;

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = { ...form };
      if (logoFile) payload.logo = logoFile;

      const res = await api.updateJob(job.id, payload);

      const city = cities.find((c) => String(c.id) === String(form.city_id));

      const updated =
        res?.data || {
          ...job,
          ...form,
          city_name: city ? city.name : job.city_name,
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
          <h2>Edit job</h2>
          <p className="lk-vdetail__subname">{job.job_title} \u2014 {job.company_name}</p>
        </div>

        <ErrorBanner message={error} />

        <form className="lk-vedit__form" onSubmit={handleSubmit}>
          <div className="lk-vedit__row">
            <label>
              Company name
              <input
                type="text"
                value={form.company_name}
                onChange={(e) => update("company_name", e.target.value)}
                required
              />
            </label>
            <label>
              Job title
              <input
                type="text"
                value={form.job_title}
                onChange={(e) => update("job_title", e.target.value)}
                required
              />
            </label>
          </div>

          <div className="lk-vedit__row">
            <label>
              Email
              <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} />
            </label>
            <label>
              Mobile number
              <input type="tel" value={form.mobile} onChange={(e) => update("mobile", e.target.value)} />
            </label>
          </div>

          <div className="lk-vedit__row">
            <label>
              Job type
              <select value={form.job_type} onChange={(e) => update("job_type", e.target.value)}>
                <option value="">Select job type</option>
                {JOB_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Work mode
              <select value={form.work_mode} onChange={(e) => update("work_mode", e.target.value)}>
                <option value="">Select work mode</option>
                {WORK_MODES.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="lk-vedit__row">
            <label>
              Experience min (years)
              <input
                type="number"
                min="0"
                step="1"
                value={form.experience_min}
                onChange={(e) => update("experience_min", e.target.value)}
              />
            </label>
            <label>
              Experience max (years)
              <input
                type="number"
                min="0"
                step="1"
                value={form.experience_max}
                onChange={(e) => update("experience_max", e.target.value)}
              />
            </label>
          </div>

          <div className="lk-vedit__row">
            <label>
              Salary min
              <input
                type="number"
                min="0"
                step="1"
                value={form.salary_min}
                onChange={(e) => update("salary_min", e.target.value)}
              />
            </label>
            <label>
              Salary max
              <input
                type="number"
                min="0"
                step="1"
                value={form.salary_max}
                onChange={(e) => update("salary_max", e.target.value)}
              />
            </label>
          </div>

          <div className="lk-vedit__row">
            <label>
              Salary type
              <select value={form.salary_type} onChange={(e) => update("salary_type", e.target.value)}>
                <option value="">Select salary type</option>
                <option value="Monthly">Monthly</option>
                <option value="Yearly">Yearly</option>
                <option value="Hourly">Hourly</option>
                <option value="Negotiable">Negotiable</option>
              </select>
            </label>
            <label>
              Qualification
              <input
                type="text"
                value={form.qualification}
                onChange={(e) => update("qualification", e.target.value)}
              />
            </label>
          </div>

          <div className="lk-vedit__row">
            <label>
              Skills
              <input type="text" value={form.skills} onChange={(e) => update("skills", e.target.value)} />
            </label>
            <label>
              Vacancies
              <input
                type="number"
                min="1"
                step="1"
                value={form.vacancies}
                onChange={(e) => update("vacancies", e.target.value)}
              />
            </label>
          </div>

          <div className="lk-vedit__row">
            <label>
              Application deadline
              <input
                type="date"
                value={form.application_deadline}
                onChange={(e) => update("application_deadline", e.target.value)}
              />
            </label>
            <label>
              Gender preference
              <select value={form.gender} onChange={(e) => update("gender", e.target.value)}>
                <option value="">Any</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </label>
          </div>

          <div className="lk-vedit__row">
            <label>
              Shift
              <select value={form.shift} onChange={(e) => update("shift", e.target.value)}>
                <option value="">Select shift</option>
                {SHIFTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
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
              City
              <select
                value={form.city_id}
                onChange={(e) => update("city_id", e.target.value)}
                disabled={loadingLookups}
              >
                <option value="">{loadingLookups ? "Loading\u2026" : "Select city"}</option>
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Location
              <input
                type="text"
                value={form.location}
                onChange={(e) => update("location", e.target.value)}
                required
              />
            </label>
          </div>

          <label className="lk-vedit__full">
            Google Maps link
            <input
              type="url"
              value={form.google_map_link}
              onChange={(e) => update("google_map_link", e.target.value)}
            />
          </label>

          <label className="lk-vedit__full">
            Job description
            <textarea
              rows={4}
              value={form.job_description}
              onChange={(e) => update("job_description", e.target.value)}
              style={{ textTransform: "none", fontWeight: 500, fontSize: 14, padding: 10 }}
            />
          </label>

          <label className="lk-vedit__full">
            Responsibilities
            <textarea
              rows={3}
              value={form.responsibilities}
              onChange={(e) => update("responsibilities", e.target.value)}
              style={{ textTransform: "none", fontWeight: 500, fontSize: 14, padding: 10 }}
            />
          </label>

          <label className="lk-vedit__full">
            Requirements
            <textarea
              rows={3}
              value={form.requirements}
              onChange={(e) => update("requirements", e.target.value)}
              style={{ textTransform: "none", fontWeight: 500, fontSize: 14, padding: 10 }}
            />
          </label>

          <label className="lk-vedit__full">
            Benefits
            <textarea
              rows={3}
              value={form.benefits}
              onChange={(e) => update("benefits", e.target.value)}
              style={{ textTransform: "none", fontWeight: 500, fontSize: 14, padding: 10 }}
            />
          </label>

          <label className="lk-vedit__full">
            Company logo
            {job.logo && <span className="lk-vedit__current-hint">Replaces existing</span>}
            <input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} />
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

export default function JobList({ onMenu }) {
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
      const res = await api.jobs({ page: pageNum });
      setRows(res.data || []);
      setPage(res.current_page || pageNum);
      setLastPage(res.last_page || 1);
      setTotal(res.total || 0);
      setRangeFrom(res.from || 0);
      setRangeTo(res.to || 0);
    } catch (e) {
      setError(e.message || "Couldn't load job listings.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load(false, 1);
  }, [load]);

  const stats = useMemo(() => {
    const active = rows.filter((j) => Number(j.status) === 1).length;
    const vacancies = rows.reduce((sum, j) => sum + (Number(j.vacancies) || 0), 0);
    const cities = new Set(rows.map((j) => j.city_name).filter(Boolean));
    return { active, vacancies, cityCount: cities.size };
  }, [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (j) =>
        j.company_name?.toLowerCase().includes(q) ||
        j.job_title?.toLowerCase().includes(q) ||
        j.city_name?.toLowerCase().includes(q) ||
        j.location?.toLowerCase().includes(q)
    );
  }, [rows, query]);

  const sortedFiltered = useMemo(() => {
    const arr = [...filtered];
    switch (sortBy) {
      case "company":
        arr.sort((a, b) => (a.company_name || "").localeCompare(b.company_name || ""));
        break;
      case "salary_high":
        arr.sort((a, b) => Number(b.salary_max || b.salary_min || 0) - Number(a.salary_max || a.salary_min || 0));
        break;
      case "salary_low":
        arr.sort((a, b) => Number(a.salary_min || a.salary_max || 0) - Number(b.salary_min || b.salary_max || 0));
        break;
      case "deadline":
        arr.sort((a, b) => new Date(a.application_deadline || 0) - new Date(b.application_deadline || 0));
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
      await api.deleteJob(target.id);
      setRows((prev) => prev.filter((r) => r.id !== target.id));
      setTarget(null);
    } catch (e) {
      setError(e.message || "Couldn't delete this job listing.");
    } finally {
      setBusy(false);
    }
  }

  function goToPage(p) {
    if (p < 1 || p > lastPage || p === page) return;
    load(true, p);
  }

  function handleJobSaved(updated) {
    setRows((prev) => prev.map((r) => (r.id === updated.id ? { ...r, ...updated } : r)));
    setViewTarget((prev) => (prev && prev.id === updated.id ? { ...prev, ...updated } : prev));
    setEditTarget(null);
  }

  return (
    <>
      <Topbar
        title="Job List"
        subtitle="Job postings from companies and vendors"
        onMenu={onMenu}
        onRefresh={() => load(true, page)}
        refreshing={refreshing}
      />
      <div className="lk-content">
        <ErrorBanner message={error} />

        <div className="lk-stats-grid">
          <StatCard tone="violet" icon={<Briefcase size={20} />} label="Total Jobs" value={total} sub="All postings" />
          <StatCard tone="indigo" icon={<BadgeCheck size={20} />} label="Active Jobs" value={stats.active} sub="Currently open" />
          <StatCard tone="rose" icon={<Users size={20} />} label="Total Vacancies" value={stats.vacancies} sub="Open positions" />
          <StatCard
            tone="violet"
            icon={<MapPin size={20} />}
            label="Cities Covered"
            value={stats.cityCount}
            sub={rows[0]?.city_name || "\u2014"}
          />
        </div>

        <div className="lk-panel">
          <div className="lk-panel__head">
            <div>
              <h2>All job listings</h2>
              <div className="lk-panel__head-sub">{total} total</div>
            </div>
            <div className="lk-panel__head-actions">
              <SearchInput value={query} onChange={setQuery} placeholder="Search company, title, city\u2026" />
              <SortDropdown value={sortBy} onChange={setSortBy} />
            </div>
          </div>

          {loading ? (
            <Loader />
          ) : sortedFiltered.length === 0 ? (
            <EmptyState message="No job listings match your search." />
          ) : (
            <div className="lk-table-wrap">
              <table className="lk-table">
                <thead>
                  <tr>
                    <th className="shop-column">Job & Company</th>
                    <th>Job Type</th>
                    <th>City</th>
                    <th>Salary</th>
                    <th>Work Mode</th>
                    <th>Posted By</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedFiltered.map((j) => (
                    <tr key={j.id}>
                      <td>
                        <EntityCell photo={j.logo} name={j.job_title} sub={j.company_name} />
                      </td>
                      <td>{j.job_type ? <span className="lk-pill">{j.job_type}</span> : <span className="lk-pill neutral">\u2014</span>}</td>
                      <td>{j.city_name || "\u2014"}</td>
                      <td>
                        <span style={{ display: "inline-flex", alignItems: "center" }}>
                          <IndianRupee size={12} style={{ marginRight: 2 }} />
                          {formatSalary(j).replace("\u20b9", "")}
                        </span>
                      </td>
                      <td>{j.work_mode || "\u2014"}</td>
                      <td>{j.role || "\u2014"}</td>
                      <td>
                        <div className="lk-row-actions" style={{ justifyContent: "flex-end" }}>
                          <button className="lk-icon-btn link" title="View details" onClick={() => setViewTarget(j)}>
                            <Eye size={15} />
                          </button>
                          <button className="lk-icon-btn link" title="Edit job" onClick={() => setEditTarget(j)}>
                            <Pencil size={15} />
                          </button>
                          <button className="lk-icon-btn" title="Delete job" onClick={() => setTarget(j)}>
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
                Showing {rangeFrom} to {rangeTo} of {total} jobs
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

      <JobDetailModal
        job={viewTarget}
        onClose={() => setViewTarget(null)}
        onEdit={(j) => {
          setViewTarget(null);
          setEditTarget(j);
        }}
      />

      <JobEditModal job={editTarget} onClose={() => setEditTarget(null)} onSaved={handleJobSaved} />

      <ConfirmDeleteModal
        open={!!target}
        busy={busy}
        title="Delete this job listing?"
        description={target ? `"${target.job_title}" at ${target.company_name} will be permanently removed from Thozhaa. This can't be undone.` : ""}
        onCancel={() => !busy && setTarget(null)}
        onConfirm={confirmDelete}
      />
    </>
  );
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