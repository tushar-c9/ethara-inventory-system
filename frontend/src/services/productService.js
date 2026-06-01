import apiClient from "./api";

const productService = {
  getAllProducts: async (lowStock = null) => {
    const params = {};
    if (lowStock !== null) {
      params.low_stock = lowStock;
    }
    const response = await apiClient.get("/products/", { params });
    return response.data;
  },

  getProductById: async (id) => {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  },

  createProduct: async (productData) => {
    const response = await apiClient.post("/products/", productData);
    return response.data;
  },

  updateProduct: async (id, productData) => {
    const response = await apiClient.put(`/products/${id}`, productData);
    return response.data;
  },

  deleteProduct: async (id) => {
    await apiClient.delete(`/products/${id}`);
    return true;
  },
};

export default productService;
