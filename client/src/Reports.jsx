import { useEffect, useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, CartesianGrid, Legend } from 'recharts';
import { api, money } from './api.js';
const COLORS = ['#2B7A78', '#E08A1E', '#3D5A80', '#9A5B7E', '#7BA05B', '#C4533B', '#8D99AE'];
const Bars = ({ data, money: m, h = 240 }) => (
  <ResponsiveContainer width="100%" height={h}><BarChart data={data} layout="vertical" margin={{ left: 30 }}><CartesianGrid horizontal={false} stroke="#e3e8e5" /><XAxis type="number" fontSize={12} /><YAxis type="category" dataKey="name" fontSize={12} width={110} />
    <Tooltip formatter={(v) => (m ? money(v) : v)} /><Bar dataKey="value" fill="#2B7A78" radius={[0, 6, 6, 0]} /></BarChart></ResponsiveContainer>);

export default function Reports() {
  const [r, setR] = useState(null);
  useEffect(() => { api.get('/reports').then(setR); }, []);
  if (!r) return <p className="muted">Po ngarkohet…</p>;
  return (
    <section>
      <header className="page-head"><div><h1>Raportet</h1><p className="muted">Analizë e klientëve dhe shitjeve</p></div><button className="btn" onClick={() => window.print()}>Printo raportin</button></header>
      <div className="stats">{[['Totali i fituar', money(r.totalWon)], ['Vlera mesatare e marrëveshjes', money(r.avgDeal)], ['Marrëveshje gjithsej', r.dealsTotal]].map(([t, v]) => <div key={t} className="card stat"><span>{t}</span><strong>{v}</strong></div>)}</div>
      <div className="grid-charts">
        <div className="card"><h3>Të ardhura sipas industrisë</h3>
          <ResponsiveContainer width="100%" height={260}><PieChart><Pie data={r.revenueByIndustry} dataKey="value" nameKey="name" outerRadius={90} innerRadius={50}>{r.revenueByIndustry.map((_, i) => <Cell key={i} fill={COLORS[i % 7]} />)}</Pie><Tooltip formatter={(v) => money(v)} /><Legend /></PieChart></ResponsiveContainer></div>
        <div className="card"><h3>Klientët kryesorë (shitje të fituara)</h3><Bars data={r.topCompanies} money /></div>
        <div className="card"><h3>Hinka e marrëveshjeve</h3><Bars data={r.funnel} /></div>
        <div className="card"><h3>Leads sipas burimit</h3><Bars data={r.leadsBySource} /></div>
        <div className="card"><h3>Aktivitetet sipas llojit</h3><Bars data={r.activitiesByType} /></div>
        <div className="card"><h3>Vizitat sipas statusit</h3><Bars data={r.visitsByStatus} /></div>
      </div>
    </section>
  );
}
