import { Router } from 'express';
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
export default function crud(Model, { search = [], populate = [], sort = '-createdAt', onUpdate } = {}) {
  const r = Router();
  r.get('/', async (req, res) => {
    const { q, ...f } = req.query; const filter = {};
    for (const [k, v] of Object.entries(f)) if (v) filter[k] = v;
    if (q && search.length) filter.$or = search.map((s) => ({ [s]: new RegExp(esc(q), 'i') }));
    res.json(await Model.find(filter).populate(populate).sort(sort).limit(500));
  });
  r.get('/:id', async (req, res) => {
    const d = await Model.findById(req.params.id).populate(populate);
    d ? res.json(d) : res.status(404).json({ error: 'Nuk u gjet' });
  });
  r.post('/', async (req, res) => {
    const d = await Model.create(req.body); res.status(201).json(await d.populate(populate));
  });
  r.put('/:id', async (req, res) => {
    const old = await Model.findById(req.params.id).lean();
    const d = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate(populate);
    if (!d) return res.status(404).json({ error: 'Nuk u gjet' });
    if (onUpdate) await onUpdate(old, d);
    res.json(d);
  });
  r.delete('/:id', async (req, res) => { await Model.findByIdAndDelete(req.params.id); res.json({ ok: true }); });
  return r;
}
