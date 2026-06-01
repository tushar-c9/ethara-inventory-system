from sqlalchemy.orm import Session
from app.models.models import Order, OrderItem, Product, Customer
from app.schemas.schemas import OrderCreate
from app.core.exceptions import EntityNotFoundError, InsufficientInventoryError
import logging

logger = logging.getLogger("app")

class InventoryService:
    @staticmethod
    def create_order(db: Session, order_data: OrderCreate) -> Order:
        """
        Creates an order with full inventory verification and atomic state updates.
        Strictly computes prices and totals on the backend.
        """
        # 1. Verify customer exists
        customer = db.query(Customer).filter(Customer.id == order_data.customer_id).first()
        if not customer:
            raise EntityNotFoundError(f"Customer with ID {order_data.customer_id} does not exist.")

        # Group items to prevent duplicate processing of the same product in a single order
        item_quantities = {}
        for item in order_data.items:
            item_quantities[item.product_id] = item_quantities.get(item.product_id, 0) + item.quantity

        order_items_to_create = []
        total_amount = 0.0

        try:
            # We wrap this in a sub-transaction block (nested transaction) so any error results in a rollback
            with db.begin_nested():
                for product_id, quantity in item_quantities.items():
                    # 2. Verify product exists
                    # We use SELECT FOR UPDATE to lock the product rows and prevent race conditions on concurrent stock updates
                    product = db.query(Product).filter(Product.id == product_id).with_for_update().first()
                    if not product:
                        raise EntityNotFoundError(f"Product with ID {product_id} does not exist.")

                    # 3. Verify stock is sufficient
                    if product.stock_quantity < quantity:
                        logger.warning(
                            f"Insufficient stock for product {product.name} (SKU: {product.sku}). "
                            f"Requested: {quantity}, Available: {product.stock_quantity}"
                        )
                        raise InsufficientInventoryError()

                    # 4. Calculate pricing & subtotal
                    unit_price = product.price
                    subtotal = unit_price * quantity
                    total_amount += subtotal

                    # 5. Deduct inventory
                    product.stock_quantity -= quantity

                    # 6. Prepare OrderItem record
                    order_item = OrderItem(
                        product_id=product_id,
                        quantity=quantity,
                        unit_price=unit_price,
                        subtotal=subtotal
                    )
                    order_items_to_create.append(order_item)

                # 7. Create the main Order
                db_order = Order(
                    customer_id=order_data.customer_id,
                    total_amount=total_amount
                )
                db.add(db_order)
                db.flush()  # Generates the Order ID

                # 8. Link OrderItems and write to DB
                for order_item in order_items_to_create:
                    order_item.order_id = db_order.id
                    db.add(order_item)

            # Commit the external transaction
            db.commit()
            db.refresh(db_order)
            return db_order

        except Exception as e:
            db.rollback()
            logger.error(f"Failed to place order: {str(e)}")
            raise e

    @staticmethod
    def cancel_order(db: Session, order_id: int) -> None:
        """
        Cancels an order and restores all deducted inventory stocks.
        """
        order = db.query(Order).filter(Order.id == order_id).first()
        if not order:
            raise EntityNotFoundError(f"Order with ID {order_id} not found.")

        try:
            with db.begin_nested():
                # Restore stock for each item in the order
                for item in order.items:
                    product = db.query(Product).filter(Product.id == item.product_id).with_for_update().first()
                    if product:
                        product.stock_quantity += item.quantity
                
                # Delete order (cascade deletes order items automatically)
                db.delete(order)
            
            db.commit()
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to cancel order: {str(e)}")
            raise e
