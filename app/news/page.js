'use client'
import { useState, useEffect } from 'react'
import { 
  fetchAllNews, 
  fetchNewsById, 
  createNewsArticle, 
  updateNewsArticle, 
  deleteNewsArticle,
  uploadNewsImage
} from '../utils/api'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'

export default function NewsPage() {
  const router = useRouter()
  const [news, setNews] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image: null
  })
  const [previewImage, setPreviewImage] = useState(null)

  // Fetch all news articles
  useEffect(() => {
    const loadNews = async () => {
      try {
        const newsData = await fetchAllNews()
        setNews(newsData)
      } catch (error) {
        toast.error(error.message || 'Failed to load news articles')
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }
    loadNews()
  }, [])

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData(prev => ({ ...prev, image: file }))
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  // Submit form (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      setIsLoading(true)
      
      let imageUrl = null
      if (formData.image) {
        try {
          const uploadResponse = await uploadNewsImage(formData.image)
          imageUrl = uploadResponse.url 
        } catch (error) {
          toast.error(error.message || 'Failed to upload image')
          return
        }
      }

      const newsPayload = {
        title: formData.title,
        content: formData.content,
        ...(imageUrl && { image_url: imageUrl }) 
      }

      if (editingId) {
        // Update existing article
        await updateNewsArticle(editingId, newsPayload)
        toast.success('News article updated successfully')
      } else {
        // Create new article
        await createNewsArticle(newsPayload)
        toast.success('News article created successfully')
      }

      // Refresh news list
      const newsData = await fetchAllNews()
      setNews(newsData)
      resetForm()
    } catch (error) {
      toast.error(error.message || 'Operation failed')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  // Edit an article
  const handleEdit = async (article) => {
    try {
      setIsLoading(true)
      // Fetch full article details in case we need more data
      const fullArticle = await fetchNewsById(article.id)
      
      setEditingId(article.id)
      setFormData({
        title: fullArticle.title,
        content: fullArticle.content,
        image: null
      })
      setPreviewImage(fullArticle.image_url || null)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (error) {
      toast.error(error.message || 'Failed to load article details')
    } finally {
      setIsLoading(false)
    }
  }

  // Delete an article
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this news article?')) return
    
    try {
      setIsLoading(true)
      await deleteNewsArticle(id)
      toast.success('News article deleted successfully')
      setNews(news.filter(item => item.id !== id))
    } catch (error) {
      toast.error(error.message || 'Failed to delete news article')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      image: null
    })
    setPreviewImage(null)
    setEditingId(null)
    setIsCreating(false)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">News Management</h1>
      
      {/* Create/Edit Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {editingId ? 'Edit News Article' : isCreating ? 'Create New Article' : 'News Articles'}
          </h2>
          {!isCreating && !editingId && (
            <button 
              onClick={() => setIsCreating(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Create New
            </button>
          )}
        </div>

        {(isCreating || editingId) && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {previewImage ? 'Change Image' : 'Upload Image'}
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
        )}
      </div>

      {/* News List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">All News Articles</h2>
        
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
                      {new Date(article.created_at).toLocaleDateString()}
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
                
                <Link 
                  href={`/news/${article.id}`}
                  className="inline-block mt-3 text-blue-600 hover:text-blue-800"
                >
                  Read more →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}