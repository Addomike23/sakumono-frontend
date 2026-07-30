import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  FaSearch, FaPlus, FaEdit, FaTrash, FaEye,
  FaSpinner, FaFilter, FaChevronDown, 
  FaCalendarAlt, FaUser, FaTag, FaClock,
  FaCheckCircle, FaTimesCircle, FaBookOpen,
  FaImage, FaChartBar,
} from 'react-icons/fa'
import { blogsApi } from '../../api/blogs.api'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: 'easeOut' },
  }),
}

const AdminBlogs = () => {
  const { user } = useAuth()
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [categories, setCategories] = useState([])
  const [stats, setStats] = useState({})
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 })

  useEffect(() => {
    fetchBlogs()
    fetchCategories()
    fetchStats()
  }, [search, statusFilter, categoryFilter, pagination.page])

  const fetchBlogs = async () => {
    setLoading(true)
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit
      }
      if (search) params.search = search
      if (statusFilter) params.status = statusFilter
      if (categoryFilter) params.category = categoryFilter
      
      const response = await blogsApi.getAllAdmin(params)
      setBlogs(response.data.blogs || [])
      setPagination(response.data.pagination || { page: 1, limit: 20, total: 0, pages: 0 })
    } catch (error) {
      console.error('Fetch blogs error:', error)
      toast.error('Failed to load blogs')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await blogsApi.getCategories()
      setCategories(response.data.categories || [])
    } catch (error) {
      console.error('Failed to load categories')
    }
  }

  const fetchStats = async () => {
    try {
      const response = await blogsApi.getStats()
      setStats(response.data.stats || {})
    } catch (error) {
      console.error('Failed to load stats')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return
    try {
      await blogsApi.delete(id)
      toast.success('Blog post deleted')
      fetchBlogs()
      fetchStats()
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete blog')
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      'published': 'bg-emerald-100 text-emerald-700',
      'draft': 'bg-amber-100 text-amber-700',
      'archived': 'bg-gray-100 text-gray-700'
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  // Fixed: Return the icon component directly, not inside a function that returns JSX
  const getStatusIcon = (status) => {
    if (status === 'published') return FaCheckCircle
    if (status === 'draft') return FaClock
    return FaTimesCircle
  }

  const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading && blogs.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <FaSpinner className="animate-spin text-3xl text-emerald-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Blog Posts</h1>
            <p className="text-sm text-gray-500 mt-1">
              {stats.total || 0} total • {stats.published || 0} published
            </p>
          </div>
          <Link
            to="/admin/blogs/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <FaPlus size={14} /> New Post
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-gray-800">{stats.total || 0}</p>
            <p className="text-xs text-gray-500">Total</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-emerald-600">{stats.published || 0}</p>
            <p className="text-xs text-gray-500">Published</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-amber-600">{stats.drafts || 0}</p>
            <p className="text-xs text-gray-500">Drafts</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-gray-600">{stats.archived || 0}</p>
            <p className="text-xs text-gray-500">Archived</p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input
                type="text"
                placeholder="Search blog posts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <FaFilter size={14} /> Filters
              <FaChevronDown className={`transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} size={12} />
            </button>
            {(search || statusFilter || categoryFilter) && (
              <button
                onClick={() => {
                  setSearch('')
                  setStatusFilter('')
                  setCategoryFilter('')
                }}
                className="flex items-center gap-1 px-3 py-2 text-sm text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
              >
                <FaX size={12} /> Clear
              </button>
            )}
          </div>

          {showFilters && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex flex-wrap gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                >
                  <option value="">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat._id}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Blogs Table */}
        {blogs.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-gray-500 text-sm">No blog posts found</p>
            <Link
              to="/admin/blogs/new"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors"
            >
              <FaPlus size={14} /> Create your first post
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {blogs.map((blog, index) => {
                    const StatusIcon = getStatusIcon(blog.status)
                    return (
                      <motion.tr
                        key={blog._id}
                        initial="hidden"
                        animate="visible"
                        custom={index}
                        variants={fadeUp}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {blog.featuredImage ? (
                              <img 
                                src={blog.featuredImage} 
                                alt={blog.title} 
                                className="w-10 h-10 rounded-lg object-cover border border-gray-200 flex-shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 flex-shrink-0">
                                <FaImage size={16} />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{blog.title}</p>
                              <p className="text-xs text-gray-400 truncate">{blog.excerpt}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs whitespace-nowrap">
                            {blog.category}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 text-sm text-gray-600 whitespace-nowrap">
                            <FaUser size={12} />
                            {blog.author?.firstName} {blog.author?.lastName}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(blog.status)}`}>
                            <StatusIcon size={12} />
                            {blog.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{blog.views || 0}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <FaCalendarAlt size={12} />
                            {formatDate(blog.createdAt)}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              to={`/blog/${blog.slug}`}
                              target="_blank"
                              className="text-blue-600 hover:text-blue-800 transition-colors p-1"
                              title="View on site"
                            >
                              <FaEye size={15} />
                            </Link>
                            <Link
                              to={`/admin/blogs/${blog._id}/edit`}
                              className="text-amber-600 hover:text-amber-800 transition-colors p-1"
                              title="Edit"
                            >
                              <FaEdit size={15} />
                            </Link>
                            <button
                              onClick={() => handleDelete(blog._id)}
                              className="text-red-600 hover:text-red-800 transition-colors p-1"
                              title="Delete"
                            >
                              <FaTrash size={15} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-sm text-gray-600">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.pages}
              className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminBlogs