import { useEffect, useState } from 'react';
import { api, STAGES, money, lbl } from './api.js';

export default function Pipeline() {
  const [deals, setDeals] = useState([]), [over, setOver] = useState(null);
  const load = () => api.get('/deals').then(setDeals);
  useEffect(() => { load(); }, []);
  const drop = async (stage, e) => {
    const id = e.dataTransfer.getData('id'); setOver(null);
    const d = deals.find((x) => x._id === id);
    if (!d || d.stage === stage) return;
    const probability = { 'Lead i ri': 10, Kontaktuar: 25, Propozim: 50, Negociim: 75, Fituar: 100, Humbur: 0 }[stage];
    setDeals(deals.map((x) => (x._id === id ? { ...x, stage, probability } : x)));
    await api.put('/deals/' + id, { stage, probability }); load();
  };
  return (
    <section>
      <header className="page-head"><div><h1>Sales Pipeline</h1><p className="muted">Tërhiq kartat për të ndryshuar fazën e shitjes</p></div></header>
      <div className="kanban">
        {STAGES.map((s) => { const items = deals.filter((d) => d.stage === s);
          return (
            <div key={s} className={'col' + (over === s ? ' over' : '')} onDragOver={(e) => { e.preventDefault(); setOver(s); }} onDragLeave={() => setOver(null)} onDrop={(e) => drop(s, e)}>
              <div className="col-head"><b>{s}</b><span>{items.length} · {money(items.reduce((a, d) => a + d.value, 0))}</span></div>
              {items.map((d) => (
                <div key={d._id} className="deal" draggable onDragStart={(e) => e.dataTransfer.setData('id', d._id)}>
                  <b>{d.title}</b><span className="muted">{lbl(d.company)}</span><strong>{money(d.value)}</strong>
                </div>))}
              {!items.length && <p className="empty small">Hiq këtu një marrëveshje</p>}
            </div>); })}
      </div>
    </section>
  );
}
