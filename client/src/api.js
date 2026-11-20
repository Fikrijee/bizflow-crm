async function req(method, path, body) {
  const r = await fetch('/api' + path, { method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || r.statusText);
  return j;
}
export const api = {
  get: (p, params = {}) => {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString();
    return req('GET', p + (qs ? '?' + qs : ''));
  },
  post: (p, b) => req('POST', p, b || {}), put: (p, b) => req('PUT', p, b), del: (p) => req('DELETE', p),
};
export const STAGES = ['Lead i ri', 'Kontaktuar', 'Propozim', 'Negociim', 'Fituar', 'Humbur'];
export const money = (n) => new Intl.NumberFormat('sq-AL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n || 0);
export const dateFmt = (d) => (d ? new Date(d).toLocaleDateString('sq-AL', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');
export const lbl = (o) => (!o ? '—' : typeof o === 'string' ? o : o.name || o.title || '—');
const good = ['Fituar', 'E kryer', 'Kryer', 'Kualifikuar', 'Aktiv', 'Pozitive', 'Kontratë e nënshkruar'];
const bad = ['Humbur', 'E lartë', 'Joaktiv'];
export const badgeClass = (v) => (good.includes(v) ? 'b-good' : bad.includes(v) ? 'b-bad' : 'b-mid');
