import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Alert,
  Snackbar,
  Skeleton,
  Tooltip,
  Divider,
  Grid,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  RemoveCircleOutline as RemoveIcon,
  AddShoppingCart as CartIcon,
} from "@mui/icons-material";
import orderService from "../services/orderService";
import customerService from "../services/customerService";
import productService from "../services/productService";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalError, setGlobalError] = useState(null);

  // Dialog States
  const [openAdd, setOpenAdd] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Create Order Wizard States
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [orderLines, setOrderLines] = useState([{ product_id: "", quantity: 1 }]);
  const [createError, setCreateError] = useState(null);
  const [submittingOrder, setSubmittingOrder] = useState(false);

  // Toast Notifications
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  const showToast = (message, severity = "success") => {
    setToast({ open: true, message, severity });
  };

  const loadData = async () => {
    setLoading(true);
    setGlobalError(null);
    try {
      const ordersData = await orderService.getAllOrders();
      const customersData = await customerService.getAllCustomers();
      const productsData = await productService.getAllProducts();
      setOrders(ordersData);
      setCustomers(customersData);
      setProducts(productsData);
    } catch (err) {
      setGlobalError(err.cleanedMessage || "Failed to sync order module with server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenDetails = (order) => {
    setSelectedOrder(order);
    setOpenDetails(true);
  };

  const handleOpenAdd = () => {
    setSelectedCustomerId("");
    setOrderLines([{ product_id: "", quantity: 1 }]);
    setCreateError(null);
    setOpenAdd(true);
  };

  // Dynamic Add / Remove order line items
  const handleAddLine = () => {
    setOrderLines([...orderLines, { product_id: "", quantity: 1 }]);
  };

  const handleRemoveLine = (index) => {
    const updated = [...orderLines];
    updated.splice(index, 1);
    setOrderLines(updated);
  };

  const handleLineChange = (index, field, value) => {
    const updated = [...orderLines];
    updated[index][field] = value;
    
    // Auto validate stock levels locally
    if (field === "product_id" || field === "quantity") {
      setCreateError(null);
    }
    
    setOrderLines(updated);
  };

  // Calculate frontend estimate for review
  const calculateTotalEstimate = () => {
    let total = 0;
    orderLines.forEach((line) => {
      const product = products.find((p) => p.id === line.product_id);
      if (product) {
        total += product.price * (parseInt(line.quantity, 10) || 0);
      }
    });
    return total;
  };

  // Submit Order Creation
  const handleCreateOrder = async (e) => {
    e.preventDefault();
    setCreateError(null);

    // Form validations
    if (!selectedCustomerId) {
      setCreateError("Please select a customer for this order.");
      return;
    }

    if (orderLines.length === 0) {
      setCreateError("Please add at least one product item.");
      return;
    }

    const itemsPayload = [];
    let hasEmptyProduct = false;
    let hasInvalidQuantity = false;
    let stockExceededMessage = null;

    // Check each order item row
    for (let i = 0; i < orderLines.length; i++) {
      const line = orderLines[i];
      if (!line.product_id) {
        hasEmptyProduct = true;
        break;
      }
      
      const qty = parseInt(line.quantity, 10);
      if (isNaN(qty) || qty <= 0) {
        hasInvalidQuantity = true;
        break;
      }

      // Local stock level validation check
      const product = products.find((p) => p.id === line.product_id);
      if (product && qty > product.stock_quantity) {
        stockExceededMessage = `Insufficient inventory for ${product.name}. Requested: ${qty}, Stock Available: ${product.stock_quantity}.`;
        break;
      }

      itemsPayload.push({
        product_id: parseInt(line.product_id, 10),
        quantity: qty,
      });
    }

    if (hasEmptyProduct) {
      setCreateError("All added items must have a product selected.");
      return;
    }

    if (hasInvalidQuantity) {
      setCreateError("All item quantities must be greater than 0.");
      return;
    }

    if (stockExceededMessage) {
      setCreateError(stockExceededMessage);
      return;
    }

    setSubmittingOrder(true);
    try {
      await orderService.createOrder({
        customer_id: parseInt(selectedCustomerId, 10),
        items: itemsPayload,
      });
      showToast("Order processed successfully!");
      setOpenAdd(false);
      loadData();
    } catch (err) {
      console.error(err);
      setCreateError(err.cleanedMessage || "Failed to create order transaction.");
    } finally {
      setSubmittingOrder(false);
    }
  };

  // Cancel order (restore inventory)
  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order? This will immediately return all items to stock.")) return;
    try {
      await orderService.cancelOrder(orderId);
      showToast("Order cancelled and inventory restored.");
      loadData();
    } catch (err) {
      console.error(err);
      showToast(err.cleanedMessage || "Failed to cancel order.", "error");
    }
  };

  return (
    <Box>
      {/* Header section */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "stretch", sm: "center" },
          gap: 2,
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800 }}>
            Order Operations
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
            Process sales checkout, monitor transactions, and manage atomic stock returns.
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<CartIcon />}
          onClick={handleOpenAdd}
          sx={{ alignSelf: { xs: "flex-start", sm: "center" } }}
        >
          New Sales Order
        </Button>
      </Box>

      {/* Global Error Banner */}
      {globalError && (
        <Alert severity="error" variant="outlined" sx={{ mb: 4, borderRadius: "10px" }}>
          {globalError}
        </Alert>
      )}

      {/* Table Card */}
      <Card sx={{ p: 0, border: "1px solid rgba(255, 255, 255, 0.05)" }}>
        {loading ? (
          <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 1.5 }}>
            {[1, 2, 3, 4].map((item) => (
              <Skeleton key={item} height={55} variant="rounded" sx={{ bgcolor: "rgba(255,255,255,0.03)" }} />
            ))}
          </Box>
        ) : orders.length === 0 ? (
          <Box sx={{ p: 8, textAlign: "center" }}>
            <Typography variant="body1" sx={{ color: "text.secondary" }}>
              No orders placed yet.
            </Typography>
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ boxShadow: "none", backgroundColor: "transparent", backgroundImage: "none" }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Order ID</TableCell>
                  <TableCell>Customer Details</TableCell>
                  <TableCell align="right">Items Ordered</TableCell>
                  <TableCell align="right">Total Sum</TableCell>
                  <TableCell>Order Date</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id} sx={{ "&:hover": { backgroundColor: "rgba(255,255,255,0.01)" } }}>
                    <TableCell sx={{ fontWeight: 700, color: "secondary.main" }}>#ORD-{order.id.toString().padStart(4, "0")}</TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{order.customer?.full_name}</Typography>
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>{order.customer?.email}</Typography>
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      {order.items?.reduce((sum, item) => sum + item.quantity, 0)} items
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body1" sx={{ fontWeight: 700, color: "text.primary" }}>
                        ₹{order.total_amount.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ color: "text.secondary" }}>
                      {new Date(order.created_at).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
                        <Tooltip title="View Order Items">
                          <IconButton
                            color="secondary"
                            onClick={() => handleOpenDetails(order)}
                            sx={{ border: "1px solid rgba(6, 182, 212, 0.1)", p: 1 }}
                          >
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Cancel Order & Restock">
                          <IconButton
                            color="error"
                            onClick={() => handleCancelOrder(order.id)}
                            sx={{ border: "1px solid rgba(239, 68, 68, 0.1)", p: 1 }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {/* VIEW ORDER ITEMS MODAL */}
      <Dialog
        open={openDetails}
        onClose={() => setOpenDetails(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: "background.paper",
            border: "1px solid rgba(255,255,255,0.08)",
            backgroundImage: "none",
            borderRadius: "16px",
            p: 1,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1, fontFamily: "'Outfit', sans-serif" }}>
          Order details #ORD-{selectedOrder?.id.toString().padStart(4, "0")}
        </DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box>
              {/* Profile Card */}
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3, mt: 1 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>CLIENT ACCOUNT</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>{selectedOrder.customer?.full_name}</Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>{selectedOrder.customer?.email}</Typography>
                </Box>
                <Box sx={{ textAlign: "right" }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>Total Amount</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 900, color: "primary.main" }}>₹{selectedOrder.total_amount.toFixed(2)}</Typography>
                </Box>
              </Box>

              <Divider sx={{ borderColor: "rgba(255,255,255,0.05)", mb: 2 }} />

              {/* Items Breakdown list */}
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>PURCHASE BREAKDOWN</Typography>
              <TableContainer component={Paper} sx={{ boxShadow: "none", backgroundColor: "rgba(255,255,255,0.01)" }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Product Item</TableCell>
                      <TableCell align="center">Qty</TableCell>
                      <TableCell align="right">Unit Price</TableCell>
                      <TableCell align="right">Subtotal</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedOrder.items?.map((item) => (
                      <TableRow key={item.id} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                        <TableCell component="th" scope="row">{item.product.name}</TableCell>
                        <TableCell align="center">{item.quantity}</TableCell>
                        <TableCell align="right">₹{item.unit_price.toFixed(2)}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, color: "primary.main" }}>₹{item.subtotal.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpenDetails(false)} variant="contained" color="secondary">
            Close Details
          </Button>
        </DialogActions>
      </Dialog>

      {/* CREATE NEW ORDER DIALOG */}
      <Dialog
        open={openAdd}
        onClose={() => !submittingOrder && setOpenAdd(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: "background.paper",
            border: "1px solid rgba(255,255,255,0.08)",
            backgroundImage: "none",
            borderRadius: "16px",
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1, fontFamily: "'Outfit', sans-serif" }}>
          Generate New Sales Checkout
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleCreateOrder} sx={{ mt: 2 }}>
            {createError && (
              <Alert severity="error" variant="outlined" sx={{ mb: 3, borderRadius: "8px" }}>
                {createError}
              </Alert>
            )}

            {/* Select Customer */}
            <FormControl fullWidth size="small" sx={{ mb: 4 }}>
              <InputLabel id="select-customer-label">Client Account</InputLabel>
              <Select
                labelId="select-customer-label"
                value={selectedCustomerId}
                label="Client Account"
                onChange={(e) => setSelectedCustomerId(e.target.value)}
              >
                {customers.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.full_name} ({c.email})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>SELECT LINE ITEMS</span>
              <Button size="small" startIcon={<AddIcon />} onClick={handleAddLine} sx={{ fontWeight: 700 }}>
                Add Item
              </Button>
            </Typography>

            {/* Dynamic Lines List */}
            <Box sx={{ maxHeight: 280, overflowY: "auto", pr: 0.5, mb: 3 }}>
              {orderLines.map((line, idx) => {
                const selectedProd = products.find((p) => p.id === line.product_id);
                return (
                  <Grid container spacing={2} key={idx} sx={{ mb: 2, alignItems: "center" }}>
                    {/* Choose Product */}
                    <Grid item xs={6}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Product</InputLabel>
                        <Select
                          value={line.product_id}
                          label="Product"
                          onChange={(e) => handleLineChange(idx, "product_id", e.target.value)}
                        >
                          {products.map((p) => (
                            <MenuItem key={p.id} value={p.id} disabled={p.stock_quantity === 0}>
                              {p.name} (₹{p.price.toFixed(2)} - Stock: {p.stock_quantity})
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    {/* Choose Quantity */}
                    <Grid item xs={3}>
                      <TextField
                        label="Quantity"
                        type="number"
                        size="small"
                        value={line.quantity}
                        onChange={(e) => handleLineChange(idx, "quantity", parseInt(e.target.value, 10) || "")}
                        inputProps={{ min: 1 }}
                      />
                    </Grid>
                    {/* Live Line Price Preview */}
                    <Grid item xs={2}>
                      <Typography variant="body2" sx={{ fontWeight: 700, textAlign: "right", color: "primary.main" }}>
                        {selectedProd ? `₹${(selectedProd.price * (line.quantity || 0)).toFixed(2)}` : "₹0.00"}
                      </Typography>
                    </Grid>
                    {/* Delete Line Action */}
                    <Grid item xs={1}>
                      <IconButton
                        color="error"
                        disabled={orderLines.length === 1}
                        onClick={() => handleRemoveLine(idx)}
                      >
                        <RemoveIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                );
              })}
            </Box>

            <Divider sx={{ borderColor: "rgba(255,255,255,0.05)", my: 2 }} />

            {/* Estimate Total */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Estimated Total:</Typography>
              <Typography variant="h5" sx={{ fontWeight: 900, color: "primary.main" }}>
                ₹{calculateTotalEstimate().toFixed(2)}
              </Typography>
            </Box>

            <DialogActions sx={{ px: 0, pb: 0, gap: 1 }}>
              <Button onClick={() => setOpenAdd(false)} disabled={submittingOrder} variant="outlined" color="inherit">
                Cancel
              </Button>
              <Button type="submit" onClick={handleCreateOrder} disabled={submittingOrder} variant="contained" color="primary">
                {submittingOrder ? "Processing..." : "Process Order"}
              </Button>
            </DialogActions>
          </Box>
        </DialogContent>
      </Dialog>

      {/* TOAST SNACKBAR */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={toast.severity}
          variant="filled"
          onClose={() => setToast({ ...toast, open: false })}
          sx={{ borderRadius: "8px", fontWeight: 600 }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
