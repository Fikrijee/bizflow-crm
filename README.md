# BizFlow CRM
CRM full-stack + Asistent AI. React+Vite · Node/Express 5 · MongoDB/Mongoose · Recharts.

## Nisja
1. Duhet Node 18+ dhe MongoDB (lokal ose Atlas).
2. Server:  `cd server && cp .env.example .env && npm install && npm run seed && npm run dev`  (port 5000)
3. Client:  `cd client && npm install && npm run dev`  (hapet http://localhost:5173)
4. AI: vendos `ANTHROPIC_API_KEY` në `server/.env`. Pa çelës, asistenti përdor shabllone lokale.

`npm run seed` fut 18 kompani, 30 kontakte, 12 leads, 20 marrëveshje, 15 detyra, 20 aktivitete, 10 vizita.

## Struktura
server/src: server.js (API+Dashboard+Reports+AI) · models.js · crud.js (router i përgjithshëm) · seed.js
client/src: App.jsx · CrudPage.jsx (Contacts, Companies, Leads, Deals, Tasks, Activities, Visits) · Dashboard · Pipeline (drag&drop) · Reports · AI
