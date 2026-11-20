import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import crud from './crud.js';
import { Company, Contact, Lead, Deal, Task, Activity, Visit, STAGES } from './models.js';

const app = express();
app.use(cors()); app.use(express.json());
const sum = (a, f = (x) => x.value) => a.reduce((s, x) => s + (f(x) || 0), 0);

app.use('/api/companies', crud(Company, { search: ['name', 'industry', 'city'] }));
app.use('/api/contacts', crud(Contact, { search: ['firstName', 'lastName', 'email', 'position'], populate: ['company'] }));
app.use('/api/leads', crud(Lead, { search: ['name', 'company', 'email', 'source'] }));
app.use('/api/deals', crud(Deal, {
  search: ['title'], populate: ['company', 'contact'],
  onUpdate: async (old, d) => { // regjistro automatikisht ndryshimin e fazës
    if (old && old.stage !== d.stage)
      await Activity.create({ type: 'Shënim', subject: `Faza: ${old.stage} → ${d.stage}`, deal: d._id, company: d.company?._id });
  } }));
app.use('/api/tasks', crud(Task, { search: ['title'], populate: ['company', 'deal'], sort: 'dueDate' }));
app.use('/api/activities', crud(Activity, { search: ['subject', 'notes'], populate: ['contact', 'company', 'deal'], sort: '-date' }));
app.use('/api/visits', crud(Visit, { search: ['purpose', 'location', 'outcome'], populate: ['company', 'contact'], sort: '-date' }));

app.post('/api/leads/:id/convert', async (req, res) => {
  const l = await Lead.findById(req.params.id);
  if (!l) return res.status(404).json({ error: 'Lead nuk u gjet' });
  const deal = await Deal.create({ title: `Marrëveshje – ${l.name}`, value: l.value, stage: 'Lead i ri', notes: l.notes });
  l.status = 'Kualifikuar'; await l.save();
  await Activity.create({ type: 'Shënim', subject: `Lead u konvertua: ${l.name}`, deal: deal._id });
  res.json(deal);
});

app.get('/api/dashboard', async (_req, res) => {
  const [companies, contacts, leads, deals, tasks, activities] = await Promise.all([
    Company.countDocuments(), Contact.countDocuments(), Lead.countDocuments(), Deal.find().populate('company'),
    Task.find({ status: { $ne: 'E kryer' } }).sort('dueDate').limit(6).populate('company'),
    Activity.find().sort('-date').limit(8).populate('company contact')]);
  const open = deals.filter((d) => !['Fituar', 'Humbur'].includes(d.stage));
  const won = deals.filter((d) => d.stage === 'Fituar'), lost = deals.filter((d) => d.stage === 'Humbur');
  const byStage = STAGES.map((s) => ({ stage: s, count: deals.filter((d) => d.stage === s).length, value: sum(deals.filter((d) => d.stage === s)) }));
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const m = new Date(); m.setDate(1); m.setMonth(m.getMonth() - i);
    const key = `${m.getFullYear()}-${m.getMonth()}`;
    months.push({ month: m.toLocaleDateString('sq-AL', { month: 'short' }),
      revenue: sum(won.filter((d) => { const c = d.closeDate && new Date(d.closeDate); return c && `${c.getFullYear()}-${c.getMonth()}` === key; })) });
  }
  res.json({ counts: { companies, contacts, leads, openDeals: open.length },
    pipelineValue: sum(open), forecast: Math.round(sum(open, (d) => d.value * d.probability / 100)),
    wonValue: sum(won), winRate: won.length + lost.length ? Math.round(100 * won.length / (won.length + lost.length)) : 0,
    byStage, months, tasks, activities });
});

app.get('/api/reports', async (_req, res) => {
  const [deals, leads, activities, visits] = await Promise.all([Deal.find().populate('company'), Lead.find(), Activity.find(), Visit.find()]);
  const group = (arr, keyFn, valFn = () => 1) => Object.entries(arr.reduce((o, x) => { const k = keyFn(x) || 'Tjetër'; o[k] = (o[k] || 0) + valFn(x); return o; }, {})).map(([name, value]) => ({ name, value }));
  const won = deals.filter((d) => d.stage === 'Fituar');
  res.json({
    revenueByIndustry: group(won, (d) => d.company?.industry, (d) => d.value),
    leadsBySource: group(leads, (l) => l.source),
    leadsByStatus: group(leads, (l) => l.status),
    activitiesByType: group(activities, (a) => a.type),
    visitsByStatus: group(visits, (v) => v.status),
    topCompanies: group(won, (d) => d.company?.name, (d) => d.value).sort((a, b) => b.value - a.value).slice(0, 6),
    funnel: STAGES.map((s) => ({ name: s, value: deals.filter((d) => d.stage === s).length })),
    avgDeal: won.length ? Math.round(sum(won) / won.length) : 0, totalWon: sum(won), dealsTotal: deals.length });
});

