import axios from "axios";
import Cookies from "js-cookie";

const API_BASE_URL = "https://backend-1-6tpq.onrender.com";

// Helper function to get auth headers with token
const getAuthHeaders = () => {
  const token = Cookies.get("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ================== AUTHENTICATION ================== //
export const login = async (username, password) => {
  try {
    const { data } = await axios.post(
      `${API_BASE_URL}/login`,
      new URLSearchParams({ username, password }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        withCredentials: true,
      }
    );

    Cookies.set("accessToken", data.access_token, { expires: 7 });
    return data;
  } catch (error) {
    throw error.response?.data?.detail || "Login failed";
  }
};

export const registerUser = async (userData) => {
  try {
    const { data } = await axios.post(`${API_BASE_URL}/register`, userData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return data;
  } catch (error) {
    throw error.response?.data?.detail || "Failed to register user";
  }
};

// ================== VIDEO ENDPOINTS ================== //
export const fetchDashboardStats = async () => {
  try {
    const { data } = await axios.get(`${API_BASE_URL}/videos/dashboard/stats`, {
      headers: getAuthHeaders(),
    });
    return data;
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error);
    return null;
  }
};

export const fetchRecentVideos = async () => {
  try {
    const { data } = await axios.get(`${API_BASE_URL}/videos/recent`, {
      headers: getAuthHeaders(),
    });
    return data;
  } catch (error) {
    console.error("Failed to fetch recent videos:", error);
    return [];
  }
};

export const fetchVideos = async () => {
  try {
    const { data } = await axios.get(`${API_BASE_URL}/videos`, {
      headers: getAuthHeaders(),
    });
    return data;
  } catch (error) {
    console.error("Failed to fetch videos:", error);
    return [];
  }
};

export const uploadVideo = async (formData) => {
  try {
    const { data } = await axios.post(`${API_BASE_URL}/videos/`, formData, {
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  } catch (error) {
    throw error.response?.data?.detail || "Failed to upload video";
  }
};

export const updateVideo = async (videoId, updatedData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/videos/${videoId}`, updatedData, {
      headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to update video:", error.response ? error.response.data : error.message);
    throw error;
  }
};

export const deleteVideo = async (videoId) => {
  try {
    await axios.delete(`${API_BASE_URL}/videos/${videoId}`, {
      headers: getAuthHeaders(),
    });
  } catch (error) {
    throw error.response?.data?.detail || "Failed to delete video";
  }
};

// ================== CATEGORY ENDPOINTS ================== //
export const fetchCategories = async () => {
  try {
    const { data } = await axios.get(`${API_BASE_URL}/categories`, {
      headers: getAuthHeaders(),
    });
    return data;
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return [];
  }
};

export const createCategory = async (categoryData) => {
  try {
    const { data } = await axios.post(`${API_BASE_URL}/categories`, categoryData, {
      headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
    });
    return data;
  } catch (error) {
    throw error.response?.data?.detail || "Failed to create category";
  }
};

export const updateCategory = async (categoryId, updatedData) => {
  try {
    const { data } = await axios.put(`${API_BASE_URL}/categories/${categoryId}`, updatedData, {
      headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
    });
    return data;
  } catch (error) {
    throw error.response?.data?.detail || "Failed to update category";
  }
};

export const deleteCategory = async (categoryId) => {
  try {
    await axios.delete(`${API_BASE_URL}/categories/${categoryId}`, {
      headers: getAuthHeaders(),
    });
  } catch (error) {
    throw error.response?.data?.detail || "Failed to delete category";
  }
};

// ================== USER ENDPOINTS ================== //
export const fetchUsers = async () => {
  try {
    const { data } = await axios.get(`${API_BASE_URL}/users`, {
      headers: getAuthHeaders(),
    });
    return data;
  } catch (error) {
    console.error("Failed to fetch users:", error);
    throw new Error(error.response?.data?.detail || "Failed to fetch users");
  }
};

export const updateUser = async (userId, updatedData) => {
  try {
    const { data } = await axios.put(`${API_BASE_URL}/users/${userId}`, updatedData, {
      headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
    });
    return data;
  } catch (error) {
    console.error("Failed to update user:", error);
    throw new Error(error.response?.data?.detail || "Failed to update user");
  }
};

export const deleteUser = async (userId) => {
  try {
    await axios.delete(`${API_BASE_URL}/users/${userId}`, {
      headers: getAuthHeaders(),
    });
  } catch (error) {
    console.error("Failed to delete user:", error);
    throw new Error(error.response?.data?.detail || "Failed to delete user");
  }
};

// ================== NEWS ENDPOINTS ================== //
export const createNews = async (newsData, imageFile) => {
  try {
    const formData = new FormData();
    formData.append('news_data', JSON.stringify(newsData));
    if (imageFile) {
      formData.append('image', imageFile);
    }

    const { data } = await axios.post(`${API_BASE_URL}/news/`, formData, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  } catch (error) {
    throw error.response?.data?.detail || "Failed to create news article";
  }
};

export const getNewsList = async (page = 1, size = 10, publishedOnly = true) => {
  try {
    const { data } = await axios.get(`${API_BASE_URL}/news/`, {
      headers: getAuthHeaders(),
      params: {
        page,
        size,
        published_only: publishedOnly
      }
    });
    return data;
  } catch (error) {
    console.error("Failed to fetch news list:", error);
    return { items: [], total: 0, page, size };
  }
};

export const getNewsById = async (news_id) => {
  try {
    const { data } = await axios.get(`${API_BASE_URL}/news/${news_id}`, {
      headers: getAuthHeaders(),
    });
    return data;
  } catch (error) {
    console.error("Failed to fetch news article:", error);
    throw error.response?.data?.detail || "News article not found";
  }
};

export const updateNews = async (news_id, newsData, imageFile) => {
  try {
    const formData = new FormData();
    formData.append('news_data', JSON.stringify(newsData));
    if (imageFile) {
      formData.append('image', imageFile);
    }

    const { data } = await axios.put(`${API_BASE_URL}/news/${news_id}`, formData, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  } catch (error) {
    throw error.response?.data?.detail || "Failed to update news article";
  }
};

export const deleteNews = async (news_id) => {
  try {
    await axios.delete(`${API_BASE_URL}/news/${news_id}`, {
      headers: getAuthHeaders(),
    });
  } catch (error) {
    throw error.response?.data?.detail || "Failed to delete news article";
  }
};

export const getLatestNews = async (limit = 5) => {
  try {
    const { data } = await axios.get(`${API_BASE_URL}/news/latest`, {
      headers: getAuthHeaders(),
      params: { limit }
    });
    return data;
  } catch (error) {
    console.error("Failed to fetch latest news:", error);
    return [];
  }
};

export const uploadNewsImage = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append('file', imageFile);

    const { data } = await axios.post(`${API_BASE_URL}/news/upload-image`, formData, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  } catch (error) {
    throw error.response?.data?.detail || "Failed to upload news image";
  }
};

// Logout function
export const logout = () => {
  Cookies.remove("accessToken");
};