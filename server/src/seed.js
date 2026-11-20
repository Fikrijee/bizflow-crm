import 'dotenv/config';
import mongoose from 'mongoose';
import { Company, Contact, Lead, Deal, Task, Activity, Visit, STAGES } from './models.js';

const day = (n) => new Date(Date.now() + n * 864e5);
const pick = (a, i) => a[i % a.length];
await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bizflow');
await Promise.all([Company, Contact, Lead, Deal, Task, Activity, Visit].map((m) => m.deleteMany({})));

const cs = [['Alba Tech','Teknologji','Prishtinë'],['Dardania Build','Ndërtim','Prizren'],['Kosova Agro','Bujqësi','Ferizaj'],['Shkodra Trade','Tregti','Shkodër'],
['Adriatic Tours','Turizëm','Durrës'],['Prime Finance','Financa','Tiranë'],['MediCare Plus','Shëndetësi','Gjilan'],['EduNext','Edukim','Pejë'],['FastLine Logistics','Logjistikë','Ferizaj'],
['Vlora Foods','Tregti','Vlorë'],['Rilindja Software','Teknologji','Tiranë'],['Mitrovica Steel','Ndërtim','Mitrovicë'],['Green Valley Farm','Bujqësi','Gjakovë'],['Sunrise Hotels','Turizëm','Sarandë'],
['CapitalOne Kosova','Financa','Prishtinë'],['Dental Smile','Shëndetësi','Tiranë'],['Skenderbeu Academy','Edukim','Krujë'],['Balkan Cargo','Logjistikë','Shkup']];
const slug = (n) => n.toLowerCase().replace(/\W/g, '');
const companies = await Company.insertMany(cs.map(([name, industry, city], i) => ({ name, industry, city,
  website: `www.${slug(name)}.com`, phone: `+383 44 ${100 + i * 7} ${200 + i * 3}`,
  email: `info@${slug(name)}.com`, size: pick(['1-10', '11-50', '51-200', '200+'], i), notes: 'Klient i regjistruar në sistem.' })));

const fn = ['Arben','Drita','Besnik','Elira','Fatmir','Gentiana','Hysen','Ilir','Jeta','Kushtrim','Lirije','Mentor','Nora','Orgesa','Petrit','Qamil','Rinor','Shpresa','Taulant','Urime','Valon','Vjosa','Xhevat','Yllka','Zana','Albin','Blerta','Dukagjin','Egzon','Flutura'];
const ln = ['Krasniqi','Gashi','Berisha','Hoxha','Shala','Morina','Bytyqi','Kelmendi','Rexhepi','Ahmeti'];
const pos = ['CEO','CTO','Drejtor Shitjesh','Menaxher Blerjesh','Drejtor Financiar','Menaxher Operacional'];
const contacts = await Contact.insertMany(fn.map((f, i) => ({ firstName: f, lastName: pick(ln, i * 3 + 1), position: pick(pos, i),
  company: companies[i % 18]._id, email: `${f.toLowerCase()}@${slug(cs[i % 18][0])}.com`,
  phone: `+383 49 ${300 + i * 11} ${400 + i}`, status: pick(['Aktiv', 'Aktiv', 'Aktiv', 'Joaktiv'], i) })));

const src = ['Faqja web', 'Referim', 'LinkedIn', 'Panair', 'Telefonatë e ftohtë'], st = ['I ri', 'Kontaktuar', 'Kualifikuar', 'Humbur'];
await Lead.insertMany(Array.from({ length: 12 }, (_, i) => ({ name: `${pick(fn, i + 5)} ${pick(ln, i)}`, company: `Prospekt ${i + 1} Sh.p.k.`,
  email: `lead${i + 1}@mail.com`, phone: `+383 45 ${500 + i * 9} 123`, source: pick(src, i), status: pick(st, i * 2), value: 2000 + i * 1500 })));

const titles = ['Licenca CRM','Sistem ERP','Kontratë mirëmbajtjeje','Platformë e-commerce','Auditim IT','Fushatë marketingu','Aplikacion mobil','Trajnim stafi','Migrim në cloud','Sistem rezervimesh'];
const order = [0,1,1,2,2,2,3,3,3,4,4,4,4,5,0,1,2,3,4,5], prob = [10, 25, 50, 75, 100, 0];
const won = [-12, -40, -70, -100, -140];
let w = 0;
const deals = await Deal.insertMany(order.map((s, i) => ({ title: `${pick(titles, i)} – ${cs[i % 18][0]}`, value: 3000 + ((i * 7919) % 9) * 6500,
  stage: STAGES[s], probability: prob[s], company: companies[i % 18]._id, contact: contacts[i % 30]._id,
  closeDate: s === 4 ? day(won[w++ % 5]) : day(10 + i * 4), notes: 'Marrëveshje e krijuar nga seed.' })));

const pr = ['E lartë', 'Mesatare', 'E ulët'];
await Task.insertMany(Array.from({ length: 15 }, (_, i) => ({ title: pick(['Dërgo ofertën', 'Telefono klientin', 'Përgatit demo', 'Rishiko kontratën', 'Takim ndjekës'], i) + ` – ${cs[i % 18][0]}`,
  dueDate: day(i - 3), priority: pick(pr, i), status: i % 5 === 0 ? 'E kryer' : 'E hapur', company: companies[i % 18]._id, deal: deals[i]._id })));

await Activity.insertMany(Array.from({ length: 20 }, (_, i) => ({ type: pick(['Telefonatë', 'Email', 'Takim', 'Shënim'], i),
  subject: pick(['Diskutim mbi çmimin', 'U dërgua propozimi', 'Demo e produktit', 'Kërkesë për ofertë', 'Ndjekje pas takimit'], i),
  notes: 'Klienti shfaqi interes të lartë.', contact: contacts[i % 30]._id, company: companies[i % 18]._id, deal: deals[i]._id, date: day(-i * 2) })));

await Visit.insertMany(Array.from({ length: 10 }, (_, i) => ({ company: companies[i]._id, contact: contacts[i]._id,
  date: day(i < 6 ? -i * 5 - 1 : i - 4), location: cs[i][2], purpose: pick(['Prezantim produkti', 'Nënshkrim kontrate', 'Trajnim', 'Ndjekje'], i),
  outcome: i < 6 ? pick(['Pozitive', 'Duhet ndjekje', 'Kontratë e nënshkruar'], i) : '', status: i < 6 ? 'Kryer' : 'Planifikuar' })));

console.log('Seed i suksesshëm ✔'); await mongoose.disconnect();
