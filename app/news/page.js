'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import {
  getNewsList,
  searchNews,
  getNewsById,
  getLatestNews,
  createNews,
  updateNews,
  deleteNews,
} from '../utils/api'

export default function NewsManagementPage() {
  const router = useRouter()
  const [state, setState] = useState({
    news: [],
    latestNews: [],
    isLoading: true,
    isLoadingLatest: false,
    isSubmitting: false, // Changed from isCreating to isSubmitting
    editingId: null,
    searchQuery: '',
    pagination: {
      page: 1,
      size: 10,
      total: 0
    }
  })

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    is_published: true,
    image: null
  })
  const [previewImage, setPreviewImage] = useState(null)
  const [formErrors, setFormErrors] = useState({}) // Added for form validation feedback

  const validateArticle = (article) => {
    return article && article.id && article.title && article.content;
  }

  const validateForm = () => {
    const errors = {}
    if (!formData.title.trim()) errors.title = 'Title is required'
    if (formData.title.length > 200) errors.title = 'Title must be 200 characters or less'
    if (!formData.content.trim()) errors.content = 'Content is required'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const loadLatestNews = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoadingLatest: true }))
      const data = await getLatestNews()
      setState(prev => ({ 
        ...prev, 
        latestNews: Array.isArray(data) ? data.filter(validateArticle) : [],
        isLoadingLatest: false 
      }))
    } catch (error) {
      console.error('Load latest news error:', error)
      if (error.message.includes('subscription')) {
        toast.error('Please renew your subscription')
        router.push('/subscribe')
      } else {
        toast.error(error.message || 'Failed to load latest news')
      }
      setState(prev => ({ 
        ...prev, 
        latestNews: [],
        isLoadingLatest: false 
      }))
    }
  }, [router])

  const loadNews = useCallback(async (page = state.pagination.page, size = state.pagination.size) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }))
      const response = state.searchQuery 
        ? await searchNews(state.searchQuery, page, size)
        : await getNewsList(page, size)
      setState(prev => ({
        ...prev,
        news: Array.isArray(response?.items) ? response.items.filter(validateArticle) : [],
        pagination: {
          ...prev.pagination,
          page,
          total: Number.isInteger(response?.total) ? response.total : 0
        },
        isLoading: false
      }))
    } catch (error) {
      console.error('Load news error:', error)
      if (error.message.includes('subscription')) {
        toast.error('Please renew your subscription')
        router.push('/subscribe')
      } else {
        toast.error(error.message || 'Failed to load news articles')
      }
      setState(prev => ({ ...prev, news: [], isLoading: false }))
    }
  }, [state.searchQuery, state.pagination.size, router])

  useEffect(() => {
    const initializeData = async () => {
      await Promise.all([loadLatestNews(), loadNews(1)])
    }
    initializeData()
  }, [loadLatestNews, loadNews])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }))
    // Clear error for the field being edited
    setFormErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Only image files are allowed')
        setFormErrors(prev => ({ ...prev, image: 'Only image files are allowed' }))
        return
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size must be less than 5MB')
        setFormErrors(prev => ({ ...prev, image: 'Image size must be less than 5MB' }))
        return
      }
      setFormData(prev => ({ ...prev, image: file }))
      setFormErrors(prev => ({ ...prev, image: '' }))
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) {
      toast.error('Please fix form errors')
      return
    }
    try {
      setState(prev => ({ ...prev, isSubmitting: true }))
      const newsPayload = {
        title: formData.title,
        content: formData.content,
        is_published: formData.is_published
      }
      if (state.editingId) {
        await updateNews(state.editingId, newsPayload, formData.image)
        toast.success('News article updated successfully')
      } else {
        await createNews(newsPayload, formData.image)
        toast.success('News article created successfully')
      }
      await Promise.all([loadNews(), loadLatestNews()])
      resetForm()
    } catch (error) {
      console.error('Submit error:', error)
      if (error.message.includes('subscription')) {
        toast.error('Please renew your subscription')
        router.push('/subscribe')
      } else if (error.message.includes('log in') || error.message.includes('Unauthorized')) {
        toast.error('Please log in to create news')
        router.push('/login')
      } else {
        toast.error(error.message || 'Operation failed')
      }
    } finally {
      setState(prev => ({ ...prev, isSubmitting: false }))
    }
  }

  const handleEdit = async (article) => {
    try {
      setState(prev => ({ ...prev, isSubmitting: true }))
      const fullArticle = await getNewsById(article.id)
      setState(prev => ({ ...prev, editingId: article.id }))
      setFormData({
        title: fullArticle?.title || '',
        content: fullArticle?.content || '',
        is_published: fullArticle?.is_published ?? true,
        image: null
      })
      setPreviewImage(fullArticle?.image_url || null)
      setFormErrors({})
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (error) {
      console.error('Edit error:', error)
      toast.error(error.message || 'Failed to load article details')
    } finally {
      setState(prev => ({ ...prev, isSubmitting: false }))
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this news article?')) return
    try {
      setState(prev => ({ ...prev, isSubmitting: true }))
      await deleteNews(id)
      toast.success('News article deleted successfully')
      await Promise.all([loadNews(), loadLatestNews()])
    } catch (error) {
      console.error('Delete error:', error)
      if (error.message.includes('Unauthorized')) {
        toast.error('Please log in to delete news')
        router.push('/login')
      } else {
        toast.error(error.message || 'Failed to delete news article')
      }
    } finally {
      setState(prev => ({ ...prev, isSubmitting: false }))
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      is_published: true,
      image: null
    })
    setPreviewImage(null)
    setFormErrors({})
    setState(prev => ({ ...prev, editingId: null, isCreating: false }))
  }

  const handlePageChange = (newPage) => {
    loadNews(newPage)
  }

  const handleSearchChange = (e) => {
    const query = e.target.value
    setState(prev => ({ ...prev, searchQuery: query }))
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (state.searchQuery.trim() !== '') {
        loadNews(1)
      } else if (state.searchQuery === '' && state.news.length > 0) {
        loadNews(1)
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [state.searchQuery, loadNews, state.news.length])

  const {
    news,
    latestNews,
    isLoading,
    isLoadingLatest,
    isSubmitting,
    editingId,
    searchQuery,
    pagination
  } = state

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-3xl font-bold mb-8">News Management</h1>
      
      {!isLoadingLatest && latestNews?.length > 0 && (
        <section className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Latest News</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {latestNews.map(article => (
              <article key={article.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                {article.image_url && (
                  <img 
                    src={article.image_url} 
                    alt={article.title}
                    className="w-full h-48 object-cover"
                    loading="lazy"
                  />
                )}
                <div className="p-4">
                  <h3 className="font-medium text-lg mb-2">{article.title}</h3>
                  <p className="text-gray-500 text-sm mb-3">
                    {new Date(article.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-gray-700 line-clamp-2 mb-4">
                    {article.content}
                  </p>
                  <Link 
                    href={`/news/${article.id}`}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    prefetch={false}
                  >
                    Read more →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <div className="mb-6">
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="Search news..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Search news articles"
          />
          {searchQuery && (
            <button
              onClick={() => setState(prev => ({ ...prev, searchQuery: '' }))}
              className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
              aria-label="Clear search input"
            >
              ✕
            </button>
          )}
        </div>
      </div>
      
      <section className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {editingId ? 'Edit News Article' : 'Create New Article'}
          </h2>
          {!editingId && (
            <button 
              onClick={() => setState(prev => ({ ...prev, isCreating: true }))}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={isSubmitting}
              aria-label="Create new article"
            >
              Create New
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title* <span id="title-required" className="sr-only">Required</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${formErrors.title ? 'border-red-500' : 'border-gray-300'}`}
              required
              maxLength={200}
              aria-describedby="title-required title-error"
            />
            {formErrors.title && (
              <p id="title-error" className="mt-1 text-sm text-red-500">{formErrors.title}</p>
            )}
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              Content* <span id="content-required" className="sr-only">Required</span>
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows={6}
              className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${formErrors.content ? 'border-red-500' : 'border-gray-300'}`}
              required
              aria-describedby="content-required content-error"
            />
            {formErrors.content && (
              <p id="content-error" className="mt-1 text-sm text-red-500">{formErrors.content}</p>
            )}
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="publish-checkbox"
              name="is_published"
              checked={formData.is_published}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              aria-label="Publish immediately"
            />
            <label htmlFor="publish-checkbox" className="ml-2 block text-sm text-gray-700">
              Publish immediately
            </label>
          </div>

          <div>
            <label htmlFor="image-upload" className="block text-sm font-medium text-gray-700 mb-1">
              {previewImage ? 'Change Image' : 'Upload Image (Optional)'}
            </label>
            <input
              type="file"
              id="image-upload"
              accept="image/*"
              onChange={handleImageChange}
              className={`w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 ${formErrors.image ? 'border-red-500' : ''}`}
              aria-describedby="image-error"
            />
            {formErrors.image && (
              <p id="image-error" className="mt-1 text-sm text-red-500">{formErrors.image}</p>
            )}
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
              disabled={isSubmitting}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors disabled:bg-blue-400"
              aria-label={editingId ? 'Update article' : 'Create article'}
            >
              {isSubmitting ? 'Processing...' : editingId ? 'Update' : 'Create'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition-colors"
              disabled={isSubmitting}
              aria-label="Cancel form"
            >
              Cancel
            </button>
          </div>
        </form>
      </section>

      <section className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">All News Articles</h2>
          <div className="text-sm text-gray-500">
            Showing {pagination.total > 0 ? (pagination.page - 1) * pagination.size + 1 : 0}-
            {pagination.total > 0 ? Math.min(pagination.page * pagination.size, pagination.total) : 0} of {pagination.total}
          </div>
        </div>
        
        {isLoading && !news.length ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
            <p>Loading news articles...</p>
          </div>
        ) : news.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchQuery ? 'No matching articles found' : 'No news articles found'}
          </div>
        ) : (
          <>
            <div className="space-y-6 mb-6">
              {news.map(article => (
                <article key={article.id} className="border-b border-gray-200 pb-6 last:border-0">
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
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        disabled={isSubmitting}
                        aria-label={`Edit ${article.title}`}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(article.id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                        disabled={isSubmitting}
                        aria-label={`Delete ${article.title}`}
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
                      loading="lazy"
                    />
                  )}
                  
                  <p className="mt-3 text-gray-700 line-clamp-3">
                    {article.content}
                  </p>
                  
                  <div className="mt-3 flex justify-between items-center">
                    <Link 
                      href={`/news/${article.id}`}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                      prefetch={false}
                    >
                      Read more →
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            {pagination.total > pagination.size && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1 || isSubmitting}
                  className="px-4 py-2 mx-1 border rounded disabled:opacity-50 hover:bg-gray-50 transition-colors"
                  aria-label="Previous page"
                >
                  Previous
                </button>
                <span className="px-4 py-2">
                  Page {pagination.page} of {Math.ceil(pagination.total / pagination.size)}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page * pagination.size >= pagination.total || isSubmitting}
                  className="px-4 py-2 mx-1 border rounded disabled:opacity-50 hover:bg-gray-50 transition-colors"
                  aria-label="Next page"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  )
}