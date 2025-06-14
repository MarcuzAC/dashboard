import axios from "axios";
import Cookies from "js-cookie";

const API_BASE_URL = "https://backend-1-6tpq.onrender.com";

// Function to get auth headers with token
const getAuthHeaders = () => {
  const token = Cookies.get("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ================= Authentication Endpoints ================= //

export const login = async (username, password) => {
  try {
    const { data } = await axios.post(
      `${API_BASE_URL}/login`,
      new URLSearchParams({ username, password }),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
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
      headers: { "Content-Type": "application/json" },
    });
    return data;
  } catch (error) {
    throw error.response?.data?.detail || "Failed to register user";
  }
};

// ================= Dashboard Stats Endpoint ================= //

export const fetchDashboardStats = async () => {
  try {
    const { data } = await axios.get(`${API_BASE_URL}/videos/dashboard/stats`, {
      headers: getAuthHeaders(),
    });
    return data; // Returns the exact format from your backend
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error);
    return {
      total_users: 0,
      total_videos: 0,
      total_categories: 0,
      total_news: 0,
      revenue: 0,
      user_growth: { months: [], counts: [] },
      video_categories: { names: [], counts: [] },
      recent_videos: []
    };
  }
};

// ================= Video Endpoints ================= //
// (All kept exactly as they were in your original code)

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
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
    });
    return response.data;
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

// ================= Category Endpoints ================= //
// (All kept exactly as they were in your original code)

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

// ================= User Endpoints ================= //
// (All kept exactly as they were in your original code)

export const fetchUsers = async () => {
  try {
    const { data } = await axios.get(`${API_BASE_URL}/users`, {
      headers: getAuthHeaders(),
    });
    return data;
  } catch (error) {
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
    throw new Error(error.response?.data?.detail || "Failed to update user");
  }
};

export const deleteUser = async (userId) => {
  try {
    await axios.delete(`${API_BASE_URL}/users/${userId}`, {
      headers: getAuthHeaders(),
    });
  } catch (error) {
    throw new Error(error.response?.data?.detail || "Failed to delete user");
  }
};

// ================= News Endpoints ================= //
// (All kept exactly as they were in your original code)

export const createNews = async (newsData, imageFile) => {
  try {
    const formData = new FormData();
    formData.append("news_data", JSON.stringify({
      title: newsData.title,
      content: newsData.content,
      is_published: newsData.is_published || false,
    }));

    if (imageFile) {
      formData.append("image", imageFile);
    }

    const { data } = await axios.post(`${API_BASE_URL}/news/`, formData, {
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  } catch (error) {
    const errorMsg = error.response?.data?.detail || error.response?.data?.message || "Failed to create news";
    throw new Error(errorMsg);
  }
};

export const getNewsList = async (page = 1, size = 10, publishedOnly = true) => {
  try {
    const { data } = await axios.get(`${API_BASE_URL}/news/`, {
      headers: getAuthHeaders(),
      params: {
        page,
        size,
        published_only: publishedOnly,
      },
    });
    return data;
  } catch (error) {
    return { items: [], total: 0, page: 1, size: 10 };
  }
};

export const getNewsById = async (newsId) => {
  try {
    const { data } = await axios.get(`${API_BASE_URL}/news/${newsId}`, {
      headers: getAuthHeaders(),
    });
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || "News item not found");
  }
};

export const updateNews = async (newsId, newsData, imageFile) => {
  try {
    const formData = new FormData();
    formData.append("news_data", JSON.stringify({
      title: newsData.title,
      content: newsData.content,
      is_published: newsData.is_published,
    }));

    if (imageFile) {
      formData.append("image", imageFile);
    }

    const { data } = await axios.put(`${API_BASE_URL}/news/${newsId}`, formData, {
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || "Failed to update news");
  }
};

export const deleteNews = async (newsId) => {
  try {
    await axios.delete(`${API_BASE_URL}/news/${newsId}`, {
      headers: getAuthHeaders(),
    });
  } catch (error) {
    throw new Error(error.response?.data?.detail || "Failed to delete news");
  }
};

export const getLatestNews = async (limit = 5) => {
  try {
    const { data } = await axios.get(`${API_BASE_URL}/news/latest/`, {
      headers: getAuthHeaders(),
      params: { limit },
    });
    return data;
  } catch (error) {
    return [];
  }
};

export const searchNews = async (query, page = 1, size = 10, publishedOnly = true) => {
  try {
    const { data } = await axios.get(`${API_BASE_URL}/search/`, {
      headers: getAuthHeaders(),
      params: {
        query,
        page,
        size,
        published_only: publishedOnly,
      },
    });
    return data;
  } catch (error) {
    return { items: [], total: 0, page: 1, size: 10 };
  }
};

export const uploadNewsImage = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append("file", imageFile);

    const { data } = await axios.post(`${API_BASE_URL}/news/upload-image/`, formData, {
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || "Failed to upload image");
  }
};