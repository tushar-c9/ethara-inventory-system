import React, { useState, useEffect } from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Skeleton,
  Alert,
  IconButton,
  Button,
  useTheme,
} from "@mui/material";
import {
  ShoppingBag as ProductsIcon,
  People as CustomersIcon,
  ReceiptLong as OrdersIcon,
  WarningAmber as AlertIcon,
  Refresh as RefreshIcon,
  ArrowForward as ArrowForwardIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import dashboardService from "../services/dashboardService";
import productService from "../services/productService";

export default function Dashboard() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [lowStockProducts, setLowStockProducts] = useState([]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const metricsData = await dashboardService.getDashboardSummary();
      const productsData = await productService.getAllProducts(true); // Filter low stock only
      setMetrics(metricsData);
      setLowStockProducts(productsData);
    } catch (err) {
      console.error(err);
      setError(err.cleanedMessage || "Could not fetch dashboard summary data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const cardList = [
    {
      title: "Total Products",
      value: metrics?.total_products,
      icon: <ProductsIcon sx={{ fontSize: 36, color: "primary.main" }} />,
      gradient: "linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.02) 100%)",
      borderColor: "rgba(16, 185, 129, 0.15)",
      path: "/products",
    },
    {
      title: "Total Customers",
      value: metrics?.total_customers,
      icon: <CustomersIcon sx={{ fontSize: 36, color: "secondary.main" }} />,
      gradient: "linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(6, 182, 212, 0.02) 100%)",
      borderColor: "rgba(6, 182, 212, 0.15)",
      path: "/customers",
    },
    {
      title: "Total Orders",
      value: metrics?.total_orders,
      icon: <OrdersIcon sx={{ fontSize: 36, color: "info.main" }} />,
      gradient: "linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.02) 100%)",
      borderColor: "rgba(59, 130, 246, 0.15)",
      path: "/orders",
    },
    {
      title: "Low Stock Alert",
      value: metrics?.low_stock_products,
      icon: <AlertIcon sx={{ fontSize: 36, color: "warning.main" }} />,
      gradient: "linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.02) 100%)",
      borderColor: "rgba(245, 158, 11, 0.15)",
      path: "/products?filter=low",
      isWarning: (metrics?.low_stock_products || 0) > 0,
    },
  ];

  return (
    <Box>
      {/* Header bar */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800 }}>
            Overview Dashboard
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
            Real-time tracking of products, customers, transactions, and critical inventory indicators.
          </Typography>
        </Box>
        <IconButton
          onClick={loadData}
          disabled={loading}
          sx={{
            border: "1px solid rgba(255, 255, 255, 0.08)",
            backgroundColor: "rgba(255,255,255,0.02)",
            p: 1.2,
          }}
        >
          <RefreshIcon />
        </IconButton>
      </Box>

      {error && (
        <Alert severity="error" variant="outlined" sx={{ mb: 4, borderRadius: "10px" }}>
          {error}
        </Alert>
      )}

      {/* KPI Cards Grid */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        {cardList.map((card, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <Card
              onClick={() => navigate(card.path)}
              sx={{
                cursor: "pointer",
                background: card.gradient,
                borderColor: card.borderColor,
                ...(card.isWarning && {
                  boxShadow: "0 8px 32px 0 rgba(245, 158, 11, 0.1)",
                  "&:hover": {
                    borderColor: "rgba(245, 158, 11, 0.4)",
                    boxShadow: "0 12px 40px 0 rgba(245, 158, 11, 0.2)",
                  },
                }),
              }}
            >
              <CardContent sx={{ p: 3, "&:last-child": { pb: 3 } }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ color: "text.secondary", fontWeight: 650, letterSpacing: "0.02em" }}>
                    {card.title}
                  </Typography>
                  {card.icon}
                </Box>
                {loading ? (
                  <Skeleton width="60%" height={48} sx={{ bgcolor: "rgba(255,255,255,0.05)" }} />
                ) : (
                  <Typography variant="h3" sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, mb: 1 }}>
                    {card.value ?? 0}
                  </Typography>
                )}
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "primary.main", mt: 1 }}>
                  <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 500 }}>
                    Click to view details
                  </Typography>
                  <ArrowForwardIcon sx={{ fontSize: 12, color: "text.secondary" }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Low Stock Alerts & Short List */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card sx={{ p: 3, border: "1px solid rgba(255, 255, 255, 0.05)" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <AlertIcon sx={{ color: "warning.main" }} />
                <Typography variant="h5" sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700 }}>
                  Critical Low Stock Items ({"<"} 10)
                </Typography>
              </Box>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => navigate("/products")}
                size="small"
                sx={{
                  border: "1px solid rgba(16, 185, 129, 0.3)",
                  "&:hover": {
                    border: "1px solid rgba(16, 185, 129, 0.6)",
                  },
                }}
              >
                Manage Inventory
              </Button>
            </Box>

            {loading ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {[1, 2, 3].map((s) => (
                  <Skeleton key={s} height={50} variant="rounded" sx={{ bgcolor: "rgba(255,255,255,0.03)" }} />
                ))}
              </Box>
            ) : lowStockProducts.length === 0 ? (
              <Box sx={{ p: 5, textAlign: "center", border: "1.5px dashed rgba(255,255,255,0.05)", borderRadius: "8px" }}>
                <Typography variant="body1" sx={{ color: "text.secondary" }}>
                  🎉 Excellent! No low-stock items detected in the database.
                </Typography>
              </Box>
            ) : (
              <TableContainer component={Paper} sx={{ boxShadow: "none", backgroundColor: "transparent", backgroundImage: "none" }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Product Details</TableCell>
                      <TableCell>SKU</TableCell>
                      <TableCell align="right">Unit Price</TableCell>
                      <TableCell align="center">Stock Level</TableCell>
                      <TableCell align="center">Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {lowStockProducts.map((product) => {
                      const isCritical = product.stock_quantity <= 4;
                      return (
                        <TableRow key={product.id} sx={{ "&:hover": { backgroundColor: "rgba(255,255,255,0.01)" } }}>
                          <TableCell sx={{ fontWeight: 600 }}>{product.name}</TableCell>
                          <TableCell sx={{ fontFamily: "monospace", color: "secondary.main" }}>{product.sku}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700 }}>
                            ${product.price.toFixed(2)}
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 800 }}>
                            <Box
                              sx={{
                                color: isCritical ? "error.main" : "warning.main",
                                fontSize: "1.1rem",
                              }}
                            >
                              {product.stock_quantity}
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={isCritical ? "CRITICAL" : "REORDER"}
                              color={isCritical ? "error" : "warning"}
                              size="small"
                              variant="outlined"
                              sx={{
                                fontWeight: 750,
                                fontSize: "0.7rem",
                                border: isCritical
                                  ? "1px solid rgba(239, 68, 68, 0.4)"
                                  : "1px solid rgba(245, 158, 11, 0.4)",
                                bgcolor: isCritical
                                  ? "rgba(239, 68, 68, 0.05)"
                                  : "rgba(245, 158, 11, 0.05)",
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
