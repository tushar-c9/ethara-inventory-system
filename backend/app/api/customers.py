from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.models import Customer
from app.schemas.schemas import CustomerCreate, CustomerResponse
from app.core.exceptions import EntityNotFoundError, DuplicateEntityError

router = APIRouter(prefix="/customers", tags=["Customers"])

@router.post("/", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED)
def create_customer(customer_data: CustomerCreate, db: Session = Depends(get_db)):
    # Check duplicate email
    existing = db.query(Customer).filter(Customer.email == customer_data.email).first()
    if existing:
        raise DuplicateEntityError(f"Customer with email '{customer_data.email}' already exists.")

    db_customer = Customer(
        full_name=customer_data.full_name,
        email=customer_data.email,
        phone=customer_data.phone,
    )
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    return db_customer

@router.get("/", response_model=List[CustomerResponse])
def list_customers(db: Session = Depends(get_db)):
    return db.query(Customer).order_by(Customer.full_name.asc()).all()

@router.get("/{customer_id}", response_model=CustomerResponse)
def get_customer(customer_id: int, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise EntityNotFoundError(f"Customer with ID {customer_id} not found.")
    return customer

@router.delete("/{customer_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_customer(customer_id: int, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise EntityNotFoundError(f"Customer with ID {customer_id} not found.")
    
    db.delete(customer)
    db.commit()