// ---------- Asistenti AI ----------
app.post('/api/ai', async (req, res) => {
  const { type = 'email', dealId, companyId, prompt = '' } = req.body;
  const deal = dealId ? await Deal.findById(dealId).populate('company contact') : null;
  const company = deal?.company || (companyId ? await Company.findById(companyId) : null);
  const acts = company ? await Activity.find({ company: company._id }).sort('-date').limit(10) : [];
  const ctx = [
    company && `Kompania: ${company.name} (${company.industry || '-'}, ${company.city || '-'})`,
    deal && `Marrëveshja: ${deal.title}, vlera ${deal.value}€, faza ${deal.stage}, probabiliteti ${deal.probability}%`,
    deal?.contact && `Kontakti: ${deal.contact.name}, ${deal.contact.position || ''}`,
    acts.length && 'Aktivitetet e fundit:\n' + acts.map((a) => `- ${a.type}: ${a.subject}`).join('\n')].filter(Boolean).join('\n');
  const task = { email: 'Shkruaj një email profesional ndjekës (follow-up) në shqip, me subjekt, i shkurtër dhe me thirrje për veprim.',
    summary: 'Bëj një përmbledhje të qartë të marrëdhënies me klientin: gjendja, rreziqet, hapat e ardhshëm.',
    suggestion: 'Jep 5 sugjerime konkrete për ta çuar marrëveshjen përpara, të renditura sipas prioritetit.',
    custom: prompt }[type] || prompt;
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    const n = deal?.contact?.name || 'i/e nderuar', c = company?.name || 'kompania juaj', t = deal?.title || 'bashkëpunimi ynë';
    const local = {
      email: `Subjekt: Ndjekje – ${t}\n\nPërshëndetje ${n},\n\nJu shkruaj për të ndjekur diskutimin tonë mbi "${t}" për ${c}. A keni pasur mundësi ta shqyrtoni propozimin? Mund të caktojmë një telefonatë 15-minutëshe këtë javë.\n\nMe respekt,\nEkipi BizFlow`,
      summary: `${c}: ${ctx || 'Nuk ka të dhëna.'}\n\n(Shënim: vendos ANTHROPIC_API_KEY për përmbledhje inteligjente.)`,
      suggestion: `1. Cakto takim vendimmarrës me ${n}.\n2. Dërgo studim rasti nga klient i ngjashëm.\n3. Ofro demo të personalizuar.\n4. Vendos afat të qartë për përgjigje.\n5. Përfshi një vendimmarrës të dytë.\n\n(Vendos ANTHROPIC_API_KEY për sugjerime të personalizuara.)`,
      custom: 'Vendos ANTHROPIC_API_KEY në server/.env për përgjigje të lira.' };
    return res.json({ text: local[type] || local.custom, source: 'local' });
  }
  const r = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST',
    headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model: process.env.AI_MODEL || 'claude-sonnet-4-5', max_tokens: 900,
      system: 'Je asistent shitjesh në një CRM. Përgjigju gjithmonë në shqip, qartë dhe shkurt.',
      messages: [{ role: 'user', content: `${task}\n\n${prompt && type !== 'custom' ? 'Udhëzim shtesë: ' + prompt + '\n\n' : ''}Konteksti:\n${ctx || '(pa kontekst)'}` }] }) });
  const j = await r.json();
  if (!r.ok) return res.status(502).json({ error: j.error?.message || 'Gabim AI' });
  res.json({ text: j.content.map((c) => c.text || '').join('\n'), source: 'ai' });
});

app.use((err, _req, res, _next) => { console.error(err); res.status(err.name === 'ValidationError' ? 400 : 500).json({ error: err.message }); });
await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bizflow');
app.listen(process.env.PORT || 5000, () => console.log('BizFlow API në portin', process.env.PORT || 5000));
