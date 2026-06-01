from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session, joinedload
from app.db.database import get_db
from app.models.models import Order, OrderItem
from app.schemas.schemas import OrderCreate, OrderResponse
from app.services.inventory import InventoryService
from app.core.exceptions import EntityNotFoundError

router = APIRouter(prefix="/orders", tags=["Orders"])

@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(order_data: OrderCreate, db: Session = Depends(get_db)):
    """
    Creates a new order, verifies stock and deducts inventory inside a transaction.
    """
    db_order = InventoryService.create_order(db=db, order_data=order_data)
    
    # Reload with relationships for full serialization
    return (
        db.query(Order)
        .options(joinedload(Order.customer), joinedload(Order.items).joinedload(OrderItem.product))
        .filter(Order.id == db_order.id)
        .first()
    )

@router.get("/", response_model=List[OrderResponse])
def list_orders(db: Session = Depends(get_db)):
    """
    Lists all orders sorted by creation time descending.
    """
    return (
        db.query(Order)
        .options(joinedload(Order.customer), joinedload(Order.items).joinedload(OrderItem.product))
        .order_by(Order.created_at.desc())
        .all()
    )

@router.get("/{order_id}", response_model=OrderResponse)
def get_order(order_id: int, db: Session = Depends(get_db)):
    """
    Retrieves detailed order information by ID.
    """
    order = (
        db.query(Order)
        .options(joinedload(Order.customer), joinedload(Order.items).joinedload(OrderItem.product))
        .filter(Order.id == order_id)
        .first()
    )
    if not order:
        raise EntityNotFoundError(f"Order with ID {order_id} not found.")
    return order

@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
def cancel_order(order_id: int, db: Session = Depends(get_db)):
    """
    Cancels an order, rolls back product stock, and removes the order records.
    """
    InventoryService.cancel_order(db=db, order_id=order_id)
