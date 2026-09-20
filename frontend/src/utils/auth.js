function decodePayload(token) {
  const segment = token.split(".")[1];
  if (!segment) return null;
  const base64 = segment.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  return JSON.parse(atob(padded));
}

export function getToken() {
  return localStorage.getItem("token");
}

export function getAuthPayload() {
  const token = getToken();
  if (!token) return null;
  try {
    return decodePayload(token);
  } catch {
    return null;
  }
}

export function getUserRole() {
  return getAuthPayload()?.role ?? null;
}

export function logout() {
  localStorage.removeItem("token");
}
