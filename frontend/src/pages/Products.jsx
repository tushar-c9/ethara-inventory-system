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
  TextField,
  InputAdornment,
  Alert,
  Snackbar,
  Skeleton,
  Tooltip,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { useSearchParams } from "react-router-dom";
import productService from "../services/productService";

export default function Products() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [globalError, setGlobalError] = useState(null);

  // Dialog states
  const [openAddEdit, setOpenAddEdit] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null); // If null, we are ADDING. Otherwise, EDITING.
  const [openDelete, setOpenDelete] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  // Toast notifications state
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  const showToast = (message, severity = "success") => {
    setToast({ open: true, message, severity });
  };

  // Form Setup
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: "",
      sku: "",
      price: "",
      stock_quantity: "",
    },
  });

  const loadProducts = async () => {
    setLoading(true);
    setGlobalError(null);
    try {
      // Check if low_stock filter is in URL
      const filterLow = searchParams.get("filter") === "low";
      const data = await productService.getAllProducts(filterLow ? true : null);
      setProducts(data);
    } catch (err) {
      setGlobalError(err.cleanedMessage || "Failed to load products from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [searchParams]);

  // Open Add/Edit Dialog
  const handleOpenAddEdit = (product = null) => {
    setSelectedProduct(product);
    if (product) {
      // Pre-fill form fields
      setValue("name", product.name);
      setValue("sku", product.sku);
      setValue("price", product.price);
      setValue("stock_quantity", product.stock_quantity);
    } else {
      reset({
        name: "",
        sku: "",
        price: "",
        stock_quantity: "",
      });
    }
    setOpenAddEdit(true);
  };

  // Handle Form Submit
  const onSubmitForm = async (data) => {
    const payload = {
      name: data.name,
      sku: data.sku,
      price: parseFloat(data.price),
      stock_quantity: parseInt(data.stock_quantity, 10),
    };

    try {
      if (selectedProduct) {
        // Edit Action
        const updated = await productService.updateProduct(selectedProduct.id, payload);
        showToast(`Product "${updated.name}" updated successfully!`);
      } else {
        // Add Action
        const created = await productService.createProduct(payload);
        showToast(`Product "${created.name}" created successfully!`);
      }
      setOpenAddEdit(false);
      loadProducts();
    } catch (err) {
      console.error(err);
      const msg = err.cleanedMessage || "Operation failed.";

      // If error represents unique SKU violation
      if (msg.includes("SKU") || msg.toLowerCase().includes("duplicate")) {
        setError("sku", { type: "manual", message: msg });
      } else {
        showToast(msg, "error");
      }
    }
  };

  // Handle Delete dialog
  const handleOpenDelete = (product) => {
    setProductToDelete(product);
    setOpenDelete(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    try {
      await productService.deleteProduct(productToDelete.id);
      showToast(`Product "${productToDelete.name}" deleted successfully.`);
      setOpenDelete(false);
      setProductToDelete(null);
      loadProducts();
    } catch (err) {
      console.error(err);
      showToast(err.cleanedMessage || "Failed to delete product. It might be linked to orders.", "error");
      setOpenDelete(false);
    }
  };

  // Filter local product list based on input search box
  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            Inventory Management
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
            Create and maintain product catalog details, pricing structures, and stock volumes.
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenAddEdit(null)}
          sx={{ alignSelf: { xs: "flex-start", sm: "center" } }}
        >
          Add Product
        </Button>
      </Box>

      {/* Global Error Banner */}
      {globalError && (
        <Alert severity="error" variant="outlined" sx={{ mb: 4, borderRadius: "10px" }}>
          {globalError}
        </Alert>
      )}

      {/* Filter and Table Card */}
      <Card sx={{ p: 0, border: "1px solid rgba(255, 255, 255, 0.05)" }}>
        {/* Search Header */}
        <Box sx={{ p: 3, display: "flex", alignItems: "center" }}>
          <TextField
            variant="outlined"
            placeholder="Search by product name or SKU..."
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{
              width: { xs: "100%", sm: 350 },
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "text.secondary" }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Data Table */}
        {loading ? (
          <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 1.5 }}>
            {[1, 2, 3, 4, 5].map((item) => (
              <Skeleton key={item} height={50} variant="rounded" sx={{ bgcolor: "rgba(255,255,255,0.03)" }} />
            ))}
          </Box>
        ) : filteredProducts.length === 0 ? (
          <Box sx={{ p: 8, textAlign: "center" }}>
            <Typography variant="body1" sx={{ color: "text.secondary" }}>
              No products found matching the criteria.
            </Typography>
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ boxShadow: "none", backgroundColor: "transparent", backgroundImage: "none" }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product Details</TableCell>
                  <TableCell>SKU Code</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="center">Stock Available</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredProducts.map((product) => {
                  const isLow = product.stock_quantity < 10;
                  return (
                    <TableRow key={product.id} sx={{ "&:hover": { backgroundColor: "rgba(255,255,255,0.01)" } }}>
                      <TableCell sx={{ fontWeight: 600 }}>{product.name}</TableCell>
                      <TableCell sx={{ fontFamily: "monospace", color: "secondary.main" }}>{product.sku}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        ₹{product.price.toFixed(2)}
                      </TableCell>
                      <TableCell align="center">
                        <Box
                          sx={{
                            display: "inline-block",
                            px: 1.5,
                            py: 0.5,
                            borderRadius: "15px",
                            fontWeight: 700,
                            fontSize: "0.9rem",
                            color: isLow ? "warning.main" : "primary.main",
                            bgcolor: isLow ? "rgba(245, 158, 11, 0.08)" : "rgba(16, 185, 129, 0.08)",
                            border: isLow
                              ? "1px solid rgba(245, 158, 11, 0.2)"
                              : "1px solid rgba(16, 185, 129, 0.2)",
                          }}
                        >
                          {product.stock_quantity} units
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
                          <Tooltip title="Edit Product">
                            <IconButton
                              color="secondary"
                              onClick={() => handleOpenAddEdit(product)}
                              sx={{ border: "1px solid rgba(6, 182, 212, 0.1)", p: 1 }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Product">
                            <IconButton
                              color="error"
                              onClick={() => handleOpenDelete(product)}
                              sx={{ border: "1px solid rgba(239, 68, 68, 0.1)", p: 1 }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {/* CREATE & EDIT OVERLAY DIALOG */}
      <Dialog
        open={openAddEdit}
        onClose={() => !isSubmitting && setOpenAddEdit(false)}
        maxWidth="xs"
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
          {selectedProduct ? "Update Product Catalog" : "Add New Catalog Product"}
        </DialogTitle>

        <form onSubmit={handleSubmit(onSubmitForm)}>
          <DialogContent sx={{ py: 2 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              <TextField
                label="Product Name"
                variant="outlined"
                fullWidth
                size="small"
                {...register("name", { required: "Product name is required" })}
                error={!!errors.name}
                helperText={errors.name?.message}
              />
              <TextField
                label="SKU Code"
                variant="outlined"
                fullWidth
                size="small"
                disabled={!!selectedProduct} // SKUs are unique IDs, usually lockable upon creation
                {...register("sku", { required: "Unique SKU is required" })}
                error={!!errors.sku}
                helperText={errors.sku?.message}
              />
              <TextField
                label="Unit Price"
                type="number"
                inputProps={{ step: "0.01" }}
                variant="outlined"
                fullWidth
                size="small"
                {...register("price", {
                  required: "Price is required",
                  validate: (v) => parseFloat(v) > 0 || "Price must be a positive number greater than 0",
                })}
                error={!!errors.price}
                helperText={errors.price?.message}
              />
              <TextField
                label="Stock Quantity"
                type="number"
                variant="outlined"
                fullWidth
                size="small"
                {...register("stock_quantity", {
                  required: "Stock quantity is required",
                  validate: (v) => parseInt(v, 10) >= 0 || "Stock quantity cannot be negative",
                })}
                error={!!errors.stock_quantity}
                helperText={errors.stock_quantity?.message}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
            <Button onClick={() => setOpenAddEdit(false)} disabled={isSubmitting} variant="outlined" color="inherit">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} variant="contained" color="primary">
              {isSubmitting ? "Saving..." : selectedProduct ? "Save Changes" : "Create Product"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog
        open={openDelete}
        onClose={() => setOpenDelete(false)}
        PaperProps={{
          sx: {
            backgroundColor: "background.paper",
            border: "1px solid rgba(255,255,255,0.08)",
            backgroundImage: "none",
            borderRadius: "16px",
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1, fontFamily: "'Outfit', sans-serif" }}>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ color: "text.secondary" }}>
            Are you sure you want to permanently remove <strong>{productToDelete?.name}</strong> (SKU: {productToDelete?.sku}) from the catalog? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={() => setOpenDelete(false)} variant="outlined" color="inherit">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} variant="contained" color="error">
            Delete Product
          </Button>
        </DialogActions>
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
