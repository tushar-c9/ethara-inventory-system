from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.exceptions import register_exception_handlers
from app.db.database import engine, Base, SessionLocal
from app.api import products, customers, orders, dashboard
from app.models.models import Product, Customer, Order, OrderItem
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("app")

app = FastAPI(
    title="Inventory & Order Management System API",
    description="A production-ready full-stack inventory tracking and order placement API.",
    version="1.0.0",
)

# CORS Setup
origins = settings.cors_origins_list
# Add dev environments just in case
if "http://localhost:5173" not in origins:
    origins.append("http://localhost:5173")
if "http://127.0.0.1:5173" not in origins:
    origins.append("http://127.0.0.1:5173")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception Handlers
register_exception_handlers(app)

# Include Routers
app.include_router(products.router, prefix="/api")
app.include_router(customers.router, prefix="/api")
app.include_router(orders.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")

# Database Seeding Routine
def seed_database():
    db = SessionLocal()
    try:
        # 1. Verify if seeding is needed
        if db.query(Product).count() > 0:
            logger.info("Database already seeded. Skipping...")
            return

        logger.info("Initializing database schema and seeding default data...")

        # 2. Seed Products (Including standard and low-stock items)
        seed_products = [
            Product(name="Quantum Laptop Pro", sku="TECH-LAP-001", price=1299.99, stock_quantity=24),
            Product(name="Ergonomic Mechanical Keyboard", sku="TECH-KEY-002", price=149.50, stock_quantity=8),  # Low Stock!
            Product(name="UltraWide Gaming Monitor 34\"", sku="TECH-MON-003", price=450.00, stock_quantity=15),
            Product(name="Precision Wireless Mouse", sku="TECH-MOU-004", price=79.99, stock_quantity=5),   # Low Stock!
            Product(name="Noise Cancelling Headphones", sku="TECH-AUD-005", price=299.99, stock_quantity=12),
            Product(name="Bamboo Smart Standing Desk", sku="FURN-DSK-001", price=599.00, stock_quantity=4),   # Low Stock!
            Product(name="Premium Leather Office Chair", sku="FURN-CHR-002", price=349.99, stock_quantity=11),
            Product(name="USB-C Dual 4K Docking Station", sku="TECH-DOCK-006", price=189.99, stock_quantity=30),
        ]
        for p in seed_products:
            db.add(p)
        db.commit()

        # 3. Seed Customers
        seed_customers = [
            Customer(full_name="Alice Smith", email="alice.smith@ethara.ai", phone="+1 (555) 123-4567"),
            Customer(full_name="Robert Johnson", email="robert.j@example.com", phone="+1 (555) 987-6543"),
            Customer(full_name="Emily Davis", email="emily.davis@design.co", phone="+44 7911 123456"),
        ]
        for c in seed_customers:
            db.add(c)
        db.commit()

        # Reload objects to get auto-generated IDs
        db_products = db.query(Product).all()
        db_customers = db.query(Customer).all()

        # 4. Seed Orders
        # Order 1: Alice buys laptop and docking station
        laptop = next(p for p in db_products if p.sku == "TECH-LAP-001")
        dock = next(p for p in db_products if p.sku == "TECH-DOCK-006")
        
        qty_lap, qty_dock = 1, 2
        sub_lap = laptop.price * qty_lap
        sub_dock = dock.price * qty_dock
        total_o1 = sub_lap + sub_dock

        order_1 = Order(customer_id=db_customers[0].id, total_amount=total_o1)
        db.add(order_1)
        db.flush() # Get order_1 id

        item_1_1 = OrderItem(order_id=order_1.id, product_id=laptop.id, quantity=qty_lap, unit_price=laptop.price, subtotal=sub_lap)
        item_1_2 = OrderItem(order_id=order_1.id, product_id=dock.id, quantity=qty_dock, unit_price=dock.price, subtotal=sub_dock)
        db.add(item_1_1)
        db.add(item_1_2)

        # Deduct stock
        laptop.stock_quantity -= qty_lap
        dock.stock_quantity -= qty_dock

        # Order 2: Robert buys keyboard and mouse
        keyboard = next(p for p in db_products if p.sku == "TECH-KEY-002")
        mouse = next(p for p in db_products if p.sku == "TECH-MOU-004")
        
        qty_key, qty_mou = 1, 1
        sub_key = keyboard.price * qty_key
        sub_mou = mouse.price * qty_mou
        total_o2 = sub_key + sub_mou

        order_2 = Order(customer_id=db_customers[1].id, total_amount=total_o2)
        db.add(order_2)
        db.flush()

        item_2_1 = OrderItem(order_id=order_2.id, product_id=keyboard.id, quantity=qty_key, unit_price=keyboard.price, subtotal=sub_key)
        item_2_2 = OrderItem(order_id=order_2.id, product_id=mouse.id, quantity=qty_mou, unit_price=mouse.price, subtotal=sub_mou)
        db.add(item_2_1)
        db.add(item_2_2)

        # Deduct stock
        keyboard.stock_quantity -= qty_key
        mouse.stock_quantity -= qty_mou

        db.commit()
        logger.info("Successfully seeded database with sample products, customers, and transactions.")

    except Exception as e:
        db.rollback()
        logger.error(f"Error seeding database: {str(e)}")
    finally:
        db.close()

@app.on_event("startup")
def on_startup():
    logger.info("Starting up FastAPI application...")
    # Auto create tables on startup
    Base.metadata.create_all(bind=engine)
    # Seed data
    seed_database()

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "Inventory & Order Management System API",
        "documentation": "/docs"
    }
