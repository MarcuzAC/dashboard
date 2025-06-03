'use client'
import { useState, useEffect } from 'react'
import { 
  getNewsList,
  getNewsById, 
  createNews, 
  updateNews, 
  deleteNews,
  uploadNewsImage
} from '../utils/api'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import Image from 'next/image'

export default function NewsPage() {
  const router = useRouter()
  const [news, setNews] = useState([])
  const [pagination, setPagination] = useState({
    page: 1,
    size: 10,
    total: 0
  })
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
  const [publishedOnly, setPublishedOnly] = useState(true)

  // Fetch news articles with pagination
  useEffect(() => {
    const loadNews = async () => {
      try {
        setIsLoading(true)
        const response = await getNewsList(
          pagination.page, 
          pagination.size, 
          publishedOnly
        )
        setNews(response.items)
        setPagination(prev => ({
          ...prev,
          total: response.total
        }))
      } catch (error) {
        toast.error('Failed to load news articles')
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }
    loadNews()
  }, [pagination.page, pagination.size, publishedOnly])

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
      // Validate file type and size
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file')
        return
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size should be less than 5MB')
        return
      }

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
      
      // Prepare news payload
      const newsPayload = {
        title: formData.title,
        content: formData.content,
        is_published: formData.is_published
      }

      if (editingId) {
        // For updates, include image only if changed
        if (formData.image) {
          const uploadResponse = await uploadNewsImage(formData.image)
          newsPayload.image_url = uploadResponse.url
        }
        await updateNews(editingId, newsPayload)
        toast.success('News article updated successfully')
      } else {
        // For new articles, require image
        if (!formData.image) {
          toast.error('Please upload an image for the news article')
          return
        }
        const uploadResponse = await uploadNewsImage(formData.image)
        await createNews({
          ...newsPayload,
          image_url: uploadResponse.url
        })
        toast.success('News article created successfully')
      }

      // Refresh news list and reset form
      const response = await getNewsList(pagination.page, pagination.size, publishedOnly)
      setNews(response.items)
      resetForm()
    } catch (error) {
      toast.error(error.message || 'Operation failed')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  // Edit an article
  const handleEdit = async (id) => {
    try {
      setIsLoading(true)
      const article = await getNewsById(id)
      setEditingId(article.id)
      setFormData({
        title: article.title,
        content: article.content,
        is_published: article.is_published,
        image: null
      })
      setPreviewImage(article.image_url)
      setIsCreating(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (error) {
      toast.error('Failed to load article for editing')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  // Delete an article
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this news article?')) return
    
    try {
      setIsLoading(true)
      await deleteNews(id)
      toast.success('News article deleted successfully')
      
      // Check if we need to go to previous page
      if (news.length === 1 && pagination.page > 1) {
        setPagination(prev => ({ ...prev, page: prev.page - 1 }))
      } else {
        const response = await getNewsList(pagination.page, pagination.size, publishedOnly)
        setNews(response.items)
        setPagination(prev => ({ ...prev, total: response.total }))
      }
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

  // Handle pagination
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">News Management</h1>
      
      {/* Create/Edit Form */}
      {(isCreating || editingId) && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? 'Edit News Article' : 'Create New Article'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="is_published"
                checked={formData.is_published}
                onChange={handleChange}
                id="is_published"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={isLoading}
              />
              <label htmlFor="is_published" className="ml-2 block text-sm text-gray-700">
                Publish immediately
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {editingId ? 'Update Image (optional)' : 'Upload Image *'}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                disabled={isLoading}
              />
              {previewImage && (
                <div className="mt-2">
                  <Image 
                    src={previewImage} 
                    alt="Preview" 
                    width={200}
                    height={150}
                    className="h-32 w-auto object-contain rounded"
                  />
                </div>
              )}
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Processing...' : editingId ? 'Update Article' : 'Create Article'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* News List Controls */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">News Articles</h2>
        <div className="flex space-x-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="published-only"
              checked={publishedOnly}
              onChange={() => setPublishedOnly(!publishedOnly)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="published-only" className="ml-2 text-sm text-gray-700">
              Published Only
            </label>
          </div>
          <button 
            onClick={() => setIsCreating(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Create New
          </button>
        </div>
      </div>

      {/* News List */}
      <div className="bg-white rounded-lg shadow-md p-6">
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
                    <h3 className="text-lg font-medium">
                      {article.title}
                      {!article.is_published && (
                        <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                          Draft
                        </span>
                      )}
                    </h3>
                    <p className="text-gray-500 text-sm mt-1">
                      {new Date(article.created_at).toLocaleDateString()} • 
                      Last updated: {new Date(article.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(article.id)}
                      className="text-blue-600 hover:text-blue-800 disabled:text-blue-300"
                      disabled={isLoading}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(article.id)}
                      className="text-red-600 hover:text-red-800 disabled:text-red-300"
                      disabled={isLoading}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                
                {article.image_url && (
                  <div className="mt-3">
                    <Image 
                      src={article.image_url} 
                      alt={article.title}
                      width={800}
                      height={450}
                      className="h-48 w-full object-cover rounded"
                    />
                  </div>
                )}
                
                <p className="mt-3 text-gray-700 line-clamp-3">
                  {article.content}
                </p>
                
                <div className="mt-4 flex justify-between items-center">
                  <Link 
                    href={`/news/${article.id}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Read more →
                  </Link>
                  {!article.is_published && (
                    <span className="text-sm text-gray-500">
                      Visible to admins only
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.total > pagination.size && (
          <div className="flex justify-center mt-6">
            <nav className="inline-flex rounded-md shadow">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-3 py-1 rounded-l-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-3 py-1 border-t border-b border-gray-300 bg-white text-gray-700">
                Page {pagination.page} of {Math.ceil(pagination.total / pagination.size)}
              </span>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page * pagination.size >= pagination.total}
                className="px-3 py-1 rounded-r-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  )
}