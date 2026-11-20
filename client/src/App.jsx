import { useEffect, useState } from 'react';
import Dashboard from './Dashboard.jsx';
import Pipeline from './Pipeline.jsx';
import Reports from './Reports.jsx';
import AI from './AI.jsx';
import CrudPage from './CrudPage.jsx';
import { modules } from './config.js';

const NAV = [['dashboard', 'Dashboard'], ['contacts', 'Kontaktet'], ['companies', 'Kompanitë'], ['leads', 'Leads'], ['deals', 'Marrëveshjet'], ['pipeline', 'Pipeline'],
  ['tasks', 'Detyrat'], ['activities', 'Aktivitetet'], ['visits', 'Vizitat'], ['ai', 'Asistenti AI'], ['reports', 'Raportet']];

export default function App() {
  const [page, setPage] = useState(location.hash.slice(1) || 'dashboard');
  useEffect(() => { const f = () => setPage(location.hash.slice(1) || 'dashboard'); addEventListener('hashchange', f); return () => removeEventListener('hashchange', f); }, []);
  const view = page === 'dashboard' ? <Dashboard /> : page === 'pipeline' ? <Pipeline /> : page === 'reports' ? <Reports /> : page === 'ai' ? <AI /> : modules[page] ? <CrudPage key={page} cfg={modules[page]} /> : <Dashboard />;
  return (
    <div className="app">
      <aside><div className="logo">BizFlow</div>
        <nav>{NAV.map(([k, t]) => <a key={k} href={'#' + k} className={page === k ? 'on' : ''}>{t}</a>)}</nav></aside>
      <main>{view}</main>
    </div>
  );
}
