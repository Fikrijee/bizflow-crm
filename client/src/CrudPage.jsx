import { useEffect, useState } from 'react';
import { api, badgeClass } from './api.js';

const toInput = (f, v) => (f.type === 'ref' ? v?._id || v || '' : f.type === 'date' ? (v ? String(v).slice(0, 10) : '') : v ?? '');

export default function CrudPage({ cfg }) {
  const [rows, setRows] = useState([]), [q, setQ] = useState(''), [form, setForm] = useState(null), [refs, setRefs] = useState({}), [msg, setMsg] = useState(''), [loading, setLoading] = useState(true);
  const load = () => api.get(cfg.endpoint, { q }).then((r) => { setRows(r); setLoading(false); }).catch((e) => setMsg(e.message));
  useEffect(() => { setLoading(true); const t = setTimeout(load, 200); return () => clearTimeout(t); }, [q, cfg.endpoint]);
  useEffect(() => {
    const need = [...new Set(cfg.fields.filter((f) => f.ref).map((f) => f.ref))];
    Promise.all(need.map((n) => api.get('/' + n))).then((rs) => setRefs(Object.fromEntries(need.map((n, i) => [n, rs[i]]))));
  }, [cfg.endpoint]);
  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  const open = (row) => setForm({ id: row?._id, data: Object.fromEntries(cfg.fields.map((f) => [f.name, toInput(f, row?.[f.name])])) });
  const save = async (e) => {
    e.preventDefault();
    const body = {};
    cfg.fields.forEach((f) => { const v = form.data[f.name];
      body[f.name] = v === '' ? (f.type === 'ref' || f.type === 'date' ? null : f.type === 'number' ? 0 : '') : f.type === 'number' ? Number(v) : v; });
    try { form.id ? await api.put(`${cfg.endpoint}/${form.id}`, body) : await api.post(cfg.endpoint, body); setForm(null); flash('U ruajt me sukses.'); load(); }
    catch (err) { flash(err.message); }
  };
  const remove = async (r) => { if (confirm('Të fshihet ky rekord?')) { await api.del(`${cfg.endpoint}/${r._id}`); flash('U fshi.'); load(); } };
  const act = async (a, r) => { try { await a.run(r); flash(a.done); load(); } catch (err) { flash(err.message); } };

  return (
    <section>
      <header className="page-head">
        <div><h1>{cfg.title}</h1><p className="muted">{rows.length} rekorde</p></div>
        <div className="row">
          <input className="search" placeholder="Kërko…" value={q} onChange={(e) => setQ(e.target.value)} />
          <button className="btn primary" onClick={() => open()}>Shto {cfg.single}</button>
        </div>
      </header>
      {msg && <div className="toast">{msg}</div>}
      <div className="card table-wrap">
        <table>
          <thead><tr>{cfg.columns.map((c) => <th key={c.label}>{c.label}</th>)}<th /></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r._id}>
                {cfg.columns.map((c) => { const v = c.render ? c.render(r) : r[c.key];
                  return <td key={c.label}>{c.badge && v ? <span className={'badge ' + badgeClass(v)}>{v}</span> : v || '—'}</td>; })}
                <td className="actions">
                  {cfg.actions?.filter((a) => !a.show || a.show(r)).map((a) => <button key={a.label} className="btn small accent" onClick={() => act(a, r)}>{a.label}</button>)}
                  <button className="btn small" onClick={() => open(r)}>Ndrysho</button>
                  <button className="btn small danger" onClick={() => remove(r)}>Fshi</button>
                </td>
              </tr>))}
            {!loading && !rows.length && <tr><td colSpan={cfg.columns.length + 1} className="empty">Nuk ka rezultate. Shto një {cfg.single} të ri ose ndrysho kërkimin.</td></tr>}
          </tbody>
        </table>
      </div>
      {form && (
        <div className="overlay" onClick={() => setForm(null)}>
          <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={save}>
            <h2>{form.id ? 'Ndrysho' : 'Shto'} {cfg.single}</h2>
            <div className="grid2">
              {cfg.fields.map((f) => (
                <label key={f.name} className={f.type === 'textarea' ? 'full' : ''}>{f.label}
                  {f.type === 'textarea' ? <textarea rows="3" value={form.data[f.name]} onChange={(e) => setForm({ ...form, data: { ...form.data, [f.name]: e.target.value } })} />
                    : f.type === 'select' || f.type === 'ref' ? (
                      <select value={form.data[f.name]} onChange={(e) => setForm({ ...form, data: { ...form.data, [f.name]: e.target.value } })}>
                        <option value="">— zgjidh —</option>
                        {f.type === 'select' ? f.options.map((o) => <option key={o}>{o}</option>) : (refs[f.ref] || []).map((o) => <option key={o._id} value={o._id}>{o.name || o.title}</option>)}
                      </select>)
                      : <input type={f.type || 'text'} required={f.required} value={form.data[f.name]} onChange={(e) => setForm({ ...form, data: { ...form.data, [f.name]: e.target.value } })} />}
                </label>))}
            </div>
            <div className="row end"><button type="button" className="btn" onClick={() => setForm(null)}>Anulo</button><button className="btn primary">Ruaj ndryshimet</button></div>
          </form>
        </div>)}
    </section>
  );
}
