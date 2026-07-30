import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FaStar, FaStarHalfAlt, FaRegStar, FaUser, FaCalendarAlt, FaSpinner,
  FaEdit, FaTrash, FaPlus, FaEye,
  FaCheckCircle, FaClock, FaQuoteLeft
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

const PatientReviews = () => {
  const { user } = useAuth()
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 })
  const [stats, setStats] = useState({ total: 0, average: 0 })

  useEffect(() => {
    fetchReviews()
  }, [pagination.page])

  const fetchReviews = async () => {
    setLoading(true)
    try {
      // Use the patient-specific endpoint
      const response = await reviewsApi.getMyReviews({
        page: pagination.page,
        limit: pagination.limit
      })
      

      setReviews(response.data.reviews || [])
      setStats({
        total: response.data.stats?.total || 0,
        average: response.data.stats?.average || 0
      })
      setPagination(response.data.pagination || { page: 1, limit: 10, total: 0, pages: 0 })
    } catch (error) {
    
      toast.error(error.response?.data?.message || 'Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this review?')) return

    try {
      await reviewsApi.delete(id)
      toast.success('Review deleted')
      fetchReviews()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete review')
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            className={star <= rating ? 'text-yellow-400' : 'text-gray-200'}
            size={14}
          />
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <FaSpinner className="animate-spin text-3xl text-green-600 mx-auto" />
          <p className="mt-4 text-gray-500 text-sm">Loading reviews...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">My Reviews</h1>
            <p className="text-sm text-gray-500 mt-1">
              {stats.total} review{stats.total !== 1 ? 's' : ''}
              {stats.average > 0 && (
                <span className="ml-2 inline-flex items-center gap-2">
                  • {renderStars(Math.round(stats.average))}
                  <span className="text-gray-600">{stats.average.toFixed(1)}</span>
                </span>
              )}
            </p>
          </div>
          <Link
            to="/patient/reviews/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <FaPlus /> Write Review
          </Link>
        </div>

        {reviews.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="text-5xl mb-4">✍️</div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">No reviews yet</h3>
            <p className="text-gray-500 text-sm">Share your experience with our doctors.</p>
            <Link
              to="/patient/reviews/new"
              className="mt-4 inline-block text-emerald-600 hover:text-emerald-700 font-medium text-sm"
            >
              Write your first review →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review, index) => (
              <motion.div
                key={review._id}
                initial="hidden"
                animate="visible"
                custom={index}
                variants={fadeUp}
                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {renderStars(review.rating)}
                      <span className="text-sm font-medium text-gray-700">{review.rating}.0</span>
                      {review.doctor && (
                        <span className="text-sm text-gray-500 ml-2 flex items-center gap-1">
                          <FaUser size={12} className="text-gray-400" />
                          Dr. {review.doctor?.firstName} {review.doctor?.lastName}
                        </span>
                      )}
                    </div>

                    <p className="text-gray-700 text-sm leading-relaxed">
                      <FaQuoteLeft className="inline text-gray-300 mr-1" size={12} />
                      {review.content}
                    </p>

                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <FaCalendarAlt size={12} /> {formatDate(review.createdAt)}
                      </span>
                      <span className={`flex items-center gap-1 ${review.isPublic ? 'text-emerald-600' : 'text-gray-400'
                        }`}>
                        {review.isPublic ? (
                          <><FaCheckCircle size={12} /> Public</>
                        ) : (
                          <><FaClock size={12} /> Pending</>
                        )}
                      </span>
                      {review.isVerified && (
                        <span className="flex items-center gap-1 text-blue-600">
                          <FaCheckCircle size={12} /> Verified
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {review.isPublic && (
                      <Link
                        to={`/reviews/${review._id}`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View"
                        target="_blank"
                      >
                        <FaEye size={15} />
                      </Link>
                    )}
                    <button
                      onClick={() => handleDelete(review._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <FaTrash size={15} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
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

export default PatientReviews