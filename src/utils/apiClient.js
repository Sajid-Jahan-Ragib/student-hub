export function getWriteRequestHeaders() {
  const scope = String(import.meta.env.VITE_WRITE_SCOPE || 'student-hub-admin').trim();
  const token = String(import.meta.env.VITE_WRITE_API_TOKEN || 'dev-admin-token').trim();

  const headers = {
    'Content-Type': 'application/json',
    'X-Admin-Scope': scope,
  };

  if (token) {
    headers['X-API-Key'] = token;
  }

  return headers;
}
