const API_BASE = 'http://localhost:4000';

export async function loginByCode(code) {
  const res = await fetch(`${API_BASE}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Badge non reconnu');
  }
  return res.json();
}

export async function fetchPatients() {
  const res = await fetch(`${API_BASE}/api/patients`);
  if (!res.ok) throw new Error('Erreur de chargement des patients');
  return res.json();
}

export async function fetchPatientDetail(id) {
  const res = await fetch(`${API_BASE}/api/patients/${id}`);
  if (!res.ok) throw new Error('Erreur de chargement du dossier');
  return res.json();
}
