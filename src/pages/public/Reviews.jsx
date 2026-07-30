import React, { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FaStar, FaSpinner, FaSearch, FaFilter,
  FaChevronDown, FaUser, FaCalendarAlt,
  FaCheckCircle, FaQuoteLeft, FaArrowRight,
  FaStarHalfAlt, FaRegStar, FaHeart,
  FaThumbsUp, FaShareAlt, FaTwitter, FaFacebook,
  FaTimes, FaStar as FaStarSolid
} from 'react-icons/fa'
import { reviewsApi } from '../../api/reviews.api'
import toast from 'react-hot-toast'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.06, ease: 'easeOut' },
  }),
}

const Reviews = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterRating, setFilterRating] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  })
  const [pagination, setPagination] = useState({ page: 1, limit: 9, total: 0, pages: 0 })

  useEffect(() => {
    const page = parseInt(searchParams.get('page')) || 1
    const rating = searchParams.get('rating') || ''
    setFilterRating(rating)
    setPagination(prev => ({ ...prev, page }))
    fetchReviews(page, rating)
    fetchStats()
  }, [searchParams])

  const fetchReviews = async (page = 1, rating = '') => {
    setLoading(true)
    try {
      const params = {
        page,
        limit: 9
      }
      if (rating) params.minRating = rating
      
      const response = await reviewsApi.getAll(params)
      setReviews(response.data.reviews || [])
      setPagination(response.data.pagination || { page: 1, limit: 9, total: 0, pages: 0 })
    } catch (error) {
      console.error('Fetch reviews error:', error)
      toast.error('Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await reviewsApi.getStats()
      setStats({
        averageRating: response.data.stats?.averageRating || 0,
        totalReviews: response.data.stats?.total || 0,
        ratingDistribution: response.data.stats?.ratingDistribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      })
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    // Implement search logic
    fetchReviews(1, filterRating)
  }

  const handleRatingFilter = (rating) => {
    const newRating = filterRating === rating ? '' : rating
    setFilterRating(newRating)
    if (newRating) {
      searchParams.set('rating', newRating)
    } else {
      searchParams.delete('rating')
    }
    searchParams.set('page', '1')
    setSearchParams(searchParams)
  }

  const handlePageChange = (page) => {
    searchParams.set('page', page.toString())
    setSearchParams(searchParams)
  }

  const clearFilters = () => {
    setSearch('')
    setFilterRating('')
    searchParams.delete('rating')
    searchParams.delete('page')
    setSearchParams(searchParams)
  }

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5
    
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => {
          if (i < fullStars) {
            return <FaStar key={i} className="text-yellow-400" size={16} />
          } else if (i === fullStars && hasHalfStar) {
            return <FaStarHalfAlt key={i} className="text-yellow-400" size={16} />
          } else {
            return <FaRegStar key={i} className="text-gray-300" size={16} />
          }
        })}
      </div>
    )
  }

  const renderRatingBars = () => {
    const maxCount = Math.max(...Object.values(stats.ratingDistribution), 1)
    return [5, 4, 3, 2, 1].map(rating => {
      const count = stats.ratingDistribution[rating] || 0
      const percentage = (count / maxCount) * 100
      return (
        <div key={rating} className="flex items-center gap-2">
          <span className="text-xs text-gray-600 w-4">{rating}</span>
          <FaStar className="text-yellow-400 text-xs" />
          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-yellow-400 rounded-full transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <span className="text-xs text-gray-500 w-8">{count}</span>
        </div>
      )
    })
  }

  const formatDate = (date) => {
    if (!date) return 'Recent'
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getInitials = (name) => {
    if (!name) return 'U'
    const parts = name.split(' ')
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
  }

  const getAvatarColor = (name) => {
    const colors = [
      'bg-blue-100 text-blue-600',
      'bg-green-100 text-green-600',
      'bg-purple-100 text-purple-600',
      'bg-pink-100 text-pink-600',
      'bg-indigo-100 text-indigo-600',
      'bg-teal-100 text-teal-600',
      'bg-orange-100 text-orange-600',
      'bg-rose-100 text-rose-600'
    ]
    const index = name ? name.length % colors.length : 0
    return colors[index]
  }

  if (loading && reviews.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FaSpinner className="animate-spin text-3xl text-emerald-600 mx-auto" />
          <p className="mt-4 text-gray-500 text-sm">Loading reviews...</p>
        </div>
      </div>
    )
  }

  const hasFilters = filterRating || search

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* ============================================================ */}
        {/* Header Section */}
        {/* ============================================================ */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-sm font-medium mb-3">
            <FaStar className="text-yellow-400" />
            Patient Testimonials
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            What Our Patients Say
          </h1>
          <p className="text-gray-500 mt-2 max-w-lg mx-auto">
            Real stories from real people who trusted us with their care
          </p>
        </motion.div>

        {/* ============================================================ */}
        {/* Stats Section */}
        {/* ============================================================ */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-8"
        >
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left - Average Rating */}
            <div className="text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
                <div>
                  <div className="text-5xl font-bold text-gray-900">
                    {stats.averageRating.toFixed(1)}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {renderStars(stats.averageRating)}
                    <span className="text-sm text-gray-500">/ 5.0</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Based on {stats.totalReviews} reviews
                  </p>
                </div>
                <div className="w-px h-16 bg-gray-200 hidden md:block" />
                <div className="flex-1 w-full max-w-xs">
                  {renderRatingBars()}
                </div>
              </div>
            </div>

            {/* Right - Quick Filter */}
            <div className="flex flex-wrap items-center justify-center md:justify-end gap-2">
              <span className="text-sm text-gray-500 mr-2">Filter by:</span>
              {[5, 4, 3, 2, 1].map(rating => (
                <button
                  key={rating}
                  onClick={() => handleRatingFilter(rating.toString())}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    filterRating === rating.toString()
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {rating} ★
                </button>
              ))}
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="px-3 py-1.5 rounded-full text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
                >
                  <FaTimes className="inline mr-1" size={12} /> Clear
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* ============================================================ */}
        {/* Search */}
        {/* ============================================================ */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-8"
        >
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search reviews..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
            >
              Search
            </button>
          </form>
        </motion.div>

        {/* ============================================================ */}
        {/* Reviews Grid */}
        {/* ============================================================ */}
        {reviews.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="text-5xl mb-4">📝</div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">No reviews yet</h3>
            <p className="text-gray-500 text-sm">Be the first to share your experience</p>
            <Link
              to="/patient/reviews/new"
              className="mt-4 inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Write a review <FaArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review, index) => {
              const reviewerName = review.name || 'Anonymous'
              const reviewerAvatar = review.avatar || null
              const reviewerEmail = review.email || ''
              
              return (
                <motion.div
                  key={review._id || index}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  variants={fadeUp}
                  custom={index}
                  className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 p-6 hover:-translate-y-1"
                >
                  {/* Header */}
                  <div className="flex items-start gap-4">
                    {reviewerAvatar ? (
                      <img
                        src={reviewerAvatar}
                        alt={reviewerName}
                        className="w-12 h-12 rounded-full object-cover border-2 border-emerald-100 flex-shrink-0"
                      />
                    ) : (
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-lg flex-shrink-0 ${getAvatarColor(reviewerName)}`}>
                        {getInitials(reviewerName)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900">{reviewerName}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-400 truncate">
                          {reviewerEmail || 'Patient'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Rating & Date */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {renderStars(review.rating || 5)}
                        <span className="text-sm font-medium text-gray-700">
                          {review.rating}.0
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <FaCalendarAlt size={12} />
                        <span>{formatDate(review.createdAt)}</span>
                      </div>
                    </div>
                    {review.isVerified && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-emerald-600">
                        <FaCheckCircle size={12} />
                        <span>Verified Patient</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="mt-3">
                    <FaQuoteLeft className="text-emerald-200 text-lg mb-1" />
                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-4">
                      {review.content || 'Great experience!'}
                    </p>
                  </div>

                  {/* Doctor info if available */}
                  {review.doctor && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-1.5">
                      <FaUser size={12} className="text-emerald-500" />
                      <span>Doctor: Dr. {review.doctor.firstName} {review.doctor.lastName}</span>
                      {review.doctor.specialization && (
                        <span className="text-gray-400">• {review.doctor.specialization}</span>
                      )}
                    </div>
                  )}

                  {/* Footer Actions */}
                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <button className="flex items-center gap-1 hover:text-emerald-600 transition-colors">
                        <FaThumbsUp size={12} /> Helpful
                      </button>
                      <button className="flex items-center gap-1 hover:text-red-500 transition-colors">
                        <FaHeart size={12} /> Like
                      </button>
                      <button className="flex items-center gap-1 hover:text-blue-500 transition-colors">
                        <FaShareAlt size={12} /> Share
                      </button>
                    </div>
                    <Link
                      to={`/reviews/${review._id}`}
                      className="text-emerald-600 hover:text-emerald-700 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
                    >
                      Read more <FaArrowRight size={12} />
                    </Link>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* ============================================================ */}
        {/* Pagination */}
        {/* ============================================================ */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Previous
            </button>
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
                  onClick={() => handlePageChange(pageNum)}
                  className={`w-9 h-9 rounded-lg text-sm transition-colors ${
                    pagination.page === pageNum
                      ? 'bg-emerald-600 text-white font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {pageNum}
                </button>
              )
            })}
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Next
            </button>
          </div>
        )}

        {/* ============================================================ */}
        {/* Write Review CTA */}
        {/* ============================================================ */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
          className="mt-12 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl text-white p-8 text-center"
        >
          <h3 className="text-xl font-bold mb-2">Share Your Experience</h3>
          <p className="text-emerald-100 mb-4 max-w-lg mx-auto">
            Your feedback helps us improve and helps others make informed decisions about their healthcare.
          </p>
          <Link
            to="/patient/reviews/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-emerald-700 rounded-lg font-medium hover:bg-gray-50 transition-colors shadow-lg"
          >
            Write a Review <FaArrowRight />
          </Link>
        </motion.div>
      </div>
    </div>
  )
}

export default Reviews