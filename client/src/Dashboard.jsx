import { useEffect, useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area } from 'recharts';
import { api, money, dateFmt, lbl, badgeClass } from './api.js';

export default function Dashboard() {
  const [d, setD] = useState(null);
  useEffect(() => { api.get('/dashboard').then(setD); }, []);
  if (!d) return <p className="muted">Po ngarkohet…</p>;
  const stats = [['Vlera e pipeline-it', money(d.pipelineValue), `${d.counts.openDeals} marrëveshje të hapura`], ['Parashikimi i peshuar', money(d.forecast), 'sipas probabilitetit'],
    ['Shitje të fituara', money(d.wonValue), `${d.winRate}% norma e fitimit`], ['Klientë', d.counts.contacts, `${d.counts.companies} kompani · ${d.counts.leads} leads`]];
  return (
    <section>
      <header className="page-head"><div><h1>Dashboard</h1><p className="muted">Pamje e përgjithshme e shitjeve tuaja</p></div></header>
      <div className="stats">{stats.map(([t, v, s], i) => <div key={t} className={'card stat' + (i === 0 ? ' hero' : '')}><span>{t}</span><strong>{v}</strong><small>{s}</small></div>)}</div>
      <div className="grid-charts">
        <div className="card"><h3>Vlera sipas fazës</h3>
          <ResponsiveContainer width="100%" height={260}><BarChart data={d.byStage}><CartesianGrid vertical={false} stroke="#e3e8e5" /><XAxis dataKey="stage" fontSize={12} /><YAxis fontSize={12} tickFormatter={(v) => v / 1000 + 'k'} /><Tooltip formatter={(v) => money(v)} /><Bar dataKey="value" name="Vlera" fill="#2B7A78" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div>
        <div className="card"><h3>Të ardhura të fituara (6 muajt e fundit)</h3>
          <ResponsiveContainer width="100%" height={260}><AreaChart data={d.months}><CartesianGrid vertical={false} stroke="#e3e8e5" /><XAxis dataKey="month" fontSize={12} /><YAxis fontSize={12} tickFormatter={(v) => v / 1000 + 'k'} /><Tooltip formatter={(v) => money(v)} /><Area dataKey="revenue" name="Të ardhura" stroke="#E08A1E" fill="#F2A54155" strokeWidth={2} /></AreaChart></ResponsiveContainer></div>
      </div>
      <div className="grid-charts">
        <div className="card"><h3>Aktivitetet e fundit</h3><ul className="list">{d.activities.map((a) => <li key={a._id}><b>{a.subject}</b><span className="muted">{a.type} · {lbl(a.company)} · {dateFmt(a.date)}</span></li>)}</ul></div>
        <div className="card"><h3>Detyrat e ardhshme</h3><ul className="list">{d.tasks.map((t) => <li key={t._id}><b>{t.title}</b><span className="muted"><span className={'badge ' + badgeClass(t.priority)}>{t.priority}</span> {dateFmt(t.dueDate)}</span></li>)}</ul></div>
      </div>
    </section>
  );
}
