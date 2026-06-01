# Ethara Inventory & Order Management System

A production-ready, full-stack **Inventory & Order Management System** built with **FastAPI** (Python), **React** (Vite + JavaScript), and **PostgreSQL**. The entire system is built following clean architecture principles, fully containerized, responsive, and ready to deploy on free hosting layers (Render, Vercel, Neon DB).

---

## System Architecture

The project is structured as a monorepo containing a modular **FastAPI** backend and a responsive **React** single page application (SPA) styled using **Material UI (MUI)**.

```mermaid
graph TD
    %% Styling
    classDef client fill:#06b6d4,stroke:#0891b2,stroke-width:2px,color:#fff;
    classDef server fill:#10b981,stroke:#059669,stroke-width:2px,color:#000;
    classDef storage fill:#3b82f6,stroke:#1d4ed8,stroke-width:2px,color:#fff;

    subgraph Client Layer [Frontend React SPA]
        A[Browser / Client] -->|Axios Services| B[API Client Layer]
        B -->|SPA Routing| C[Dashboard UI]
        B -->|Forms Validation| D[Products CRUD]
        B -->|Forms Validation| E[Customers CRUD]
        B -->|Order Line Wizard| F[Orders Checkout]
    end

    subgraph Server Layer [Backend FastAPI App]
        B -->|HTTP Requests| G[Uvicorn Server]
        G -->|Middleware| H[CORS / Request Filters]
        H -->|Routers| I[API Controllers]
        I -->|Pydantic schemas| J[Validation Boundary]
        I -->|Database dependency| K[Session Management]
        I -->|Services Layer| L[Atomic Inventory Service]
    end

    subgraph Storage Layer [PostgreSQL Engine]
        L -->|SQLAlchemy ORM| M[(PostgreSQL DB)]
        M -->|Constraints Check| N[Unique SKU / Non-Negative Stock]
    end

    class Client_Layer,A,B,C,D,E,F client;
    class Server_Layer,G,H,I,J,K,L server;
    class Storage_Layer,M,N storage;
```

### Key Highlights
*   **Backend Validation & Security:** Leverages Pydantic validation boundaries to ensure all incoming payloads (e.g. positive price checks, non-negative stocks, clean email structures) conform to business regulations before execution.
*   **Atomic Order Processing:** Prevents transaction race-conditions using PostgreSQL row-level locks (`SELECT FOR UPDATE`). Restores inventory balances automatically if an order is cancelled.
*   **Self-Seeding DB Startup:** Inspects database tables on launch; if empty, it auto-generates schema mappings (`Base.metadata.create_all`) and feeds a gorgeous mockup dataset (including standard and low-stock alert products) to make the dashboard immediately interactive.
*   **Midnight Obsidian & Cyber Emerald UI:** A stunning high-contrast dark theme utilizing glassmorphic Material UI cards, smooth hover effects, Outfit & Inter typography, and real-time validation feedback.

---

## Monorepo Directory Structure

