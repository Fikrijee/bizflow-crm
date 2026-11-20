# BizFlow CRM

A full-stack Customer Relationship Management app with a built-in AI sales assistant. It covers the daily workflow of a sales team: contacts, companies, leads, deals, a drag-and-drop pipeline, tasks, activity history, field visits and reports.

![Dashboard](docs/dashboard.png)

## Screenshots

| Pipeline | AI Assistant |
|---|---|
| ![Pipeline](docs/pipeline.png) | ![AI Assistant](docs/ai.png) |

| Contacts | Reports |
|---|---|
| ![Contacts](docs/contacts.png) | ![Reports](docs/reports.png) |

## Features

- **Dashboard:** pipeline value, weighted forecast, won revenue, win rate, revenue chart for the last 6 months, recent activities and upcoming tasks.
- **Contacts and Companies:** create, edit, delete and search. Contacts are linked to companies.
- **Leads:** track prospects by source and status. One click converts a lead into a deal.
- **Deals:** manage value, stage, probability and expected close date.
- **Sales Pipeline:** Kanban board with drag and drop. Moving a card updates the stage and probability and logs an activity automatically.
- **Tasks and Reminders:** priorities, due dates and a "mark as done" action.
- **Activity History:** calls, emails, meetings and notes linked to contacts, companies and deals.
- **Field Visits:** plan and record visits to customers, with location, purpose and outcome.
- **AI Assistant:** generates follow-up emails, client summaries and next-step suggestions using the deal, company and recent activities as context.
- **Reports:** revenue by industry, top customers, deal funnel, leads by source, activities by type and visits by status. Printable.
- **Seed data:** 18 companies, 30 contacts, 12 leads, 20 deals, 15 tasks, 20 activities and 10 visits, so the app is never empty on first launch.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, plain CSS |
| Charts | Recharts |
| Backend | Node.js, Express 5 |
| Database | MongoDB with Mongoose |
| AI | OpenAI or Anthropic API (optional, with local fallback) |

## Architecture

```
client (React + Vite)  --/api-->  server (Express)  -->  MongoDB
                                      |
                                      +--> AI provider (optional)
```

- The server exposes a REST API. A generic CRUD router (`server/src/crud.js`) is reused for every module, so adding a new module takes a Mongoose model and one line of configuration.
- On the frontend, one config-driven `CrudPage` component renders the table, search and create/edit form for seven modules. Dashboard, Pipeline, Reports and AI are dedicated pages.
- Dashboard and report numbers are aggregated on the server and returned as ready-to-chart JSON.
- In development, Vite proxies `/api` requests to the backend.

## Getting Started

**Requirements:** Node.js 18+ and MongoDB (local or MongoDB Atlas).

```bash
git clone https://github.com/Fikrijee/bizflow-crm.git
cd bizflow-crm
```

**1. Backend**

```bash
cd server
cp .env.example .env      # on Windows: copy .env.example .env
npm install
npm run seed              # fills the database with demo data
npm run dev
```

**2. Frontend** (in a second terminal)

```bash
cd client
npm install
npm run dev
```

Open http://localhost:5173.

If you change `PORT` in `server/.env`, update the proxy target in `client/vite.config.js` to the same port.

### Environment variables

| Variable | Description |
|---|---|
| `PORT` | API port (default `5000`) |
| `MONGO_URI` | MongoDB connection string |
| `OPENAI_API_KEY` | Optional. Enables the AI assistant with OpenAI |
| `OPENAI_MODEL` | Optional. Default `gpt-4o-mini` |
| `ANTHROPIC_API_KEY` | Optional. Alternative AI provider |

Without an API key the AI assistant still works, using local templates. Never commit your `.env` file.

## API Overview

| Endpoint | Description |
|---|---|
| `GET/POST /api/{contacts,companies,leads,deals,tasks,activities,visits}` | List (with `?q=` search) and create |
| `GET/PUT/DELETE /api/<resource>/:id` | Read, update, delete |
| `POST /api/leads/:id/convert` | Convert a lead into a deal |
| `GET /api/dashboard` | Dashboard statistics and chart data |
| `GET /api/reports` | Report aggregations |
| `POST /api/ai` | Generate an email, summary or suggestions |

## Project Structure

```
bizflow-crm/
├── client/
│   └── src/  App.jsx · CrudPage.jsx · config.js · Dashboard.jsx
│             Pipeline.jsx · Reports.jsx · AI.jsx · api.js · styles.css
├── server/
│   └── src/  server.js · crud.js · models.js · seed.js
└── docs/     screenshots
```

## Roadmap

- Authentication and user roles (JWT)
- Pagination for large datasets
- Automated tests
- Deployment guide (Render, Vercel, MongoDB Atlas)
- Per-customer detail page with full history

## Author

Built by [Fikrije](https://github.com/Fikrijee).