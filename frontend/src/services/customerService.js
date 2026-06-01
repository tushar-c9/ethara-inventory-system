import apiClient from "./api";

const customerService = {
  getAllCustomers: async () => {
    const response = await apiClient.get("/customers/");
    return response.data;
  },

  getCustomerById: async (id) => {
    const response = await apiClient.get(`/customers/${id}`);
    return response.data;
  },

  createCustomer: async (customerData) => {
    const response = await apiClient.post("/customers/", customerData);
    return response.data;
  },

  deleteCustomer: async (id) => {
    await apiClient.delete(`/customers/${id}`);
    return true;
  },
};

export default customerService;
