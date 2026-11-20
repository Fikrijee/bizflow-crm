import { useEffect, useState } from 'react';
import { api } from './api.js';
const TYPES = [['email', 'Gjenero email'], ['summary', 'Përmbledhje'], ['suggestion', 'Sugjerime'], ['custom', 'Pyetje e lirë']];

export default function AI() {
  const [deals, setDeals] = useState([]), [dealId, setDealId] = useState(''), [type, setType] = useState('email'), [prompt, setPrompt] = useState(''), [out, setOut] = useState(''), [busy, setBusy] = useState(false), [copied, setCopied] = useState(false);
  useEffect(() => { api.get('/deals').then(setDeals); }, []);
  const run = async () => {
    setBusy(true); setOut('');
    try { const r = await api.post('/ai', { type, dealId: dealId || undefined, prompt }); setOut(r.text); } catch (e) { setOut('Gabim: ' + e.message); }
    setBusy(false);
  };
  return (
    <section>
      <header className="page-head"><div><h1>Asistenti AI</h1><p className="muted">Gjenero email, përmbledhje dhe sugjerime nga të dhënat e CRM-së</p></div></header>
      <div className="card ai">
        <label>Marrëveshja (opsionale)<select value={dealId} onChange={(e) => setDealId(e.target.value)}><option value="">— pa kontekst —</option>{deals.map((d) => <option key={d._id} value={d._id}>{d.title}</option>)}</select></label>
        <div className="seg">{TYPES.map(([k, t]) => <button key={k} className={type === k ? 'on' : ''} onClick={() => setType(k)}>{t}</button>)}</div>
        <label>{type === 'custom' ? 'Pyetja jote' : 'Udhëzim shtesë (opsional)'}<textarea rows="3" value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="P.sh. mbaje tonin miqësor dhe përmend zbritjen 10%" /></label>
        <button className="btn primary" disabled={busy} onClick={run}>{busy ? 'Po gjeneron…' : 'Gjenero'}</button>
        {out && <><textarea className="out" rows="12" value={out} onChange={(e) => setOut(e.target.value)} />
          <button className="btn" onClick={() => { navigator.clipboard.writeText(out); setCopied(true); setTimeout(() => setCopied(false), 1500); }}>{copied ? 'U kopjua' : 'Kopjo tekstin'}</button></>}
      </div>
    </section>
  );
}
