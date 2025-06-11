'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import {
  fetchNewsList,
  searchNews,
  fetchNewsItem, 
  createNews, 
  updateNews, 
  deleteNews,
  uploadNewsImage,

} from '../utils/api'

export default function NewsPage() {
  const router = useRouter()
  const [state, setState] = useState({
    news: [],
    latestNews: [],
    isLoading: true,
    isLoadingLatest: false,
    isCreating: false,
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



  const loadNews = useCallback(async (page = state.pagination.page, size = state.pagination.size) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }))
      
      const response = state.searchQuery 
        ? await searchNews(state.searchQuery, page, size)
        : await fetchNewsList(page, size)

      setState(prev => ({
        ...prev,
        news: response.items,
        pagination: {
          ...prev.pagination,
          page,
          total: response.total
        }
      }))
    } catch (error) {
      toast.error(error.message || 'Failed to load news articles')
      console.error(error)
    } finally {
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }, [state.searchQuery, state.pagination.size])

  // Initial load
  useEffect(() => {
    const initializeData = async () => {
      await Promise.all([loadLatestNews(), loadNews(1)])
    }
    initializeData()
  }, [loadLatestNews, loadNews])

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
      setState(prev => ({ ...prev, isLoading: true }))
      
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

      if (state.editingId) {
        await updateNews(state.editingId, newsPayload)
        toast.success('News article updated successfully')
      } else {
        await createNews(newsPayload)
        toast.success('News article created successfully')
      }

      // Refresh both news lists
      await Promise.all([loadNews(), loadLatestNews()])
      resetForm()
    } catch (error) {
      toast.error(error.message || 'Operation failed')
      console.error(error)
    } finally {
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }

  // Edit an article
  const handleEdit = async (article) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }))
      const fullArticle = await fetchNewsItem(article.news_id)
      
      setState(prev => ({ ...prev, editingId: article.news_id }))
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
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }

  // Delete an article
  const handleDelete = async (news_id) => {
    if (!confirm('Are you sure you want to delete this news article?')) return
    
    try {
      setState(prev => ({ ...prev, isLoading: true }))
      await deleteNews(news_id)
      toast.success('News article deleted successfully')
      await Promise.all([loadNews(), loadLatestNews()])
    } catch (error) {
      toast.error(error.message || 'Failed to delete news article')
      console.error(error)
    } finally {
      setState(prev => ({ ...prev, isLoading: false }))
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
    setState(prev => ({ ...prev, editingId: null, isCreating: false }))
  }

  // Handle page change
  const handlePageChange = (newPage) => {
    loadNews(newPage)
  }

  // Handle search query change with debounce
  const handleSearchChange = (e) => {
    const query = e.target.value
    setState(prev => ({ ...prev, searchQuery: query }))
  }

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (state.searchQuery !== '') {
        loadNews(1)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [state.searchQuery, loadNews])

  const {
    news,
    latestNews,
    isLoading,
    isLoadingLatest,
    isCreating,
    editingId,
    searchQuery,
    pagination
  } = state

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-3xl font-bold mb-8">News Management</h1>
      
      {/* Latest News Section */}
      {!isLoadingLatest && latestNews.length > 0 && (
        <section className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Latest News</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {latestNews.map(article => (
              <article key={article.news_id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
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
                    href={`/news/${article.news_id}`}
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

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="Search news..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {searchQuery && (
            <button
              onClick={() => setState(prev => ({ ...prev, searchQuery: '' }))}
              className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </div>
      
      {/* Create/Edit Form */}
      <section className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {editingId ? 'Edit News Article' : isCreating ? 'Create New Article' : 'News Articles'}
          </h2>
          {!isCreating && !editingId && (
            <button 
              onClick={() => setState(prev => ({ ...prev, isCreating: true }))}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={isLoading}
            >
              Create New
            </button>
          )}
        </div>

        {(isCreating || editingId) && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title*
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
                maxLength={100}
              />
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                Content*
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
                maxLength={5000}
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="publish-checkbox"
                name="is_published"
                checked={formData.is_published}
                onChange={handleChange}
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
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors disabled:bg-blue-400"
              >
                {isLoading ? 'Processing...' : editingId ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition-colors"
                disabled={isLoading}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </section>

      {/* News List */}
      <section className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">All News Articles</h2>
          <div className="text-sm text-gray-500">
            Showing {(pagination.page - 1) * pagination.size + 1}-
            {Math.min(pagination.page * pagination.size, pagination.total)} of {pagination.total}
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
                <article key={article.news_id} className="border-b border-gray-200 pb-6 last:border-0">
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
                        disabled={isLoading}
                        aria-label={`Edit ${article.title}`}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(article.news_id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                        disabled={isLoading}
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
                      href={`/news/${article.news_id}`}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                      prefetch={false}
                    >
                      Read more →
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-6">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1 || isLoading}
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
                disabled={pagination.page * pagination.size >= pagination.total || isLoading}
                className="px-4 py-2 mx-1 border rounded disabled:opacity-50 hover:bg-gray-50 transition-colors"
                aria-label="Next page"
              >
                Next
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  )
}