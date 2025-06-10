'use client'
import { useState, useEffect } from 'react'
import { 
  fetchNewsList,
  searchNews,
  fetchNewsItem, 
  createNews, 
  updateNews, 
  deleteNews,
  uploadNewsImage,
  fetchLatestNews
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
    is_published: true,
    image: null
  })
  const [previewImage, setPreviewImage] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [pagination, setPagination] = useState({
    page: 1,
    size: 10,
    total: 0
  })

  // Fetch news articles with pagination
  const loadNews = async (page = pagination.page, size = pagination.size) => {
    try {
      setIsLoading(true)
      let response
      
      if (searchQuery) {
        response = await searchNews(searchQuery, page, size)
      } else {
        response = await fetchNewsList(page, size)
      }

      setNews(response.items)
      setPagination(prev => ({
        ...prev,
        page,
        total: response.total
      }))
    } catch (error) {
      toast.error(error.message || 'Failed to load news articles')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  // Initial load and when search changes
  useEffect(() => {
    loadNews(1) // Reset to page 1 when search changes
  }, [searchQuery])

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }))
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
        is_published: formData.is_published,
        ...(imageUrl && { image_url: imageUrl }) 
      }

      if (editingId) {
        // Update existing article
        await updateNews(editingId, newsPayload)
        toast.success('News article updated successfully')
      } else {
        // Create new article
        await createNews(newsPayload)
        toast.success('News article created successfully')
      }

      // Refresh news list
      loadNews()
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
      const fullArticle = await fetchNewsItem(article.news_id)
      
      setEditingId(article.news_id)
      setFormData({
        title: fullArticle.title,
        content: fullArticle.content,
        is_published: fullArticle.is_published,
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
  const handleDelete = async (news_id) => {
    if (!confirm('Are you sure you want to delete this news article?')) return
    
    try {
      setIsLoading(true)
      await deleteNews(news_id)
      toast.success('News article deleted successfully')
      loadNews() // Refresh the list
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
      is_published: true,
      image: null
    })
    setPreviewImage(null)
    setEditingId(null)
    setIsCreating(false)
  }

  // Handle page change
  const handlePageChange = (newPage) => {
    loadNews(newPage)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">News Management</h1>
      
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search news..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          )}
        </div>
      </div>
      
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
              disabled={isLoading}
            >
              Create New
            </button>
          )}
        </div>

        {(isCreating || editingId) && (
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

            <div className="flex items-center">
              <input
                type="checkbox"
                name="is_published"
                checked={formData.is_published}
                onChange={handleChange}
                id="publish-checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="publish-checkbox" className="ml-2 block text-sm text-gray-700">
                Publish immediately
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
                disabled={isLoading}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* News List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">All News Articles</h2>
          <div className="text-sm text-gray-500">
            Showing {(pagination.page - 1) * pagination.size + 1}-
            {Math.min(pagination.page * pagination.size, pagination.total)} of {pagination.total}
          </div>
        </div>
        
        {isLoading && !news.length ? (
          <div className="text-center py-8">Loading news articles...</div>
        ) : news.length === 0 ? (
          <div className="text-center py-8">
            {searchQuery ? 'No matching articles found' : 'No news articles found'}
          </div>
        ) : (
          <>
            <div className="space-y-6 mb-6">
              {news.map(article => (
                <div key={article.news_id} className="border-b border-gray-200 pb-6 last:border-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium">{article.title}</h3>
                      <p className="text-gray-500 text-sm mt-1">
                        {new Date(article.created_at).toLocaleDateString()} • 
                        <span className={`ml-2 px-2 py-1 rounded text-xs ${
                          article.is_published 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {article.is_published ? 'Published' : 'Draft'}
                        </span>
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(article)}
                        className="text-blue-600 hover:text-blue-800"
                        disabled={isLoading}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(article.news_id)}
                        className="text-red-600 hover:text-red-800"
                        disabled={isLoading}
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
                  
                  <p className="mt-3 text-gray-700 line-clamp-3">
                    {article.content}
                  </p>
                  
                  <div className="mt-3 flex justify-between items-center">
                    <Link 
                      href={`/news/${article.news_id}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Read more →
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <Pagination
              currentPage={pagination.page}
              totalItems={pagination.total}
              itemsPerPage={pagination.size}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>
    </div>
  )
}