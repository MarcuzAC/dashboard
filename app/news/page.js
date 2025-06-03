// NewsPage.jsx
import { useState, useEffect } from 'react';
import { 
  fetchAllNews, 
  fetchNewsById, 
  createNewsArticle, 
  updateNewsArticle, 
  deleteNewsArticle,
  uploadNewsImage
} from '../utils/api';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

export default function NewsPage() {
  const router = useRouter();
  const [news, setNews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    is_published: true,
    image: null
  });
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    const loadNews = async () => {
      try {
        const newsData = await fetchAllNews();
        setNews(newsData.items || newsData);
      } catch (error) {
        toast.error('Failed to load news articles');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    loadNews();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      if (editingId) {
        await updateNewsArticle(editingId, formData, formData.image);
        toast.success('News article updated successfully');
      } else {
        await createNewsArticle(formData, formData.image);
        toast.success('News article created successfully');
      }

      const newsData = await fetchAllNews();
      setNews(newsData.items || newsData);
      resetForm();
    } catch (error) {
      toast.error(error.message || 'Operation failed');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (article) => {
    setEditingId(article.id);
    setFormData({
      title: article.title,
      content: article.content,
      is_published: article.is_published,
      image: null
    });
    setPreviewImage(article.image_url);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (news_id) => {
    if (!confirm('Are you sure you want to delete this news article?')) return
    
    try {
      setIsLoading(true);
      await deleteNewsArticle(news_id);
      toast.success('News article deleted successfully');
      setNews(news.filter(item => item.id !== news_id));
    } catch (error) {
      toast.error('Failed to delete news article');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      is_published: true,
      image: null
    });
    setPreviewImage(null);
    setEditingId(null);
    setIsCreating(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">News Management</h1>
      
      {/* Form */}
      {(isCreating || editingId) && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? 'Edit News Article' : 'Create New Article'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title*</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content*</label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_published"
                name="is_published"
                checked={formData.is_published}
                onChange={(e) => setFormData({...formData, is_published: e.target.checked})}
                className="rounded"
              />
              <label htmlFor="is_published" className="text-sm font-medium text-gray-700">
                Publish this article
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {previewImage ? 'Change Image' : 'Upload Image (Optional)'}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {previewImage && (
                <div className="mt-2">
                  <img 
                    src={previewImage} 
                    alt="Preview" 
                    className="h-32 object-cover rounded"
                  />
                </div>
              )}
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-400"
              >
                {isLoading ? 'Processing...' : editingId ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* News List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">All News Articles</h2>
          {!isCreating && !editingId && (
            <button 
              onClick={() => setIsCreating(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Create New
            </button>
          )}
        </div>
        
        {isLoading && !news.length ? (
          <div className="text-center py-8">Loading news articles...</div>
        ) : news.length === 0 ? (
          <div className="text-center py-8">No news articles found</div>
        ) : (
          <div className="space-y-6">
            {news.map(article => (
              <div key={article.id} className="border-b border-gray-200 pb-6 last:border-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium">{article.title}</h3>
                    <p className="text-gray-500 text-sm mt-1">
                      {new Date(article.created_at).toLocaleDateString()} • 
                      Status: {article.is_published ? 'Published' : 'Draft'}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(article)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(article.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                
                {article.image_url && (
                  <img 
                    src={article.image_url} 
                    alt={article.title}
                    className="mt-3 h-48 w-full object-cover rounded"
                  />
                )}
                
                <p className="mt-3 text-gray-700">{article.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}