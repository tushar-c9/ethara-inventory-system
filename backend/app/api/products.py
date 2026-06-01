from typing import List, Optional
from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.models import Product
from app.schemas.schemas import ProductCreate, ProductUpdate, ProductResponse
from app.core.exceptions import EntityNotFoundError, DuplicateEntityError

router = APIRouter(prefix="/products", tags=["Products"])

@router.post("/", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(product_data: ProductCreate, db: Session = Depends(get_db)):
    # Check duplicate SKU
    existing = db.query(Product).filter(Product.sku == product_data.sku).first()
    if existing:
        raise DuplicateEntityError(f"Product with SKU '{product_data.sku}' already exists.")

    db_product = Product(
        name=product_data.name,
        sku=product_data.sku,
        price=product_data.price,
        stock_quantity=product_data.stock_quantity,
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@router.get("/", response_model=List[ProductResponse])
def list_products(
    low_stock: Optional[bool] = Query(None, description="Filter for products with stock < 10"),
    db: Session = Depends(get_db)
):
    query = db.query(Product)
    if low_stock is True:
        query = query.filter(Product.stock_quantity < 10)
    return query.order_by(Product.name.asc()).all()

@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise EntityNotFoundError(f"Product with ID {product_id} not found.")
    return product

@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int, product_data: ProductUpdate, db: Session = Depends(get_db)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise EntityNotFoundError(f"Product with ID {product_id} not found.")

    if product_data.sku is not None and product_data.sku != product.sku:
        existing = db.query(Product).filter(Product.sku == product_data.sku).first()
        if existing:
            raise DuplicateEntityError(f"Product with SKU '{product_data.sku}' already exists.")
        product.sku = product_data.sku

    if product_data.name is not None:
        product.name = product_data.name
    if product_data.price is not None:
        product.price = product_data.price
    if product_data.stock_quantity is not None:
        product.stock_quantity = product_data.stock_quantity

    db.commit()
    db.refresh(product)
    return product

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise EntityNotFoundError(f"Product with ID {product_id} not found.")
    
    # Check if product is in any orders before deleting (optional but clean database design)
    # The ForeignKey constraint is set to RESTRICT on delete so DB will block it, but we can do a nice check or let it trigger DB error.
    try:
        db.delete(product)
        db.commit()
    except Exception:
        db.rollback()
        raise DuplicateEntityError(
            "Cannot delete product because it is associated with existing orders. Cancel the orders first."
        )
