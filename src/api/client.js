const BASE_URL = "https://booking.mpdatahub.com/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { Accept: "application/json", ...(options.headers || {}) },
    ...options,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || (data && data.success === false)) {
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

export const api = {
  dashboardCounts: () => request("/dashboard-list"),
  users: () => request("/user-list"),
  vendors: () => request("/all-vendors"),
  activities: () => request("/activities-all"),
  nearStalls: () => request("/near-stalls-all"),

  deleteVendor: (vendor_id) =>
    request(`/vendor-delete?vendor_id=${vendor_id}`, { method: "GET" }),

  deleteActivity: (activity_id) =>
    request(`/activity-delete?activity_id=${activity_id}`, { method: "GET" }),

  deleteNearStall: (stall_id) =>
    request(`/near-stall-delete?stall_id=${stall_id}`, { method: "GET" }),

  categoriesByType: (type) =>
    request(`/get_Categories_bytype?type=${encodeURIComponent(type)}`),

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