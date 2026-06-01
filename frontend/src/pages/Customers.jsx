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
  Delete as DeleteIcon,
  Search as SearchIcon,
  MailOutline as MailIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { useForm } from "react-hook-form";
import customerService from "../services/customerService";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [globalError, setGlobalError] = useState(null);

  // Dialog States
  const [openAdd, setOpenAdd] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);

  // Toast Notifications
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  const showToast = (message, severity = "success") => {
    setToast({ open: true, message, severity });
  };

  // Form Setup
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
    },
  });

  const loadCustomers = async () => {
    setLoading(true);
    setGlobalError(null);
    try {
      const data = await customerService.getAllCustomers();
      setCustomers(data);
    } catch (err) {
      setGlobalError(err.cleanedMessage || "Failed to load customers from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleOpenAdd = () => {
    reset({
      full_name: "",
      email: "",
      phone: "",
    });
    setOpenAdd(true);
  };

  const onSubmitForm = async (data) => {
    try {
      const created = await customerService.createCustomer(data);
      showToast(`Customer "${created.full_name}" registered successfully!`);
      setOpenAdd(false);
      loadCustomers();
    } catch (err) {
      console.error(err);
      const msg = err.cleanedMessage || "Failed to add customer.";
      
      // If error represents unique email violation
      if (msg.includes("email") || msg.toLowerCase().includes("duplicate")) {
        setError("email", { type: "manual", message: msg });
      } else {
        showToast(msg, "error");
      }
    }
  };

  const handleOpenDelete = (customer) => {
    setCustomerToDelete(customer);
    setOpenDelete(true);
  };

  const handleDeleteConfirm = async () => {
    if (!customerToDelete) return;
    try {
      await customerService.deleteCustomer(customerToDelete.id);
      showToast(`Customer "${customerToDelete.full_name}" removed successfully.`);
      setOpenDelete(false);
      setCustomerToDelete(null);
      loadCustomers();
    } catch (err) {
      console.error(err);
      showToast(err.cleanedMessage || "Failed to remove customer record.", "error");
      setOpenDelete(false);
    }
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
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
            Customer Management
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
            Register new clients, audit accounts, and review profiles.
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenAdd}
          sx={{ alignSelf: { xs: "flex-start", sm: "center" } }}
        >
          Add Customer
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
            placeholder="Search by name or email..."
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
            {[1, 2, 3, 4].map((item) => (
              <Skeleton key={item} height={50} variant="rounded" sx={{ bgcolor: "rgba(255,255,255,0.03)" }} />
            ))}
          </Box>
        ) : filteredCustomers.length === 0 ? (
          <Box sx={{ p: 8, textAlign: "center" }}>
            <Typography variant="body1" sx={{ color: "text.secondary" }}>
              No customer records found.
            </Typography>
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ boxShadow: "none", backgroundColor: "transparent", backgroundImage: "none" }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Full Name</TableCell>
                  <TableCell>Email Address</TableCell>
                  <TableCell>Phone Number</TableCell>
                  <TableCell>Registration Date</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id} sx={{ "&:hover": { backgroundColor: "rgba(255,255,255,0.01)" } }}>
                    <TableCell sx={{ fontWeight: 600 }}>{customer.full_name}</TableCell>
                    <TableCell sx={{ color: "secondary.main" }}>{customer.email}</TableCell>
                    <TableCell sx={{ fontFamily: "monospace" }}>{customer.phone || "--"}</TableCell>
                    <TableCell sx={{ color: "text.secondary" }}>
                      {new Date(customer.created_at).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Remove Customer">
                        <IconButton
                          color="error"
                          onClick={() => handleOpenDelete(customer)}
                          sx={{ border: "1px solid rgba(239, 68, 68, 0.1)", p: 1 }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {/* REGISTER CUSTOMER DIALOG */}
      <Dialog
        open={openAdd}
        onClose={() => !isSubmitting && setOpenAdd(false)}
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
          Register New Customer
        </DialogTitle>
        
        <form onSubmit={handleSubmit(onSubmitForm)}>
          <DialogContent sx={{ py: 2 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              <TextField
                label="Full Name"
                variant="outlined"
                fullWidth
                size="small"
                {...register("full_name", { required: "Customer name is required" })}
                error={!!errors.full_name}
                helperText={errors.full_name?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ color: "text.secondary", fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="Email Address"
                variant="outlined"
                fullWidth
                size="small"
                {...register("email", {
                  required: "Valid email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address format",
                  },
                })}
                error={!!errors.email}
                helperText={errors.email?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MailIcon sx={{ color: "text.secondary", fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="Phone Number"
                placeholder="+1 (555) 000-0000"
                variant="outlined"
                fullWidth
                size="small"
                {...register("phone")}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon sx={{ color: "text.secondary", fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
            <Button onClick={() => setOpenAdd(false)} disabled={isSubmitting} variant="outlined" color="inherit">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} variant="contained" color="primary">
              {isSubmitting ? "Registering..." : "Add Customer"}
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
        <DialogTitle sx={{ fontWeight: 700, pb: 1, fontFamily: "'Outfit', sans-serif" }}>Remove Customer Profile</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ color: "text.secondary" }}>
            Are you sure you want to delete <strong>{customerToDelete?.full_name}</strong> ({customerToDelete?.email})? This deletes their account and associated order histories.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={() => setOpenDelete(false)} variant="outlined" color="inherit">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} variant="contained" color="error">
            Delete Record
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
