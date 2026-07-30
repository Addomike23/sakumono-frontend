import React, { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FiSearch, FiCalendar, FiUser, FiTag, FiEye, 
  FiClock, FiArrowRight, FiHeart, FiBookOpen,
  FiTrendingUp, FiStar, FiX, FiGrid, FiList,
  FiChevronLeft, FiChevronRight
} from 'react-icons/fi'
import { blogsApi } from '../../api/blogs.api'
import toast from 'react-hot-toast'

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.06, ease: 'easeOut' },
  }),
}

const Blog = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '')
  const [searchTerm, setSearchTerm] = useState('')
  const [pagination, setPagination] = useState({ page: 1, limit: 9, total: 0, pages: 0 })
  const [stats, setStats] = useState({})
  const [popularPosts, setPopularPosts] = useState([])
  const [recentPosts, setRecentPosts] = useState([])
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'list'

  useEffect(() => {
    fetchBlogs()
    fetchCategories()
    fetchStats()
    fetchPopularPosts()
    fetchRecentPosts()
  }, [selectedCategory, pagination.page])

  const fetchBlogs = async () => {
    setLoading(true)
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit
      }
      if (selectedCategory) params.category = selectedCategory
      if (searchTerm) params.search = searchTerm
      
      const response = await blogsApi.getAll(params)
      setBlogs(response.data.blogs || [])
      setPagination(response.data.pagination || { page: 1, limit: 9, total: 0, pages: 0 })
    } catch (error) {
      toast.error('Failed to load blog posts')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await blogsApi.getCategories()
      setCategories(response.data.categories || [])
    } catch (error) {
      toast.error('Failed to load categories')
    }
  }

  const fetchStats = async () => {
    try {
      const response = await blogsApi.getStats()
      setStats(response.data.stats || {})
    } catch (error) {
      toast.error('Failed to load stats')
    }
  }

  const fetchPopularPosts = async () => {
    try {
      const response = await blogsApi.getPopular(5)
      setPopularPosts(response.data.blogs || [])
    } catch (error) {
      toast.error('Failed to load popular posts')
    }
  }

  const fetchRecentPosts = async () => {
    try {
      const response = await blogsApi.getRecent(5)
      setRecentPosts(response.data.blogs || [])
    } catch (error) {
      toast.error('Failed to load recent posts')
    }
  }

  const handleCategoryClick = (category) => {
    setSelectedCategory(category === selectedCategory ? '' : category)
    setPagination(prev => ({ ...prev, page: 1 }))
    if (category === selectedCategory) {
      searchParams.delete('category')
    } else {
      searchParams.set('category', category)
    }
    setSearchParams(searchParams)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchBlogs()
  }

  const clearFilters = () => {
    setSelectedCategory('')
    setSearchTerm('')
    setPagination(prev => ({ ...prev, page: 1 }))
    searchParams.delete('category')
    setSearchParams(searchParams)
    fetchBlogs()
  }

  const formatDate = (date) => {
    if (!date) return 'Recently'
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusColor = (status) => {
    if (status === 'published') return 'bg-emerald-100 text-emerald-700'
    if (status === 'draft') return 'bg-amber-100 text-amber-700'
    return 'bg-gray-100 text-gray-700'
  }

  const SkeletonCard = () => (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="aspect-[16/10] bg-gray-200" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-1/3" />
        <div className="h-5 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-2/3" />
        <div className="flex items-center gap-4 pt-2">
          <div className="h-3 bg-gray-200 rounded w-1/4" />
          <div className="h-3 bg-gray-200 rounded w-1/4" />
        </div>
      </div>
    </div>
  )

  if (loading && blogs.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ============================================================ */}
      {/* HERO SECTION - Minimal & Clean */}
      {/* ============================================================ */}
      <section className="relative bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                  {stats.published || 0} Articles
                </span>
                <span className="text-sm text-gray-400">•</span>
                <span className="text-sm text-gray-500">
                  {stats.totalViews || 0} total views
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                Health <span className="text-emerald-600">Insights</span>
              </h1>
              <p className="text-gray-500 mt-1 max-w-xl">
                Expert advice, wellness tips, and medical insights from our healthcare professionals.
              </p>
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="w-full md:w-auto min-w-[280px]">
              <div className="relative">
                <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                />
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* MAIN CONTENT */}
      {/* ============================================================ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* ============================================================ */}
          {/* SIDEBAR - Left */}
          {/* ============================================================ */}
          <aside className="lg:w-64 xl:w-72 flex-shrink-0">
            <div className="sticky top-8 space-y-6">
              {/* Categories */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm">
                  <FiTag className="text-emerald-500" /> Categories
                </h3>
                <div className="space-y-1">
                  {categories.map((cat) => (
                    <button
                      key={cat._id}
                      onClick={() => handleCategoryClick(cat._id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center justify-between ${
                        selectedCategory === cat._id
                          ? 'bg-emerald-50 text-emerald-700 font-medium'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span>{cat._id}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        selectedCategory === cat._id 
                          ? 'bg-emerald-200 text-emerald-700' 
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {cat.count}
                      </span>
                    </button>
                  ))}
                  {categories.length === 0 && (
                    <p className="text-sm text-gray-400 px-3 py-2">No categories</p>
                  )}
                </div>
                {(selectedCategory || searchTerm) && (
                  <button
                    onClick={clearFilters}
                    className="mt-3 text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1 px-3"
                  >
                    <FiX size={14} /> Clear filters
                  </button>
                )}
              </div>

              {/* Popular Posts */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm">
                  <FiTrendingUp className="text-emerald-500" /> Trending
                </h3>
                <div className="space-y-3">
                  {popularPosts.slice(0, 4).map((post, index) => (
                    <Link
                      key={post._id}
                      to={`/blog/${post.slug}`}
                      className="group flex gap-3 hover:bg-gray-50 rounded-lg p-2 -mx-2 transition-colors"
                    >
                      <span className="text-sm font-bold text-gray-300 w-5 flex-shrink-0">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-800 group-hover:text-emerald-600 transition-colors line-clamp-2">
                          {post.title}
                        </h4>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <FiEye size={12} className="text-emerald-500" /> {post.views || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <FiHeart size={12} className="text-red-400" /> {post.likes || 0}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                  {popularPosts.length === 0 && (
                    <p className="text-sm text-gray-400">No trending posts</p>
                  )}
                </div>
              </div>
            </div>
          </aside>

          {/* ============================================================ */}
          {/* BLOG GRID */}
          {/* ============================================================ */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <p className="text-sm text-gray-500">
                  {pagination.total > 0 ? (
                    <>Showing <span className="font-medium text-gray-700">
                      {((pagination.page - 1) * pagination.limit) + 1}
                    </span> to <span className="font-medium text-gray-700">
                      {Math.min(pagination.page * pagination.limit, pagination.total)}
                    </span> of <span className="font-medium text-gray-700">{pagination.total}</span> articles</>
                  ) : (
                    'No articles found'
                  )}
                </p>
                {selectedCategory && (
                  <span className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full flex items-center gap-1">
                    <FiTag size={12} /> {selectedCategory}
                    <button onClick={clearFilters} className="ml-1 hover:text-emerald-900">
                      <FiX size={14} />
                    </button>
                  </span>
                )}
              </div>

              {/* View toggle */}
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-white shadow-sm text-emerald-600' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                  aria-label="Grid view"
                >
                  <FiGrid size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-white shadow-sm text-emerald-600' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                  aria-label="List view"
                >
                  <FiList size={16} />
                </button>
              </div>
            </div>

            {/* Blog Grid */}
            {blogs.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                <div className="text-5xl mb-4">📝</div>
                <h3 className="text-lg font-medium text-gray-800 mb-1">No articles found</h3>
                <p className="text-gray-500 text-sm">Try adjusting your search or filters.</p>
                <button
                  onClick={clearFilters}
                  className="mt-4 text-emerald-600 hover:text-emerald-700 font-medium text-sm"
                >
                  Clear filters
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid md:grid-cols-2 gap-5">
                {blogs.map((post, index) => (
                  <motion.div
                    key={post._id}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    variants={fadeUp}
                    custom={index}
                  >
                    <Link
                      to={`/blog/${post.slug}`}
                      className="group block bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 h-full hover:-translate-y-1"
                    >
                      <div className="relative aspect-[16/10] bg-gray-100 overflow-hidden">
                        {post.featuredImage ? (
                          <img
                            src={post.featuredImage}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-4xl text-gray-300">
                            📖
                          </div>
                        )}
                        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                          <span className="text-xs px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm text-emerald-700 font-medium shadow-sm">
                            {post.category || 'Uncategorized'}
                          </span>
                          <span className={`text-xs px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm font-medium shadow-sm ${getStatusColor(post.status)}`}>
                            {post.status}
                          </span>
                        </div>
                        {post.readTime && (
                          <span className="absolute bottom-3 right-3 text-xs px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white font-medium">
                            {post.readTime} min read
                          </span>
                        )}
                      </div>

                      <div className="p-5">
                        <div className="flex items-center gap-3 text-xs text-gray-400 mb-2">
                          <span className="flex items-center gap-1">
                            <FiUser size={12} className="text-emerald-500" />
                            {post.author?.firstName || 'Anonymous'} {post.author?.lastName || ''}
                          </span>
                          <span className="flex items-center gap-1">
                            <FiCalendar size={12} className="text-emerald-500" />
                            {formatDate(post.publishedAt || post.createdAt)}
                          </span>
                        </div>

                        <h3 className="font-semibold text-base text-gray-900 mb-1.5 group-hover:text-emerald-600 transition-colors line-clamp-2">
                          {post.title}
                        </h3>

                        <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                          {post.excerpt}
                        </p>

                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3 text-gray-400">
                            <span className="flex items-center gap-1">
                              <FiEye size={12} className="text-emerald-500" /> {post.views || 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <FiHeart size={12} className="text-red-400" /> {post.likes || 0}
                            </span>
                          </div>
                          <span className="text-emerald-600 font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-all text-sm">
                            Read <FiArrowRight size={14} />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              // List View
              <div className="space-y-4">
                {blogs.map((post, index) => (
                  <motion.div
                    key={post._id}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    variants={fadeUp}
                    custom={index}
                  >
                    <Link
                      to={`/blog/${post.slug}`}
                      className="group block bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                    >
                      <div className="flex flex-col sm:flex-row gap-4 p-4">
                        <div className="sm:w-48 md:w-56 flex-shrink-0">
                          <div className="aspect-[16/10] sm:aspect-square bg-gray-100 rounded-xl overflow-hidden">
                            {post.featuredImage ? (
                              <img
                                src={post.featuredImage}
                                alt={post.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-3xl text-gray-300">
                                📖
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0 py-1">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">
                              {post.category || 'Uncategorized'}
                            </span>
                            <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${getStatusColor(post.status)}`}>
                              {post.status}
                            </span>
                          </div>
                          <h3 className="font-semibold text-base text-gray-900 group-hover:text-emerald-600 transition-colors line-clamp-2">
                            {post.title}
                          </h3>
                          <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                            {post.excerpt}
                          </p>
                          <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                              <FiUser size={12} className="text-emerald-500" />
                              {post.author?.firstName || 'Anonymous'} {post.author?.lastName || ''}
                            </span>
                            <span className="flex items-center gap-1">
                              <FiCalendar size={12} className="text-emerald-500" />
                              {formatDate(post.publishedAt || post.createdAt)}
                            </span>
                            <span className="flex items-center gap-1">
                              <FiClock size={12} className="text-emerald-500" />
                              {post.readTime || 0} min read
                            </span>
                            <span className="flex items-center gap-1">
                              <FiEye size={12} className="text-emerald-500" /> {post.views || 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <FiHeart size={12} className="text-red-400" /> {post.likes || 0}
                            </span>
                            <span className="ml-auto text-emerald-600 font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                              Read <FiArrowRight size={14} />
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm flex items-center gap-1"
                >
                  <FiChevronLeft size={16} /> Previous
                </button>
                
                <div className="flex items-center gap-1.5">
                  {[...Array(Math.min(pagination.pages, 5))].map((_, i) => {
                    let pageNum
                    if (pagination.pages <= 5) {
                      pageNum = i + 1
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1
                    } else if (pagination.page >= pagination.pages - 2) {
                      pageNum = pagination.pages - 4 + i
                    } else {
                      pageNum = pagination.page - 2 + i
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                        className={`w-9 h-9 rounded-xl text-sm transition-colors ${
                          pagination.page === pageNum
                            ? 'bg-emerald-600 text-white font-medium'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                </div>

                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.pages}
                  className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm flex items-center gap-1"
                >
                  Next <FiChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Blog