```text
inventory-system/
├── backend/                  # FastAPI Application
│   ├── app/
│   │   ├── api/              # Module Controllers (Products, Customers, Orders, Dashboard)
│   │   ├── core/             # Configuration Settings & Global Exception Handlers
│   │   ├── db/               # SQLAlchemy Session Generator & Connection Poolers
│   │   ├── models/           # SQLAlchemy DB Table Mappings
│   │   ├── schemas/          # Pydantic Request / Response Validators
│   │   ├── services/         # Business Logic Layer (Inventory-aware transactions)
│   │   └── main.py           # Application Entrypoint, CORS, & Seeding Routines
│   ├── requirements.txt      # Python Package Dependencies
│   ├── Dockerfile            # Multi-stage secure python:3.12-slim container
│   └── .dockerignore         # Exclude caches, env files, & virtual environments
│
├── frontend/                 # React SPA (Vite + JS)
│   ├── src/
│   │   ├── components/       # Layout Shell (Navbar, persistent Sidebar)
│   │   ├── pages/            # View Pages (Dashboard, Products, Customers, Orders)
│   │   ├── services/         # Axios API clients & endpoint wrappers
│   │   ├── theme/            # Obsidian Emerald custom MUI theme styles
│   │   ├── App.jsx           # Routing Mapping & Global Theme bindings
│   │   ├── index.css         # Baseline resets
│   │   └── main.jsx          # Entrypoint script
│   ├── nginx.conf            # Custom Nginx rewrite routing rules for React Router
│   ├── Dockerfile            # Multi-stage compile & serve Nginx container
│   └── .dockerignore         # Exclude local builds & node modules
│
├── docker-compose.yml        # Orchestrates Postgres, Backend API, & Nginx Frontend
├── .env.example              # Env template
├── .env                      # Active local development env variables
├── build_docker.sh           # Publish helper script for Docker Hub
├── README.md                 # Detailed System Documentation
└── .gitignore                # Root gitignore rules
```

---

## Environmental Configuration

All environment variables are loaded from `.env` in the root of the project:

| Variable Name | Description | Default Value (Local) |
| :--- | :--- | :--- |
| `APP_ENV` | Environment stage (`development` or `production`) | `development` |
| `POSTGRES_USER` | DB User credential for PostgreSQL | `postgres` |
| `POSTGRES_PASSWORD` | DB Password credential for PostgreSQL | `postgres` |
| `POSTGRES_DB` | Primary Database name to create | `inventory` |
| `DATABASE_URL` | SQLAlchemy connection string (for external runs) | `postgresql://postgres:postgres@localhost:5432/inventory` |
| `CORS_ORIGINS` | Permitted client CORS domains (comma-separated) | `http://localhost:5173,http://127.0.0.1:5173` |

---

## Local Setup & Quickstart

Ensure you have **NodeJS (v22+)** and **Python (3.12+)** installed on your system if running outside Docker.

### 1. Database Setup
Ensure you have a PostgreSQL server running locally, or skip this if running with Docker Compose.
*   Create a database named `inventory`
*   Ensure port `5432` is accessible.

### 2. Backend Installation & Run
```bash
# Navigate to backend
cd backend

# Create a virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start local server (Runs at http://localhost:8000)
uvicorn app.main:app --reload
```
Navigate to **`http://localhost:8000/docs`** to verify Swagger documentation is running!

### 3. Frontend Installation & Run
```bash
# Navigate to frontend (from project root)
cd frontend

# Install package dependencies
npm install --legacy-peer-deps

# Boot development server (Runs at http://localhost:5173)
npm run dev
```

---

## Docker Compose Quickstart (Recommended)

To launch the complete database, backend server, and frontend Nginx layer in a single command, ensure you have **Docker** and **Docker Compose** installed:

```bash
# Run one-command compose from the monorepo root:
docker compose up --build
```

### Access URLs:
*   **Frontend Dashboard:** `http://localhost:5173/` (Maps to Port 80 inside container)
*   **FastAPI Backend URL:** `http://localhost:8000/`
*   **Interactive Swagger APIs:** `http://localhost:8000/docs`
*   **PostgreSQL Engine:** `localhost:5432`

---

## Detailed Endpoint Reference

### Products Module (`/api/products`)
*   `GET /api/products/` - Lists all products sorted alphabetically. Supports `?low_stock=true` query parameters to fetch items under 10 stock.
*   `POST /api/products/` - Registers a product. SKU must be unique. Prices and stocks must be positive.
*   `GET /api/products/{id}` - Details for product ID.
*   `PUT /api/products/{id}` - Edit product specs. Enforces uniqueness constraints.
*   `DELETE /api/products/{id}` - Removes product. Blocked if associated with orders.

