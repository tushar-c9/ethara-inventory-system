import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#10b981", // Cyber Emerald
      light: "#34d399",
      dark: "#059669",
      contrastText: "#000000",
    },
    secondary: {
      main: "#06b6d4", // Electric Cyan / Blue
      light: "#22d3ee",
      dark: "#0891b2",
      contrastText: "#ffffff",
    },
    background: {
      default: "#090d16", // Midnight Obsidian deep background
      paper: "rgba(17, 24, 39, 0.7)", // Glassmorphic translucent slate
    },
    text: {
      primary: "#f3f4f6", // Crisp light grey
      secondary: "#9ca3af", // Subdued grey
    },
    error: {
      main: "#ef4444", // High contrast red
    },
    warning: {
      main: "#f59e0b", // Amber low stock warnings
    },
    info: {
      main: "#3b82f6",
    },
    success: {
      main: "#10b981",
    },
  },
  typography: {
    fontFamily: "'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    h1: {
      fontWeight: 800,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 700,
    },
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 600,
      letterSpacing: "0.02em",
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarColor: "#1f2937 #0b0f19",
          "&::-webkit-scrollbar": {
            width: "8px",
            height: "8px",
          },
          "&::-webkit-scrollbar-track": {
            background: "#090d16",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "#1f2937",
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background: "#374151",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          backgroundColor: "rgba(17, 24, 39, 0.75)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
          transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out, border-color 0.2s ease-in-out",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0 12px 40px 0 rgba(16, 185, 129, 0.15)",
            borderColor: "rgba(16, 185, 129, 0.3)",
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: "none",
          padding: "8px 16px",
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            boxShadow: "0 4px 14px 0 rgba(16, 185, 129, 0.3)",
          },
        },
        containedSecondary: {
          "&:hover": {
            boxShadow: "0 4px 14px 0 rgba(6, 182, 212, 0.3)",
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
        },
        head: {
          fontWeight: 700,
          backgroundColor: "rgba(9, 13, 22, 0.9)",
          color: "#f3f4f6",
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: "#070a10",
          borderRight: "1px solid rgba(255, 255, 255, 0.05)",
        },
      },
    },
  },
});

export default theme;
