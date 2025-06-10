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

// ================= Notes Endpoints ================= //

/**
 * Create a new note
 * @param {Object} noteData - Note data including title, content, is_published
 * @param {File} [image] - Optional image file
 */
export const createNews = async (newsData, image = null) => {
  try {
    const formData = new FormData();
    formData.append('news_data', JSON.stringify(newsData));
    if (image) {
      formData.append('image', image);
    }

    const { data } = await axios.post(`${API_BASE_URL}/news/`, formData, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  } catch (error) {
    throw error.response?.data?.detail || "Failed to create note";
  }
};
/**
 * Fetch a single news item by ID
 * @param {string} news_id - UUID of the news item
 */
export const fetchNewsItem = async (news_id) => {
  try {
    const { data } = await axios.get(`${API_BASE_URL}/news/${news_id}`, {
      headers: getAuthHeaders(),
    });
    return data;
  } catch (error) {
    if (error.response?.status === 404) {
      return null;
    }
    throw error.response?.data?.detail || "Failed to fetch news item";
  }
};

/**
 * Get paginated list of notes
 * @param {number} page - Page number (default: 1)
 * @param {number} size - Items per page (default: 10)
 * @param {boolean} publishedOnly - Only return published notes (default: true)
 */
export const fetchNewsList = async (page = 1, size = 10, publishedOnly = true) => {
  try {
    const { data } = await axios.get(`${API_BASE_URL}/news/`, {
      headers: getAuthHeaders(),
      params: { page, size, published_only: publishedOnly },
    });
    return data;
  } catch (error) {
    console.error("Failed to fetch notes list:", error);
    return { items: [], total: 0, page, size };
  }
};

/**
 * Get latest notes
 * @param {number} limit - Number of notes to return (default: 5)
 */
export const getLatestNews = async (limit = 5) => {
  try {
    const { data } = await axios.get(`${API_BASE_URL}/news/latest`, {
      headers: getAuthHeaders(),
      params: { limit },
    });
    return data;
  } catch (error) {
    console.error("Failed to fetch latest notes:", error);
    return [];
  }
};

/**
 * Get single note by ID
 * @param {string} note_id - UUID of the note
 */
export const getNewsById = async (news_id) => {
  try {
    const { data } = await axios.get(`${API_BASE_URL}/notes/${news_id}`, {
      headers: getAuthHeaders(),
    });
    return data;
  } catch (error) {
    if (error.response?.status === 404) {
      return null;
    }
    throw error.response?.data?.detail || "Failed to fetch note";
  }
};

/**
 * Update a note
 * @param {string} note_id - UUID of the note
 * @param {Object} noteData - Updated note data
 * @param {File} [image] - Optional new image file
 */
export const updateNews = async (news_id, noteData, image = null) => {
  try {
    const formData = new FormData();
    formData.append('note_data', JSON.stringify(noteData));
    if (image) {
      formData.append('image', image);
    }

    const { data } = await axios.put(`${API_BASE_URL}/news/${news_id}`, formData, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  } catch (error) {
    throw error.response?.data?.detail || "Failed to update note";
  }
};

/**
 * Delete a note
 * @param {string} note_id - UUID of the note
 */
export const deleteNews = async (note_id) => {
  try {
    await axios.delete(`${API_BASE_URL}/news/${news_id}`, {
      headers: getAuthHeaders(),
    });
  } catch (error) {
    throw error.response?.data?.detail || "Failed to delete note";
  }
};

/**
 * Upload an image for notes
 * @param {File} file - Image file to upload
 */
export const uploadNewsImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await axios.post(`${API_BASE_URL}/news/upload-image`, formData, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'multipart/form-data',
      },
    });
    return data.url;
  } catch (error) {
    throw error.response?.data?.detail || "Failed to upload image";
  }
};

/**
 * Search notes by query
 * @param {string} query - Search keyword(s)
 * @param {number} page - Page number (default: 1)
 * @param {number} size - Items per page (default: 10)
 */
export const searchNews = async (query, page = 1, size = 10) => {
  try {
    const { data } = await axios.get(`${API_BASE_URL}/news/search`, {
      headers: getAuthHeaders(),
      params: { query, page, size },
    });
    return data;
  } catch (error) {
    console.error("Failed to search notes:", error);
    return { items: [], total: 0, page, size };
  }
};

// ================= Existing Video Endpoints ================= //

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

// ================= Category Endpoints ================= //

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

// ================= User Endpoints ================= //

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