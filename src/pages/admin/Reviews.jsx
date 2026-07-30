import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  FaStar, FaTrash, FaSpinner, FaEye,
  FaSearch, FaFilter, FaChevronDown,
  FaUser, FaCalendarAlt, FaCheckCircle, FaTimesCircle
} from 'react-icons/fa'
import { reviewsApi } from '../../api/reviews.api'
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

const AdminReviews = () => {
  const { user } = useAuth()
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [stats, setStats] = useState({})
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 })

  useEffect(() => {
    fetchReviews()
    fetchStats()
  }, [pagination.page])

  const fetchReviews = async () => {
    setLoading(true)
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit
      }
      
      const response = await reviewsApi.getAll(params)
      setReviews(response.data.reviews || [])
      setPagination(response.data.pagination || { page: 1, limit: 20, total: 0, pages: 0 })
    } catch (error) {
      toast.error('Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await reviewsApi.getStats()
      setStats(response.data.stats || {})
    } catch (error) {
      toast.error('Failed to load stats')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this review?')) return
    try {
      await reviewsApi.delete(id)
      toast.success('Review deleted')
      fetchReviews()
    } catch (error) {
      toast.error('Failed to delete review')
    }
  }

  const handleTogglePublic = async (id, isPublic) => {
    try {
      await reviewsApi.update(id, { isPublic: !isPublic })
      toast.success(`Review ${isPublic ? 'hidden' : 'made public'}`)
      fetchReviews()
    } catch (error) {
      toast.error('Failed to update review')
    }
  }

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            className={star <= rating ? 'text-yellow-400' : 'text-gray-200'}
            size={12}
          />
        ))}
      </div>
    )
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FaSpinner className="animate-spin text-3xl text-green-600" />
      </div>
    )
  }

  const filteredReviews = reviews.filter(review => {
    if (!search) return true
    const name = review.name?.toLowerCase() || ''
    const content = review.content?.toLowerCase() || ''
    return name.includes(search.toLowerCase()) || content.includes(search.toLowerCase())
  })

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Reviews</h1>
            <p className="text-sm text-gray-500 mt-1">
              {stats.totalReviews || 0} total • ⭐ {stats.averageRating?.toFixed(1) || '0.0'} avg
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 text-center">
            <p className="text-xl font-bold text-gray-800">{stats.totalReviews || 0}</p>
            <p className="text-[10px] text-gray-500">Total</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 text-center">
            <p className="text-xl font-bold text-yellow-500">{stats.averageRating?.toFixed(1) || '0.0'}</p>
            <p className="text-[10px] text-gray-500">Average Rating</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 text-center">
            <p className="text-xl font-bold text-green-600">{stats.public || 0}</p>
            <p className="text-[10px] text-gray-500">Public</p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search reviews by name or content..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30"
            />
          </div>
          {search && (
            <button
              onClick={() => setSearch('')}
              className="mt-2 flex items-center gap-1 px-3 py-1.5 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            >
              <FaX /> Clear
            </button>
          )}
        </div>

        {filteredReviews.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="text-5xl mb-4">⭐</div>
            <p className="text-gray-500 text-sm">No reviews found</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reviewer</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Content</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredReviews.map((review, index) => (
                    <motion.tr
                      key={review._id}
                      initial="hidden"
                      animate="visible"
                      custom={index}
                      variants={fadeUp}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {review.avatar && (
                            <img src={review.avatar} alt={review.name} className="w-6 h-6 rounded-full object-cover" />
                          )}
                          <span className="text-sm font-medium text-gray-900">{review.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">{renderStars(review.rating)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 line-clamp-2 max-w-[200px]">{review.content}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          review.isPublic ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {review.isPublic ? 'Public' : 'Hidden'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{formatDate(review.createdAt)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/reviews/${review._id}`} className="text-blue-600 hover:text-blue-800" title="View">
                            <FaEye size={15} />
                          </Link>
                          <button
                            onClick={() => handleTogglePublic(review._id, review.isPublic)}
                            className={review.isPublic ? 'text-yellow-600 hover:text-yellow-800' : 'text-green-600 hover:text-green-800'}
                            title={review.isPublic ? 'Hide' : 'Make Public'}
                          >
                            {review.isPublic ? <FaTimesCircle size={15} /> : <FaCheckCircle size={15} />}
                          </button>
                          <button onClick={() => handleDelete(review._id)} className="text-red-600 hover:text-red-800" title="Delete">
                            <FaTrash size={15} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

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

export default AdminReviews