import axios from "axios";
import Cookies from "js-cookie";

const API_BASE_URL = "https://backend-1-6tpq.onrender.com"; 

// Function to get auth headers with token
const getAuthHeaders = () => {
  const token = Cookies.get("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Login Function
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

    // Store token in cookies (expires in 7 days)
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
// Fetch Dashboard Stats
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

// Fetch Recent Videos
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

// Fetch All Videos
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



// Upload Video
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
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to update video:", error.response ? error.response.data : error.message);
    throw error;
  }
};

  
// Delete Video
export const deleteVideo = async (videoId) => {
  try {
    await axios.delete(`${API_BASE_URL}/videos/${videoId}`, {
      headers: getAuthHeaders(),
    });
  } catch (error) {
    throw error.response?.data?.detail || "Failed to delete video";
  }
};

// Fetch Categories
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

// Create Category
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

// Update Category
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

// Delete Category
export const deleteCategory = async (categoryId) => {
  try {
    await axios.delete(`${API_BASE_URL}/categories/${categoryId}`, {
      headers: getAuthHeaders(),
    });
  } catch (error) {
    throw error.response?.data?.detail || "Failed to delete category";
  }
};

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
// Fetch latest news articles (for dashboard)
export const fetchLatestNews = async (limit = 5) => {
  try {
    const { data } = await axios.get(`${API_BASE_URL}/latest`, {
      headers: getAuthHeaders(),
      params: {
        size: limit,
        published_only: true
      }
    });
    
    // If the API returns paginated response (assuming NewsListResponse format)
    if (data && data.items) {
      return data.items;
    }
    
    // If API returns array directly
    return data || [];
  } catch (error) {
    console.error("Failed to fetch latest news:", error);
    return [];
  }
};

// Update User
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

// Delete User
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

// News API
export const fetchAllNews = async (page = 1, size = 10, publishedOnly = true) => {
  try {
    const { data } = await axios.get(`${API_BASE_URL}/news`, {
      headers: getAuthHeaders(),
      params: {
        page,
        size,
        published_only: publishedOnly
      }
    });
    return data;
  } catch (error) {
    console.error('Failed to fetch news:', error);
    return { items: [], total: 0, page, size };
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
    console.error('Failed to fetch latest news:', error);
    return [];
  }
};

export const fetchNewsById = async (news_id) => {
  try {
    const { data } = await axios.get(`${API_BASE_URL}/news/${news_id}`, {
      headers: getAuthHeaders()
    });
    return data;
  } catch (error) {
    console.error('Failed to fetch news article:', error);
    throw error.response?.data?.detail || 'News article not found';
  }
};

export const createNewsArticle = async (newsData, imageFile = null) => {
  try {
    const formData = new FormData();
    formData.append('news_data', JSON.stringify({
      title: newsData.title,
      content: newsData.content,
      is_published: newsData.is_published || true
    }));
    
    if (imageFile) {
      formData.append('image', imageFile);
    }

    const { data } = await axios.post(`${API_BASE_URL}/news`, formData, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'multipart/form-data'
      }
    });
    return data;
  } catch (error) {
    console.error('Failed to create news article:', error);
    throw error.response?.data?.detail || 'Failed to create news article';
  }
};

export const updateNewsArticle = async (news_id, newsData, imageFile = null) => {
  try {
    const formData = new FormData();
    formData.append('news_data', JSON.stringify({
      title: newsData.title,
      content: newsData.content,
      is_published: newsData.is_published
    }));
    
    if (imageFile) {
      formData.append('image', imageFile);
    }

    const { data } = await axios.put(`${API_BASE_URL}/news/${news_id}`, formData, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'multipart/form-data'
      }
    });
    return data;
  } catch (error) {
    console.error('Failed to update news article:', error);
    throw error.response?.data?.detail || 'Failed to update news article';
  }
};

export const deleteNewsArticle = async (news_id) => {
  try {
    await axios.delete(`${API_BASE_URL}/news/${news_id}`, {
      headers: getAuthHeaders()
    });
  } catch (error) {
    console.error('Failed to delete news article:', error);
    throw error.response?.data?.detail || 'Failed to delete news article';
  }
};

export const uploadNewsImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await axios.post(`${API_BASE_URL}/news/upload-image`, formData, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'multipart/form-data'
      }
    });
    return data;
  } catch (error) {
    console.error('Failed to upload news image:', error);
    throw error.response?.data?.detail || 'Failed to upload image';
  }
};