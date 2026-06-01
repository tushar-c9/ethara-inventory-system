# Inventory & Order Management System – Implementation Plan for Antigravity IDE

## Objective

Build a production-ready, full-stack Inventory & Order Management System that satisfies all assessment requirements.

Mandatory Stack:

* Frontend: React (Vite + JavaScript)
* Backend: FastAPI (Python)
* Database: PostgreSQL
* ORM: SQLAlchemy
* Validation: Pydantic
* Containerization: Docker
* Orchestration: Docker Compose
* Version Control: Git

The final solution must be:

* Production-ready
* Fully containerized
* Deployable using free hosting services
* Well-structured and maintainable
* Following clean architecture principles

---

# PHASE 1 – Project Setup & Architecture

## Goal

Create a clean monorepo structure and initialize frontend/backend projects.

## Required Folder Structure

```text
inventory-system/

├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── db/
│   │   ├── core/
│   │   └── main.py
│   │
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .dockerignore
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── App.jsx
│   │
│   ├── Dockerfile
│   └── .dockerignore
│
├── docker-compose.yml
├── .env.example
├── README.md
└── .gitignore
```

Deliverables:

* Folder structure created
* React app initialized with Vite
* FastAPI app initialized
* PostgreSQL connection scaffolded

---

# PHASE 2 – Database Design

## Goal

Design normalized database schema.

### Products Table

Fields:

* id (PK)
* name
* sku
* price
* stock_quantity
* created_at
* updated_at

Constraints:

* sku UNIQUE
* stock_quantity >= 0

---

### Customers Table

Fields:

* id (PK)
* full_name
* email
* phone
* created_at

Constraints:

* email UNIQUE

---

### Orders Table

Fields:

* id (PK)
* customer_id (FK)
* total_amount
* created_at

---

### Order Items Table

Fields:

* id (PK)
* order_id (FK)
* product_id (FK)
* quantity
* unit_price
* subtotal

Relationships:

* Customer → Many Orders
* Order → Many OrderItems
* Product → Many OrderItems

Deliverables:

* SQLAlchemy models
* Relationships configured
* Database migrations configured

---

# PHASE 3 – Backend Foundation

## Goal

Create reusable backend architecture.

Create:

### Database Layer

* database.py
* session management
* dependency injection

### Configuration Layer

Environment variables:

* DATABASE_URL
* APP_ENV
* CORS_ORIGINS

### Global Exception Handling

Implement:

* 400 Bad Request
* 404 Not Found
* 409 Conflict
* 422 Validation Error
* 500 Internal Server Error

### API Documentation

Use FastAPI Swagger.

Deliverables:

* Clean startup
* Swagger working
* DB connectivity verified

---

# PHASE 4 – Product Module

## Goal

Implement complete product management.

### Product Fields

* name
* sku
* price
* stock_quantity

### APIs

POST /products

Create product

GET /products

List all products

GET /products/{id}

Get product details

PUT /products/{id}

Update product

DELETE /products/{id}

Delete product

### Validation Rules

* SKU must be unique
* Price must be positive
* Stock cannot be negative

### Error Handling

Return:

* 404 if product missing
* 409 if duplicate SKU
* 422 for invalid payload

Deliverables:

* Fully functional product CRUD

---

# PHASE 5 – Customer Module

## Goal

Implement customer management.

### Customer Fields

* full_name
* email
* phone

### APIs

POST /customers

Create customer

GET /customers

List customers

GET /customers/{id}

Get customer

DELETE /customers/{id}

Delete customer

### Validation Rules

* Valid email
* Unique email

### Error Handling

Return:

* 404 if customer missing
* 409 if email already exists

Deliverables:

* Fully functional customer module

---

# PHASE 6 – Order Module

## Goal

Implement inventory-aware ordering system.

### Create Order Request

```json
{
  "customer_id": 1,
  "items": [
    {
      "product_id": 1,
      "quantity": 2
    }
  ]
}
```

### APIs

POST /orders

Create order

GET /orders

List orders

GET /orders/{id}

Get order details

DELETE /orders/{id}

Cancel order

### Backend Business Rules

DO NOT trust frontend calculations.

System must:

1. Verify customer exists

2. Verify products exist

3. Verify inventory available

4. Calculate subtotal

5. Calculate total amount

6. Create order

7. Create order items

8. Deduct inventory

9. Commit transaction

### Inventory Logic

Reject order when:

```text
requested_quantity > stock_quantity
```

Response:

```json
{
  "message": "Insufficient inventory"
}
```

### Total Calculation

