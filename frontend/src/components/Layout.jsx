import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  ShoppingBag as ProductsIcon,
  People as CustomersIcon,
  ReceiptLong as OrdersIcon,
  AccountCircle as UserIcon,
  LocalShipping as LogoIcon,
} from "@mui/icons-material";

const drawerWidth = 260;

export default function Layout() {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/" },
    { text: "Products", icon: <ProductsIcon />, path: "/products" },
    { text: "Customers", icon: <CustomersIcon />, path: "/customers" },
    { text: "Orders", icon: <OrdersIcon />, path: "/orders" },
  ];

  // Detect active page name for header
  const getPageTitle = () => {
    const currentItem = menuItems.find((item) => item.path === location.pathname);
    return currentItem ? currentItem.text : "System Module";
  };

  const drawerContent = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Brand Header */}
      <Box
        sx={{
          p: 3,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          background: "linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(9, 13, 22, 0.1) 100%)",
        }}
      >
        <LogoIcon sx={{ color: theme.palette.primary.main, fontSize: 32 }} />
        <Typography
          variant="h5"
          noWrap
          sx={{
            fontWeight: 800,
            fontFamily: "'Outfit', sans-serif",
            background: "linear-gradient(90deg, #10b981 0%, #06b6d4 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "0.05em",
          }}
        >
          ETHARA
        </Typography>
      </Box>
      <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.05)" }} />

      {/* Navigation List */}
      <List sx={{ px: 2, py: 3, flexGrow: 1 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) setMobileOpen(false);
                }}
                sx={{
                  borderRadius: "8px",
                  py: 1.2,
                  px: 2,
                  backgroundColor: isActive
                    ? "rgba(16, 185, 129, 0.08)"
                    : "transparent",
                  borderLeft: isActive
                    ? `4px solid ${theme.palette.primary.main}`
                    : "4px solid transparent",
                  color: isActive ? theme.palette.primary.main : "text.secondary",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.03)",
                    color: "text.primary",
                    "& .MuiListItemIcon-root": {
                      color: theme.palette.primary.light,
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? theme.palette.primary.main : "text.secondary",
                    minWidth: 40,
                    transition: "color 0.2s ease",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: "0.95rem",
                    fontWeight: isActive ? 600 : 500,
                    fontFamily: "'Outfit', sans-serif",
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Footer Info */}
      <Box sx={{ p: 2, borderTop: "1px solid rgba(255, 255, 255, 0.05)", textAlign: "center" }}>
        <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.75rem" }}>
          Antigravity Engine &copy; 2026
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      {/* Top Navbar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          backgroundColor: "rgba(9, 13, 22, 0.8)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
          boxShadow: "none",
        }}
      >
        <Toolbar sx={{ px: { xs: 2, sm: 3 }, py: 1 }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography
            variant="h6"
            component="h1"
            sx={{
              flexGrow: 1,
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 700,
              fontSize: { xs: "1.25rem", sm: "1.5rem" },
              letterSpacing: "-0.01em",
            }}
          >
            {getPageTitle()}
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              sx={{
                display: { xs: "none", sm: "flex" },
                alignItems: "center",
                gap: 1,
                bgcolor: "rgba(16, 185, 129, 0.05)",
                border: "1px solid rgba(16, 185, 129, 0.15)",
                borderRadius: "20px",
                px: 2,
                py: 0.5,
              }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  bgcolor: "primary.main",
                  borderRadius: "50%",
                  animation: "pulse 2s infinite",
                  "@keyframes pulse": {
                    "0%": { transform: "scale(0.95)", boxShadow: "0 0 0 0 rgba(16,185,129,0.7)" },
                    "70%": { transform: "scale(1)", boxShadow: "0 0 0 6px rgba(16,185,129,0)" },
                    "100%": { transform: "scale(0.95)", boxShadow: "0 0 0 0 rgba(16,185,129,0)" },
                  },
                }}
              />
              <Typography variant="caption" sx={{ color: "primary.main", fontWeight: 700 }}>
                Live Connection
              </Typography>
            </Box>

            <IconButton sx={{ border: "1px solid rgba(255,255,255,0.05)", color: "text.primary" }}>
              <UserIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar Navigation */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        aria-label="mailbox folders"
      >
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
          }}
        >
          {drawerContent}
        </Drawer>
        {/* Desktop Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2.5, sm: 4 },
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: "72px",
          minHeight: "calc(100vh - 72px)",
          bgcolor: "background.default",
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
