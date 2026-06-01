import apiClient from "./api";

const orderService = {
  getAllOrders: async () => {
    const response = await apiClient.get("/orders/");
    return response.data;
  },

  getOrderById: async (id) => {
    const response = await apiClient.get(`/orders/${id}`);
    return response.data;
  },

  createOrder: async (orderData) => {
    const response = await apiClient.post("/orders/", orderData);
    return response.data;
  },

  cancelOrder: async (id) => {
    await apiClient.delete(`/orders/${id}`);
    return true;
  },
};

export default orderService;