Calculate on backend only:

```text
subtotal = product_price × quantity
total = sum(all subtotals)
```

Deliverables:

* Complete order lifecycle
* Inventory deduction working

---

# PHASE 7 – Dashboard APIs

## Goal

Provide frontend dashboard data.

Create endpoint:

GET /dashboard

Response:

```json
{
  "total_products": 120,
  "total_customers": 55,
  "total_orders": 340,
  "low_stock_products": 8
}
```

Low stock rule:

```text
stock_quantity < 10
```

Deliverables:

* Dashboard summary API

---

# PHASE 8 – Frontend Setup

## Goal

Create professional UI.

Use:

* React
* Vite
* Axios
* React Router
* React Hook Form
* Material UI

Create layout:

```text
Sidebar
Top Navbar
Main Content
```

Pages:

* Dashboard
* Products
* Customers
* Orders

Deliverables:

* Routing setup
* Responsive layout

---

# PHASE 9 – Product UI

## Goal

Product management interface.

Features:

### Product Table

Columns:

* Name
* SKU
* Price
* Stock
* Actions

### Product Actions

* Add Product
* Edit Product
* Delete Product

### Validation

Show errors for:

* Empty fields
* Negative stock
* Invalid price

Deliverables:

* Complete Product UI

---

# PHASE 10 – Customer UI

## Goal

Customer management interface.

Features:

### Customer Table

Columns:

* Name
* Email
* Phone

### Actions

* Add Customer
* Delete Customer

Deliverables:

* Complete Customer UI

---

# PHASE 11 – Order UI

## Goal

Order management interface.

Features:

### Create Order

Select:

* Customer
* Product(s)
* Quantity

### Orders List

Display:

* Order ID
* Customer
* Total Amount
* Date

### Order Details

Display:

* Products
* Quantities
* Totals

Deliverables:

* Complete Order UI

---

# PHASE 12 – Dashboard UI

## Goal

Create overview dashboard.

Cards:

* Total Products
* Total Customers
* Total Orders
* Low Stock Products

Additional Section:

Low Stock Product Table

Highlight:

```text
stock < 10
```

Deliverables:

* Fully functional dashboard

---

# PHASE 13 – API Service Layer

## Goal

Centralize API communication.

Create:

```text
src/services/
```

Files:

* api.js
* productService.js
* customerService.js
* orderService.js
* dashboardService.js

Requirements:

* Axios instance
* Environment-based API URL
* Error interceptors

Deliverables:

* Clean service layer

---

# PHASE 14 – Dockerization

## Goal

Containerize application.

### Backend Dockerfile

Requirements:

* python:3.12-slim
* Non-root user
* Environment variables
* Optimized layers

### Frontend Dockerfile

Requirements:

Build Stage:

* node:22-alpine

Runtime Stage:

* nginx:alpine

### .dockerignore

Backend:

```text
__pycache__
venv
.git
```

Frontend:

```text
node_modules
dist
.git
```

Deliverables:

* Production-ready Dockerfiles

---

# PHASE 15 – Docker Compose

## Goal

Run full application locally.

Services:

### frontend

Port:

5173

### backend

Port:

8000

### postgres

Port:

5432

### Named Volume

```yaml
postgres_data:
```

Environment variables must be loaded from .env.

Deliverables:

* One-command startup

```bash
docker compose up --build
```

---

# PHASE 16 – Deployment

## Goal

Deploy all services.

Backend:

Deploy on Render.

Database:

Use Neon PostgreSQL.

Frontend:

Deploy on Vercel.

Requirements:

* Configure environment variables
* Enable CORS
* Verify frontend/backend communication

Deliverables:

* Public frontend URL
* Public backend URL

---

# PHASE 17 – Docker Hub

## Goal

Publish backend image.

Tasks:

Build image

```bash
docker build -t <dockerhub-user>/inventory-backend .
```

Push image

```bash
docker push <dockerhub-user>/inventory-backend
```

Deliverables:

* Docker Hub image URL

---

# PHASE 18 – Documentation

## Goal

Create reviewer-friendly README.

Include:

1. Project Overview

2. Architecture Diagram

3. Tech Stack

4. Local Setup

5. Docker Setup

6. Environment Variables

7. API Documentation

8. Deployment URLs

9. Docker Hub Image

10. Screenshots

11. Assumptions

12. Future Improvements

Deliverables:

* Professional README

---


At last Give me these links - 
*GitHub Repository Link (Frontend + Backend)
*Backend Docker Hub Image Link
*Frontend Hosted URL
*Backend API Hosted URL
