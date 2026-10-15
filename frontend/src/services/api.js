const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export async function parseIntent(text) {
  const res = await fetch(`${API_URL}/parse-intent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Something went wrong. Please try again.');
  }

  return res.json();
}