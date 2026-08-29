const BASE_URL = "https://booking.mpdatahub.com/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { Accept: "application/json", ...(options.headers || {}) },
    ...options,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || (data && data.status === false)) {
    throw new Error((data && data.message) || `Request failed (${res.status})`);
  }
  return data;
}

function toForm(payload) {
  const fd = new FormData();
  Object.entries(payload).forEach(([k, v]) => {
    if (v !== undefined && v !== null) fd.append(k, v);
  });
  return fd;
}

// Vendor registration hits a different endpoint per listing type — mirrors
// the user-side vendorApi.js ENDPOINTS map.
const REGISTER_ENDPOINTS = {
  service: "/vendor/services",
  activity: "/activities-register",
  stall: "/near-stalls",
};

export const api = {
  adminLogin: ({ email, password }) =>
    request("/admin/login", { method: "POST", body: toForm({ email, password }) }),

  dashboardCounts: () => request("/dashboard-list"),

  users: () => request("/user-list"),
  vendors: () => request("/all-vendors"),
  activities: () => request("/activities-all"),
  nearStalls: () => request("/near-stalls-all"),
  allCategories: () => request("/categories"),
  cities: () => request("/cities"),

  // type: "service" | "activity" | "stall" — routes to the matching endpoint.
  registerVendor: (type, formData) =>
    request(REGISTER_ENDPOINTS[type], { method: "POST", body: formData }),

  deleteVendor: (vendor_id) =>
    request(`/vendor-delete?vendor_id=${vendor_id}`, { method: "GET" }),

  updateVendor: (id, payload) =>
    request(`/vendors-update?id=${id}`, { method: "POST", body: toForm(payload) }),

  deleteActivity: (activity_id) =>
    request(`/activity-delete?activity_id=${activity_id}`, { method: "GET" }),

  updateActivity: (id, payload) =>
    request(`/activities/update?id=${id}`, { method: "POST", body: toForm(payload) }),

  deleteNearStall: (stall_id) =>
    request(`/near-stall-delete?stall_id=${stall_id}`, { method: "GET" }),

  updateNearStall: (id, payload) =>
    request(`/near-stalls/update?id=${id}`, { method: "POST", body: toForm(payload) }),

  categoriesByType: (type) =>
    request(`/get_Categories_bytype?type=${encodeURIComponent(type)}`),

  // NEW: fetch a single category (with its fresh sub_categories, including vendor_id)
  // GET /api/categories?category_id=2
  categoryDetail: (category_id) =>
    request(`/categories?category_id=${category_id}`),

  addCategory: ({ name, image, type }) =>
    request("/categories", { method: "POST", body: toForm({ name, image, type }) }),

  updateCategory: (id, { name, image, type, status }) =>
    request(`/categories-update/${id}`, { method: "POST", body: toForm({ name, image, type, status }) }),

  deleteCategory: (id) =>
    request(`/categories-delete/${id}`, { method: "GET" }),

  addSubcategory: ({ category_id, name, image }) =>
    request("/subcategories", { method: "POST", body: toForm({ category_id, name, image }) }),

  updateSubcategory: (id, { category_id, name, image, status }) =>
    request(`/subcategories-update/${id}`, {
      method: "POST",
      body: toForm({ category_id, name, image, status }),
    }),

  deleteSubcategory: (id) =>
    request(`/subcategories-delete/${id}`, { method: "GET" }),
};

export const CATEGORY_TYPES = ["Home Services", "Learning & Training", "Sports & Fitness"];

export default api;