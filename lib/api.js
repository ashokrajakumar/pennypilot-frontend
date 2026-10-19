
const API = "/api/proxy";

export async function api(path, options = {}) {
  let response;

  try {
    response = await fetch(`${API}${path}`, {
      ...options,
      headers: {
        Accept: "application/json",
        ...(options.body
          ? { "Content-Type": "application/json" }
          : {}),
        ...options.headers,
      },
      cache: "no-store",
    });
  } catch {
    throw new Error("Cannot connect to the API server.");
  }

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errors = body.errors
      ? Object.values(body.errors).flat().join(" ")
      : "";

    throw new Error(
      errors || body.message || `API error (${response.status})`
    );
  }

  return body;
}

export const currency = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(n) || 0);

export const currentMonth = () => new Date().getMonth() + 1;

export const currentYear = () => new Date().getFullYear();

export const today = () => {
  const d = new Date();

  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export const dateOnly = (s) => String(s || "").slice(0, 10);
