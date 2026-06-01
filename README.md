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