### Customers Module (`/api/customers`)
*   `GET /api/customers/` - List registered customers.
*   `POST /api/customers/` - Create profile. Validates correct email formatting. Reject duplicates.
*   `DELETE /api/customers/{id}` - Remove customer.

### Orders Module (`/api/orders`)
*   `POST /api/orders/` - Creates transaction. Server computes subtotals, reduces stock, and locks database rows for concurrent safety. Rejects with `{"message": "Insufficient inventory"}` if stock is exceeded.
*   `GET /api/orders/` - List placed orders.
*   `GET /api/orders/{id}` - Detailed order containing line items and products.
*   `DELETE /api/orders/{id}` - Cancels the order and returns product quantities back to stock.

### Dashboard Stats (`/api/dashboard`)
*   `GET /api/dashboard/` - Returns KPI metrics: `{"total_products": X, "total_customers": Y, "total_orders": Z, "low_stock_products": W}`.

---

## Production Deployment Guides

### 1. Database (Neon PostgreSQL)
1. Sign up on [Neon.tech](https://neon.tech/) and provision a serverless PostgreSQL cluster.
2. Obtain your Connection String (e.g. `postgres://alex:pass@ep-cool-sun-12.us-east-2.aws.neon.tech/neondb?sslmode=require`).
3. Feed this Connection String as the `DATABASE_URL` environment variable for your hosted backend. *(The backend automatically normalizes `postgres://` to `postgresql://`).*

### 2. Backend (Render)
1. Connect your Github monorepo to [Render](https://render.com/).
2. Setup a **Web Service** targeting the `backend/` root directory.
3. Configure settings:
    *   **Runtime:** `Python` (or `Docker` using the `backend/Dockerfile` file paths).
    *   **Build Command:** `pip install -r requirements.txt` (if using python runtime).
    *   **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port 8000`.
4. Add Environmental variables:
    *   `DATABASE_URL` (Your Neon connection string)
    *   `APP_ENV` = `production`
    *   `CORS_ORIGINS` = Your public Vercel frontend URL.

### 3. Frontend (Vercel)
1. Import your repository into [Vercel](https://vercel.com/).
2. Configure settings:
    *   **Framework Preset:** `Vite`
    *   **Root Directory:** `frontend/`
    *   **Build Command:** `npm run build`
    *   **Output Directory:** `dist`
3. Add Environmental variables:
    *   `VITE_API_URL` = Your public Render API endpoint (e.g. `https://my-backend.onrender.com/api`).

---

## Docker Hub Publishing

To build, tag, and publish the backend image to your public Docker Hub registry, run the bundled helper script from your terminal:

```bash
# Make sure to input your dockerhub username as argument
./build_docker.sh <your-dockerhub-username>
```

This compiles, tags, and guides you to run `docker login` and `docker push` commands.

## Deployment URLs

See `DEPLOYMENT.md` for a complete step-by-step guide to achieving these links.

| Resource | Link |
|----------|------|
| GitHub Repository | `<Insert GitHub Link Here>` |
| Docker Hub Image | `<Insert Docker Hub Link Here>` |
| Frontend URL | `<Insert Vercel Frontend URL Here>` |
| Backend API URL | `<Insert Render Backend URL Here>` |

## Screenshots

*(Placeholder for adding screenshots once deployed)*
- Dashboard Overview
- Product Management
- Order Checkout Wizard

## Assumptions

1. **Authentication:** No Authentication or Authorization is implemented as per the requirements. All APIs are public.
2. **Currency:** All financial values are treated as simple floats/decimals for demonstration purposes. In a real-world app, standard integer-based cent representations or dedicated currency libraries should be used.
3. **Inventory Logic:** Refunds and returns are out of scope. Inventory is deducted immediately on order creation.

## Future Improvements

- Implement JWT based Authentication and RBAC (Role Based Access Control).
- Integrate Redis for caching frequent dashboard queries.
- Add pagination for tables (Products, Customers, Orders).
- Build automated refund handling and order status tracking.
