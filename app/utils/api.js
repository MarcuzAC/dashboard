import axios from "axios";
import Cookies from "js-cookie";

const API_BASE_URL = "https://backend-1-6tpq.onrender.com"; 

// Function to get auth headers with token
const getAuthHeaders = () => {
  const token = Cookies.get("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ==================
// AUTH API FUNCTIONS
// ==================

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

// =================
// NEWS API FUNCTIONS
// =================

/**
 * Create a new news article
 * @param {Object} newsData - News content {title, content, is_published}
 * @param {File} [imageFile] - Optional image file
 */
export const createNews = async (newsData, imageFile) => {
  const formData = new FormData();
  formData.append('news_data', JSON.stringify(newsData));
  if (imageFile) formData.append('image', imageFile);

  try {
    const { data } = await axios.post(`${API_BASE_URL}/news/`, formData, {
      headers: { ...getAuthHeaders(), 'Content-Type': 'multipart/form-data' },
    });
    return data;
  } catch (error) {
    throw error.response?.data?.detail || "Failed to create news article";
  }
};

/**
 * Get paginated news list
 * @param {number} [page=1] - Page number
 * @param {number} [size=10] - Items per page
 * @param {boolean} [publishedOnly=true] - Only show published articles
 */
export const fetchNewsList = async (page = 1, size = 10, publishedOnly = true) => {
  try {
    const { data } = await axios.get(`${API_BASE_URL}/news/`, {
      params: { page, size, published_only: publishedOnly },
      headers: getAuthHeaders(),
    });
    return data;
  } catch (error) {
    console.error("Failed to fetch news:", error);
    return { items: [], total: 0, page, size };
  }
};

/**
 * Search news articles
 * @param {string} query - Search term
 * @param {number} [page=1] - Page number
 * @param {number} [size=10] - Items per page
 * @param {boolean} [publishedOnly=true] - Only search published articles
 */
export const searchNews = async (query, page = 1, size = 10, publishedOnly = true) => {
  try {
    const { data } = await axios.get(`${API_BASE_URL}/news/search`, {
      params: { query, page, size, published_only: publishedOnly },
      headers: getAuthHeaders(),
    });
    return data;
  } catch (error) {
    console.error("Failed to search news:", error);
    return { items: [], total: 0, page, size };
  }
};

/**
 * Get single news article
 * @param {string} news_id - News article ID
 */
export const fetchNewsItem = async (news_id) => {
  try {
    const { data } = await axios.get(`${API_BASE_URL}/news/${news_id}`, {
      headers: getAuthHeaders(),
    });
    return data;
  } catch (error) {
    throw error.response?.data?.detail || "News article not found";
  }
};

/**
 * Update news article
 * @param {string} news_id - News article ID to update
 * @param {Object} newsData - Updated news content
 * @param {File} [imageFile] - Optional new image
 */
export const updateNews = async (news_id, newsData, imageFile) => {
  const formData = new FormData();
  formData.append('news_update', JSON.stringify(newsData));
  if (imageFile) formData.append('image', imageFile);

  try {
    const { data } = await axios.put(`${API_BASE_URL}/news/${news_id}`, formData, {
      headers: { ...getAuthHeaders(), 'Content-Type': 'multipart/form-data' },
    });
    return data;
  } catch (error) {
    throw error.response?.data?.detail || "Failed to update news article";
  }
};

/**
 * Delete news article
 * @param {string} news_id - News article ID to delete
 */
export const deleteNews = async (news_id) => {
  try {
    await axios.delete(`${API_BASE_URL}/news/${news_id}`, {
      headers: getAuthHeaders(),
    });
  } catch (error) {
    throw error.response?.data?.detail || "Failed to delete news article";
  }
};

/**
 * Get latest news articles
 * @param {number} [limit=5] - Number of articles to return
 */
export const fetchLatestNews = async (limit = 5) => {
  try {
    const { data } = await axios.get(`${API_BASE_URL}/latest`, {
      params: { limit },
      headers: getAuthHeaders(),
    });
    return data;
  } catch (error) {
    console.error("Failed to fetch latest news:", error);
    return [];
  }
};

/**
 * Upload news image (standalone)
 * @param {File} imageFile - Image file to upload
 */
export const uploadNewsImage = async (imageFile) => {
  const formData = new FormData();
  formData.append('file', imageFile);

  try {
    const { data } = await axios.post(`${API_BASE_URL}/news/upload-image`, formData, {
      headers: { ...getAuthHeaders(), 'Content-Type': 'multipart/form-data' },
    });
    return data;
  } catch (error) {
    throw error.response?.data?.detail || "Failed to upload image";
  }
};

// ==================
// VIDEO API FUNCTIONS
// ==================

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
      headers: { ...getAuthHeaders(), 'Content-Type': 'multipart/form-data' },
    });
    return data;
  } catch (error) {
    throw error.response?.data?.detail || "Failed to upload video";
  }
};

export const updateVideo = async (videoId, updatedData) => {
  try {
    const { data } = await axios.put(`${API_BASE_URL}/videos/${videoId}`, updatedData, {
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
    });
    return data;
  } catch (error) {
    throw error.response?.data?.detail || "Failed to update video";
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

// ======================
// CATEGORY API FUNCTIONS
// ======================

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
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
    });
    return data;
  } catch (error) {
    throw error.response?.data?.detail || "Failed to create category";
  }
};

export const updateCategory = async (categoryId, updatedData) => {
  try {
    const { data } = await axios.put(`${API_BASE_URL}/categories/${categoryId}`, updatedData, {
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
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

// =================
// USER API FUNCTIONS
// =================

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
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
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