import mongoose from 'mongoose';
const { Schema, model } = mongoose;
const ref = (m) => ({ type: Schema.Types.ObjectId, ref: m });
const opts = { timestamps: true, toJSON: { virtuals: true } };
export const STAGES = ['Lead i ri', 'Kontaktuar', 'Propozim', 'Negociim', 'Fituar', 'Humbur'];

export const Company = model('Company', new Schema({
  name: { type: String, required: true }, industry: String, city: String, website: String,
  phone: String, email: String, size: String, notes: String }, opts));

const contactSchema = new Schema({
  firstName: { type: String, required: true }, lastName: String, email: String, phone: String,
  position: String, company: ref('Company'), status: { type: String, default: 'Aktiv' }, notes: String }, opts);
contactSchema.virtual('name').get(function () { return `${this.firstName} ${this.lastName || ''}`.trim(); });
export const Contact = model('Contact', contactSchema);

export const Lead = model('Lead', new Schema({
  name: { type: String, required: true }, company: String, email: String, phone: String,
  source: String, status: { type: String, default: 'I ri' }, value: { type: Number, default: 0 }, notes: String }, opts));

export const Deal = model('Deal', new Schema({
  title: { type: String, required: true }, value: { type: Number, default: 0 },
  stage: { type: String, enum: STAGES, default: STAGES[0] }, probability: { type: Number, default: 10 },
  company: ref('Company'), contact: ref('Contact'), closeDate: Date, notes: String }, opts));

export const Task = model('Task', new Schema({
  title: { type: String, required: true }, dueDate: Date, priority: { type: String, default: 'Mesatare' },
  status: { type: String, default: 'E hapur' }, deal: ref('Deal'), company: ref('Company'), description: String }, opts));

export const Activity = model('Activity', new Schema({
  type: { type: String, default: 'Shënim' }, subject: { type: String, required: true }, notes: String,
  contact: ref('Contact'), company: ref('Company'), deal: ref('Deal'), date: { type: Date, default: Date.now } }, opts));

export const Visit = model('Visit', new Schema({
  company: ref('Company'), contact: ref('Contact'), date: { type: Date, default: Date.now }, location: String,
  purpose: String, outcome: String, status: { type: String, default: 'Planifikuar' }, notes: String }, opts));
