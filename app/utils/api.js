import axios from "axios";
import Cookies from "js-cookie";

const API_BASE_URL = "https://mcltv.onrender.com";
//const API_BASE_URL = "https://backend-1qjc.onrender.com";
//const API_BASE_URL = "http://localhost:8000"; // Change to your local or production API base URL

// Function to get auth headers with token
const getAuthHeaders = () => {
  const token = Cookies.get("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ================= Authentication Endpoints ================= //

export const login = async (username, password) => {
  try {
    const { data } = await axios.post(
      `${API_BASE_URL}/auth/login`,
      new URLSearchParams({ username, password }),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );
    Cookies.set("accessToken", data.access_token, { expires: 7 });
    Cookies.set("refreshToken", data.refresh_token, { expires: 30 });
    return data;
  } catch (error) {
    throw error.response?.data?.detail || "Login failed";
  }
};

export const registerUser = async (userData) => {
  try {
    const { data } = await axios.post(`${API_BASE_URL}/auth/register`, userData, {
      headers: { "Content-Type": "application/json" },
    });
    Cookies.set("accessToken", data.access_token, { expires: 7 });
    Cookies.set("refreshToken", data.refresh_token, { expires: 30 });
    return data;
  } catch (error) {
    throw error.response?.data?.detail || "Failed to register user";
  }
};

export const refreshToken = async () => {
  try {
    const refreshToken = Cookies.get("refreshToken");
    if (!refreshToken) throw new Error("No refresh token available");
    
    const { data } = await axios.post(
      `${API_BASE_URL}/auth/refresh`,
      { refresh_token: refreshToken },
      { headers: { "Content-Type": "application/json" } }
    );
    
    Cookies.set("accessToken", data.access_token, { expires: 7 });
    return data;
  } catch (error) {
    console.error("Token refresh failed:", error);
    logout();
    throw error;
  }
};

export const verifyToken = async () => {
  try {
    const { data } = await axios.get(`${API_BASE_URL}/auth/verify-token`, {
      headers: getAuthHeaders(),
    });
    return data;
  } catch (error) {
    if (error.response?.status === 401) {
      try {
        await refreshToken();
        return verifyToken();
      } catch (refreshError) {
        throw refreshError;
      }
    }
    throw error;
  }
};

export const logout = () => {
  Cookies.remove("accessToken");
  Cookies.remove("refreshToken");
  window.location.href = "/login";
};

// ================= User Management Endpoints ================= //

export const getCurrentUser = async () => {
  try {
    const { data } = await axios.get(`${API_BASE_URL}/users/me`, {
      headers: getAuthHeaders(),
    });
    return data;
  } catch (error) {
    throw error.response?.data?.detail || "Failed to fetch user details";
  }
};

export const fetchUsers = async () => {
  try {
    const { data } = await axios.get(`${API_BASE_URL}/users/`, {
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

// ================= Video Endpoints ================= //

export const fetchDashboardStats = async () => {
  try {
    const { data } = await axios.get(`${API_BASE_URL}/videos/dashboard/stats`, {
      headers: getAuthHeaders(),
    });
    return data;
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
    const { data } = await axios.get(`${API_BASE_URL}/videos/`, {
      headers: getAuthHeaders(),
    });
    return data;
  } catch (error) {
    console.error("Failed to fetch videos:", error);
    return [];
  }
};

export const getVideoById = async (videoId) => {
  try {
    const { data } = await axios.get(`${API_BASE_URL}/videos/${videoId}`, {
      headers: getAuthHeaders(),
    });
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || "Failed to fetch video");
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

export const searchVideos = async (query) => {
  try {
    const { data } = await axios.get(`${API_BASE_URL}/videos/search`, {
      headers: getAuthHeaders(),
      params: { query }
    });
    return data;
  } catch (error) {
    console.error("Failed to search videos:", error);
    return [];
  }
};

// ================= Category Endpoints ================= //

export const fetchCategories = async () => {
  try {
    const { data } = await axios.get(`${API_BASE_URL}/categories/`, {
      headers: getAuthHeaders(),
    });
    return data;
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return [];
  }
};

export const getCategoryById = async (categoryId) => {
  try {
    const { data } = await axios.get(`${API_BASE_URL}/categories/${categoryId}`, {
      headers: getAuthHeaders(),
    });
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || "Failed to fetch category");
  }
};

export const getCategoryByName = async (name) => {
  try {
    const { data } = await axios.get(`${API_BASE_URL}/categories/by-name/${name}`, {
      headers: getAuthHeaders(),
    });
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || "Failed to fetch category");
  }
};

export const createCategory = async (categoryData) => {
  try {
    const { data } = await axios.post(`${API_BASE_URL}/categories/`, categoryData, {
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
    throw error.response?.data?.detail || "Failed to update category"
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

export const getCategoryVideoCounts = async () => {
  try {
    const { data } = await axios.get(`${API_BASE_URL}/categories/video-counts/`, {
      headers: getAuthHeaders(),
    });
    return data;
  } catch (error) {
    console.error("Failed to fetch category video counts:", error);
    return [];
  }
};

// ================= Comment Endpoints ================= //

export const fetchVideoComments = async (videoId) => {
  try {
    const { data } = await axios.get(`${API_BASE_URL}/comments/${videoId}`, {
      headers: getAuthHeaders(),
    });
    return data;
  } catch (error) {
    return [];
  }
};

export const addComment = async (videoId, content) => {
  try {
    const { data } = await axios.post(
      `${API_BASE_URL}/comments/`,
      { video_id: videoId, content },
      { headers: getAuthHeaders() }
    );
    return data;
  } catch (error) {
    throw error.response?.data?.detail || "Failed to add comment";
  }
};

export const updateComment = async (commentId, content) => {
  try {
    const { data } = await axios.put(
      `${API_BASE_URL}/comments/${commentId}`,
      { content },
      { headers: getAuthHeaders() }
    );
    return data;
  } catch (error) {
    throw error.response?.data?.detail || "Failed to update comment";
  }
};

export const deleteComment = async (commentId) => {
  try {
    await axios.delete(`${API_BASE_URL}/comments/${commentId}`, {
      headers: getAuthHeaders(),
    });
  } catch (error) {
    throw error.response?.data?.detail || "Failed to delete comment";
  }
};

// ================= Like Endpoints ================= //

export const likeVideo = async (videoId) => {
  try {
    const { data } = await axios.post(
      `${API_BASE_URL}/likes/`,
      { video_id: videoId },
      { headers: getAuthHeaders() }
    );
    return data;
  } catch (error) {
    throw error.response?.data?.detail || "Failed to like video";
  }
};

export const unlikeVideo = async (videoId) => {
  try {
    await axios.delete(`${API_BASE_URL}/likes/`, {
      headers: getAuthHeaders(),
      data: { video_id: videoId }
    });
  } catch (error) {
    throw error.response?.data?.detail || "Failed to unlike video";
  }
};

export const getLikeStatus = async (videoId) => {
  try {
    const { data } = await axios.get(`${API_BASE_URL}/likes/${videoId}/status`, {
      headers: getAuthHeaders(),
    });
    return data;
  } catch (error) {
    console.error("Failed to fetch like status:", error);
    return { liked: false };
  }
};

export const getLikeCount = async (videoId) => {
  try {
    const { data } = await axios.get(`${API_BASE_URL}/likes/${videoId}/count`, {
      headers: getAuthHeaders(),
    });
    return data;
  } catch (error) {
    console.error("Failed to fetch like count:", error);
    return { count: 0 };
  }
};

// ================= News Endpoints ================= //

export const createNews = async (newsData, imageFile) => {
  try {
    if (!imageFile) {
      throw new Error("Image file is required");
    }

    const formData = new FormData();
    formData.append("title", newsData.title);
    formData.append("content", newsData.content);
    formData.append("is_published", newsData.is_published || false);
    formData.append("image", imageFile);

    const { data } = await axios.post(`${API_BASE_URL}/news/`, formData, {
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  } catch (error) {
    const errorMsg = error.response?.data?.detail || 
                  error.response?.data?.message || 
                   "Failed to create news";
    throw new Error(errorMsg);
  }
};

export const updateNews = async (newsId, newsData, imageFile) => {
  try {
    const formData = new FormData();
    if (newsData.title) formData.append("title", newsData.title);
    if (newsData.content) formData.append("content", newsData.content);
    if (newsData.is_published !== undefined) formData.append("is_published", newsData.is_published);
    if (imageFile) formData.append("image", imageFile);

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
    const { data } = await axios.get(`${API_BASE_URL}/news/search/`, {
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
    if (!imageFile) {
      throw new Error("Image file is required");
    }

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

// ================= Subscription Endpoints ================= //

export const fetchSubscriptionPlans = async () => {
  try {
    const { data } = await axios.get(`${API_BASE_URL}/subscriptions/plans`, {
      headers: getAuthHeaders(),
    });
    return data;
  } catch (error) {
    throw error.response?.data?.detail || "Failed to fetch subscription plans";
  }
};

export const getSubscriptionPlanById = async (planId) => {
  try {
    const { data } = await axios.get(`${API_BASE_URL}/subscriptions/plans/${planId}`, {
      headers: getAuthHeaders(),
    });
    return data;
  } catch (error) {
    throw error.response?.data?.detail || "Failed to fetch subscription plan";
  }
};

export const initiatePayment = async (planId) => {
  try {
    const { data } = await axios.post(
      `${API_BASE_URL}/subscriptions/initiate-payment`,
      { plan_id: planId },
      { headers: getAuthHeaders() }
    );
    return data;
  } catch (error) {
    throw error.response?.data?.detail || "Payment initiation failed";
  }
};

export const verifyPayment = async (transactionReference) => {
  try {
    const { data } = await axios.get(
      `${API_BASE_URL}/subscriptions/verify-payment/${transactionReference}`,
      { headers: getAuthHeaders() }
    );
    return data;
  } catch (error) {
    throw error.response?.data?.detail || "Payment verification failed";
  }
};

export const getSubscriptionStatus = async () => {
  try {
    const { data } = await axios.get(`${API_BASE_URL}/subscriptions/status`, {
      headers: getAuthHeaders(),
    });
    return data;
  } catch (error) {
    throw error.response?.data?.detail || "Failed to get subscription status";
  }
};

// Add axios request interceptor to handle token refresh
axios.interceptors.request.use(
  async (config) => {
    const token = Cookies.get("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add axios response interceptor to handle 401 errors
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        await refreshToken();
        const newToken = Cookies.get("accessToken");
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axios(originalRequest);
      } catch (refreshError) {
        logout();
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);