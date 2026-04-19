# Matriq – Smart Inventory Analytics System

**Live Frontend (Vercel):** [Replace with Vercel Link]  
**Live Backend API (Hugging Face Spaces):** [https://huggingface.co/spaces/SamD444/matriq-backend-api](https://huggingface.co/spaces/SamD444/matriq-backend-api)

---

## 1. Project Title
**Matriq** – Smart Inventory Analytics & Reporting System

## 2. Project Overview
Matriq is an enterprise-grade inventory intelligence and reporting system designed to simulate modern material management workflows. It acts as a comprehensive full-stack solution, providing actionable insights into stock variations, vendor performance, and critical inventory alerts across diverse plant locations.

## 3. Problem Statement
Managing fragmented supply chain data historically relied on manual data dumps and static spreadsheets. Enterprises often struggle with real-time visibility into out-of-stock risks, vendor lead-time mapping, and optimized reorder points. Matriq solves this by bridging the gap between raw inventory data and predictive procurement analytics in a unified dashboard.

## 4. SAP Relevance (Custom ABAP ALV Report Scenario)
Academically inspired by SAP MM (Materials Management), Matriq simulates a **Custom ABAP ALV Report** scenario using modern web technologies. 
It mirrors enterprise core concepts:
- **Material Master Data**: Item definitions, groups, base units, and prices.
- **Vendor Master**: Supplier metadata and linkage.
- **Plant Configurations**: Storage locations managing the flow of goods.
- **Inventory Records**: Transactional facts dictating current stock.
- **ALV-Style Reporting**: Features an integrated grid system mimicking ALV list viewing, providing sorting, filtering, and cross-reference jumping.
- **Alerts**: Custom background job (simulated) triggering Critical Stock warnings.

## 5. Features
- **Dynamic Analytics Dashboard**: Stock valuation and risk distribution pie charts.
- **Real-Time Data Filtering (ALV Grid)**: Sort items by SKU, Material Group, Vendor ID, and Stock Status.
- **Proactive Stock Risk Warning**: Auto-calculates reorder quantities based on reorder minimums and typical consumption cycles.
- **Backend Driven Pagination & Sorting**: High-throughput capability modeled after enterprise applications.
- **Unified Health APIs**: Standalone endpoints decoupling frontend interfaces.

## 6. Tech Stack
- **Frontend**: React (Vite), TypeScript, Tailwind CSS, Lucide React (Icons).
- **Backend**: Python, FastAPI, SQLAlchemy ORM, Pydantic, psycopg.
- **Database**: PostgreSQL (Supabase).
- **Deployments**: Vercel (Frontend), Hugging Face Spaces + Docker (Backend).

## 7. Architecture
Matriq is built using a strict Client-Server decoupled architecture. The React client acts exclusively as the presentation layer, delegating all domain logic and heavy computation (aggregation, risk analysis) to the FastAPI service. Supabase handles relational persistent storage safely behind the backend.

## 8. Folder Structure
```text
matriq-smart-inventory-analytics/
├── backend/                  # FastAPI Application Core
│   ├── app/                  # Application Modules
│   │   ├── models/           # SQLAlchemy DB Models
│   │   ├── schemas/          # Pydantic Types
│   │   ├── routers/          # API Endpoints
│   │   └── services/         # Business Logic Layer
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/                 # React Vite Presentation Layer
│   ├── src/
│   │   ├── api/              # API Client & SDK Hookups
│   │   ├── components/       # Reusable UI Elements
│   │   └── views/            # Dashboard Pages
│   └── package.json
├── docs/                     
│   └── screenshots/          # Project visual assets
├── .gitignore
└── README.md
```

## 9. Backend API Overview
The backend exposes granular RESTful routes mirroring enterprise modules:
- `/materials`: Core material metadata lifecycle.
- `/inventory`: Active stock counts and warehouse bin allocations.
- `/reports`: Aggregated responses feeding the ALV Grid grids and Analytics visualizers.
- `/analytics`: Computations prioritizing reorder insights based on algorithms.

## 10. Database Design
Relational schemas powered by PostgreSQL:
- `materials` (1:N) -> `inventory`
- `vendors` (1:N) -> `inventory`
- `plants` (1:N) -> `inventory`
- Indexes placed on `material_code`, `plant_code`, and `stock_status` for swift analytical queries.

## 11. Deployment Architecture
- The FastAPI backend is packaged in a Docker container and deployed serverlessly on **Hugging Face Spaces**.
- The frontend is served globally via edge networks using **Vercel**.
- Database uses **Supabase PostgreSQL** cloud instances.

---

## 12. Local Setup Instructions

### 13. Backend Setup
1. `cd backend`
2. Create virtual environment: `python -m venv venv`
3. Activate environment: 
   - Windows: `.\venv\Scripts\activate`
   - Mac/Linux: `source venv/bin/activate`
4. Install dependencies: `pip install -r requirements.txt`
5. Create `.env` file and define `DATABASE_URL`
6. Run the server: `uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload`

### 14. Frontend Setup
1. `cd frontend`
2. Install Node dependencies: `npm install`
3. Create `.env` file and set `VITE_API_BASE_URL=http://127.0.0.1:8000`
4. Run development server: `npm run dev`

---

## 15. Environment Variables
### Backend
`DATABASE_URL=postgresql://user:password@aws-0-region.pooler.supabase.com:5432/postgres`

### Frontend
`VITE_API_BASE_URL=https://<your-backend-api-url>` (Defaults to localhost statically)

## 16. Hugging Face Backend Deployment
A separate Dockerized format exists specifically for Hugging Face Spaces (in the `hf-backend` branch/repo). It listens implicitly on `PORT 7860` configured in the Space securely. Space Secrets store the DB credentials.

## 17. Vercel Frontend Deployment
Deployed normally via the Vercel GitHub integration focusing explicitly on building the `./frontend/` root utilizing Vite's build tools.

---

## 18. API Endpoints Summary
- **`GET /health`**: Connectivity heartbeats.
- **`GET /reports/summary`**: Vital statistics aggregation API.
- **`GET /reports/alv`**: Dynamic filtering API for reporting matrices.
- **`GET /reports/alerts`**: Automated filtering for low stock thresholds.
- **`GET /analytics/reorder`**: Machine-calculated resupply queue endpoint.

---

## 19. Key Screens / Pages

### Overview Dashboard
![Overview Dashboard](docs/screenshots/overview-dashboard.png)

### ALV Report Page
![ALV Report](docs/screenshots/alv-report.png)

### Alerts Page
![Alerts Page](docs/screenshots/alerts-page.png)

### Reorder Insights
![Reorder Insights](docs/screenshots/reorder-insights.png)

### Material Risk View
![Material Risk](docs/screenshots/material-risk.png)

### Swagger API Docs
![Swagger API Docs](docs/screenshots/swagger-docs.png)

### Hugging Face Backend Live API
![Hugging Face Backend](docs/screenshots/hf-backend.png)

### Vercel Frontend Live App
![Vercel Frontend](docs/screenshots/vercel-frontend.png)

---

## 20. Future Enhancements
- Simulate Goods Receipt / Issue full lifecycle logging.
- Add OAuth2 enterprise login integration.
- Dynamic PDF Excel Exports (similar to typical SAP ALV extractions).
- Historical Trend Analysis line charts.

## 21. Author / Academic Submission Notes
**Author**: Sambhav Das  
Developed as a showcase of converting classical enterprise resource planning configurations into modern, responsive, and decoupled architectural patterns. All database objects generated represent an academic proof-of-concept modeling SAP methodologies.
